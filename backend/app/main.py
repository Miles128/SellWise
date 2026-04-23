from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import import_, hot_products, product_monitor, influencer

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="SellWise 电商运营工具 API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(import_.router, prefix="/api/import", tags=["数据导入"])
app.include_router(hot_products.router, prefix="/api/hot-products", tags=["热点选款"])
app.include_router(product_monitor.router, prefix="/api/product-monitor", tags=["产品监控"])
app.include_router(influencer.router, prefix="/api/influencer", tags=["达人分析"])

@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": settings.version,
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
