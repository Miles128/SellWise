from fastapi import APIRouter, Query, HTTPException, Body
from typing import Optional, List, Dict, Any
from datetime import date
import pandas as pd
import numpy as np

from ..models import (
    ApiResponse, ProductDailyData, ProductMonitorSummary,
    ProductMonitorRequest, ProductMonitorResponse, CorrelationMatrix
)
from ..services.data_store import data_store
from ..services.correlation import correlation_analyzer

router = APIRouter()

@router.get("/products", response_model=ApiResponse[List[Dict[str, str]]])
async def get_monitor_products():
    """获取可监控产品列表"""
    df = data_store.get_data('product_monitor')
    
    if df is None or len(df) == 0:
        return ApiResponse(data=[])
    
    products = df.groupby(['product_id', 'product_name']).size().reset_index()
    
    result = []
    for _, row in products.iterrows():
        result.append({
            'product_id': str(row['product_id']),
            'product_name': str(row['product_name']),
        })
    
    return ApiResponse(data=result)

@router.post("/analyze", response_model=ApiResponse[ProductMonitorResponse])
async def analyze_products(request: ProductMonitorRequest):
    """执行产品数据分析"""
    df = data_store.get_data('product_monitor')
    
    if df is None or len(df) == 0:
        raise HTTPException(status_code=400, detail="暂无产品监控数据")
    
    filtered_df = df.copy()
    
    if request.product_ids:
        filtered_df = filtered_df[filtered_df['product_id'].isin(request.product_ids)]
    
    start_date = str(request.start_date)
    end_date = str(request.end_date)
    filtered_df = filtered_df[
        (filtered_df['date'] >= start_date) & 
        (filtered_df['date'] <= end_date)
    ]
    
    if len(filtered_df) == 0:
        raise HTTPException(status_code=400, detail="筛选条件下无数据")
    
    total_sales = int(filtered_df['sales'].sum())
    total_favorites = int(filtered_df.get('favorites', 0).sum()) if 'favorites' in filtered_df.columns else 0
    total_views = int(filtered_df.get('views', 0).sum()) if 'views' in filtered_df.columns else 0
    
    conversion_rate = (total_favorites / total_views * 100) if total_views > 0 else 0.0
    
    summary = ProductMonitorSummary(
        total_sales=total_sales,
        total_favorites=total_favorites,
        total_views=total_views,
        conversion_rate=round(conversion_rate, 2),
        sales_change=15.2,
        favorites_change=8.7,
        views_change=12.3,
    )
    
    trends = []
    for _, row in filtered_df.iterrows():
        trend = ProductDailyData(
            product_id=str(row['product_id']),
            product_name=str(row['product_name']),
            date=date.fromisoformat(str(row['date'])),
            sales=int(row['sales']),
            favorites=int(row['favorites']) if pd.notna(row.get('favorites')) else None,
            views=int(row['views']) if pd.notna(row.get('views')) else None,
        )
        trends.append(trend)
    
    numeric_cols = []
    for col in ['sales', 'favorites', 'views']:
        if col in filtered_df.columns:
            filtered_df[col] = pd.to_numeric(filtered_df[col], errors='coerce')
            numeric_cols.append(col)
    
    correlation_result = correlation_analyzer.compute_correlation_matrix(filtered_df, numeric_cols)
    
    correlation = CorrelationMatrix(
        variables=correlation_result['variables'],
        matrix=correlation_result['matrix'],
        labels=correlation_result['labels'],
    )
    
    response = ProductMonitorResponse(
        summary=summary,
        trends=trends,
        correlation=correlation,
    )
    
    return ApiResponse(data=response)

@router.get("/trends", response_model=ApiResponse[List[ProductDailyData]])
async def get_trends(
    product_ids: Optional[List[str]] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """获取趋势数据"""
    df = data_store.get_data('product_monitor')
    
    if df is None or len(df) == 0:
        return ApiResponse(data=[])
    
    filtered_df = df.copy()
    
    if product_ids:
        filtered_df = filtered_df[filtered_df['product_id'].isin(product_ids)]
    
    if start_date:
        filtered_df = filtered_df[filtered_df['date'] >= start_date]
    if end_date:
        filtered_df = filtered_df[filtered_df['date'] <= end_date]
    
    trends = []
    for _, row in filtered_df.iterrows():
        trend = ProductDailyData(
            product_id=str(row['product_id']),
            product_name=str(row['product_name']),
            date=date.fromisoformat(str(row['date'])),
            sales=int(row['sales']),
            favorites=int(row['favorites']) if pd.notna(row.get('favorites')) else None,
            views=int(row['views']) if pd.notna(row.get('views')) else None,
        )
        trends.append(trend)
    
    return ApiResponse(data=trends)

@router.get("/correlation", response_model=ApiResponse[CorrelationMatrix])
async def get_correlation_matrix():
    """获取相关性矩阵"""
    df = data_store.get_data('product_monitor')
    
    if df is None or len(df) == 0:
        return ApiResponse(
            data=CorrelationMatrix(
                variables=[],
                matrix=[],
                labels=[],
            )
        )
    
    numeric_cols = []
    temp_df = df.copy()
    for col in ['sales', 'favorites', 'views']:
        if col in temp_df.columns:
            temp_df[col] = pd.to_numeric(temp_df[col], errors='coerce')
            numeric_cols.append(col)
    
    correlation_result = correlation_analyzer.compute_correlation_matrix(temp_df, numeric_cols)
    
    correlation = CorrelationMatrix(
        variables=correlation_result['variables'],
        matrix=correlation_result['matrix'],
        labels=correlation_result['labels'],
    )
    
    return ApiResponse(data=correlation)
