from typing import List, Dict, Any, Optional
from datetime import datetime


class DataStore:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.products: List[Dict[str, Any]] = []
        self.influencers: List[Dict[str, Any]] = []
        self.upload_info: Dict[str, Any] = {
            "products": None,
            "influencers": None
        }
    
    def set_products(self, products: List[Dict[str, Any]], filename: str = None):
        self.products = products
        self.upload_info["products"] = {
            "filename": filename,
            "count": len(products),
            "uploaded_at": datetime.now().isoformat()
        }
    
    def set_influencers(self, influencers: List[Dict[str, Any]], filename: str = None):
        self.influencers = influencers
        self.upload_info["influencers"] = {
            "filename": filename,
            "count": len(influencers),
            "uploaded_at": datetime.now().isoformat()
        }
    
    def get_products(self, limit: int = None) -> List[Dict[str, Any]]:
        if limit:
            return self.products[:limit]
        return self.products
    
    def get_influencers(self, limit: int = None) -> List[Dict[str, Any]]:
        if limit:
            return self.influencers[:limit]
        return self.influencers
    
    def get_influencer_by_id(self, influencer_id: int) -> Optional[Dict[str, Any]]:
        for inf in self.influencers:
            if inf.get("id") == influencer_id:
                return inf
        return None
    
    def get_upload_info(self) -> Dict[str, Any]:
        return self.upload_info.copy()
    
    def has_products(self) -> bool:
        return len(self.products) > 0
    
    def has_influencers(self) -> bool:
        return len(self.influencers) > 0
    
    def clear_products(self):
        self.products = []
        self.upload_info["products"] = None
    
    def clear_influencers(self):
        self.influencers = []
        self.upload_info["influencers"] = None
    
    def get_product_stats(self) -> Dict[str, Any]:
        if not self.products:
            return {}
        
        total_sales = sum(p.get("sales_volume", 0) for p in self.products)
        total_revenue = sum(p.get("price", 0) * p.get("sales_volume", 0) for p in self.products)
        avg_rating = sum(p.get("rating", 0) for p in self.products) / len(self.products) if self.products else 0
        avg_growth = sum(p.get("sales_growth", 0) for p in self.products) / len(self.products) if self.products else 0
        
        categories = {}
        platforms = {}
        for p in self.products:
            cat = p.get("category", "未分类")
            categories[cat] = categories.get(cat, 0) + 1
            plat = p.get("platform", "未知")
            platforms[plat] = platforms.get(plat, 0) + 1
        
        return {
            "total_products": len(self.products),
            "total_sales": total_sales,
            "total_revenue": total_revenue,
            "avg_rating": round(avg_rating, 2),
            "avg_growth": round(avg_growth, 2),
            "categories": categories,
            "platforms": platforms
        }
    
    def get_influencer_stats(self) -> Dict[str, Any]:
        if not self.influencers:
            return {}
        
        total_followers = sum(inf.get("followers", 0) for inf in self.influencers)
        total_likes = sum(inf.get("likes_count", 0) for inf in self.influencers)
        total_comments = sum(inf.get("comments_count", 0) for inf in self.influencers)
        total_collects = sum(inf.get("collects_count", 0) for inf in self.influencers)
        avg_engagement = sum(inf.get("engagement_rate", 0) for inf in self.influencers) / len(self.influencers) if self.influencers else 0
        
        categories = {}
        for inf in self.influencers:
            for cat in inf.get("categories", []):
                categories[cat] = categories.get(cat, 0) + 1
        
        follower_ranges = {
            "1万以下": 0,
            "1万-10万": 0,
            "10万-50万": 0,
            "50万-100万": 0,
            "100万以上": 0
        }
        for inf in self.influencers:
            followers = inf.get("followers", 0)
            if followers < 10000:
                follower_ranges["1万以下"] += 1
            elif followers < 100000:
                follower_ranges["1万-10万"] += 1
            elif followers < 500000:
                follower_ranges["10万-50万"] += 1
            elif followers < 1000000:
                follower_ranges["50万-100万"] += 1
            else:
                follower_ranges["100万以上"] += 1
        
        return {
            "total_influencers": len(self.influencers),
            "total_followers": total_followers,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_collects": total_collects,
            "avg_engagement_rate": round(avg_engagement, 2),
            "categories": categories,
            "follower_ranges": follower_ranges
        }


data_store = DataStore()
