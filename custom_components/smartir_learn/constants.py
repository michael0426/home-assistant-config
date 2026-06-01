from typing import Final

MOCK_DATA: Final = False

DOMAIN: Final = "smartir_learn"
LEARN_TIMEOUT: Final = 30

# 设备类型列表
DEVICE_TYPES: Final = {
    "climate": "Climate",
    "media_player": "Media Player",
    "fan": "Fan",
    "light": "Light"
}

# Translation Keys
TRANSLATION_KEY_DEVICE_IP_MODE: Final = f"component.{DOMAIN}.common.device_ip_mode"
TRANSLATION_KEY_TEMPLATE_FROM_FILE: Final = f"component.{DOMAIN}.common.template_from_file"
TRANSLATION_KEY_COMMAND_REPLACE_MAP: Final = f"component.{DOMAIN}.common.command_replace_map"
TRANSLATION_KEY_DEVICE_TEMPLATE_NAME: Final = f"component.{DOMAIN}.common.device_template_name"
TRANSLATION_KEY_TEMPLATE_DEAL_MODE: Final = f"component.{DOMAIN}.common.template_deal_mode"

