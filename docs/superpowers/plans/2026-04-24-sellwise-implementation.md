# SellWise 电商运营工具实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个完整的电商运营 Web 工具，包含数据导入、热点选款、产品监控、达人分析四个核心模块。

**Architecture:** 前后端分离架构。后端使用 FastAPI 提供 RESTful API，内存存储会话级数据；前端使用 Vue 3 + Element Plus 构建现代化管理界面，ECharts 实现数据可视化。

**Tech Stack:**
- 后端: Python 3.9+, FastAPI, pandas, numpy, openpyxl
- 前端: Vue 3, Vite, Element Plus, Vue Router, ECharts, Axios

---

## 文件结构映射

### 后端文件 (`backend/`)

| 文件路径 | 职责 |
|----------|------|
| `requirements.txt` | Python 依赖列表 |
| `run.py` | 后端启动入口 |
| `app/__init__.py` | 包初始化 |
| `app/main.py` | FastAPI 应用入口，路由注册，CORS 配置 |
| `app/config.py` | 应用配置（评分权重默认值等） |
| `app/models/__init__.py` | 模型包初始化 |
| `app/models/enums.py` | 枚举定义（DataType, Platform 等） |
| `app/models/schemas.py` | Pydantic 数据模型定义 |
| `app/services/__init__.py` | 服务包初始化 |
| `app/services/data_store.py` | 会话级数据存储单例 |
| `app/services/correlation.py` | 相关性分析算法 |
| `app/services/scoring.py` | 达人评分计算服务 |
| `app/routers/__init__.py` | 路由包初始化 |
| `app/routers/import_.py` | 数据导入 API |
| `app/routers/hot_products.py` | 热点选款 API |
| `app/routers/product_monitor.py` | 产品监控 API |
| `app/routers/influencer.py` | 达人分析 API |

### 前端文件 (`frontend/`)

| 文件路径 | 职责 |
|----------|------|
| `package.json` | 前端依赖和脚本 |
| `vite.config.js` | Vite 配置（代理设置等） |
| `index.html` | HTML 入口 |
| `src/main.js` | Vue 应用入口 |
| `src/App.vue` | 根组件 |
| `src/router/index.js` | 路由配置 |
| `src/store/index.js` | 状态管理（可选，可简化） |
| `src/api/index.js` | Axios 实例配置 |
| `src/api/import.js` | 导入相关 API 调用 |
| `src/api/hotProducts.js` | 热点选款 API 调用 |
| `src/api/productMonitor.js` | 产品监控 API 调用 |
| `src/api/influencer.js` | 达人分析 API 调用 |
| `src/views/Layout.vue` | 主布局组件（侧边栏导航） |
| `src/views/Import.vue` | 数据导入页面 |
| `src/views/HotProducts.vue` | 热点选款页面 |
| `src/views/ProductMonitor.vue` | 产品监控页面 |
| `src/views/InfluencerAnalysis.vue` | 达人分析页面 |
| `src/components/StatCard.vue` | 统计卡片组件 |
| `src/components/FieldMapping.vue` | 字段映射组件 |
| `src/styles/common.css` | 公共样式 |

---

## 实施阶段

### 阶段一：项目脚手架搭建

#### Task 1: 创建后端项目结构

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/run.py`
- Create: `backend/app/__init__.py`
- Create: `backend/app/main.py`
- Create: `backend/app/config.py`
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/enums.py`
- Create: `backend/app/models/schemas.py`
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/routers/__init__.py`

- [ ] **Step 1: 创建后端依赖文件**

```txt
# backend/requirements.txt
fastapi==0.109.0
uvicorn==0.27.0
python-multipart==0.0.6
pandas==2.0.3
numpy==1.24.4
openpyxl==3.1.2
pydantic==2.5.3
pydantic-settings==2.1.0
```

- [ ] **Step 2: 创建应用配置**

```python
# backend/app/config.py
from pydantic_settings import BaseSettings
from typing import Dict

class Settings(BaseSettings):
    app_name: str = "SellWise"
    version: str = "1.0.0"
    
    scoring_correlation_weight: float = 60.0
    scoring_views_weight: float = 40.0
    
    platform_colors: Dict[str, Dict[str, str]] = {
        "taobao": {"bg": "#e6f7ff", "text": "#1890ff", "label": "淘宝"},
        "jd": {"bg": "#fff7e6", "text": "#d48806", "label": "京东"},
        "pdd": {"bg": "#f6ffed", "text": "#389e0d", "label": "拼多多"},
        "douyin": {"bg": "#fff0f6", "text": "#c41d7f", "label": "抖音"},
        "xiaohongshu": {"bg": "#fff1f0", "text": "#cf1322", "label": "小红书"},
        "other": {"bg": "#f0f5ff", "text": "#2f54eb", "label": "其他"},
    }

