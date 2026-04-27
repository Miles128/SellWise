from fastapi import APIRouter, Query
from typing import Optional
from app.models.schemas import (
    ProductResearchResponse,
    TrendProduct,
    CategoryTrend,
    TrendProductList
)
from app.models.enums import Platform

router = APIRouter()

@router.get("/trending", response_model=TrendProductList)
async def get_trending_products(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    platform: Optional[Platform] = Query(None, description="平台筛选"),
    category: Optional[str] = Query(None, description="分类筛选")
):
    mock_products = [
        TrendProduct(
            id=i+1,
            name=f"热销产品 {i+1}",
            category="美妆护肤" if i % 3 == 0 else "家居用品" if i % 3 == 1 else "电子产品",
            price=99.99 + i * 10,
            sales_volume=10000 + i * 500,
            sales_growth=15.5 + i * 2,
            rating=4.5 + i * 0.1,
            review_count=5000 + i * 200,
            trend_score=85 + i * 1.5,
            platform=Platform.AMAZON if i % 2 == 0 else Platform.SHOPIFY,
            image_url=f"https://example.com/product-{i+1}.jpg"
        )
        for i in range(10)
    ]
    
    return TrendProductList(
        products=mock_products,
        total=50,
        trending_up=35,
        trending_down=15
    )

@router.get("/overview", response_model=ProductResearchResponse)
async def get_product_research_overview():
    trend_products = [
        TrendProduct(
            id=i+1,
            name=f"趋势产品 {i+1}",
            category="美妆护肤",
            price=199.99,
            sales_volume=15000,
            sales_growth=25.5,
            rating=4.8,
            review_count=8000,
            trend_score=92.5,
            platform=Platform.AMAZON
        )
        for i in range(5)
    ]
    
    category_trends = [
        CategoryTrend(
            category="美妆护肤",
            sales_volume=150000,
            growth_rate=28.5,
            product_count=1200,
            avg_price=159.99
        ),
        CategoryTrend(
            category="家居用品",
            sales_volume=120000,
            growth_rate=15.2,
            product_count=950,
            avg_price=89.99
        ),
        CategoryTrend(
            category="电子产品",
            sales_volume=200000,
            growth_rate=32.8,
            product_count=850,
            avg_price=599.99
        )
    ]
    
    hot_keywords = [
        "防晒喷雾",
        "无线耳机",
        "智能手表",
        "美妆套装",
        "家居收纳"
    ]
    
    return ProductResearchResponse(
        trend_products=trend_products,
        category_trends=category_trends,
        hot_keywords=hot_keywords
    )

@router.get("/categories", response_model=list[CategoryTrend])
async def get_category_trends():
    return [
        CategoryTrend(
            category="美妆护肤",
            sales_volume=150000,
            growth_rate=28.5,
            product_count=1200,
            avg_price=159.99
        ),
        CategoryTrend(
            category="家居用品",
            sales_volume=120000,
            growth_rate=15.2,
            product_count=950,
            avg_price=89.99
        ),
        CategoryTrend(
            category="电子产品",
            sales_volume=200000,
            growth_rate=32.8,
            product_count=850,
            avg_price=599.99
        ),
        CategoryTrend(
            category="服装配饰",
            sales_volume=180000,
            growth_rate=19.3,
            product_count=2100,
            avg_price=129.99
        ),
        CategoryTrend(
            category="食品饮料",
            sales_volume=95000,
            growth_rate=12.1,
            product_count=650,
            avg_price=49.99
        )
    ]
