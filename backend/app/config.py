from pydantic_settings import BaseSettings
from typing import Dict

class Settings(BaseSettings):
    app_name: str = "SellWise"
    version: str = "1.0.0"
    
    scoring_correlation_weight: float = 60.0
    scoring_views_weight: float = 40.0
    
    platform_colors: Dict[str, Dict[str, str]] = {
        "taobao": {"bg": "#e6f7ff", "text": "#1890ff", "label": "淘宝"},
        "jd": {"bg": "#fff7e6", "text": "#d48806", "label": "京东"},
        "pdd": {"bg": "#f6ffed", "text": "#389e0d", "label": "拼多多"},
        "douyin": {"bg": "#fff0f6", "text": "#c41d7f", "label": "抖音"},
        "xiaohongshu": {"bg": "#fff1f0", "text": "#cf1322", "label": "小红书"},
        "other": {"bg": "#f0f5ff", "text": "#2f54eb", "label": "其他"},
    }

settings = Settings()