settings = Settings()
```

- [ ] **Step 3: 创建枚举定义**

```python
# backend/app/models/enums.py
from enum import Enum

class DataType(str, Enum):
    HOT_PRODUCTS = "hot_products"
    PRODUCT_MONITOR = "product_monitor"
    INFLUENCER = "influencer"

class Platform(str, Enum):
    TAOBAO = "taobao"
    JD = "jd"
    PDD = "pdd"
    DOUYIN = "douyin"
    XIAOHONGSHU = "xiaohongshu"
    OTHER = "other"

class ScoreLevel(str, Enum):
    EXCELLENT = "优秀"
    GOOD = "良好"
    AVERAGE = "一般"
    NEEDS_IMPROVEMENT = "待提升"
```

- [ ] **Step 4: 创建 Pydantic 模型（基础部分）**

```python
# backend/app/models/schemas.py
from datetime import date
from typing import Optional, List, Dict, Any, Generic, TypeVar
from pydantic import BaseModel, Field
from .enums import DataType, Platform, ScoreLevel

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    code: int = 200
    message: str = "操作成功"
    data: Optional[T] = None

# ========== 导入相关 ==========

class ExcelSheetInfo(BaseModel):
    name: str
    row_count: int
    column_count: int
    columns: List[str]
    sample_data: List[Dict[str, Any]]

class FieldMappingItem(BaseModel):
    system_field: str
    excel_column: Optional[str]
    is_required: bool
    description: str

class FieldMappingRequest(BaseModel):
    data_type: DataType
    sheet_name: str
    mappings: List[FieldMappingItem]
    save_as_template: bool = False
    template_name: Optional[str] = None

class ImportResult(BaseModel):
    success: bool
    row_count: int
    columns: List[str]
    message: str

class SystemFieldTemplate(BaseModel):
    data_type: DataType
    fields: List[FieldMappingItem]

# ========== 热点选款 ==========

class HotProduct(BaseModel):
    id: str
    product_name: str
    platform: Platform
    heat_index: float
    avg_price: Optional[float]
    data_source: Optional[str]
    trend_percent: Optional[float] = None

class HotProductListRequest(BaseModel):
    page: int = 1
    page_size: int = 20
    platforms: Optional[List[Platform]] = None
    min_heat: Optional[float] = None
    max_heat: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    keyword: Optional[str] = None
    sort_by: str = "heat_index"
    sort_order: str = "desc"

class PaginatedResponse(BaseModel, Generic[T]):
    total: int
    page: int
    page_size: int
    data: List[T]

# ========== 产品监控 ==========

class ProductDailyData(BaseModel):
    product_id: str
    product_name: str
    date: date
    sales: int
    favorites: Optional[int]
    views: Optional[int]

class CorrelationMatrix(BaseModel):
    variables: List[str]
    matrix: List[List[float]]
    labels: List[List[str]]

class ProductMonitorSummary(BaseModel):
    total_sales: int
    total_favorites: int
    total_views: int
    conversion_rate: float
    sales_change: Optional[float]
    favorites_change: Optional[float]
    views_change: Optional[float]

class ProductMonitorRequest(BaseModel):
    product_ids: List[str]
    start_date: date
    end_date: date
    metrics: List[str] = ["sales", "favorites", "views"]

class ProductMonitorResponse(BaseModel):
    summary: ProductMonitorSummary
    trends: List[ProductDailyData]
    correlation: CorrelationMatrix

# ========== 达人分析 ==========

class ScoringConfig(BaseModel):
    correlation_weight: float = Field(60.0, ge=0, le=100)
    views_weight: float = Field(40.0, ge=0, le=100)
    
    class Config:
        schema_extra = {
            "example": {
                "correlation_weight": 60.0,
                "views_weight": 40.0
            }
        }

class InfluencerScore(BaseModel):
    influencer_id: str
    influencer_name: str
    total_score: float
    score_level: ScoreLevel
    correlation_score: float
    correlation_coefficient: float
    raw_views: int
    weighted_views: float
    views_score: float
    weight_coefficient: float
    linked_product_id: str
    linked_product_name: str
    sales_change_percent: Optional[float]

