from enum import Enum

class DataType(str, Enum):
    HOT_PRODUCTS = "hot_products"
    PRODUCT_MONITOR = "product_monitor"
    INFLUENCER = "influencer"

class Platform(str, Enum):
    TAOBAO = "taobao"
    JD = "jd"
    PDD = "pdd"
    DOUYIN = "douyin"
    XIAOHONGSHU = "xiaohongshu"
    OTHER = "other"

class ScoreLevel(str, Enum):
    EXCELLENT = "优秀"
    GOOD = "良好"
    AVERAGE = "一般"
    NEEDS_IMPROVEMENT = "待提升"
