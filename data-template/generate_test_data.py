import pandas as pd
from pathlib import Path

data_dir = Path("/Users/sihai/Documents/My Projects/SellWise/data-template")

products_data = [
    {"product_name": "高清智能运动手表", "category": "电子产品", "price": 899.00, "sales_volume": 12500, "sales_growth": 28.5, "rating": 4.8, "review_count": 3200, "trend_score": 92.3, "platform": "AMAZON", "image_url": ""},
    {"product_name": "便携折叠露营车", "category": "户外装备", "price": 599.00, "sales_volume": 9800, "sales_growth": 45.2, "rating": 4.7, "review_count": 2100, "trend_score": 95.8, "platform": "AMAZON", "image_url": ""},
    {"product_name": "智能空气炸锅5L", "category": "厨房电器", "price": 459.00, "sales_volume": 15600, "sales_growth": 32.1, "rating": 4.9, "review_count": 4500, "trend_score": 88.6, "platform": "SHOPIFY", "image_url": ""},
    {"product_name": "防晒喷雾SPF50+", "category": "美妆护肤", "price": 129.99, "sales_volume": 28500, "sales_growth": 52.3, "rating": 4.6, "review_count": 8500, "trend_score": 96.2, "platform": "AMAZON", "image_url": ""},
    {"product_name": "无线蓝牙耳机Pro", "category": "电子产品", "price": 399.00, "sales_volume": 18200, "sales_growth": 25.8, "rating": 4.7, "review_count": 6200, "trend_score": 85.4, "platform": "SHOPIFY", "image_url": ""},
    {"product_name": "高端护肤礼盒套装", "category": "美妆护肤", "price": 699.00, "sales_volume": 5600, "sales_growth": 18.9, "rating": 4.8, "review_count": 2800, "trend_score": 78.5, "platform": "AMAZON", "image_url": ""},
    {"product_name": "儿童益智积木玩具", "category": "母婴用品", "price": 299.00, "sales_volume": 22300, "sales_growth": 62.4, "rating": 4.6, "review_count": 7800, "trend_score": 98.1, "platform": "EBAY", "image_url": ""},
    {"product_name": "家用智能扫地机器人", "category": "家居用品", "price": 1299.00, "sales_volume": 3200, "sales_growth": 15.6, "rating": 4.5, "review_count": 1200, "trend_score": 72.3, "platform": "SHOPIFY", "image_url": ""},
    {"product_name": "超薄游戏机械键盘", "category": "电子产品", "price": 549.00, "sales_volume": 8900, "sales_growth": 38.7, "rating": 4.9, "review_count": 3500, "trend_score": 91.2, "platform": "AMAZON", "image_url": ""},
    {"product_name": "便携式榨汁机", "category": "厨房电器", "price": 199.00, "sales_volume": 19800, "sales_growth": 41.2, "rating": 4.7, "review_count": 5600, "trend_score": 89.5, "platform": "SHOPIFY", "image_url": ""},
]

influencers_data = [
    {"name": "美妆达人小美", "avatar_url": "", "bio": "热爱美妆护肤分享，每天分享妆容教程和好物推荐", "followers": 1580000, "following": 286, "posts_count": 658, "likes_count": 32500000, "collects_count": 12800000, "comments_count": 2100000, "engagement_rate": 9.2, "categories": "美妆,护肤,时尚", "platform": "xiaohongshu"},
    {"name": "家居博主小窝", "avatar_url": "", "bio": "专注家居收纳与生活方式，打造温馨小窝", "followers": 920000, "following": 352, "posts_count": 425, "likes_count": 15800000, "collects_count": 6500000, "comments_count": 890000, "engagement_rate": 7.5, "categories": "家居,生活方式,收纳", "platform": "xiaohongshu"},
    {"name": "时尚博主Luna", "avatar_url": "", "bio": "每日穿搭分享，打造你的专属时尚风格", "followers": 1850000, "following": 412, "posts_count": 568, "likes_count": 42000000, "collects_count": 18500000, "comments_count": 3200000, "engagement_rate": 8.8, "categories": "时尚,穿搭,配饰", "platform": "xiaohongshu"},
    {"name": "美食博主小厨", "avatar_url": "", "bio": "探店与美食制作，发现城市美味", "followers": 680000, "following": 520, "posts_count": 356, "likes_count": 12500000, "collects_count": 5200000, "comments_count": 680000, "engagement_rate": 6.5, "categories": "美食,探店,食谱", "platform": "xiaohongshu"},
    {"name": "旅行博主阿远", "avatar_url": "", "bio": "环球旅行攻略，带你看世界", "followers": 1250000, "following": 680, "posts_count": 298, "likes_count": 28500000, "collects_count": 11200000, "comments_count": 1850000, "engagement_rate": 8.2, "categories": "旅行,攻略,摄影", "platform": "xiaohongshu"},
    {"name": "健身教练Max", "avatar_url": "", "bio": "健身训练指导，塑造完美身材", "followers": 520000, "following": 185, "posts_count": 485, "likes_count": 8500000, "collects_count": 3200000, "comments_count": 520000, "engagement_rate": 7.1, "categories": "健身,运动,健康", "platform": "xiaohongshu"},
    {"name": "数码科技君", "avatar_url": "", "bio": "最新科技产品测评，数码好物推荐", "followers": 450000, "following": 256, "posts_count": 325, "likes_count": 6800000, "collects_count": 2100000, "comments_count": 420000, "engagement_rate": 6.8, "categories": "科技,数码,测评", "platform": "xiaohongshu"},
    {"name": "母婴达人乐乐", "avatar_url": "", "bio": "育儿经验分享，母婴好物推荐", "followers": 780000, "following": 325, "posts_count": 268, "likes_count": 9800000, "collects_count": 4500000, "comments_count": 650000, "engagement_rate": 7.3, "categories": "母婴,育儿,好物", "platform": "xiaohongshu"},
]

products_df = pd.DataFrame(products_data)
influencers_df = pd.DataFrame(influencers_data)

products_df.to_excel(data_dir / "test_products.xlsx", index=False, sheet_name="产品数据")
influencers_df.to_excel(data_dir / "test_influencers.xlsx", index=False, sheet_name="达人数据")

print("Excel 文件创建成功!")
print(f"- {data_dir / 'test_products.xlsx'}")
print(f"- {data_dir / 'test_influencers.xlsx'}")
