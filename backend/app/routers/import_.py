from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
import pandas as pd
import io
import uuid

from ..models import (
    ApiResponse, DataType, Platform,
    ExcelSheetInfo, FieldMappingItem, FieldMappingRequest,
    ImportResult, SystemFieldTemplate
)
from ..services.data_store import data_store

router = APIRouter()

SYSTEM_FIELDS = {
    DataType.HOT_PRODUCTS: [
        FieldMappingItem(system_field="product_name", excel_column=None, is_required=True, description="商品名称"),
        FieldMappingItem(system_field="platform", excel_column=None, is_required=True, description="平台"),
        FieldMappingItem(system_field="heat_index", excel_column=None, is_required=True, description="热度指数"),
        FieldMappingItem(system_field="avg_price", excel_column=None, is_required=False, description="平均价格"),
        FieldMappingItem(system_field="data_source", excel_column=None, is_required=False, description="数据来源"),
    ],
    DataType.PRODUCT_MONITOR: [
        FieldMappingItem(system_field="product_id", excel_column=None, is_required=True, description="产品ID/名称"),
        FieldMappingItem(system_field="date", excel_column=None, is_required=True, description="日期"),
        FieldMappingItem(system_field="sales", excel_column=None, is_required=True, description="销量"),
        FieldMappingItem(system_field="favorites", excel_column=None, is_required=False, description="收藏量"),
        FieldMappingItem(system_field="views", excel_column=None, is_required=False, description="浏览量"),
    ],
    DataType.INFLUENCER: [
        FieldMappingItem(system_field="post_id", excel_column=None, is_required=True, description="帖子ID/链接"),
        FieldMappingItem(system_field="influencer_name", excel_column=None, is_required=True, description="达人名称"),
        FieldMappingItem(system_field="post_views", excel_column=None, is_required=True, description="帖子浏览量"),
        FieldMappingItem(system_field="product_id", excel_column=None, is_required=True, description="关联产品ID"),
        FieldMappingItem(system_field="product_favorites", excel_column=None, is_required=False, description="产品收藏量"),
        FieldMappingItem(system_field="product_sales", excel_column=None, is_required=False, description="产品销量"),
        FieldMappingItem(system_field="user_profile_weight", excel_column=None, is_required=False, description="用户画像权重系数"),
    ],
}

PLATFORM_MAPPING = {
    '淘宝': Platform.TAOBAO,
    'taobao': Platform.TAOBAO,
    '京东': Platform.JD,
    'jd': Platform.JD,
    '拼多多': Platform.PDD,
    'pdd': Platform.PDD,
    '抖音': Platform.DOUYIN,
    'douyin': Platform.DOUYIN,
    '小红书': Platform.XIAOHONGSHU,
    'xiaohongshu': Platform.XIAOHONGSHU,
}

def normalize_platform(value: str) -> str:
    """标准化平台名称"""
    if not value:
        return Platform.OTHER.value
    value_lower = str(value).strip().lower()
    for key, plat in PLATFORM_MAPPING.items():
        if key.lower() in value_lower or value_lower in key.lower():
            return plat.value
    return Platform.OTHER.value

