from typing import Dict, Any, List, Optional
import pandas as pd
from .correlation import correlation_analyzer
from .data_store import data_store
from ..models.enums import ScoreLevel

class ScoringService:
    """达人评分计算服务"""
    
    SCORE_LEVELS = [
        (80, 100, ScoreLevel.EXCELLENT),
        (60, 80, ScoreLevel.GOOD),
        (40, 60, ScoreLevel.AVERAGE),
        (0, 40, ScoreLevel.NEEDS_IMPROVEMENT),
    ]
    
    @classmethod
    def get_score_level(cls, score: float) -> ScoreLevel:
        """根据分数获取等级"""
        for lower, upper, level in cls.SCORE_LEVELS:
            if lower <= score < upper:
                return level
        if score >= 100:
            return ScoreLevel.EXCELLENT
        return ScoreLevel.NEEDS_IMPROVEMENT
    
    @classmethod
    def calculate_scores(
        cls,
        df: pd.DataFrame,
        correlation_weight: Optional[float] = None,
        views_weight: Optional[float] = None,
    ) -> pd.DataFrame:
        """
        计算所有达人的评分
        
        字段映射（从导入数据中读取）:
        - post_views: 帖子浏览量
        - user_profile_weight: 用户画像权重系数
        - product_sales / product_favorites: 产品销量/收藏量
        """
        if df is None or len(df) == 0:
            return pd.DataFrame()
        
        config = data_store.get_scoring_config()
        corr_w = correlation_weight if correlation_weight is not None else config['correlation_weight']
        views_w = views_weight if views_weight is not None else config['views_weight']
        
        result_df = df.copy()
        
        weighted_views_col = None
        if 'post_views' in result_df.columns:
            result_df['_raw_views'] = pd.to_numeric(result_df['post_views'], errors='coerce').fillna(0)
            
            if 'user_profile_weight' in result_df.columns:
                result_df['_weight_coeff'] = pd.to_numeric(result_df['user_profile_weight'], errors='coerce').fillna(1.0)
            else:
                result_df['_weight_coeff'] = 1.0
            
            result_df['_weighted_views'] = result_df['_raw_views'] * result_df['_weight_coeff']
            weighted_views_col = '_weighted_views'
        else:
            result_df['_raw_views'] = 0
            result_df['_weight_coeff'] = 1.0
            result_df['_weighted_views'] = 0
        
        if weighted_views_col is not None:
            max_weighted = result_df[weighted_views_col].max()
            if max_weighted > 0:
                result_df['_views_score'] = (result_df[weighted_views_col] / max_weighted) * views_w
            else:
                result_df['_views_score'] = 0.0
        else:
            result_df['_views_score'] = 0.0
        
        result_df['_correlation_coefficient'] = 0.5
        result_df['_correlation_score'] = result_df['_correlation_coefficient'] * (corr_w / 100) * 100
        
        if 'post_views' in result_df.columns:
            view_cols = [col for col in result_df.columns if 'view' in col.lower() or '浏览' in col]
            sales_cols = [col for col in result_df.columns if 'sale' in col.lower() or '销量' in col or 'favorite' in col.lower() or '收藏' in col]
            
            if view_cols and sales_cols:
                for idx, row in result_df.iterrows():
                    views_val = pd.to_numeric(row.get(view_cols[0], 0), errors='coerce')
                    sales_val = pd.to_numeric(row.get(sales_cols[0], 0), errors='coerce')
                    
                    if pd.notna(views_val) and pd.notna(sales_val):
                        base_corr = min(1.0, max(0.0, views_val / 100000))
                        if sales_val > 0:
                            base_corr = min(1.0, base_corr + 0.3)
                        result_df.at[idx, '_correlation_coefficient'] = round(base_corr, 4)
                        result_df.at[idx, '_correlation_score'] = round(base_corr * corr_w, 2)
        
        result_df['_total_score'] = result_df['_correlation_score'] + result_df['_views_score']
        result_df['_score_level'] = result_df['_total_score'].apply(cls.get_score_level)
        
        return result_df
    
    @classmethod
    def generate_analysis_conclusion(
        cls,
        score: float,
        correlation_coeff: float,
        weight_coeff: float,
    ) -> str:
        """生成达人分析结论"""
        level = cls.get_score_level(score)
        corr_label, _ = correlation_analyzer.get_correlation_label(correlation_coeff)
        
        conclusions = []
        
        if level == ScoreLevel.EXCELLENT:
            conclusions.append(f"该达人效果评分 <strong>{score:.1f}分</strong>，等级为<strong>优秀</strong>。")
            conclusions.append(f"内容与产品转化呈现<strong>{corr_label}</strong>（系数: {correlation_coeff:.2f}）。")
            if weight_coeff >= 1.5:
                conclusions.append(f"用户画像权重高达 <strong>{weight_coeff}x</strong>，粉丝群体与产品定位高度匹配。")
            conclusions.append("<strong>建议：继续合作并考虑长期签约。</strong>")
        
        elif level == ScoreLevel.GOOD:
            conclusions.append(f"该达人效果评分 <strong>{score:.1f}分</strong>，等级为<strong>良好</strong>。")
            conclusions.append(f"内容与产品转化呈现<strong>{corr_label}</strong>。")
            conclusions.append("<strong>建议：可以继续合作，观察后续数据表现。</strong>")
        
        elif level == ScoreLevel.AVERAGE:
            conclusions.append(f"该达人效果评分 <strong>{score:.1f}分</strong>，等级为<strong>一般</strong>。")
            conclusions.append(f"内容相关性为<strong>{corr_label}</strong>，转化效果有待提升。")
            if weight_coeff < 1.0:
                conclusions.append(f"用户画像权重较低（{weight_coeff}x），粉丝匹配度可能不足。")
            conclusions.append("<strong>建议：考虑优化内容方向或更换合作达人。</strong>")
        
        else:
            conclusions.append(f"该达人效果评分 <strong>{score:.1f}分</strong>，等级为<strong>待提升</strong>。")
            conclusions.append(f"内容相关性为<strong>{corr_label}</strong>，转化效果较差。")
            conclusions.append("<strong>建议：暂停合作，重新评估达人匹配度。</strong>")
        
        return "".join(f"<p>{c}</p>" for c in conclusions)

scoring_service = ScoringService()
