"""Home Assistant Broadlink Control Integration."""
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
import logging
from .constants import DOMAIN

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass, config_entry):
    # 获取设备IP
    device_ip = config_entry.data["device_ip"]
    
    # 获取设备注册表
    device_registry = dr.async_get(hass)

    # 注册设备
    # device_registry.async_get_or_create(
    #     config_entry_id=config_entry.entry_id,
    #     identifiers={(DOMAIN, device_ip)},
    #     name=f"Learn Device ({device_ip})",  # 使用格式化字符串来添加前缀
    #     #manufacturer="你的制造商",  # 可选
    #     #model="你的模型",  # 可选
    # )

    # 如果有其他初始化或实体设置逻辑放在这里
    return True

async def _update_listener(hass, entry):
    """Handle options update."""
    await hass.config_entries.async_reload(entry.entry_id)

async def async_unload_entry(hass, entry):
    """Unload a Smart IR Learn config entry."""
    return True
