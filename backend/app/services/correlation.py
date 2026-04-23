from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import pandas as pd

class CorrelationAnalyzer:
    """相关性分析服务"""
    
    CORRELATION_LABELS = {
        (0.8, 1.0): ('极强正相关', 'excellent'),
        (0.6, 0.8): ('强正相关', 'good'),
        (0.4, 0.6): ('中度正相关', 'average'),
        (0.2, 0.4): ('弱正相关', 'weak'),
        (0.0, 0.2): ('极弱或无相关', 'none'),
        (-0.2, 0.0): ('极弱或无相关', 'none'),
        (-0.4, -0.2): ('弱负相关', 'weak'),
        (-0.6, -0.4): ('中度负相关', 'average'),
        (-0.8, -0.6): ('强负相关', 'good'),
        (-1.0, -0.8): ('极强负相关', 'excellent'),
    }
    
    COLORS = {
        'excellent': '#67c23a',
        'good': '#409eff',
        'average': '#e6a23c',
        'weak': '#909399',
        'none': '#c0c4cc',
    }
    
    @classmethod
    def pearson_correlation(cls, x: List[float], y: List[float]) -> float:
        """计算皮尔逊相关系数"""
        if len(x) != len(y):
            raise ValueError("两个序列长度必须相同")
        if len(x) < 2:
            return 0.0
        
        x_arr = np.array(x, dtype=float)
        y_arr = np.array(y, dtype=float)
        
        valid_mask = ~(np.isnan(x_arr) | np.isnan(y_arr))
        x_clean = x_arr[valid_mask]
        y_clean = y_arr[valid_mask]
        
        if len(x_clean) < 2:
            return 0.0
        
        if np.std(x_clean) == 0 or np.std(y_clean) == 0:
            return 0.0
        
        return float(np.corrcoef(x_clean, y_clean)[0][1])
    
    @classmethod
    def get_correlation_label(cls, coefficient: float) -> Tuple[str, str]:
        """获取相关性描述标签和等级"""
        coeff = float(coefficient)
        
        for (lower, upper), (label, level) in cls.CORRELATION_LABELS.items():
            if lower < coeff <= upper:
                return label, level
        
        if coeff >= 1.0:
            return '极强正相关', 'excellent'
        if coeff <= -1.0:
            return '极强负相关', 'excellent'
        
        return '无相关', 'none'
    
    @classmethod
    def get_correlation_color(cls, coefficient: float) -> str:
        """获取相关性颜色"""
        _, level = cls.get_correlation_label(coefficient)
        return cls.COLORS.get(level, '#c0c4cc')
    
    @classmethod
    def compute_correlation_matrix(
        cls, 
        df: pd.DataFrame, 
        columns: List[str]
    ) -> Dict[str, Any]:
        """计算多个变量的相关性矩阵"""
        available_cols = [col for col in columns if col in df.columns]
        if len(available_cols) < 2:
            return {
                'variables': available_cols,
                'matrix': [[1.0]] if available_cols else [],
                'labels': [['完全相关']] if available_cols else [],
            }
        
        sub_df = df[available_cols].copy()
        
        for col in available_cols:
            sub_df[col] = pd.to_numeric(sub_df[col], errors='coerce')
        
        matrix = []
        labels = []
        
        for i, col1 in enumerate(available_cols):
            row = []
            label_row = []
            for j, col2 in enumerate(available_cols):
                if i == j:
                    corr = 1.0
                else:
                    x = sub_df[col1].values
                    y = sub_df[col2].values
                    corr = cls.pearson_correlation(x.tolist(), y.tolist())
                
                row.append(round(corr, 4))
                label, _ = cls.get_correlation_label(corr)
                label_row.append(label)
            
            matrix.append(row)
            labels.append(label_row)
        
        return {
            'variables': available_cols,
            'matrix': matrix,
            'labels': labels,
        }

correlation_analyzer = CorrelationAnalyzer()
