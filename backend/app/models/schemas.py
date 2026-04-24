from datetime import datetime as dt_datetime, date as dt_date
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.models.enums import Platform, ProductStatus

class ProductBase(BaseModel):
    name: str = Field(..., description="产品名称")
    description: Optional[str] = Field(None, description="产品描述")
    price: float = Field(..., gt=0, description="产品价格")
    platform: Platform = Field(..., description="销售平台")
    status: ProductStatus = Field(default=ProductStatus.ACTIVE, description="产品状态")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, description="产品名称")
    description: Optional[str] = Field(None, description="产品描述")
    price: Optional[float] = Field(None, gt=0, description="产品价格")
    status: Optional[ProductStatus] = Field(None, description="产品状态")

class ProductResponse(ProductBase):
    id: int = Field(..., description="产品ID")
    created_at: dt_datetime = Field(..., description="创建时间")
    updated_at: dt_datetime = Field(..., description="更新时间")

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    products: List[ProductResponse] = Field(..., description="产品列表")
    total: int = Field(..., description="总数量")
    page: int = Field(..., description="当前页")
    page_size: int = Field(..., description="每页数量")

class TrendProduct(BaseModel):
    id: int = Field(..., description="产品ID")
    name: str = Field(..., description="产品名称")
    category: str = Field(..., description="产品分类")
    price: float = Field(..., description="价格")
    sales_volume: int = Field(..., description="销量")
    sales_growth: float = Field(..., description="销售增长率%")
    rating: float = Field(..., description="评分")
    review_count: int = Field(..., description="评价数")
    trend_score: float = Field(..., description="趋势分数")
    platform: Platform = Field(..., description="平台")
    image_url: Optional[str] = Field(None, description="图片URL")

class TrendProductList(BaseModel):
    products: List[TrendProduct] = Field(..., description="趋势产品列表")
    total: int = Field(..., description="总数量")
    trending_up: int = Field(..., description="上升趋势数量")
    trending_down: int = Field(..., description="下降趋势数量")

class CategoryTrend(BaseModel):
    category: str = Field(..., description="分类名称")
    sales_volume: int = Field(..., description="销量")
    growth_rate: float = Field(..., description="增长率%")
    product_count: int = Field(..., description="产品数量")
    avg_price: float = Field(..., description="平均价格")

class ProductResearchResponse(BaseModel):
    trend_products: List[TrendProduct] = Field(..., description="热门趋势产品")
    category_trends: List[CategoryTrend] = Field(..., description="分类趋势")
    hot_keywords: List[str] = Field(..., description="热门关键词")

class DailySalesData(BaseModel):
    sale_date: dt_date = Field(..., description="日期")
    sales_amount: float = Field(..., description="销售额")
    order_count: int = Field(..., description="订单数")
    avg_order_value: float = Field(..., description="客单价")
    visitor_count: int = Field(..., description="访客数")
    conversion_rate: float = Field(..., description="转化率%")

class SalesSummary(BaseModel):
    period: str = Field(..., description="时间段")
    total_sales: float = Field(..., description="总销售额")
    total_orders: int = Field(..., description="总订单数")
    avg_order_value: float = Field(..., description="平均客单价")
    total_visitors: int = Field(..., description="总访客数")
    avg_conversion_rate: float = Field(..., description="平均转化率%")
    sales_growth: float = Field(..., description="销售增长%")

class ProductPerformance(BaseModel):
    product_id: int = Field(..., description="产品ID")
    product_name: str = Field(..., description="产品名称")
    sales_amount: float = Field(..., description="销售额")
    sales_quantity: int = Field(..., description="销售数量")
    profit: float = Field(..., description="利润")
    profit_margin: float = Field(..., description="利润率%")
    return_rate: float = Field(..., description="退货率%")

class AnalyticsResponse(BaseModel):
    sales_summary: SalesSummary = Field(..., description="销售概览")
    daily_sales: List[DailySalesData] = Field(..., description="每日销售数据")
    top_products: List[ProductPerformance] = Field(..., description="热销产品排行")
    category_sales: Dict[str, float] = Field(..., description="分类销售占比")

class InfluencerBase(BaseModel):
    id: int = Field(..., description="达人ID")
    name: str = Field(..., description="达人名称")
    avatar_url: Optional[str] = Field(None, description="头像URL")
    followers: int = Field(..., description="粉丝数")
    following: int = Field(..., description="关注数")
    posts_count: int = Field(..., description="笔记数")
    likes_count: int = Field(..., description="获赞数")
    collects_count: int = Field(..., description="收藏数")
    comments_count: int = Field(..., description="评论数")
    engagement_rate: float = Field(..., description="互动率%")
    categories: List[str] = Field(..., description="内容分类")
    platform: str = Field(default="xiaohongshu", description="平台")

class InfluencerDetail(InfluencerBase):
    bio: Optional[str] = Field(None, description="简介")
    avg_likes_per_post: float = Field(..., description="平均获赞数/笔记")
    avg_comments_per_post: float = Field(..., description="平均评论数/笔记")
    avg_collects_per_post: float = Field(..., description="平均收藏数/笔记")
    recent_posts: List[Dict[str, Any]] = Field(..., description="最近笔记")

class InfluencerListResponse(BaseModel):
    influencers: List[InfluencerBase] = Field(..., description="达人列表")
    total: int = Field(..., description="总数量")
    page: int = Field(..., description="当前页")
    page_size: int = Field(..., description="每页数量")

class InfluencerAnalyticsResponse(BaseModel):
    top_influencers: List[InfluencerBase] = Field(..., description="热门达人")
    category_distribution: Dict[str, int] = Field(..., description="分类分布")
    follower_distribution: Dict[str, int] = Field(..., description="粉丝量级分布")
    avg_engagement_rate: float = Field(..., description="平均互动率%")