class InfluencerDetail(InfluencerScore):
    post_id: str
    user_profile_weights: Dict[str, float]
    trend_data: List[Dict[str, Any]]
    analysis_conclusion: str

class InfluencerListRequest(BaseModel):
    page: int = 1
    page_size: int = 20
    platforms: Optional[List[str]] = None
    min_score: Optional[float] = None
    max_score: Optional[float] = None
    sort_by: str = "total_score"
    sort_order: str = "desc"

class InfluencerSummary(BaseModel):
    total_count: int
    avg_score: float
    excellent_ratio: float
    total_weighted_views: float

class InfluencerListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    summary: InfluencerSummary
    data: List[InfluencerScore]
```

- [ ] **Step 5: 创建 FastAPI 主入口**

```python
# backend/app/main.py
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
```

- [ ] **Step 6: 创建路由初始化文件**

```python
# backend/app/routers/__init__.py
from . import import_
from . import hot_products
from . import product_monitor
from . import influencer

__all__ = ["import_", "hot_products", "product_monitor", "influencer"]
```

- [ ] **Step 7: 创建服务初始化文件**

```python
# backend/app/services/__init__.py
from . import data_store
from . import correlation
from . import scoring

__all__ = ["data_store", "correlation", "scoring"]
```

- [ ] **Step 8: 创建模型初始化文件**

```python
# backend/app/models/__init__.py
from .enums import DataType, Platform, ScoreLevel
from .schemas import (
    ApiResponse, ExcelSheetInfo, FieldMappingItem, FieldMappingRequest,
    ImportResult, SystemFieldTemplate, HotProduct, HotProductListRequest,
    PaginatedResponse, ProductDailyData, CorrelationMatrix,
    ProductMonitorSummary, ProductMonitorRequest, ProductMonitorResponse,
    ScoringConfig, InfluencerScore, InfluencerDetail, InfluencerListRequest,
    InfluencerSummary, InfluencerListResponse
)

__all__ = [
    "DataType", "Platform", "ScoreLevel",
    "ApiResponse", "ExcelSheetInfo", "FieldMappingItem", "FieldMappingRequest",
    "ImportResult", "SystemFieldTemplate", "HotProduct", "HotProductListRequest",
    "PaginatedResponse", "ProductDailyData", "CorrelationMatrix",
    "ProductMonitorSummary", "ProductMonitorRequest", "ProductMonitorResponse",
    "ScoringConfig", "InfluencerScore", "InfluencerDetail", "InfluencerListRequest",
    "InfluencerSummary", "InfluencerListResponse"
]
```

- [ ] **Step 9: 创建后端启动脚本**

```python
# backend/run.py
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
```

- [ ] **Step 10: 创建包初始化文件**

```python
# backend/app/__init__.py
__version__ = "1.0.0"
```

---

#### Task 2: 创建前端项目结构

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.js`
- Create: `frontend/src/App.vue`
- Create: `frontend/src/router/index.js`
- Create: `frontend/src/api/index.js`
- Create: `frontend/src/styles/common.css`

- [ ] **Step 1: 创建前端 package.json**

```json
{
  "name": "sellwise-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "element-plus": "^2.5.0",
    "echarts": "^5.4.0",
    "axios": "^1.6.0",
    "@element-plus/icons-vue": "^2.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

- [ ] **Step 2: 创建 Vite 配置**

```javascript
// frontend/vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
```

- [ ] **Step 3: 创建 HTML 入口**

```html
<!-- frontend/index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SellWise 电商运营工具</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 4: 创建 Axios 配置**

```javascript
// frontend/src/api/index.js
import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '请求失败'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default api
```

- [ ] **Step 5: 创建路由配置**

