from fastapi import APIRouter, Query
from typing import Optional
from datetime import date, timedelta
from app.models.schemas import (
    AnalyticsResponse,
    SalesSummary,
    DailySalesData,
    ProductPerformance
)

router = APIRouter()

@router.get("/overview", response_model=AnalyticsResponse)
async def get_analytics_overview(
    period: str = Query("30d", description="时间段: 7d, 30d, 90d"),
    start_date: Optional[date] = Query(None, description="开始日期"),
    end_date: Optional[date] = Query(None, description="结束日期")
):
    days = 30 if period == "30d" else 7 if period == "7d" else 90
    
    daily_sales = []
    for i in range(days):
        d = date.today() - timedelta(days=days - i - 1)
        daily_sales.append(
            DailySalesData(
                date=d,
                sales_amount=50000 + i * 1000,
                order_count=200 + i * 5,
                avg_order_value=250.0,
                visitor_count=5000 + i * 100,
                conversion_rate=4.0 + i * 0.1
            )
        )
    
    sales_summary = SalesSummary(
        period=period,
        total_sales=1500000.0,
        total_orders=6000,
        avg_order_value=250.0,
        total_visitors=150000,
        avg_conversion_rate=4.0,
        sales_growth=12.5
    )
    
    top_products = [
        ProductPerformance(
            product_id=1,
            product_name="热销产品A",
            sales_amount=150000.0,
            sales_quantity=1000,
            profit=45000.0,
            profit_margin=30.0,
            return_rate=2.5
        ),
        ProductPerformance(
            product_id=2,
            product_name="热销产品B",
            sales_amount=120000.0,
            sales_quantity=800,
            profit=36000.0,
            profit_margin=30.0,
            return_rate=3.2
        ),
        ProductPerformance(
            product_id=3,
            product_name="热销产品C",
            sales_amount=100000.0,
            sales_quantity=600,
            profit=30000.0,
            profit_margin=30.0,
            return_rate=1.8
        ),
        ProductPerformance(
            product_id=4,
            product_name="热销产品D",
            sales_amount=90000.0,
            sales_quantity=500,
            profit=27000.0,
            profit_margin=30.0,
            return_rate=4.1
        ),
        ProductPerformance(
            product_id=5,
            product_name="热销产品E",
            sales_amount=80000.0,
            sales_quantity=450,
            profit=24000.0,
            profit_margin=30.0,
            return_rate=2.0
        )
    ]
    
    category_sales = {
        "美妆护肤": 35.5,
        "家居用品": 25.0,
        "电子产品": 20.5,
        "服装配饰": 12.0,
        "食品饮料": 7.0
    }
    
    return AnalyticsResponse(
        sales_summary=sales_summary,
        daily_sales=daily_sales,
        top_products=top_products,
        category_sales=category_sales
    )

@router.get("/sales-summary", response_model=SalesSummary)
async def get_sales_summary(
    period: str = Query("30d", description="时间段: 7d, 30d, 90d")
):
    return SalesSummary(
        period=period,
        total_sales=1500000.0,
        total_orders=6000,
        avg_order_value=250.0,
        total_visitors=150000,
        avg_conversion_rate=4.0,
        sales_growth=12.5
    )

@router.get("/daily-sales", response_model=list[DailySalesData])
async def get_daily_sales(
    days: int = Query(30, ge=1, le=90, description="天数")
):
    daily_sales = []
    for i in range(days):
        d = date.today() - timedelta(days=days - i - 1)
        daily_sales.append(
            DailySalesData(
                date=d,
                sales_amount=50000 + i * 1000,
                order_count=200 + i * 5,
                avg_order_value=250.0,
                visitor_count=5000 + i * 100,
                conversion_rate=4.0 + i * 0.1
            )
        )
    return daily_sales

@router.get("/top-products", response_model=list[ProductPerformance])
async def get_top_products(
    limit: int = Query(10, ge=1, le=50, description="返回数量")
):
    products = []
    for i in range(limit):
        products.append(
            ProductPerformance(
                product_id=i+1,
                product_name=f"热销产品 {chr(65+i)}",
                sales_amount=150000.0 - i * 10000,
                sales_quantity=1000 - i * 50,
                profit=45000.0 - i * 3000,
                profit_margin=30.0,
                return_rate=2.5 + i * 0.2
            )
        )
    return products
