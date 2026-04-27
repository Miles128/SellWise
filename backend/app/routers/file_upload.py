from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.services.file_service import (
    read_file, 
    parse_product_data, 
    parse_influencer_data, 
    get_file_summary
)
from app.services.data_store import data_store
from pydantic import BaseModel

router = APIRouter()


class FileUploadResponse(BaseModel):
    success: bool
    message: str
    filename: str
    row_count: int
    column_count: int
    columns: List[str]
    data: List[Dict[str, Any]]
    stats: Optional[Dict[str, Any]] = None


class FileInfoResponse(BaseModel):
    success: bool
    message: str
    filename: str
    row_count: int
    column_count: int
    columns: List[str]
    sample_data: List[Dict[str, Any]]


class DataStatusResponse(BaseModel):
    success: bool
    has_products: bool
    has_influencers: bool
    upload_info: Dict[str, Any]
    product_stats: Optional[Dict[str, Any]] = None
    influencer_stats: Optional[Dict[str, Any]] = None


class ProductsResponse(BaseModel):
    success: bool
    count: int
    data: List[Dict[str, Any]]
    stats: Optional[Dict[str, Any]] = None


class InfluencersResponse(BaseModel):
    success: bool
    count: int
    data: List[Dict[str, Any]]
    stats: Optional[Dict[str, Any]] = None


class InfluencerDetailResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    message: str


@router.post("/upload/products", response_model=FileUploadResponse)
async def upload_products(
    file: UploadFile = File(..., description="CSV/XLS/XLSX 文件，包含电商产品数据"),
    limit: Optional[int] = Query(100, description="返回数据的最大数量"),
    save: Optional[bool] = Query(True, description="是否保存数据到存储中")
):
    try:
        content = await file.read()
        df = read_file(content, file.filename)
        
        products = parse_product_data(df)
        
        if save:
            data_store.set_products(products, file.filename)
        
        return_data = products
        if limit and len(return_data) > limit:
            return_data = return_data[:limit]
        
        return FileUploadResponse(
            success=True,
            message=f"成功读取 {len(df)} 条产品数据{'并保存' if save else ''}",
            filename=file.filename,
            row_count=len(df),
            column_count=len(df.columns),
            columns=df.columns.tolist(),
            data=return_data,
            stats=data_store.get_product_stats() if save else None
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件解析失败: {str(e)}")


@router.post("/upload/influencers", response_model=FileUploadResponse)
async def upload_influencers(
    file: UploadFile = File(..., description="CSV/XLS/XLSX 文件，包含小红书达人数据"),
    limit: Optional[int] = Query(100, description="返回数据的最大数量"),
    save: Optional[bool] = Query(True, description="是否保存数据到存储中")
):
    try:
        content = await file.read()
        df = read_file(content, file.filename)
        
        influencers = parse_influencer_data(df)
        
        if save:
            data_store.set_influencers(influencers, file.filename)
        
        return_data = influencers
        if limit and len(return_data) > limit:
            return_data = return_data[:limit]
        
        return FileUploadResponse(
            success=True,
            message=f"成功读取 {len(df)} 条达人数据{'并保存' if save else ''}",
            filename=file.filename,
            row_count=len(df),
            column_count=len(df.columns),
            columns=df.columns.tolist(),
            data=return_data,
            stats=data_store.get_influencer_stats() if save else None
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件解析失败: {str(e)}")


@router.post("/upload/preview", response_model=FileInfoResponse)
async def preview_file(
    file: UploadFile = File(..., description="预览任何 CSV/XLS/XLSX 文件")
):
    try:
        content = await file.read()
        df = read_file(content, file.filename)
        summary = get_file_summary(df)
        
        return FileInfoResponse(
            success=True,
            message="文件预览成功",
            filename=file.filename,
            row_count=summary["row_count"],
            column_count=summary["column_count"],
            columns=summary["columns"],
            sample_data=summary["sample_data"]
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件预览失败: {str(e)}")


@router.get("/status", response_model=DataStatusResponse)
async def get_data_status():
    return DataStatusResponse(
        success=True,
        has_products=data_store.has_products(),
        has_influencers=data_store.has_influencers(),
        upload_info=data_store.get_upload_info(),
        product_stats=data_store.get_product_stats() if data_store.has_products() else None,
        influencer_stats=data_store.get_influencer_stats() if data_store.has_influencers() else None
    )


@router.get("/products", response_model=ProductsResponse)
async def get_products(
    limit: Optional[int] = Query(None, description="返回数据的最大数量")
):
    products = data_store.get_products(limit)
    return ProductsResponse(
        success=True,
        count=len(products),
        data=products,
        stats=data_store.get_product_stats()
    )


@router.get("/influencers", response_model=InfluencersResponse)
async def get_influencers(
    limit: Optional[int] = Query(None, description="返回数据的最大数量")
):
    influencers = data_store.get_influencers(limit)
    return InfluencersResponse(
        success=True,
        count=len(influencers),
        data=influencers,
        stats=data_store.get_influencer_stats()
    )


@router.get("/influencers/{influencer_id}", response_model=InfluencerDetailResponse)
async def get_influencer_detail(influencer_id: int):
    influencer = data_store.get_influencer_by_id(influencer_id)
    if influencer:
        return InfluencerDetailResponse(
            success=True,
            data=influencer,
            message="获取成功"
        )
    else:
        return InfluencerDetailResponse(
            success=False,
            data=None,
            message=f"未找到 ID 为 {influencer_id} 的达人"
        )


@router.delete("/products")
async def clear_products():
    data_store.clear_products()
    return {
        "success": True,
        "message": "产品数据已清空"
    }


@router.delete("/influencers")
async def clear_influencers():
    data_store.clear_influencers()
    return {
        "success": True,
        "message": "达人数据已清空"
    }