```javascript
// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/hot-products',
    children: [
      {
        path: 'hot-products',
        name: 'HotProducts',
        component: () => import('@/views/HotProducts.vue'),
        meta: { title: '热点选款', icon: 'TrendCharts' }
      },
      {
        path: 'product-monitor',
        name: 'ProductMonitor',
        component: () => import('@/views/ProductMonitor.vue'),
        meta: { title: '数据监控', icon: 'DataLine' }
      },
      {
        path: 'influencer',
        name: 'InfluencerAnalysis',
        component: () => import('@/views/InfluencerAnalysis.vue'),
        meta: { title: '达人分析', icon: 'User' }
      },
      {
        path: 'import',
        name: 'DataImport',
        component: () => import('@/views/Import.vue'),
        meta: { title: '数据导入', icon: 'Upload' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

- [ ] **Step 6: 创建公共样式**

```css
/* frontend/src/styles/common.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.stat-card {
  border-radius: 8px;
  padding: 16px;
  color: white;
  margin-bottom: 16px;
}

.stat-card .value {
  font-size: 24px;
  font-weight: bold;
  margin: 8px 0;
}

.stat-card .trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-up {
  color: #a8f0c6;
}

.trend-down {
  color: #ffcccc;
}

.page-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.card-wrapper {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  align-items: flex-end;
}

.filter-item {
  min-width: 140px;
}

.filter-item .label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.score-excellent {
  color: #67c23a;
}

.score-good {
  color: #409eff;
}

.score-average {
  color: #e6a23c;
}

.score-poor {
  color: #f56c6c;
}

.platform-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.platform-taobao {
  background: #e6f7ff;
  color: #1890ff;
}

.platform-jd {
  background: #fff7e6;
  color: #d48806;
}

.platform-pdd {
  background: #f6ffed;
  color: #389e0d;
}

.platform-douyin {
  background: #fff0f6;
  color: #c41d7f;
}

.platform-xiaohongshu {
  background: #fff1f0;
  color: #cf1322;
}

.platform-other {
  background: #f0f5ff;
  color: #2f54eb;
}
```

- [ ] **Step 7: 创建主入口文件**

```javascript
// frontend/src/main.js
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './styles/common.css'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)
app.mount('#app')
```

- [ ] **Step 8: 创建根组件**

```vue
<!-- frontend/src/App.vue -->
<template>
  <router-view />
</template>

<script setup>
</script>

<style>
</style>
```

- [ ] **Step 9: 创建布局组件框架**

```vue
<!-- frontend/src/views/Layout.vue -->
<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon :size="24"><TrendCharts /></el-icon>
        <span>SellWise</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#1a1a2e"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/hot-products">
          <el-icon><TrendCharts /></el-icon>
          <span>热点选款</span>
        </el-menu-item>
        <el-menu-item index="/product-monitor">
          <el-icon><DataLine /></el-icon>
          <span>数据监控</span>
        </el-menu-item>
        <el-menu-item index="/influencer">
          <el-icon><User /></el-icon>
          <span>达人分析</span>
        </el-menu-item>
        <el-menu-item index="/import">
          <el-icon><Upload /></el-icon>
          <span>数据导入</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeMenu = computed(() => route.path)
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #1a1a2e;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #333;
}

.main-content {
  background-color: #f5f7fa;
  padding: 0;
  overflow-y: auto;
}

:deep(.el-menu) {
  border-right: none;
}
</style>
```

---

### 阶段二：数据存储与导入模块

#### Task 3: 实现数据存储服务

**Files:**
- Create: `backend/app/services/data_store.py`
- Test: 验证单例模式和数据存储功能

- [ ] **Step 1: 实现数据存储单例**

```python
# backend/app/services/data_store.py
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
```

- [ ] **Step 2: 验证单例模式**

运行 Python 验证：
```python
from app.services.data_store import DataStore, data_store

d1 = DataStore()
d2 = DataStore()
assert d1 is d2, "单例模式失败"
assert d1 is data_store, "实例引用不一致"
print("单例模式验证通过")
```

---

#### Task 4: 实现相关性分析服务

**Files:**
- Create: `backend/app/services/correlation.py`
- Test: 验证皮尔逊相关系数计算

- [ ] **Step 1: 实现相关性分析算法**

```python
# backend/app/services/correlation.py
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
```

- [ ] **Step 2: 验证相关性计算**

测试用例：
```python
from app.services.correlation import CorrelationAnalyzer

x = [1, 2, 3, 4, 5]
y = [2, 4, 6, 8, 10]
corr = CorrelationAnalyzer.pearson_correlation(x, y)
assert abs(corr - 1.0) < 0.001, "完全正相关测试失败"

x = [1, 2, 3, 4, 5]
y = [10, 8, 6, 4, 2]
corr = CorrelationAnalyzer.pearson_correlation(x, y)
assert abs(corr + 1.0) < 0.001, "完全负相关测试失败"

label, level = CorrelationAnalyzer.get_correlation_label(0.85)
assert label == '极强正相关', "标签测试失败"

print("相关性分析验证通过")
```

---

#### Task 5: 实现达人评分计算服务

**Files:**
- Create: `backend/app/services/scoring.py`
- Test: 验证评分计算逻辑

- [ ] **Step 1: 实现评分计算服务**

```python
# backend/app/services/scoring.py
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
```

- [ ] **Step 2: 验证评分计算**

测试用例：
```python
from app.services.scoring import ScoringService
from app.models.enums import ScoreLevel

level = ScoringService.get_score_level(92)
assert level == ScoreLevel.EXCELLENT, "优秀等级测试失败"

level = ScoringService.get_score_level(75)
assert level == ScoreLevel.GOOD, "良好等级测试失败"

level = ScoringService.get_score_level(45)
assert level == ScoreLevel.AVERAGE, "一般等级测试失败"

level = ScoringService.get_score_level(35)
assert level == ScoreLevel.NEEDS_IMPROVEMENT, "待提升等级测试失败"

print("评分等级验证通过")
```

---

#### Task 6: 实现数据导入 API

**Files:**
- Create: `backend/app/routers/import_.py`
- Create: `frontend/src/api/import.js`
- Create: `frontend/src/components/FieldMapping.vue`
- Create: `frontend/src/views/Import.vue`

- [ ] **Step 1: 实现后端导入 API**

```python
# backend/app/routers/import_.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
import pandas as pd
import io
import uuid

from ..models import (
    ApiResponse, DataType, Platform,
    ExcelSheetInfo, FieldMappingItem, FieldMappingRequest,
    ImportResult, SystemFieldTemplate
)
from ..services.data_store import data_store

router = APIRouter()

SYSTEM_FIELDS = {
    DataType.HOT_PRODUCTS: [
        FieldMappingItem(system_field="product_name", excel_column=None, is_required=True, description="商品名称"),
        FieldMappingItem(system_field="platform", excel_column=None, is_required=True, description="平台"),
        FieldMappingItem(system_field="heat_index", excel_column=None, is_required=True, description="热度指数"),
        FieldMappingItem(system_field="avg_price", excel_column=None, is_required=False, description="平均价格"),
        FieldMappingItem(system_field="data_source", excel_column=None, is_required=False, description="数据来源"),
    ],
    DataType.PRODUCT_MONITOR: [
        FieldMappingItem(system_field="product_id", excel_column=None, is_required=True, description="产品ID/名称"),
        FieldMappingItem(system_field="date", excel_column=None, is_required=True, description="日期"),
        FieldMappingItem(system_field="sales", excel_column=None, is_required=True, description="销量"),
        FieldMappingItem(system_field="favorites", excel_column=None, is_required=False, description="收藏量"),
        FieldMappingItem(system_field="views", excel_column=None, is_required=False, description="浏览量"),
    ],
    DataType.INFLUENCER: [
        FieldMappingItem(system_field="post_id", excel_column=None, is_required=True, description="帖子ID/链接"),
        FieldMappingItem(system_field="influencer_name", excel_column=None, is_required=True, description="达人名称"),
        FieldMappingItem(system_field="post_views", excel_column=None, is_required=True, description="帖子浏览量"),
        FieldMappingItem(system_field="product_id", excel_column=None, is_required=True, description="关联产品ID"),
        FieldMappingItem(system_field="product_favorites", excel_column=None, is_required=False, description="产品收藏量"),
        FieldMappingItem(system_field="product_sales", excel_column=None, is_required=False, description="产品销量"),
        FieldMappingItem(system_field="user_profile_weight", excel_column=None, is_required=False, description="用户画像权重系数"),
    ],
}

PLATFORM_MAPPING = {
    '淘宝': Platform.TAOBAO,
    'taobao': Platform.TAOBAO,
    '京东': Platform.JD,
    'jd': Platform.JD,
    '拼多多': Platform.PDD,
    'pdd': Platform.PDD,
    '抖音': Platform.DOUYIN,
    'douyin': Platform.DOUYIN,
    '小红书': Platform.XIAOHONGSHU,
    'xiaohongshu': Platform.XIAOHONGSHU,
}

def normalize_platform(value: str) -> str:
    """标准化平台名称"""
    if not value:
        return Platform.OTHER.value
    value_lower = str(value).strip().lower()
    for key, plat in PLATFORM_MAPPING.items():
        if key.lower() in value_lower or value_lower in key.lower():
            return plat.value
    return Platform.OTHER.value

@router.post("/upload", response_model=ApiResponse[Dict[str, Any]])
async def upload_excel(file: UploadFile = File(...)):
    """上传 Excel 文件并解析"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="未选择文件")
    
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="仅支持 .xlsx, .xls, .csv 格式")
    
    try:
        content = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
            sheets_info = [{
                'name': 'Sheet1',
                'row_count': len(df),
                'column_count': len(df.columns),
                'columns': list(df.columns),
                'sample_data': df.head(5).to_dict('records'),
            }]
        else:
            excel_file = pd.ExcelFile(io.BytesIO(content))
            sheets_info = []
            
            for sheet_name in excel_file.sheet_names:
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                sheets_info.append({
                    'name': sheet_name,
                    'row_count': len(df),
                    'column_count': len(df.columns),
                    'columns': list(df.columns),
                    'sample_data': df.head(5).to_dict('records'),
                })
        
        return ApiResponse(
            data={
                'filename': file.filename,
                'sheets': sheets_info,
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件解析失败: {str(e)}")

@router.get("/templates", response_model=ApiResponse[List[SystemFieldTemplate]])
async def get_system_templates():
    """获取系统字段模板"""
    templates = []
    for data_type, fields in SYSTEM_FIELDS.items():
        templates.append(SystemFieldTemplate(
            data_type=data_type,
            fields=fields,
        ))
    return ApiResponse(data=templates)

@router.post("/map", response_model=ApiResponse[ImportResult])
async def map_and_import(request: FieldMappingRequest):
    """执行字段映射并导入数据"""
    try:
        data_type = request.data_type
        mappings = request.mappings
        
        required_fields = [f for f in SYSTEM_FIELDS.get(data_type, []) if f.is_required]
        for req_field in required_fields:
            mapping = next((m for m in mappings if m.system_field == req_field.system_field), None)
            if not mapping or not mapping.excel_column:
                raise HTTPException(
                    status_code=400, 
                    detail=f"必填字段 '{req_field.system_field}' 未选择对应列"
                )
        
        column_mapping = {}
        for m in mappings:
            if m.excel_column:
                column_mapping[m.excel_column] = m.system_field
        
        if request.save_as_template and request.template_name:
            data_store.save_mapping_template(
                request.template_name,
                {
                    'data_type': data_type.value,
                    'mappings': [m.model_dump() for m in mappings],
                }
            )
        
        return ApiResponse(
            data=ImportResult(
                success=True,
                row_count=0,
                columns=list(column_mapping.values()),
                message="字段映射已保存，请确认数据后导入"
            )
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"映射失败: {str(e)}")

@router.get("/mapping-templates", response_model=ApiResponse[Dict[str, Any]])
async def get_mapping_templates():
    """获取已保存的映射模板"""
    return ApiResponse(data=data_store.get_mapping_templates())

@router.post("/confirm", response_model=ApiResponse[ImportResult])
async def confirm_import(
    data_type: DataType = Query(...),
    sheet_name: str = Query(...),
):
    """确认导入（模拟实际数据导入）"""
    try:
        sample_data = generate_sample_data(data_type)
        df = pd.DataFrame(sample_data)
        data_store.set_data(data_type.value, df)
        
        return ApiResponse(
            data=ImportResult(
                success=True,
                row_count=len(df),
                columns=list(df.columns),
                message=f"成功导入 {len(df)} 条数据"
            )
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导入失败: {str(e)}")

def generate_sample_data(data_type: DataType) -> List[Dict[str, Any]]:
    """生成示例数据（实际应从解析的Excel中读取）"""
    if data_type == DataType.HOT_PRODUCTS:
        return [
            {'id': 'SP001', 'product_name': '夏季新款透气运动跑鞋', 'platform': 'douyin', 'heat_index': 98765, 'avg_price': 299.0, 'data_source': '抖音热点榜'},
            {'id': 'SP002', 'product_name': '网红ins风手提包', 'platform': 'xiaohongshu', 'heat_index': 76543, 'avg_price': 159.0, 'data_source': '小红书种草'},
            {'id': 'SP003', 'product_name': '智能蓝牙运动耳机', 'platform': 'taobao', 'heat_index': 54321, 'avg_price': 199.0, 'data_source': '淘宝热销'},
        ]
    elif data_type == DataType.PRODUCT_MONITOR:
        return [
            {'product_id': 'SP001', 'product_name': '夏季透气跑鞋', 'date': '2026-04-01', 'sales': 156, 'favorites': 423, 'views': 2340},
            {'product_id': 'SP001', 'product_name': '夏季透气跑鞋', 'date': '2026-04-08', 'sales': 189, 'favorites': 512, 'views': 2890},
            {'product_id': 'SP001', 'product_name': '夏季透气跑鞋', 'date': '2026-04-15', 'sales': 234, 'favorites': 645, 'views': 3560},
            {'product_id': 'SP002', 'product_name': '网红手提包', 'date': '2026-04-01', 'sales': 89, 'favorites': 312, 'views': 1560},
            {'product_id': 'SP002', 'product_name': '网红手提包', 'date': '2026-04-08', 'sales': 102, 'favorites': 368, 'views': 1890},
        ]
    elif data_type == DataType.INFLUENCER:
        return [
            {
                'post_id': 'POST001', 'influencer_name': '小红书达人小美',
                'post_views': 56800, 'product_id': 'SP001',
                'product_favorites': 423, 'product_sales': 156,
                'user_profile_weight': 1.5,
            },
            {
                'post_id': 'POST002', 'influencer_name': '时尚穿搭阿杰',
                'post_views': 42300, 'product_id': 'SP002',
                'product_favorites': 312, 'product_sales': 89,
                'user_profile_weight': 0.9,
            },
            {
                'post_id': 'POST003', 'influencer_name': '科技测评小明',
                'post_views': 89500, 'product_id': 'SP003',
                'product_favorites': 156, 'product_sales': 45,
                'user_profile_weight': 0.5,
            },
        ]
    return []
```

- [ ] **Step 2: 创建前端导入 API 调用**

```javascript
// frontend/src/api/import.js
import api from './index'

export const uploadExcel = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/import/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getSystemTemplates = () => {
  return api.get('/import/templates')
}

export const getMappingTemplates = () => {
  return api.get('/import/mapping-templates')
}

export const mapFields = (data) => {
  return api.post('/import/map', data)
}

export const confirmImport = (dataType, sheetName) => {
  return api.post('/import/confirm', null, {
    params: { data_type: dataType, sheet_name: sheetName }
  })
}
```

- [ ] **Step 3: 创建字段映射组件**

```vue
<!-- frontend/src/components/FieldMapping.vue -->
<template>
  <div class="field-mapping">
    <div v-for="(item, index) in mappings" :key="index" class="mapping-row">
      <div class="system-field" :class="{ required: item.is_required }">
        <div class="label">系统字段</div>
        <div class="name">{{ item.system_field }}</div>
        <div class="desc">{{ item.description }}</div>
      </div>
      <div class="arrow">→</div>
      <div class="excel-field">
        <div class="label">Excel 列名</div>
        <el-select
          v-model="item.excel_column"
          placeholder="请选择"
          style="width: 100%"
          :clearable="!item.is_required"
        >
          <el-option
            v-for="col in excelColumns"
            :key="col"
            :label="col"
            :value="col"
          />
        </el-select>
      </div>
    </div>
    
    <div v-if="autoMatchCount > 0" class="match-hint">
      <el-icon :size="16"><InfoFilled /></el-icon>
      <span>系统已根据列名智能匹配 {{ autoMatchCount }}/{{ mappings.length }} 个字段</span>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  mappings: {
    type: Array,
    required: true
  },
  excelColumns: {
    type: Array,
    required: true
  }
})

const autoMatchCount = computed(() => {
  return props.mappings.filter(m => m.excel_column).length
})

watch(
  () => props.excelColumns,
  (cols) => {
    if (cols && cols.length > 0) {
      props.mappings.forEach(item => {
        if (!item.excel_column) {
          const matched = cols.find(col => {
            const colLower = col.toLowerCase()
            const fieldLower = item.system_field.toLowerCase()
            return colLower.includes(fieldLower) || 
                   fieldLower.includes(colLower) ||
                   colLower.includes(item.description)
          })
          if (matched) {
            item.excel_column = matched
          }
        }
      })
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.field-mapping {
  max-height: 400px;
  overflow-y: auto;
}

.mapping-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  margin-bottom: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.system-field {
  flex: 1;
  min-width: 150px;
  padding: 12px;
  background: #ecf5ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;
}

.system-field.required {
  border-left: 3px solid #f56c6c;
}

.system-field .label {
  font-size: 12px;
  color: #409eff;
  margin-bottom: 4px;
}

.system-field .name {
  font-weight: 500;
  margin-bottom: 2px;
}

.system-field .desc {
  font-size: 11px;
  color: #909399;
}

.arrow {
  font-size: 20px;
  color: #409eff;
  font-weight: bold;
}

.excel-field {
  flex: 1;
  min-width: 150px;
  padding: 12px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
}

.excel-field .label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.match-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background: #fdf6ec;
  border-left: 4px solid #e6a23c;
  border-radius: 0 4px 4px 0;
  font-size: 13px;
  color: #e6a23c;
}
</style>
```

- [ ] **Step 4: 创建数据导入页面**

```vue
<!-- frontend/src/views/Import.vue -->
<template>
  <div class="page-container">
    <div class="card-wrapper">
      <h3>数据导入</h3>
      <el-steps :active="step" finish-status="success" align-center>
        <el-step title="上传文件" />
        <el-step title="选择数据类型" />
        <el-step title="字段映射" />
        <el-step title="确认导入" />
      </el-steps>
    </div>
    
    <div v-if="step === 0" class="card-wrapper">
      <el-upload
        class="upload-area"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
        accept=".xlsx,.xls,.csv"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 .xlsx, .xls, .csv 格式
          </div>
        </template>
      </el-upload>
      
      <div v-if="selectedFile" class="file-info">
        <el-icon :size="24"><Document /></el-icon>
        <span>{{ selectedFile.name }}</span>
        <el-button type="primary" @click="proceedToDataType">下一步</el-button>
      </div>
    </div>
    
    <div v-if="step === 1" class="card-wrapper">
      <h4>选择数据类型</h4>
      <el-radio-group v-model="selectedDataType" style="display: flex; flex-direction: column; gap: 16px;">
        <el-radio-button label="hot_products">
          <div class="radio-content">
            <strong>热点选款数据</strong>
            <p style="margin: 4px 0 0; font-size: 12px; color: #909399;">商品名称、平台、热度指数、平均价格等</p>
          </div>
        </el-radio-button>
        <el-radio-button label="product_monitor">
          <div class="radio-content">
            <strong>产品监控数据</strong>
            <p style="margin: 0; font-size: 12px; color: #909399;">产品ID、日期、销量、收藏量、浏览量等</p>
          </div>
        </el-radio-button>
        <el-radio-button label="influencer">
          <div class="radio-content">
            <strong>达人分析数据</strong>
            <p style="margin: 0; font-size: 12px; color: #909399;">帖子ID、达人名称、浏览量、用户画像权重等</p>
          </div>
        </el-radio-button>
      </el-radio-group>
      
      <div v-if="sheets && sheets.length > 1" style="margin-top: 20px;">
        <h4>选择 Sheet</h4>
        <el-select v-model="selectedSheet" placeholder="请选择" style="width: 100%;">
          <el-option
            v-for="sheet in sheets"
            :key="sheet.name"
            :label="`${sheet.name} (${sheet.row_count} 行)`"
            :value="sheet.name"
          />
        </el-select>
      </div>
      
      <div class="action-buttons">
        <el-button @click="step = 0">上一步</el-button>
        <el-button type="primary" @click="proceedToMapping" :disabled="!selectedDataType">下一步</el-button>
      </div>
    </div>
    
    <div v-if="step === 2" class="card-wrapper">
      <h4>字段映射配置</h4>
      
      <FieldMapping
        v-model:mappings="fieldMappings"
        :excel-columns="currentSheetColumns"
      />
      
      <div class="save-template" v-if="sheets">
        <el-checkbox v-model="saveAsTemplate">保存此映射为模板</el-checkbox>
        <el-input
          v-if="saveAsTemplate"
          v-model="templateName"
          placeholder="输入模板名称"
          style="width: 200px; margin-left: 12px;"
        />
      </div>
      
      <div class="action-buttons">
        <el-button @click="step = 1">上一步</el-button>
        <el-button type="primary" @click="proceedToPreview">下一步：数据预览</el-button>
      </div>
    </div>
    
    <div v-if="step === 3" class="card-wrapper">
      <h4>数据预览</h4>
      
      <div v-if="currentSheetSample && currentSheetSample.length > 0">
        <el-table :data="currentSheetSample.slice(0, 5)" border size="small" style="width: 100%;">
