from homeassistant import config_entries
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.translation import async_get_translations
import voluptuous as vol
from homeassistant.core import callback
import broadlink
import logging
import json
import os
import asyncio
import time
import base64
import datetime
import uuid
import aiofiles
import re
from collections import OrderedDict
from broadlink.exceptions import ReadError, StorageError

from .constants import DOMAIN
from .constants import MOCK_DATA
from .constants import DEVICE_TYPES
from .constants import LEARN_TIMEOUT
from .constants import TRANSLATION_KEY_DEVICE_IP_MODE
from .constants import TRANSLATION_KEY_TEMPLATE_FROM_FILE
from .constants import TRANSLATION_KEY_COMMAND_REPLACE_MAP
from .constants import TRANSLATION_KEY_DEVICE_TEMPLATE_NAME
from .constants import TRANSLATION_KEY_TEMPLATE_DEAL_MODE

_LOGGER = logging.getLogger(__name__)


# Step 1: 进入流时要求输入设备信息，要求用户输入设备名称
SETUP_SCHEMA = vol.Schema({
    vol.Required("device_ip"): str,  # 设备名称，必填
})

# Step 2: 配置时要求输入设备的类型、制造商和型号
CONFIGURE_SCHEMA = vol.Schema({
    # 设备类型
    vol.Required("type"): vol.In(DEVICE_TYPES),
})

# 扫描设备 IP 地址
def scan_devices():
    if MOCK_DATA:
        # 模拟的设备列表
        devices = [
            {"name": "Mock Device 1", "ip": "192.168.1.100"},
            {"name": "Mock Device 2", "ip": "192.168.1.101"},
            {"name": "Mock Device 3", "ip": "192.168.1.102"},
        ]
        return devices

    """扫描设备并返回设备列表"""
    devices = []
    for device in broadlink.xdiscover():
        _LOGGER.debug(f'发现设备: {device}')
        devices.append({"name": "Device 1", "ip": device.host[0]})
    return devices

def merge_commands(template_commands, learned_commands, min_temperature=None, max_temperature=None):
    """递归更新模板命令，处理温度范围并替换
    如果 learned_commands 中提供了具体温度，则对应温度赋值为 learned value，其它温度赋值为空字符串；
    对于模板中存在但 learned_commands 未覆盖的温度范围，全部赋值为空字符串。
    """
    if min_temperature is None or max_temperature is None:
        _LOGGER.error("温度范围未设置，无法进行替换！")
        return template_commands

    # 先根据 learned_commands 更新模板
    for key, value in learned_commands.items():
        keys = key.split('.')
        current_level = template_commands
        for part in keys[:-1]:
            if part not in current_level or not isinstance(current_level[part], dict):
                current_level[part] = {}
            current_level = current_level[part]

        # 判断 learned 命令是否为温度相关命令（最后一级是否为数字）
        if keys[-1].isdigit():
            # 如果当前层存在温度范围占位符，则进行温度替换
            if "minTemperature-maxTemperature" in current_level:
                del current_level["minTemperature-maxTemperature"]
                learned_temp = int(keys[-1])
                for temp in range(min_temperature, max_temperature + 1):
                    current_level[str(temp)] = value if temp == learned_temp else ""
            else:
                # 模板中未设置温度范围占位符，直接更新该键
                current_level[keys[-1]] = value
        else:
            # 非温度相关命令，直接覆盖
            current_level[keys[-1]] = value

    # 处理模板中剩余未被 learned_commands 覆盖的温度范围
    def process_temperature_ranges(d):
        for k, v in d.items():
            if isinstance(v, dict):
                if "minTemperature-maxTemperature" in v:
                    del v["minTemperature-maxTemperature"]
                    for temp in range(min_temperature, max_temperature + 1):
                        v[str(temp)] = ""
                else:
                    process_temperature_ranges(v)
    process_temperature_ranges(template_commands)

    return template_commands

# 辅助函数：检查设备 IP 是否有效，并返回设备和错误信息
def validate_device_ip(ip):
    if MOCK_DATA:
        # 设置设备信息（请将这些值替换为您的设备实际信息）
        ip_address = "192.168.1.100"  # 设备的IP地址
        mac_address = bytearray.fromhex("aabbccddeeff")  # 设备的MAC地址
        device_type = 0x5f36  # 您的设备类型编号，需确认
        # 使用 gendevice 方法创建设备对象
        device = broadlink.gendevice(device_type, (ip_address, 80), mac_address)
        return device, None

    """验证设备 IP，返回设备对象和错误信息"""
    try:
        device = broadlink.hello(ip)
        device.auth()
        _LOGGER.debug(f'设备连接成功: {device}')
        return device, None  # 设备有效，返回设备和无错误
    except broadlink.exceptions.NetworkTimeoutError as e:
        error_message = f"当前设备IP，无法连接，请检查！IP: {ip}，错误详情: {e}"
        _LOGGER.error(error_message)
        return None, error_message
    except broadlink.exceptions.AuthenticationError as e:
        error_message = f"设备授权失败，请在博联APP设备属性里，关闭“设备上锁”  IP: {ip}，错误详情: {e}"
        _LOGGER.error(error_message)
        return None, error_message
    except OSError as e:
        error_message = f"IP格式错误，请输入有效的设备 IP 地址"
        _LOGGER.error(error_message)
        return None, error_message
    except Exception as e:
        error_message = f"连接设备，出现异常！IP: {ip}，错误详情: {e}"
        _LOGGER.error(error_message)
        return None, error_message

