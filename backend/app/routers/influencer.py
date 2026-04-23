from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict, Any
import pandas as pd

from ..models import (
    ApiResponse, ScoringConfig, ScoreLevel,
    InfluencerScore, InfluencerDetail, InfluencerListRequest,
    InfluencerSummary, InfluencerListResponse
)
from ..services.data_store import data_store
from ..services.scoring import scoring_service

router = APIRouter()

@router.get("/scoring-config", response_model=ApiResponse[ScoringConfig])
async def get_scoring_config():
    """获取当前评分权重配置"""
    config = data_store.get_scoring_config()
    return ApiResponse(
        data=ScoringConfig(
            correlation_weight=config['correlation_weight'],
            views_weight=config['views_weight'],
        )
    )

@router.put("/scoring-config", response_model=ApiResponse[ScoringConfig])
async def update_scoring_config(config: ScoringConfig):
    """更新评分权重配置"""
    try:
        data_store.set_scoring_config(config.correlation_weight, config.views_weight)
        return ApiResponse(
            data=config,
            message="评分权重配置已更新"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/recalculate", response_model=ApiResponse[Dict[str, Any]])
async def recalculate_scores():
    """重新计算所有达人评分"""
    df = data_store.get_data('influencer')
    
    if df is None or len(df) == 0:
        raise HTTPException(status_code=400, detail="暂无达人数据")
    
    scored_df = scoring_service.calculate_scores(df)
    data_store.set_data('influencer', scored_df)
    
    return ApiResponse(
        data={
            'recalculated': len(scored_df),
            'message': f"已重新计算 {len(scored_df)} 位达人的评分"
        },
        message="评分重新计算完成"
    )

@router.get("/", response_model=ApiResponse[InfluencerListResponse])
async def get_influencers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    min_score: Optional[float] = Query(None),
    max_score: Optional[float] = Query(None),
    sort_by: str = Query("total_score"),
    sort_order: str = Query("desc"),
):
    """获取达人列表"""
    df = data_store.get_data('influencer')
    
    if df is None or len(df) == 0:
        return ApiResponse(
            data=InfluencerListResponse(
                total=0,
                page=page,
                page_size=page_size,
                summary=InfluencerSummary(
                    total_count=0,
                    avg_score=0.0,
                    excellent_ratio=0.0,
                    total_weighted_views=0.0,
                ),
                data=[]
            )
        )
    
    scored_df = scoring_service.calculate_scores(df)
    
    filtered_df = scored_df.copy()
    
    if min_score is not None:
        filtered_df = filtered_df[filtered_df['_total_score'] >= min_score]
    if max_score is not None:
        filtered_df = filtered_df[filtered_df['_total_score'] <= max_score]
    
    sort_col = {
        'total_score': '_total_score',
        'correlation': '_correlation_coefficient',
        'views': '_weighted_views',
    }.get(sort_by, '_total_score')
    
    if sort_col in filtered_df.columns:
        ascending = sort_order == "asc"
        filtered_df = filtered_df.sort_values(by=sort_col, ascending=ascending)
    
    total = len(filtered_df)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_df = filtered_df.iloc[start:end]
    
    total_count = len(scored_df)
    avg_score = float(scored_df['_total_score'].mean()) if total_count > 0 else 0.0
    excellent_count = len(scored_df[scored_df['_score_level'] == ScoreLevel.EXCELLENT])
    excellent_ratio = excellent_count / total_count * 100 if total_count > 0 else 0.0
    total_weighted_views = float(scored_df.get('_weighted_views', 0).sum())
    
    summary = InfluencerSummary(
        total_count=total_count,
        avg_score=round(avg_score, 2),
        excellent_ratio=round(excellent_ratio, 2),
        total_weighted_views=total_weighted_views,
    )
    
    influencers = []
    for _, row in paginated_df.iterrows():
        influencer = InfluencerScore(
            influencer_id=str(row.get('post_id', row.get('influencer_name', ''))),
            influencer_name=str(row.get('influencer_name', '')),
            total_score=float(row.get('_total_score', 0)),
            score_level=ScoreLevel(str(row.get('_score_level', ScoreLevel.AVERAGE))),
            correlation_score=float(row.get('_correlation_score', 0)),
            correlation_coefficient=float(row.get('_correlation_coefficient', 0)),
            raw_views=int(row.get('_raw_views', 0)),
            weighted_views=float(row.get('_weighted_views', 0)),
            views_score=float(row.get('_views_score', 0)),
            weight_coefficient=float(row.get('_weight_coeff', 1.0)),
            linked_product_id=str(row.get('product_id', '')),
            linked_product_name=str(row.get('influencer_name', '') + '-关联产品'),
            sales_change_percent=15.2,
        )
        influencers.append(influencer)
    
    response = InfluencerListResponse(
        total=total,
        page=page,
        page_size=page_size,
        summary=summary,
        data=influencers,
    )
    
    return ApiResponse(data=response)

@router.get("/{influencer_id}", response_model=ApiResponse[InfluencerDetail])
async def get_influencer_detail(influencer_id: str):
    """获取达人详情"""
    df = data_store.get_data('influencer')
    
    if df is None or len(df) == 0:
        raise HTTPException(status_code=404, detail="达人不存在")
    
    scored_df = scoring_service.calculate_scores(df)
    
    influencer_row = scored_df[
        (scored_df['post_id'] == influencer_id) | 
        (scored_df['influencer_name'] == influencer_id)
    ]
    
    if len(influencer_row) == 0:
        raise HTTPException(status_code=404, detail="达人不存在")
    
    row = influencer_row.iloc[0]
    
    score = float(row.get('_total_score', 0))
    correlation_coeff = float(row.get('_correlation_coefficient', 0))
    weight_coeff = float(row.get('_weight_coeff', 1.0))
    
    conclusion = scoring_service.generate_analysis_conclusion(score, correlation_coeff, weight_coeff)
    
    user_profile_weights = {
        '目标用户（18-24岁女性）': 2.0,
        '一线城市用户': 1.5,
        '次目标用户（25-35岁女性）': 1.2,
        '其他用户': 0.5,
    }
    
    trend_data = [
        {'date': '2026-04-01', 'views': 8500, 'sales': 45},
        {'date': '2026-04-08', 'views': 12300, 'sales': 78},
        {'date': '2026-04-15', 'views': 15600, 'sales': 112},
    ]
    
    detail = InfluencerDetail(
        influencer_id=str(row.get('post_id', '')),
        influencer_name=str(row.get('influencer_name', '')),
        total_score=score,
        score_level=ScoreLevel(str(row.get('_score_level', ScoreLevel.AVERAGE))),
        correlation_score=float(row.get('_correlation_score', 0)),
        correlation_coefficient=correlation_coeff,
        raw_views=int(row.get('_raw_views', 0)),
        weighted_views=float(row.get('_weighted_views', 0)),
        views_score=float(row.get('_views_score', 0)),
        weight_coefficient=weight_coeff,
        linked_product_id=str(row.get('product_id', '')),
        linked_product_name=str(row.get('influencer_name', '') + '-关联产品'),
        sales_change_percent=15.2,
        post_id=str(row.get('post_id', '')),
        user_profile_weights=user_profile_weights,
        trend_data=trend_data,
        analysis_conclusion=conclusion,
    )
    
    return ApiResponse(data=detail)
