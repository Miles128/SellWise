from datetime import date
from typing import Optional, List, Dict, Any, Generic, TypeVar
from pydantic import BaseModel, Field
from .enums import DataType, Platform, ScoreLevel

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    code: int = 200
    message: str = "操作成功"
    data: Optional[T] = None

# ========== 导入相关 ==========

class ExcelSheetInfo(BaseModel):
    name: str
    row_count: int
    column_count: int
    columns: List[str]
    sample_data: List[Dict[str, Any]]

class FieldMappingItem(BaseModel):
    system_field: str
    excel_column: Optional[str]
    is_required: bool
    description: str

class FieldMappingRequest(BaseModel):
    data_type: DataType
    sheet_name: str
    mappings: List[FieldMappingItem]
    save_as_template: bool = False
    template_name: Optional[str] = None

class ImportResult(BaseModel):
    success: bool
    row_count: int
    columns: List[str]
    message: str

class SystemFieldTemplate(BaseModel):
    data_type: DataType
    fields: List[FieldMappingItem]

# ========== 热点选款 ==========

class HotProduct(BaseModel):
    id: str
    product_name: str
    platform: Platform
    heat_index: float
    avg_price: Optional[float]
    data_source: Optional[str]
    trend_percent: Optional[float] = None

class HotProductListRequest(BaseModel):
    page: int = 1
    page_size: int = 20
    platforms: Optional[List[Platform]] = None
    min_heat: Optional[float] = None
    max_heat: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    keyword: Optional[str] = None
    sort_by: str = "heat_index"
    sort_order: str = "desc"

class PaginatedResponse(BaseModel, Generic[T]):
    total: int
    page: int
    page_size: int
    data: List[T]

# ========== 产品监控 ==========

class ProductDailyData(BaseModel):
    product_id: str
    product_name: str
    date: date
    sales: int
    favorites: Optional[int]
    views: Optional[int]

class CorrelationMatrix(BaseModel):
    variables: List[str]
    matrix: List[List[float]]
    labels: List[List[str]]

class ProductMonitorSummary(BaseModel):
    total_sales: int
    total_favorites: int
    total_views: int
    conversion_rate: float
    sales_change: Optional[float]
    favorites_change: Optional[float]
    views_change: Optional[float]

class ProductMonitorRequest(BaseModel):
    product_ids: List[str]
    start_date: date
    end_date: date
    metrics: List[str] = ["sales", "favorites", "views"]

class ProductMonitorResponse(BaseModel):
    summary: ProductMonitorSummary
    trends: List[ProductDailyData]
    correlation: CorrelationMatrix

# ========== 达人分析 ==========

class ScoringConfig(BaseModel):
    correlation_weight: float = Field(60.0, ge=0, le=100)
    views_weight: float = Field(40.0, ge=0, le=100)
    
    class Config:
        json_schema_extra = {
            "example": {
                "correlation_weight": 60.0,
                "views_weight": 40.0
            }
        }

class InfluencerScore(BaseModel):
    influencer_id: str
    influencer_name: str
    total_score: float
    score_level: ScoreLevel
    correlation_score: float
    correlation_coefficient: float
    raw_views: int
    weighted_views: float
    views_score: float
    weight_coefficient: float
    linked_product_id: str
    linked_product_name: str
    sales_change_percent: Optional[float]

class InfluencerDetail(InfluencerScore):
    post_id: str
    user_profile_weights: Dict[str, float]
    trend_data: List[Dict[str, Any]]
    analysis_conclusion: str

class InfluencerListRequest(BaseModel):
    page: int = 1
    page_size: int = 20
    platforms: Optional[List[str]] = None
    min_score: Optional[float] = None
    max_score: Optional[float] = None
    sort_by: str = "total_score"
    sort_order: str = "desc"

class InfluencerSummary(BaseModel):
    total_count: int
    avg_score: float
    excellent_ratio: float
    total_weighted_views: float

class InfluencerListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    summary: InfluencerSummary
    data: List[InfluencerScore]
