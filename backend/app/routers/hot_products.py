from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict, Any
import pandas as pd

from ..models import (
    ApiResponse, Platform, HotProduct, 
    HotProductListRequest, PaginatedResponse
)
from ..services.data_store import data_store

router = APIRouter()

@router.get("/", response_model=ApiResponse[PaginatedResponse[HotProduct]])
async def get_hot_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    platforms: Optional[List[str]] = Query(None),
    min_heat: Optional[float] = Query(None),
    max_heat: Optional[float] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    keyword: Optional[str] = Query(None),
    sort_by: str = Query("heat_index"),
    sort_order: str = Query("desc"),
):
    """获取热点商品列表"""
    df = data_store.get_data('hot_products')
    
    if df is None or len(df) == 0:
        return ApiResponse(
            data=PaginatedResponse(
                total=0,
                page=page,
                page_size=page_size,
                data=[]
            )
        )
    
    filtered_df = df.copy()
    
    if platforms:
        filtered_df = filtered_df[filtered_df['platform'].isin(platforms)]
    
    if min_heat is not None:
        filtered_df = filtered_df[filtered_df['heat_index'] >= min_heat]
    if max_heat is not None:
        filtered_df = filtered_df[filtered_df['heat_index'] <= max_heat]
    
    if 'avg_price' in filtered_df.columns:
        if min_price is not None:
            filtered_df = filtered_df[filtered_df['avg_price'] >= min_price]
        if max_price is not None:
            filtered_df = filtered_df[filtered_df['avg_price'] <= max_price]
    
    if keyword:
        keyword_lower = keyword.lower()
        if 'product_name' in filtered_df.columns:
            name_mask = filtered_df['product_name'].astype(str).str.lower().str.contains(keyword_lower, na=False)
            filtered_df = filtered_df[name_mask]
    
    if sort_by in filtered_df.columns:
        ascending = sort_order == "asc"
        filtered_df = filtered_df.sort_values(by=sort_by, ascending=ascending)
    
    total = len(filtered_df)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_df = filtered_df.iloc[start:end]
    
    products = []
    for _, row in paginated_df.iterrows():
        product = HotProduct(
            id=str(row.get('id', '')),
            product_name=str(row.get('product_name', '')),
            platform=Platform(str(row.get('platform', 'other'))),
            heat_index=float(row.get('heat_index', 0)),
            avg_price=float(row['avg_price']) if pd.notna(row.get('avg_price')) else None,
            data_source=str(row['data_source']) if pd.notna(row.get('data_source')) else None,
            trend_percent=float(row['trend_percent']) if pd.notna(row.get('trend_percent')) else None,
        )
        products.append(product)
    
    return ApiResponse(
        data=PaginatedResponse(
            total=total,
            page=page,
            page_size=page_size,
            data=products
        )
    )

@router.get("/platforms", response_model=ApiResponse[List[Dict[str, str]]])
async def get_platforms():
    """获取平台列表"""
    platforms = [
        {'value': 'taobao', 'label': '淘宝'},
        {'value': 'jd', 'label': '京东'},
        {'value': 'pdd', 'label': '拼多多'},
        {'value': 'douyin', 'label': '抖音'},
        {'value': 'xiaohongshu', 'label': '小红书'},
        {'value': 'other', 'label': '其他'},
    ]
    return ApiResponse(data=platforms)

@router.get("/{product_id}", response_model=ApiResponse[HotProduct])
async def get_product_detail(product_id: str):
    """获取商品详情"""
    df = data_store.get_data('hot_products')
    
    if df is None or len(df) == 0:
        raise HTTPException(status_code=404, detail="商品不存在")
    
    product_row = df[df['id'] == product_id]
    
    if len(product_row) == 0:
        raise HTTPException(status_code=404, detail="商品不存在")
    
    row = product_row.iloc[0]
    
    product = HotProduct(
        id=str(row.get('id', '')),
        product_name=str(row.get('product_name', '')),
        platform=Platform(str(row.get('platform', 'other'))),
        heat_index=float(row.get('heat_index', 0)),
        avg_price=float(row['avg_price']) if pd.notna(row.get('avg_price')) else None,
        data_source=str(row['data_source']) if pd.notna(row.get('data_source')) else None,
        trend_percent=float(row['trend_percent']) if pd.notna(row.get('trend_percent')) else None,
    )
    
    return ApiResponse(data=product)

@router.post("/", response_model=ApiResponse[HotProduct])
async def add_product(product: HotProduct):
    """手动新增商品"""
    df = data_store.get_data('hot_products')
    
    if df is None:
        df = pd.DataFrame(columns=['id', 'product_name', 'platform', 'heat_index', 'avg_price', 'data_source'])
    
    new_row = {
        'id': product.id,
        'product_name': product.product_name,
        'platform': product.platform.value,
        'heat_index': product.heat_index,
        'avg_price': product.avg_price,
        'data_source': product.data_source,
    }
    
    new_df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    data_store.set_data('hot_products', new_df)
    
    return ApiResponse(data=product, message="商品添加成功")

@router.post("/{product_id}/monitor", response_model=ApiResponse[Dict[str, str]])
async def add_to_monitor(product_id: str):
    """加入产品监控"""
    df = data_store.get_data('hot_products')
    
    if df is None:
        raise HTTPException(status_code=404, detail="商品不存在")
    
    product_row = df[df['id'] == product_id]
    
    if len(product_row) == 0:
        raise HTTPException(status_code=404, detail="商品不存在")
    
    return ApiResponse(
        data={'product_id': product_id, 'status': 'added'},
        message="商品已加入监控列表"
    )
