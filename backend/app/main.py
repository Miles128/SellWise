from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import product_research, analytics, influencer_analytics

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    description="SellWise 电商工作台 - 智能电商数据分析平台"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    product_research.router,
    prefix="/api/product-research",
    tags=["电商选题"]
)

app.include_router(
    analytics.router,
    prefix="/api/analytics",
    tags=["电商运营数据分析"]
)

app.include_router(
    influencer_analytics.router,
    prefix="/api/influencer-analytics",
    tags=["小红书达人数据分析"]
)

@app.get("/")
async def root():
    return {"message": "Welcome to SellWise API", "version": settings.APP_VERSION}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
