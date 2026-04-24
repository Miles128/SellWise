from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.services.file_service import (
    read_file, 
    parse_product_data, 
    parse_influencer_data, 
    get_file_summary
)
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


class FileInfoResponse(BaseModel):
    success: bool
    message: str
    filename: str
    row_count: int
    column_count: int
    columns: List[str]
    sample_data: List[Dict[str, Any]]


@router.post("/upload/products", response_model=FileUploadResponse)
async def upload_products(
    file: UploadFile = File(..., description="CSV/XLS/XLSX 文件，包含电商产品数据"),
    limit: Optional[int] = Query(100, description="返回数据的最大数量")
):
    try:
        content = await file.read()
        df = read_file(content, file.filename)
        
        products = parse_product_data(df)
        
        if limit and len(products) > limit:
            products = products[:limit]
        
        return FileUploadResponse(
            success=True,
            message=f"成功读取 {len(df)} 条产品数据",
            filename=file.filename,
            row_count=len(df),
            column_count=len(df.columns),
            columns=df.columns.tolist(),
            data=products
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件解析失败: {str(e)}")


@router.post("/upload/influencers", response_model=FileUploadResponse)
async def upload_influencers(
    file: UploadFile = File(..., description="CSV/XLS/XLSX 文件，包含小红书达人数据"),
    limit: Optional[int] = Query(100, description="返回数据的最大数量")
):
    try:
        content = await file.read()
        df = read_file(content, file.filename)
        
        influencers = parse_influencer_data(df)
        
        if limit and len(influencers) > limit:
            influencers = influencers[:limit]
        
        return FileUploadResponse(
            success=True,
            message=f"成功读取 {len(df)} 条达人数据",
            filename=file.filename,
            row_count=len(df),
            column_count=len(df.columns),
            columns=df.columns.tolist(),
            data=influencers
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
