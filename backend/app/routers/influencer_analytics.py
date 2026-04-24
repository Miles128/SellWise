from fastapi import APIRouter, Query
from typing import Optional, List
from app.models.schemas import (
    InfluencerAnalyticsResponse,
    InfluencerListResponse,
    InfluencerBase,
    InfluencerDetail
)

router = APIRouter()

@router.get("/overview", response_model=InfluencerAnalyticsResponse)
async def get_influencer_analytics_overview():
    top_influencers = [
        InfluencerBase(
            id=1,
            name="美妆达人小美",
            avatar_url="https://example.com/avatar1.jpg",
            followers=1500000,
            following=200,
            posts_count=520,
            likes_count=25000000,
            collects_count=8000000,
            comments_count=1200000,
            engagement_rate=8.5,
            categories=["美妆", "护肤", "时尚"],
            platform="xiaohongshu"
        ),
        InfluencerBase(
            id=2,
            name="家居博主小窝",
            avatar_url="https://example.com/avatar2.jpg",
            followers=850000,
            following=350,
            posts_count=380,
            likes_count=12000000,
            collects_count=5000000,
            comments_count=600000,
            engagement_rate=7.2,
            categories=["家居", "生活方式", "收纳"],
            platform="xiaohongshu"
        ),
        InfluencerBase(
            id=3,
            name="时尚博主Luna",
            avatar_url="https://example.com/avatar3.jpg",
            followers=1200000,
            following=280,
            posts_count=450,
            likes_count=18000000,
            collects_count=6500000,
            comments_count=900000,
            engagement_rate=9.1,
            categories=["时尚", "穿搭", "配饰"],
            platform="xiaohongshu"
        )
    ]
    
    category_distribution = {
        "美妆护肤": 150,
        "家居生活": 120,
        "时尚穿搭": 95,
        "美食探店": 80,
        "旅行攻略": 65,
        "科技数码": 45
    }
    
    follower_distribution = {
        "1万以下": 200,
        "1万-10万": 180,
        "10万-50万": 120,
        "50万-100万": 60,
        "100万以上": 35
    }
    
    return InfluencerAnalyticsResponse(
        top_influencers=top_influencers,
        category_distribution=category_distribution,
        follower_distribution=follower_distribution,
        avg_engagement_rate=6.8
    )

@router.get("/list", response_model=InfluencerListResponse)
async def get_influencer_list(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    category: Optional[str] = Query(None, description="分类筛选"),
    min_followers: Optional[int] = Query(None, description="最低粉丝数"),
    max_followers: Optional[int] = Query(None, description="最高粉丝数"),
    sort_by: str = Query("followers", description="排序方式: followers, engagement, posts")
):
    influencers: List[InfluencerBase] = []
    categories = ["美妆护肤", "家居生活", "时尚穿搭", "美食探店", "旅行攻略"]
    
    for i in range(page_size):
        influencers.append(
            InfluencerBase(
                id=(page-1)*page_size + i + 1,
                name=f"达人 {(page-1)*page_size + i + 1}",
                avatar_url=f"https://example.com/avatar{(page-1)*page_size + i + 1}.jpg",
                followers=100000 + i * 50000,
                following=150 + i * 10,
                posts_count=200 + i * 20,
                likes_count=5000000 + i * 500000,
                collects_count=1000000 + i * 100000,
                comments_count=300000 + i * 30000,
                engagement_rate=5.0 + i * 0.3,
                categories=[categories[i % len(categories)]],
                platform="xiaohongshu"
            )
        )
    
    return InfluencerListResponse(
        influencers=influencers,
        total=500,
        page=page,
        page_size=page_size
    )

@router.get("/{influencer_id}", response_model=InfluencerDetail)
async def get_influencer_detail(influencer_id: int):
    return InfluencerDetail(
        id=influencer_id,
        name=f"达人 {influencer_id}",
        avatar_url=f"https://example.com/avatar{influencer_id}.jpg",
        bio="专注美妆护肤分享，热爱生活，分享美好。合作请私信~",
        followers=1500000,
        following=200,
        posts_count=520,
        likes_count=25000000,
        collects_count=8000000,
        comments_count=1200000,
        engagement_rate=8.5,
        avg_likes_per_post=48076.9,
        avg_comments_per_post=2307.7,
        avg_collects_per_post=15384.6,
        categories=["美妆", "护肤", "时尚"],
        platform="xiaohongshu",
        recent_posts=[
            {
                "id": 1,
                "title": "夏日护肤必备！这款精华太好用了",
                "likes": 125000,
                "comments": 8500,
                "collects": 35000,
                "publish_date": "2026-04-20"
            },
            {
                "id": 2,
                "title": "新手化妆教程，看完你也会",
                "likes": 98000,
                "comments": 6200,
                "collects": 28000,
                "publish_date": "2026-04-18"
            },
            {
                "id": 3,
                "title": "好物分享 | 最近爱用的护肤品",
                "likes": 87000,
                "comments": 5100,
                "collects": 22000,
                "publish_date": "2026-04-15"
            }
        ]
    )
