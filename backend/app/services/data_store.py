from typing import Dict, Optional, List, Any
import pandas as pd
import uuid
from datetime import datetime

class DataStore:
    """会话级数据存储单例"""
    
    _instance: Optional['DataStore'] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init_store()
        return cls._instance
    
    def _init_store(self):
        self._data: Dict[str, Optional[pd.DataFrame]] = {
            'hot_products': None,
            'product_monitor': None,
            'influencer': None,
        }
        self._mapping_templates: Dict[str, Dict[str, Any]] = {}
        self._import_history: List[Dict[str, Any]] = []
        self._scoring_config: Dict[str, float] = {
            'correlation_weight': 60.0,
            'views_weight': 40.0,
        }
    
    def get_data(self, data_type: str) -> Optional[pd.DataFrame]:
        return self._data.get(data_type)
    
    def set_data(self, data_type: str, df: pd.DataFrame):
        self._data[data_type] = df
        self._add_history(data_type, len(df))
    
    def clear_data(self, data_type: str):
        self._data[data_type] = None
    
    def clear_all(self):
        for key in self._data:
            self._data[key] = None
    
    def has_data(self, data_type: str) -> bool:
        df = self._data.get(data_type)
        return df is not None and len(df) > 0
    
    def _add_history(self, data_type: str, row_count: int):
        self._import_history.append({
            'id': str(uuid.uuid4())[:8],
            'data_type': data_type,
            'row_count': row_count,
            'timestamp': datetime.now().isoformat(),
        })
    
    def get_import_history(self) -> List[Dict[str, Any]]:
        return self._import_history
    
    def save_mapping_template(self, name: str, template: Dict[str, Any]):
        self._mapping_templates[name] = {
            **template,
            'created_at': datetime.now().isoformat(),
        }
    
    def get_mapping_templates(self) -> Dict[str, Dict[str, Any]]:
        return self._mapping_templates
    
    def get_mapping_template(self, name: str) -> Optional[Dict[str, Any]]:
        return self._mapping_templates.get(name)
    
    def get_scoring_config(self) -> Dict[str, float]:
        return self._scoring_config.copy()
    
    def set_scoring_config(self, correlation_weight: float, views_weight: float):
        if abs(correlation_weight + views_weight - 100.0) > 0.01:
            raise ValueError("权重之和必须为 100%")
        self._scoring_config = {
            'correlation_weight': correlation_weight,
            'views_weight': views_weight,
        }

data_store = DataStore()