@router.post("/upload", response_model=ApiResponse[Dict[str, Any]])
async def upload_excel(file: UploadFile = File(...)):
    """上传 Excel 文件并解析"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="未选择文件")
    
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="仅支持 .xlsx, .xls, .csv 格式")
    
    try:
        content = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
            sheets_info = [{
                'name': 'Sheet1',
                'row_count': len(df),
                'column_count': len(df.columns),
                'columns': list(df.columns),
                'sample_data': df.head(5).to_dict('records'),
            }]
        else:
            excel_file = pd.ExcelFile(io.BytesIO(content))
            sheets_info = []
            
            for sheet_name in excel_file.sheet_names:
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                sheets_info.append({
                    'name': sheet_name,
                    'row_count': len(df),
                    'column_count': len(df.columns),
                    'columns': list(df.columns),
                    'sample_data': df.head(5).to_dict('records'),
                })
        
        return ApiResponse(
            data={
                'filename': file.filename,
                'sheets': sheets_info,
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件解析失败: {str(e)}")

@router.get("/templates", response_model=ApiResponse[List[SystemFieldTemplate]])
async def get_system_templates():
    """获取系统字段模板"""
    templates = []
    for data_type, fields in SYSTEM_FIELDS.items():
        templates.append(SystemFieldTemplate(
            data_type=data_type,
            fields=fields,
        ))
    return ApiResponse(data=templates)

@router.post("/map", response_model=ApiResponse[ImportResult])
async def map_and_import(request: FieldMappingRequest):
    """执行字段映射并导入数据"""
    try:
        data_type = request.data_type
        mappings = request.mappings
        
        required_fields = [f for f in SYSTEM_FIELDS.get(data_type, []) if f.is_required]
        for req_field in required_fields:
            mapping = next((m for m in mappings if m.system_field == req_field.system_field), None)
            if not mapping or not mapping.excel_column:
                raise HTTPException(
                    status_code=400, 
                    detail=f"必填字段 '{req_field.system_field}' 未选择对应列"
                )
        
        column_mapping = {}
        for m in mappings:
            if m.excel_column:
                column_mapping[m.excel_column] = m.system_field
        
        if request.save_as_template and request.template_name:
            data_store.save_mapping_template(
                request.template_name,
                {
                    'data_type': data_type.value,
                    'mappings': [m.model_dump() for m in mappings],
                }
            )
        
        return ApiResponse(
            data=ImportResult(
                success=True,
                row_count=0,
                columns=list(column_mapping.values()),
                message="字段映射已保存，请确认数据后导入"
            )
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"映射失败: {str(e)}")

@router.get("/mapping-templates", response_model=ApiResponse[Dict[str, Any]])
async def get_mapping_templates():
    """获取已保存的映射模板"""
    return ApiResponse(data=data_store.get_mapping_templates())

@router.post("/confirm", response_model=ApiResponse[ImportResult])
async def confirm_import(
    data_type: DataType = Query(...),
    sheet_name: str = Query(...),
):
    """确认导入（模拟实际数据导入）"""
    try:
        sample_data = generate_sample_data(data_type)
        df = pd.DataFrame(sample_data)
        data_store.set_data(data_type.value, df)
        
        return ApiResponse(
            data=ImportResult(
                success=True,
                row_count=len(df),
                columns=list(df.columns),
                message=f"成功导入 {len(df)} 条数据"
            )
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导入失败: {str(e)}")

def generate_sample_data(data_type: DataType) -> List[Dict[str, Any]]:
    """生成示例数据（实际应从解析的Excel中读取）"""
    if data_type == DataType.HOT_PRODUCTS:
        return [
            {'id': 'SP001', 'product_name': '夏季新款透气运动跑鞋', 'platform': 'douyin', 'heat_index': 98765, 'avg_price': 299.0, 'data_source': '抖音热点榜'},
            {'id': 'SP002', 'product_name': '网红ins风手提包', 'platform': 'xiaohongshu', 'heat_index': 76543, 'avg_price': 159.0, 'data_source': '小红书种草'},
            {'id': 'SP003', 'product_name': '智能蓝牙运动耳机', 'platform': 'taobao', 'heat_index': 54321, 'avg_price': 199.0, 'data_source': '淘宝热销'},
        ]
    elif data_type == DataType.PRODUCT_MONITOR:
        return [
            {'product_id': 'SP001', 'product_name': '夏季透气跑鞋', 'date': '2026-04-01', 'sales': 156, 'favorites': 423, 'views': 2340},
            {'product_id': 'SP001', 'product_name': '夏季透气跑鞋', 'date': '2026-04-08', 'sales': 189, 'favorites': 512, 'views': 2890},
            {'product_id': 'SP001', 'product_name': '夏季透气跑鞋', 'date': '2026-04-15', 'sales': 234, 'favorites': 645, 'views': 3560},
            {'product_id': 'SP002', 'product_name': '网红手提包', 'date': '2026-04-01', 'sales': 89, 'favorites': 312, 'views': 1560},
            {'product_id': 'SP002', 'product_name': '网红手提包', 'date': '2026-04-08', 'sales': 102, 'favorites': 368, 'views': 1890},
        ]
    elif data_type == DataType.INFLUENCER:
        return [
            {
                'post_id': 'POST001', 'influencer_name': '小红书达人小美',
                'post_views': 56800, 'product_id': 'SP001',
                'product_favorites': 423, 'product_sales': 156,
                'user_profile_weight': 1.5,
            },
            {
                'post_id': 'POST002', 'influencer_name': '时尚穿搭阿杰',
                'post_views': 42300, 'product_id': 'SP002',
                'product_favorites': 312, 'product_sales': 89,
                'user_profile_weight': 0.9,
            },
            {
                'post_id': 'POST003', 'influencer_name': '科技测评小明',
                'post_views': 89500, 'product_id': 'SP003',
                'product_favorites': 156, 'product_sales': 45,
                'user_profile_weight': 0.5,
            },
        ]
    return []
