import pandas as pd
from typing import Any, List, Dict
from io import BytesIO
from pathlib import Path
from app.models.enums import Platform


def read_file(file_content: bytes, filename: str) -> pd.DataFrame:
    ext = Path(filename).suffix.lower()
    
    if ext == '.csv':
        return pd.read_csv(BytesIO(file_content), encoding='utf-8')
    elif ext in ['.xls', '.xlsx']:
        return pd.read_excel(BytesIO(file_content))
    else:
        raise ValueError(f"不支持的文件格式: {ext}")


def parse_product_data(df: pd.DataFrame) -> List[Dict[str, Any]]:
    products = []
    for _, row in df.iterrows():
        product = {
            "id": row.get("id", int(_) + 1) if pd.notna(row.get("id")) else int(_) + 1,
            "name": str(row.get("product_name", "")) if pd.notna(row.get("product_name")) else "",
            "category": str(row.get("category", "")) if pd.notna(row.get("category")) else "",
            "price": float(row["price"]) if pd.notna(row.get("price")) else 0.0,
            "sales_volume": int(row["sales_volume"]) if pd.notna(row.get("sales_volume")) else 0,
            "sales_growth": float(row["sales_growth"]) if pd.notna(row.get("sales_growth")) else 0.0,
            "rating": float(row["rating"]) if pd.notna(row.get("rating")) else 0.0,
            "review_count": int(row["review_count"]) if pd.notna(row.get("review_count")) else 0,
            "trend_score": float(row["trend_score"]) if pd.notna(row.get("trend_score")) else 0.0,
            "platform": str(row["platform"]) if pd.notna(row.get("platform")) else "AMAZON",
            "image_url": str(row.get("image_url", "")) if pd.notna(row.get("image_url")) else ""
        }
        products.append(product)
    return products


def parse_influencer_data(df: pd.DataFrame) -> List[Dict[str, Any]]:
    influencers = []
    for _, row in df.iterrows():
        categories_str = str(row.get("categories", "")) if pd.notna(row.get("categories")) else ""
        categories = [c.strip() for c in categories_str.split(",") if c.strip()]
        
        influencer = {
            "id": row.get("id", int(_) + 1) if pd.notna(row.get("id")) else int(_) + 1,
            "name": str(row.get("name", "")) if pd.notna(row.get("name")) else "",
            "avatar_url": str(row.get("avatar_url", "")) if pd.notna(row.get("avatar_url")) else "",
            "bio": str(row.get("bio", "")) if pd.notna(row.get("bio")) else "",
            "followers": int(row["followers"]) if pd.notna(row.get("followers")) else 0,
            "following": int(row["following"]) if pd.notna(row.get("following")) else 0,
            "posts_count": int(row["posts_count"]) if pd.notna(row.get("posts_count")) else 0,
            "likes_count": int(row["likes_count"]) if pd.notna(row.get("likes_count")) else 0,
            "collects_count": int(row["collects_count"]) if pd.notna(row.get("collects_count")) else 0,
            "comments_count": int(row["comments_count"]) if pd.notna(row.get("comments_count")) else 0,
            "engagement_rate": float(row["engagement_rate"]) if pd.notna(row.get("engagement_rate")) else 0.0,
            "categories": categories,
            "platform": str(row["platform"]) if pd.notna(row.get("platform")) else "xiaohongshu"
        }
        influencers.append(influencer)
    return influencers


def get_file_columns(df: pd.DataFrame) -> List[str]:
    return df.columns.tolist()


def get_file_summary(df: pd.DataFrame) -> Dict[str, Any]:
    return {
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": df.columns.tolist(),
        "sample_data": df.head(5).to_dict(orient="records")
    }