def extract_prefixed_data(data, prefix):
    """递归提取嵌套字典中以给定前缀开头的键值对，并格式化为新的字典。"""
    def recursive_extract(source, current_prefix):
        result = {}
        for key, value in source.items():
            if key.startswith(current_prefix):
                # 提取前缀和点号之后的部分
                new_key = key[len(current_prefix) + 1:]  # +1以跳过点号
                if '.' in new_key:
                    # 如果新键中还包含点号，处理为嵌套结构
                    first_part, rest_part = new_key.split('.', 1)
                    if first_part not in result:
                        result[first_part] = {}
                    if isinstance(value, dict):
                        # 如果值是字典，递归处理
                        nested_result = recursive_extract(value, current_prefix + '.' + first_part)
                        result[first_part].update(nested_result)
                    else:
                        # 处理那些值不是字典的情况
                        result[first_part][rest_part] = value
                else:
                    # 如果新键中没有点号，作为普通键处理
                    result[new_key] = value
        return result
    
    return recursive_extract(data, prefix)

def get_device_templates(device_template_name):
    # 获取当前文件所在目录
    current_directory = os.path.dirname(os.path.abspath(__file__))
    template_directory = os.path.join(current_directory, "template")
    
    # 创建一个新的字典来存储结果
    translated_device_template = {}

    # 遍历template目录的所有子目录
    for device_type in os.listdir(template_directory):
        device_type_path = os.path.join(template_directory, device_type)

        # 检查是否为目录
        if os.path.isdir(device_type_path):
            translated_device_template[device_type] = {}

            # 遍历该目录下的所有文件
            for file_name in os.listdir(device_type_path):
                file_path = os.path.join(device_type_path, file_name)

                # 确保只处理文件，且文件名不包含后缀
                if os.path.isfile(file_path) and '.' in file_name:
                    translated_key = os.path.splitext(file_name)[0]
                    
                    # 使用device_template_name来翻译translated_key
                    translated_key = device_template_name.get(translated_key, translated_key)
                    
                    # 更新字典
                    translated_device_template[device_type][translated_key] = file_path

    return translated_device_template


def apply_replacement_mapping(cmd, replace_map, device_type):
    # 获取device_type对应的替换映射，并按key的长度从长到短排序
    sorted_replacements = sorted(replace_map.get(device_type, {}).items(), key=lambda x: len(x[0]), reverse=True)
    
    # 执行替换操作，忽略大小写
    for old, new in sorted_replacements:
        cmd = re.sub(re.escape(old), new, cmd, flags=re.IGNORECASE)
    
    # 替换掉句点为空格
    cmd = cmd.replace('.', ' ')
    return cmd

def remove_after_last_space(s):
    result = s[:s.rfind('.')] if '.' in s else s
    if result == s:
        result = s[:s.rfind(' ')] if ' ' in s else s
    return result

def remove_before_last_space(s):
    result = s.split('.')[-1] if '.' in s else ''
    if result == s:
        result = s.split(' ')[-1] if ' ' in s else ''
    return result

def get_nested_value(data, path):
    """从嵌套字典中获取值，路径通过.分隔"""
    keys = path.split(".")
    for key in keys:
        # 如果当前的data是字典，尝试按key获取对应的值
        if isinstance(data, dict) and key in data:
            data = data[key]
        else:
            return None  # 如果找不到对应的值，返回None
    return data

class SmartirLearnConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1  # 配置流的版本

    def __init__(self):
        self.device_ip = None  # 初始化设备IP变量

    async def async_fetch_translations(self) -> None:
        """Fetch translations."""
        self._translations = await async_get_translations(
            self.hass,
            self.hass.config.language,
            "common",
            [DOMAIN],
        )

    async def async_step_user(self, user_input=None):
        # 异步加载插件的翻译内容
        await self.async_fetch_translations()

        _LOGGER.debug(f'异步加载插件的翻译内容结果：{self._translations}')
        self.device_ip_mode = extract_prefixed_data(self._translations, TRANSLATION_KEY_DEVICE_IP_MODE)

        """用户输入设备 IP 的第一步，支持扫描或手动输入"""
        errors = {}

        if user_input is not None:
            device_ip = user_input["device_ip"]
            if device_ip == "scan":
                # 用户选择扫描设备 IP 列表
                devices = scan_devices()

                if not devices:
                    errors["device_ip"] = "没有找到可用的设备，请检查网络连接或尝试手动输入设备 IP 地址。"
                    return self.async_show_form(
                        step_id="user",
                        data_schema=vol.Schema({
                            vol.Required("device_ip"): vol.In(self.device_ip_mode)
                        }),
                        errors=errors
                    )

                return self.async_show_form(
                    step_id="user",
                    data_schema=vol.Schema({
                        vol.Required("device_ip"): vol.In([device["ip"] for device in devices])
                    }),
                    errors=errors,
                    description_placeholders={"devices": devices}
                )
            elif device_ip == "manual":
                # 用户选择手动输入设备 IP
                return await self.async_step_manual_input()

            # 验证设备 IP
            device, error = validate_device_ip(device_ip)
            if error:
                errors["device_ip"] = error  # 如果有错误，显示错误信息
                return self.async_show_form(
                    step_id="user",
                    data_schema=vol.Schema({
                        vol.Required("device_ip"): vol.In(self.device_ip_mode)
                    }),
                    errors=errors
                )

            # 保存设备 IP
            self.device_ip = device_ip
            return self.async_create_entry(
                title=f'{getattr(device, "name", "Unknown Device")}({self.device_ip})',
                data={"device_ip": self.device_ip}
            )

        # 显示表单，要求用户选择扫描或手动输入
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required("device_ip"): vol.In(self.device_ip_mode)
            }),
            errors=errors
        )

    async def async_step_manual_input(self, user_input=None):
        """用户输入设备 IP 地址的手动输入步骤"""
        errors = {}

        if user_input is not None:
            device_ip = user_input["device_ip"]
            if not device_ip:
                errors["device_ip"] = "设备 IP 地址不能为空，请输入有效的 IP 地址。"
            else:
                # 验证设备 IP
                device, error = validate_device_ip(device_ip)
                if error:
                    errors["device_ip"] = error  # 如果有错误，显示错误信息
                else:
                    # 保存设备 IP
                    self.device_ip = device_ip
                    return self.async_create_entry(
                        title=f'{getattr(device, "name", "Unknown Device")}({self.device_ip})',
                        data={"device_ip": self.device_ip}
                    )

            return self.async_show_form(
                step_id="manual_input",
                data_schema=vol.Schema({
                    vol.Required("device_ip"): str  # 要求用户输入设备的 IP 地址
                }),
                errors=errors
            )

        # 显示手动输入 IP 地址的表单
        return self.async_show_form(
            step_id="manual_input",
            data_schema=vol.Schema({
                vol.Required("device_ip"): str  # 要求用户输入设备的 IP 地址
            }),
            errors=errors
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """返回设备配置选项的处理类"""
        return SmartirLearnOptionsFlowHandler(config_entry)


class SmartirLearnOptionsFlowHandler(config_entries.OptionsFlow):
    progress_task: asyncio.Task | None = None
    template_deal_mode: str | None = None

    def __init__(self, config_entry):
        self.device_data = dict(config_entry.data)  # 转换成可修改的字典

    async def async_fetch_translations(self) -> None:
        """Fetch translations."""
        self._translations = await async_get_translations(
            self.hass,
            self.hass.config.language,
            "common",
            [DOMAIN],
        )

    async def async_step_init(self, user_input=None):
        """配置选项流的初始化步骤"""
        # 异步加载插件的翻译内容
        await self.async_fetch_translations()
        _LOGGER.debug(f'异步加载插件的翻译内容结果：{self._translations}')

        language = self.hass.config.language
        _LOGGER.debug(f"获取到的国际化语言: {language}")

        # 读取配置文件中的 DEVICE_TEMPLATES 和 COMMAND_REPLACE_MAP
        self.device_templates = get_device_templates(extract_prefixed_data(self._translations, TRANSLATION_KEY_DEVICE_TEMPLATE_NAME))
        self.command_replace_map = extract_prefixed_data(self._translations, TRANSLATION_KEY_COMMAND_REPLACE_MAP)
        
        _LOGGER.debug(f"获取到的设备模板: {self.device_templates}")
        _LOGGER.debug(f"获取到的指令映射: {self.command_replace_map}")

        return await self.async_step_device_configuration()

    async def async_step_device_configuration(self, user_input=None):
        """设备配置步骤，要求用户输入设备的详细配置"""
        errors = {}

        if user_input is not None:
            # 更新设备数据
            self.device_data.update(user_input)

            # 获取设备 IP，连接设备并保存
            device_ip = self.device_data.get("device_ip")
            device, error = validate_device_ip(device_ip)
            if error:
                errors["type"] = error
                return self.async_show_form(
                    step_id="device_configuration",
                    data_schema=CONFIGURE_SCHEMA,
                    errors=errors
                )
            # 保存设备对象到上下文
            self.device = device
            # 检查是否存在 smartir 目录
            self.exists_smartir_directory = os.path.exists(self.get_smartir_directory())
            return await self.async_step_template_and_temperature()

        return self.async_show_form(
            step_id="device_configuration",
            data_schema=CONFIGURE_SCHEMA,
            errors=errors
        )

    def get_smartir_directory(self):
            """获取 SmartIR 目录路径"""
            current_directory = os.path.dirname(os.path.abspath(__file__))
            parent_directory = os.path.dirname(current_directory)
            smartir_directory = os.path.join(parent_directory, "smartir")
            return smartir_directory
    
    async def async_step_template_and_temperature(self, user_input=None):
        """模板选择和温度范围设置步骤，基于设备类型动态展示模板"""
        errors = {}

        device_type = self.device_data.get("type")
        # 加载模板
        templates = self.device_templates.get(device_type, {})

        # 添加“TRANSLATION_KEY_TEMPLATE_FROM_FILE”的选项
        if user_input is not None and user_input.get("template") == self._translations.get(TRANSLATION_KEY_TEMPLATE_FROM_FILE):
            # 进入TRANSLATION_KEY_TEMPLATE_FROM_FILE的流程
            return await self.async_step_select_existing_file()

        # 温度范围设置，仅用于 climate 类型设备
        if device_type == "climate":
            temperature_schema = {
                vol.Required("min_temperature", default=16): vol.All(int, vol.Range(min=16, max=32)),
                vol.Required("max_temperature", default=32): vol.All(int, vol.Range(min=16, max=32)),
            }
        else:
            temperature_schema = {}

        if user_input is not None:
            selected_template_label = user_input["template"]
            selected_template_value = templates.get(selected_template_label)
            self.device_data["template"] = selected_template_value

            if device_type == "climate":
                self.device_data["min_temperature"] = user_input["min_temperature"]
                self.device_data["max_temperature"] = user_input["max_temperature"]

            # 调用方法读取模板文件内容，并准备选择指令
            return await self.async_step_commands_step()

        return self.async_show_form(
            step_id="template_and_temperature",
            description_placeholders={
                "message": f"\n\n<span style='color:red;'><b>!!!注意：检测到未安装SmartIR插件，请先安装再使用！</b></span>" if not self.exists_smartir_directory else ''
            },
            data_schema=vol.Schema({
                vol.Required("template"): vol.In(list(templates.keys()) + [self._translations.get(TRANSLATION_KEY_TEMPLATE_FROM_FILE)]),
                **temperature_schema
            }),
            errors=errors
        )

    async def async_step_select_existing_file(self, user_input=None):
        """展示现有文件供用户选择"""
        errors = {}

        if user_input is not None:
            selected_file = user_input.get("existing_file")
            if selected_file:
                self.device_data["template"] = selected_file
                self.template_deal_mode = user_input.get("template_deal_mode")
                _LOGGER.info(f"指定模板全路径: {self.device_data["template"]}")
                
                if self.template_deal_mode == 'delete':
                    await asyncio.to_thread(os.remove, selected_file)
                    _LOGGER.info(f"File {selected_file} deleted successfully.")
                    return await self.async_step_select_existing_file()
                if self.template_deal_mode == 'view':
                    return await self.async_step_view_smartir_content()
                
                return await self.async_step_commands_step()

        # 获取现有文件列表（假设文件存放在特定目录）
        existing_files = await self.get_existing_files_list()
        _LOGGER.debug(f'获取到的文件列表：{existing_files}')
        template_deal_mode_map = extract_prefixed_data(self._translations, TRANSLATION_KEY_TEMPLATE_DEAL_MODE)

        return self.async_show_form(
            step_id="select_existing_file",
            data_schema=vol.Schema({
                vol.Required("existing_file"): vol.In(existing_files),
                vol.Required("template_deal_mode", default="ref"): vol.In(template_deal_mode_map),
            }),
            errors=errors
        )

    async def async_step_view_smartir_content(self, user_input=None):
        if user_input is not None:
            return await self.async_step_select_existing_file()
        
        template_file_path = self.device_data.get("template")
        # 读取模板文件
        template_data = await asyncio.to_thread(self._read_template_file,template_file_path)
        template_data_json = json.dumps(template_data, indent=2)

        return self.async_show_form(
            step_id="view_smartir_content",
            description_placeholders={
                "file_contents": f'```\n{template_data_json}\n```'
            },
            errors={}
        )

    async def get_existing_files_list(self):
        """获取现有文件列表，并返回map格式，key为文件全路径，value为文件名"""

        # 获取所有文件并以map格式返回
        existing_files = {}

        # 获取当前文件的路径
        current_directory = os.path.dirname(os.path.abspath(__file__))
        # 获取上一级目录并连接到目标路径
        parent_directory = os.path.dirname(current_directory)
        target_directory = os.path.join(parent_directory, "smartir", "codes", self.device_data.get("type", "").lower())

        # 目标目录不存在，就直接返回
        if not os.path.exists(target_directory):
            return existing_files

        try:
            # 使用 asyncio.to_thread 来异步获取目录列表
            files = await asyncio.to_thread(os.listdir, target_directory)

            # 排序文件，超过16位的文件排在前面
            files.sort(key=lambda f: (len(f) <= 16, f))

            for file in files:
                if file.endswith(".json"):
                    full_path = os.path.join(target_directory, file)
                    existing_files[full_path] = file

        except Exception as e:
            # 处理可能的异常，例如目录读取失败
            print(f"An error occurred while listing files: {e}")

        return existing_files

    def _get_commands_step_schema(self, all_commands, default_commands=None, select_all_clicked=True):
        """动态生成包含条件字段的 Schema（保证字段顺序）"""
        schema_fields = OrderedDict()

        # 非测试模式时添加制造商和型号到最前面
        if self.template_deal_mode != 'test':
            schema_fields[vol.Required("manufacturer", default=self.device_data.get("manufacturer", ""))] = str
            schema_fields[vol.Required("models", default=self.device_data.get("models", ""))] = str
        
        commands_select = {
            cmd: apply_replacement_mapping(
                cmd, 
                self.command_replace_map, 
                self.device_data.get("type")
            ) for cmd in all_commands
        }

        """动态生成包含条件字段的 Schema"""
        # 基础字段：指令选择和多选按钮
        schema_fields[vol.Required("commands", default=default_commands or [])] = cv.multi_select(commands_select)
        schema_fields[vol.Optional("deselect_all" if select_all_clicked else "select_all")] = vol.Coerce(bool)
        
        return vol.Schema(schema_fields)
        
    async def async_step_commands_step(self, user_input=None):
        """展示所有指令并选择指令进行学习"""
        errors = {}
        template_file_path = self.device_data.get("template")

        if template_file_path:
            try:
                # 初次加载模板时初始化默认值
                if "template_data" not in self.device_data:
                    template_data = await asyncio.to_thread(self._read_template_file, template_file_path)
                    self.device_data["template_data"] = template_data
                    
                    # 从模板读取默认值
                    self.device_data.setdefault("manufacturer", template_data.get("manufacturer", ""))
                    models = ",".join(template_data.get("supportedModels", []))
                    self.device_data.setdefault("models", models)
                    
                # 初次加载模板时持久化数据 -----------------------------------------
                if "expanded_commands" not in self.device_data:  # 关键判断：确保只初始化一次
                    template_data = await asyncio.to_thread(self._read_template_file, template_file_path)
                    self.device_data["template_data"] = template_data
                    _LOGGER.debug(f"读取模板数据成功: {template_data}")

                    raw_commands = self.extract_commands(template_data.get("commands", {}))
                    self.device_data["raw_commands"] = raw_commands  # 原始未扩展指令
                    self.device_data["expanded_commands"] = self.expand_selected_temperature_commands(raw_commands.copy())  # 预先生成完整列表

                # 从持久化数据获取指令列表 -----------------------------------------
                all_commands = self.device_data["expanded_commands"]
                _LOGGER.debug(f"当前可用指令列表: {all_commands}")

                if user_input is not None:
                    # 处理按钮点击动作 -------------------------------------------
                    select_all_clicked = user_input.get("select_all", False)
                    deselect_all_clicked = user_input.get("deselect_all", False)
                    
                    # 获取并严格过滤用户输入 -------------------------------------
                    selected_commands = [
                        cmd for cmd in user_input.get("commands", [])
                        if cmd in all_commands  # 强制过滤非法值
                    ]

                    # 处理全选/全不选 -------------------------------------------
                    if select_all_clicked:
                        selected_commands = all_commands.copy()
                    elif deselect_all_clicked:
                        selected_commands = []

                    # 非测试模式时需要验证制造商和型号
                    if self.template_deal_mode != 'test':
                        # 保存并验证字段
                        self.device_data["manufacturer"] = user_input.get("manufacturer", "")
                        self.device_data["models"] = user_input.get("models", "")
                        
                        # 输入验证
                        if not self.device_data["manufacturer"]:
                            errors["manufacturer"] = "制造商不能为空"
                        if not self.device_data["models"]:
                            errors["models"] = "型号不能为空"
                    
                    if errors:
                        return self.async_show_form(
                            step_id="commands_step",
                            data_schema=self._get_commands_step_schema(all_commands, selected_commands, select_all_clicked),
                            errors=errors
                        )

                    # 更新设备数据（不再需要额外扩展）--------------------------------
                    _LOGGER.debug(f"待学习指令列表：{selected_commands}")
                    self.device_data["selected_commands"] = selected_commands

                    # 如果是按钮点击，刷新表单 -------------------------------------
                    if select_all_clicked or deselect_all_clicked:
                        return self.async_show_form(
                            step_id="commands_step",
                            data_schema=self._get_commands_step_schema(all_commands, selected_commands, select_all_clicked),
                            errors=errors
                        )

                    # 提交验证 ---------------------------------------------------
                    if not selected_commands:
                        errors["base"] = "至少选择一个指令"
                    else:
                        if self.template_deal_mode == 'test':
                            return await self.async_step_test_all_command()
                        return await self.async_step_learn_ir_code()

                # 初次显示表单 -------------------------------------------------
                return self.async_show_form(
                    step_id="commands_step",
                    data_schema=self._get_commands_step_schema(all_commands, all_commands, True),
                    errors=errors
                )
            except FileNotFoundError:
                _LOGGER.error(f"模板文件 {template_file_path} 未找到！")
                errors["base"] = "template_missing"

        return self.async_show_form(
            step_id="commands_step",
            errors=errors
        )

    async def async_step_test_all_command(self):
        """验证所有指令"""
        errors = {}

        # 获取所有指令
        template_data = self.device_data["template_data"]
        all_commands = self.device_data["selected_commands"]
        # 获取已选择的指令
        selected_commands = self.device_data.get("selected_commands", [])

        # 记录未通过的指令
        if not hasattr(self, 'failed_commands'):
            self.failed_commands = []
            self.failed_command_names = []

        if not hasattr(self, 'current_command_index'):
            self.current_command_index = 0

        # 筛选出 selected_commands 中的指令
        selected_commands = [cmd for cmd in selected_commands if cmd in all_commands]

        if self.current_command_index < len(selected_commands):
            # 获取当前指令和其value值
            command = selected_commands[self.current_command_index]
            command_value = get_nested_value(template_data.get("commands", {}), command)

            # 设置当前指令到上下文
            self.device_data["current_command"] = command
            self.device_data["current_command_name"] = apply_replacement_mapping(command, self.command_replace_map, self.device_data.get("type"))
            self.device_data["current_command_value"] = command_value

            # 逐个指令测试
            return await self.async_step_test_command()

        # 所有指令验证完成后，展示未通过指令列表
        return await self.async_step_finish_failed_tests()

    async def async_step_test_command(self, user_input=None):
        """验证单个指令"""
        errors = {}
        command = self.device_data.get("current_command")
        command_name = self.device_data["current_command_name"]
        command_value = self.device_data.get("current_command_value")

        if user_input is not None:
            test_result = user_input.get("test_result")
            if test_result == "fail":
                # 如果验证失败，记录未通过的指令
                self.failed_commands.append(command)
                self.failed_command_names.append(command_name)

            # 继续测试下一个指令
            self.current_command_index += 1

            # 如果还有指令未验证，继续测试下一个
            return await self.async_step_test_all_command()

        # 发送红外指令
        result, error = await self.send_ir_code(command_value)
        if error:
            errors['test_result'] = error

        # 显示测试指令的界面，等待用户选择通过或未通过
        return self.async_show_form(
            step_id="test_command",
            description_placeholders={
                "command": f'`{command_name}`',
                "command_value": f'`{command_value}`',
            },
            data_schema=vol.Schema({
                vol.Required("test_result"): vol.In(["pass", "fail"])  # 用户选择是否通过
            }),
            errors=errors
        )
 
    async def async_step_finish_failed_tests(self, user_input=None):
        """展示所有未通过的指令，并处理重新学习的选择"""
        # 如果用户选择重新学习
        if user_input and user_input.get("retry_learning") == "yes":
            # 更新 selected_commands 为失败的指令
            self.device_data["selected_commands"] = self.failed_commands
            self.template_deal_mode = 'replace'

            # 清理
            self.failed_commands = None
            self.failed_command_names = None
            self.current_command_value = None
            self.current_command_index = None

            # 进入重新学习流程
            _LOGGER.debug(f'进入重新学习流程 selected_commands: {self.failed_commands}')
            return await self.async_step_learn_ir_code()

        if hasattr(self, 'failed_command_names') and self.failed_command_names:
            failed_commands_list = "\n".join(self.failed_command_names)

            # 显示未通过的指令，并提供重新学习的选项
            return self.async_show_form(
                step_id="finish_failed_tests",
                description_placeholders={
                    "failed_commands": f'```\n{failed_commands_list}\n```',
                },
                data_schema=vol.Schema({
                    vol.Required("retry_learning"): vol.In(["yes", "no"])  # 用户选择是否重新学习
                }),
                errors={},
                last_step=True
            )
        else:
            # 如果没有未通过的指令，完成配置
            return self.async_create_entry(
                    title="设备配置完成",
                    data={}
                )

    def expand_selected_temperature_commands(self, selected_commands):
        """展开用户选中的温度指令，保留前缀并生成相应的命令"""
        expanded_commands = []

        for command in selected_commands:
            # 检查指令是否包含温度范围
            if "minTemperature" in command and "maxTemperature" in command:
                # 提取 minTemperature 和 maxTemperature 的值
                min_temp = self.device_data.get("min_temperature", 16)
                max_temp = self.device_data.get("max_temperature", 32)
                # 为每个温度生成一个新的指令
                for temp in range(min_temp, max_temp + 1):
                    command = command.replace(".minTemperature-maxTemperature", "")
                    expanded_commands.append(f"{command}.{temp}")
            else:
                expanded_commands.append(command)

        return expanded_commands

    async def async_step_learn_ir_code(self, user_input=None):
        """展示指令并等待学习 IR 码"""
        errors = {}

        # 获取当前指令
        selected_commands = self.device_data.get("selected_commands", [])
        if selected_commands:
            self.device_data["prev_command"] = self.device_data.get("current_command", None)
            command = selected_commands[0]  # 获取第一个未学习的指令
            self.device_data["current_command"] = command
            command_name = apply_replacement_mapping(command, self.command_replace_map, self.device_data.get("type"))
            self.device_data["current_command_name"] = command_name
            _LOGGER.debug(f"准备开始学习 IR 码：{command_name}")
            self.progress_task = None
            _LOGGER.debug(f'-------prev_command: {self.device_data.get("prev_command")}  current_command: {command}  min_temperature: {self.device_data.get("min_temperature")}')
            if self.device_data.get("prev_command") and remove_after_last_space(self.device_data.get("prev_command")) != remove_after_last_space(command):
                command_pre = remove_after_last_space(command_name)
                commond_sigle = remove_before_last_space(command)
                if commond_sigle == str(self.device_data.get("min_temperature")):
                    command_pre = f"{command_pre} {int(commond_sigle) + 1}"

                return self.async_show_form(
                    step_id="learn_ir_code_progres",
                    description_placeholders={
                        "command_pre": f'<b>{command_pre}</b>',
                        "mode": 1
                    },
                    errors=errors
                )

            return await self.async_step_learn_ir_code_progres()

        # 如果没有指令需要学习，跳转到完成步骤
        return await self.async_step_finish()


    async def async_step_learn_ir_code_progres(self, user_input=None):
        current_command_name = self.device_data.get("current_command_name")
        if self.progress_task is None:
            # 创建一个异步任务来执行 IR 码学习
            self.progress_task = self.hass.async_create_task(self.async_step_receive_ir_code())

        if not self.progress_task.done():
            # 使用 async_show_progress 来显示进度条
            return self.async_show_progress(
                step_id=f"learn_ir_code_progres",
                progress_action=f"learn_ir_code_progres",  # 传递任务名称
                progress_task=self.progress_task,  # 传递任务对象
                description_placeholders={
                    "command": f'<b>{current_command_name}</b>'
                },
            )

        if getattr(self, 'error', None):
            return self.async_show_progress_done(next_step_id="learn_ir_code_fail")

        return self.async_show_progress_done(next_step_id="learn_ir_code")

    async def async_step_learn_ir_code_fail(self, user_input=None):
        errors = {}
        command_name = self.device_data["current_command_name"]
        errors["command"] = self.error
        # 清除错误
        self.error = None

        return self.async_show_form(
            step_id="learn_ir_code",
            description_placeholders={"command": f'<b>{command_name}</b>'},
            data_schema=vol.Schema({
                vol.Optional("command", default=command_name): str
            }),
            errors=errors
        )

    async def async_step_receive_ir_code(self, user_input=None):
        """接收 IR 码并将其保存到 device_data"""
        errors = {}

        # 从 device_data 获取当前要学习的指令
        current_command = self.device_data.get("current_command")

        if current_command:
            _LOGGER.info(f"开始接收 {current_command} 的 IR 码...")

            try:
                # 调用 receive_ir_code 方法来接收 IR 码
                ir_code = await self.receive_ir_code()

                if ir_code:
                    _LOGGER.info(f"接收到 {current_command} 的 IR 码: {ir_code}")

                    # 将 IR 码存储到设备数据中
                    if "ir_codes" not in self.device_data:
                        self.device_data["ir_codes"] = {}
                    self.device_data["ir_codes"][current_command] = ir_code

                    # 移除已学习的指令
                    remaining_commands = self.device_data["selected_commands"][1:]  # 移除当前指令
                    self.device_data["selected_commands"] = remaining_commands
                    return ir_code, None
                else:
                    self.error = f"未能接收到 IR 码，请重试。"
            except broadlink.exceptions.NetworkTimeoutError as e:
                self.error = f"接收 IR 码超时, 请确认遥控器是否按了需要学习的按钮"
            except Exception as e:
                self.error = f"接收 IR 码时发生未知错误: {e}"
                _LOGGER.error(e)

        # 如果有错误，返回错误信息
        return None, self.error

    async def receive_ir_code(self):
        """
        进入学习模式并等待红外命令。
        """
        if MOCK_DATA:
            """模拟接收 IR 码"""
            await asyncio.sleep(1)  # 模拟等待接收 IR 码的时间
            return f"IR_CODE_{uuid.uuid4().hex}"  # 返回模拟的 IR 码
            #raise Exception("I know python!")
        
        self.device.enter_learning()  # 设备进入学习模式
        start = time.time()
        while time.time() - start < LEARN_TIMEOUT:  # 在超时时间内循环尝试获取数据
            await asyncio.sleep(0.1)
            try:
                # 如果获取到数据，则返回Base64编码后的命令数据
                return base64.b64encode(self.device.check_data()).decode('ascii')
            except (ReadError, StorageError):
                # 如果读取数据或存储出现异常，则继续尝试
                continue
        else:
            _LOGGER.error("No data received...")  # 超时未获取到数据，输出提示信息
            raise broadlink.exceptions.NetworkTimeoutError("Failed to receive IR data within timeout period.")


    async def send_ir_code(self, command_value):
        """
        进入学习模式并等待红外命令。
        """
        if MOCK_DATA:
            return True, None

        ip = self.device_data.get("device_ip")
        try:
            self.device.send_data(base64.b64decode(command_value))
            _LOGGER.info(f'已发送IR指令：{command_value}')
            return True, None
        except broadlink.exceptions.NetworkTimeoutError as e:
            error_message = f"当前设备IP，无法连接，请检查！IP: {ip}，错误详情: {e}"
            _LOGGER.error(error_message)
            return False, error_message
        except broadlink.exceptions.AuthenticationError as e:
            error_message = f"设备授权失败，请在博联APP设备属性里，关闭“设备上锁”  IP: {ip}，错误详情: {e}"
            _LOGGER.error(error_message)
            return False, error_message
        except OSError as e:
            error_message = f"IP格式错误，请输入有效的设备 IP 地址"
            _LOGGER.error(error_message)
            return False, error_message
        except Exception as e:
            error_message = f"连接设备，出现异常！IP: {ip}，错误详情: {e}"
            _LOGGER.error(error_message)
            return False, error_message
        return False, '异常'

    async def async_step_finish(self, user_input=None):
        """显示所有接收到的 IR 码，保存配置，并完成设置。"""
        ir_codes = self.device_data.get("ir_codes", {})
        template_file_path = self.device_data.get("template")

        if user_input is not None:
            # 保存文件
            await asyncio.to_thread(self._save_configuration_file, self.saved_file_path, self.configuration_json)
            _LOGGER.info(f"配置文件已保存: {self.saved_file_path}")
            return self.async_create_entry(
                    title="设备配置完成",
                    data={}
                )

        if ir_codes and template_file_path:
            try:
                # 读取模板文件
                template_data = await asyncio.to_thread(self._read_template_file,template_file_path)
                _LOGGER.debug(f"模板数据: {template_data}")

                # 更新模板数据
                template_data["manufacturer"] = self.device_data.get("manufacturer", "Unknown")
                template_data["supportedModels"] = [item.strip() for item in self.device_data.get("models", "Unknown").split(",")]

                # 合并学习到的 IR 码到模板命令中
                merged_commands = merge_commands(
                    template_data.get("commands", {}),
                    ir_codes,
                    min_temperature=self.device_data.get("min_temperature", 16),
                    max_temperature=self.device_data.get("max_temperature", 32)
                )
                template_data["commands"] = merged_commands

                # 如果设备类型是 climate，更新温度范围
                if self.device_data.get("type") == "climate":
                    template_data["minTemperature"] = self.device_data.get("min_temperature", 16)
                    template_data["maxTemperature"] = self.device_data.get("max_temperature", 32)

                # 转换为 JSON 字符串
                self.configuration_json = json.dumps(template_data, indent=2)
                _LOGGER.info(f"学习到的所有 IR 码：{ir_codes}\n\n生成的配置: {self.configuration_json}")
                # 保存配置到文件
                self.file_base_name, self.saved_file_path = self._get_configuration_file_path()
                if self.template_deal_mode == 'replace':
                    self.saved_file_path = template_file_path
                    self.file_base_name = os.path.splitext(os.path.basename(template_file_path))[0]

                # 在表单中显示保存的文件内容和路径
                return self.async_show_form(
                    step_id="finish",
                    description_placeholders={
                        "file_path": f'`{self.saved_file_path}`',
                        "device_code": f'`{self.file_base_name}`',
                        "file_contents": f'```\n{self.configuration_json}\n```'
                    },
                    data_schema=vol.Schema({

                    }),
                    errors={},
                    last_step=True
                )
            except FileNotFoundError:
                _LOGGER.error(f"模板文件 {template_file_path} 未找到！ 路径：{template_file_path}")

        # 如果没有学习到 IR 码，记录错误信息
        return self.async_abort(reason="未能学习到任何 IR 码")

    def _save_configuration_file(self, file_path, configuration_json):
        # 将配置写入到文件
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(configuration_json)

        return file_path
    
    def _get_configuration_file_path(self):
        file_base_name = datetime.datetime.now().strftime("%Y%m%d%H%M")
        file_name = f"{file_base_name}.json"
        
        # 获取当前文件的路径
        current_directory = os.path.dirname(os.path.abspath(__file__))
        
        # 获取上一级目录并连接到目标路径
        parent_directory = os.path.dirname(current_directory)
        target_directory = os.path.join(parent_directory, "smartir", "codes", self.device_data.get("type", "").lower())
        
        # 确保目标目录存在
        if not os.path.exists(target_directory):
            os.makedirs(target_directory)

        file_path = os.path.join(target_directory, file_name)
        return file_base_name, file_path


    def _read_template_file(self, template_path):
        """同步读取模板文件的内容"""
        with open(template_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def extract_commands(self, commands, parent_key=""):
        """递归提取所有指令名称"""
        all_commands = []
        for key, value in commands.items():
            current_key = f"{parent_key}.{key}" if parent_key else key
            if isinstance(value, dict):
                all_commands.extend(self.extract_commands(value, current_key))
            else:
                all_commands.append(current_key)

        #_LOGGER.debug(f"当前提取的指令: {all_commands}")
        return all_commands
