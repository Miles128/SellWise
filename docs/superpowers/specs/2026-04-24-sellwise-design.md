# SellWise 电商运营工具设计规格

**创建日期：** 2026-04-24  
**项目名称：** SellWise  
**状态：** 设计完成，待实施

---

## 1. 项目概述

### 1.1 项目背景

SellWise 是一个面向电商运营人员和数据分析师的 Web 端运营工具，提供热点选款、产品数据监控、达人带货分析等核心功能。

### 1.2 目标用户

- **电商运营人员**：快速监控产品数据和分析达人合作效果
- **选品团队**：关注热点选款功能，寻找爆款机会
- **数据分析师**：深入的数据相关性分析和导出功能

### 1.3 技术栈

| 层级 | 技术选择 | 说明 |
|------|----------|------|
| 后端 | FastAPI | 现代异步Python框架，自动API文档 |
| 前端 | Vue 3 + Element Plus | 组件库成熟，适合管理后台 |
| 图表 | ECharts | 数据可视化功能强大 |
| 数据处理 | pandas + numpy | Excel读取、数据计算、相关性分析 |

### 1.4 数据存储策略

- **会话级存储**：每次打开应用重新导入，关闭后数据不保留
- **无需数据库**：简化架构，降低部署复杂度
- **导入历史记录**：可选功能，记录每次导入操作

---

## 2. 系统架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (Vue 3)                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 数据导入  │ │ 热点选款  │ │ 产品监控  │ │ 达人分析  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Element Plus UI 组件库                 │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │               ECharts 图表可视化                     │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      后端 (FastAPI)                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │  导入模块    │ │  分析模块    │ │  导出模块    │       │
│  │  (Excel)    │ │  (相关性)   │ │  (数据)    │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
│  ┌────────────────────────────────────────────────────┐     │
│  │           pandas / numpy 数据处理引擎               │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      会话级数据存储                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 内存中的 DataFrame / 临时文件 (应用重启后清除)      │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 目录结构

```
SellWise/
├── backend/                    # 后端代码
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI 入口
│   │   ├── config.py          # 配置文件
│   │   ├── routers/           # API 路由
│   │   │   ├── __init__.py
│   │   │   ├── import_.py     # 数据导入相关API
│   │   │   ├── hot_products.py # 热点选款API
│   │   │   ├── product_monitor.py # 产品监控API
│   │   │   └── influencer.py  # 达人分析API
│   │   ├── services/          # 业务逻辑
│   │   │   ├── __init__.py
│   │   │   ├── data_import.py # Excel导入处理
│   │   │   ├── correlation.py # 相关性分析
│   │   │   └── scoring.py     # 评分计算
│   │   ├── models/            # 数据模型
│   │   │   ├── __init__.py
│   │   │   ├── schemas.py     # Pydantic 模型
│   │   │   └── enums.py       # 枚举定义
│   │   └── utils/             # 工具函数
│   │       ├── __init__.py
│   │       ├── excel.py       # Excel处理工具
│   │       └── math.py        # 数学计算工具
│   ├── requirements.txt       # Python依赖
│   └── run.py                 # 启动脚本
│
├── frontend/                   # 前端代码
│   ├── public/
│   ├── src/
│   │   ├── main.js            # 入口文件
│   │   ├── App.vue            # 根组件
│   │   ├── router/            # 路由配置
│   │   │   └── index.js
│   │   ├── store/             # 状态管理
│   │   │   └── index.js
│   │   ├── api/               # API 调用
│   │   │   ├── index.js
│   │   │   ├── import.js
│   │   │   ├── hotProducts.js
│   │   │   ├── productMonitor.js
│   │   │   └── influencer.js
│   │   ├── views/             # 页面视图
│   │   │   ├── Layout.vue     # 布局组件
│   │   │   ├── Import.vue     # 数据导入页
│   │   │   ├── HotProducts.vue # 热点选款页
│   │   │   ├── ProductMonitor.vue # 产品监控页
│   │   │   └── InfluencerAnalysis.vue # 达人分析页
│   │   ├── components/        # 公共组件
│   │   │   ├── DataTable.vue  # 数据表格
│   │   │   ├── Chart.vue      # 图表组件
│   │   │   ├── StatCard.vue   # 统计卡片
│   │   │   └── FieldMapping.vue # 字段映射组件
│   │   ├── styles/            # 样式文件
│   │   └── utils/             # 前端工具
│   ├── package.json
│   └── vite.config.js
│
├── docs/                       # 文档目录
│   └── superpowers/
│       └── specs/
│           └── 2026-04-24-sellwise-design.md
│
├── templates/                  # Excel模板示例
│   ├── hot_products_template.xlsx
│   ├── product_monitor_template.xlsx
│   └── influencer_template.xlsx
│
├── .gitignore
└── README.md
```

---

## 3. 功能模块设计

### 3.1 数据导入模块

#### 3.1.1 功能概述

支持从本地Excel文件导入数据，通过字段映射机制适配不同的Excel模板结构。

#### 3.1.2 导入流程

```
上传Excel → 解析Sheet → 选择数据类型 → 字段映射 → 数据预览 → 确认导入
```

#### 3.1.3 字段映射机制

- **左侧显示系统字段**（必填/可选标记）
- **右侧下拉选择Excel列名**
- **智能推荐匹配**：根据列名相似度自动匹配
- **保存映射模板**：下次导入相同结构时自动应用

#### 3.1.4 系统字段定义

##### 热点选款字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| product_name | string | 是 | 商品名称 |
| platform | string | 是 | 平台（淘宝/京东/抖音/小红书等） |
| heat_index | number | 是 | 热度指数 |
| avg_price | number | 否 | 平均价格 |
| data_source | string | 否 | 数据来源 |

##### 产品监控字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| product_id | string | 是 | 产品ID或名称 |
| date | date | 是 | 数据日期 |
| sales | number | 是 | 销量 |
| favorites | number | 否 | 收藏量 |
| views | number | 否 | 浏览量 |

##### 达人分析字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| post_id | string | 是 | 帖子ID/链接 |
| influencer_name | string | 是 | 达人名称 |
| post_views | number | 是 | 帖子浏览量 |
| product_id | string | 是 | 关联产品ID |
| product_favorites | number | 否 | 产品收藏量 |
| product_sales | number | 否 | 产品销量 |
| user_profile_weight | number | 否 | 用户画像权重系数 |

#### 3.1.5 API 设计

```
POST  /api/import/upload          # 上传Excel文件
POST  /api/import/parse           # 解析Excel结构
POST  /api/import/map             # 执行字段映射并导入
GET   /api/import/templates       # 获取系统字段模板
POST  /api/import/save-template   # 保存映射模板
GET   /api/import/history         # 获取导入历史
```

---

### 3.2 热点选款模块

#### 3.2.1 功能概述

展示热点商品池，支持多维度筛选、排序和快捷操作。

#### 3.2.2 页面结构

1. **筛选区**
   - 平台筛选（下拉多选）
   - 价格区间（预设区间+自定义）
   - 热度范围（最小值/最大值）
   - 关键词搜索

2. **数据展示区**
   - 商品列表表格
   - 分页功能
   - 排序功能

3. **快捷操作**
   - 导出数据
   - 手动新增商品
   - 加入产品监控

#### 3.2.3 表格列定义

| 列名 | 说明 | 可视化方式 |
|------|------|------------|
| 商品名称 | 名称+ID | 主标题+副标题 |
| 平台 | 来源平台 | 彩色标签（不同平台不同颜色） |
| 热度指数 | 数值+相对热度 | 数字 + 进度条 |
| 平均价格 | 价格 | 货币格式 |
| 热度趋势 | 变化方向 | 涨跌图标 + 百分比 |
| 操作 | 快捷操作 | 查看详情/加入监控 |

#### 3.2.4 平台标签配色

| 平台 | 背景色 | 文字色 |
|------|--------|--------|
| 淘宝 | #e6f7ff | #1890ff |
| 京东 | #fff7e6 | #d48806 |
| 拼多多 | #f6ffed | #389e0d |
| 抖音 | #fff0f6 | #c41d7f |
| 小红书 | #fff1f0 | #cf1322 |
| 其他 | #f0f5ff | #2f54eb |

#### 3.2.5 API 设计

```
GET   /api/hot-products           # 获取商品列表（支持筛选排序）
GET   /api/hot-products/{id}      # 获取商品详情
GET   /api/hot-products/platforms # 获取平台列表
POST  /api/hot-products           # 手动新增商品
POST  /api/hot-products/export    # 导出数据
POST  /api/hot-products/{id}/monitor # 加入监控
```

---

### 3.3 产品运营数据监控模块

#### 3.3.1 功能概述

监控多款产品的运营数据变动，计算产品数据之间的相关性。

#### 3.3.2 页面结构

1. **筛选区**
   - 多选产品
   - 时间范围选择（预设+自定义）
   - 数据指标选择（销量/收藏/浏览）

2. **概览卡片**
   - 总销量 + 环比变化
   - 总收藏量 + 环比变化
   - 总浏览量 + 环比变化
   - 转化率 + 环比变化

3. **图表区**
   - 左侧：多产品销量趋势对比图（柱状/折线切换）
   - 右侧：相关性分析矩阵

4. **详细列表**
   - 各产品每日数据明细

#### 3.3.3 相关性分析

**计算方法：皮尔逊相关系数**

```python
import numpy as np

def pearson_correlation(x, y):
    """计算皮尔逊相关系数"""
    return np.corrcoef(x, y)[0][1]
```

**相关性强度判定：**

| 相关系数绝对值 | 强度 | 颜色标记 |
|----------------|------|----------|
| 0.8 ~ 1.0 | 极强相关 | 绿色 |
| 0.6 ~ 0.8 | 强相关 | 蓝色 |
| 0.4 ~ 0.6 | 中度相关 | 橙色 |
| 0.2 ~ 0.4 | 弱相关 | 灰色 |
| 0.0 ~ 0.2 | 极弱或无相关 | 浅灰色 |

**分析维度：**
1. **指标间相关性**：销量 vs 收藏 vs 浏览
2. **产品间相关性**：不同产品之间的销量相关性（竞争/互补分析）

#### 3.3.4 API 设计

```
GET   /api/product-monitor/products     # 获取可监控产品列表
POST  /api/product-monitor/analyze      # 执行数据分析
GET   /api/product-monitor/trends       # 获取趋势数据
GET   /api/product-monitor/correlation  # 获取相关性矩阵
POST  /api/product-monitor/export       # 导出分析报告
```

---

### 3.4 达人带货数据分析模块

#### 3.4.1 功能概述

根据帖子浏览量和产品数据的趋势相关性，结合用户画像加权浏览量，计算达人带货效果评价分。

#### 3.4.2 页面结构

1. **筛选区**
   - 达人筛选（平台/类型）
   - 评分区间筛选
   - 排序方式
   - 评分权重配置按钮

2. **概览卡片**
   - 达人总数
   - 平均效果评分
   - 优秀达人占比
   - 总加权浏览量

3. **图表区**
   - 评分分布柱状图
   - 当前评分规则说明

4. **达人列表**
   - 达人信息（头像+名称+粉丝数）
   - 效果评分（分数+等级标签）
   - 相关性系数
   - 原始/加权浏览量
   - 关联产品+销量变化
   - 查看详情

#### 3.4.3 评分计算规则

**公式：**
```
效果评价分 = 趋势相关性分 × W1 + 加权浏览量分 × W2

其中：
- W1 + W2 = 100%
- 默认值：W1=60%, W2=40%
- 用户可在页面配置权重
```

**1. 趋势相关性分（满分：100 × W1）**

计算帖子浏览量时间序列与产品销量/收藏量时间序列的皮尔逊相关系数：

```
趋势相关性分 = 相关系数 × (100 × W1)

示例：
相关系数 = 0.92, W1 = 60%
趋势相关性分 = 0.92 × 60 = 55.2 分
```

**2. 加权浏览量分（满分：100 × W2）**

```
加权浏览量 = 原始浏览量 × 用户画像权重系数

加权浏览量分按相对排名换算：
- 最高加权浏览量 → 100 × W2 分
- 其余按比例递减

示例：
W2 = 40%，最高得40分
达人A加权浏览量最高 → 40分
达人B为达人A的90% → 36分
```

**3. 用户画像权重**

- 从Excel导入时一并导入权重系数
- 权重系数示例：
  - 目标用户（18-24岁女性）：权重 = 2.0
  - 次目标用户（25-35岁女性）：权重 = 1.2
  - 一线城市用户：权重 = 1.5
  - 其他用户：权重 = 0.5

#### 3.4.4 评分等级

| 分数区间 | 等级 | 标签颜色 |
|----------|------|----------|
| 80 ~ 100 | 优秀 | 绿色 |
| 60 ~ 80 | 良好 | 蓝色 |
| 40 ~ 60 | 一般 | 橙色 |
| 0 ~ 40 | 待提升 | 红色 |

#### 3.4.5 权重配置功能

- **入口**：页面顶部「⚙️ 评分权重」按钮
- **配置项**：
  - 趋势相关性分权重（滑块+输入框）
  - 加权浏览量分权重（滑块+输入框，与前者联动）
- **校验规则**：两权重之和必须为100%
- **效果预览**：显示当前权重和调整后权重的评分差异示例
- **恢复默认**：一键恢复 60:40
- **应用并重算**：应用新权重后自动重新计算所有达人评分

#### 3.4.6 达人详情弹窗

- **评分构成拆解**：相关性分/浏览量分的具体数值
- **用户画像权重明细**：各标签的权重系数
- **趋势对比图**：浏览量vs销量双折线图
- **智能分析结论**：基于数据的建议（继续合作/需优化/不推荐）

#### 3.4.7 API 设计

```
GET   /api/influencer/list               # 获取达人列表
GET   /api/influencer/{id}               # 获取达人详情
POST  /api/influencer/analyze            # 执行达人分析
GET   /api/influencer/scoring-config     # 获取当前评分权重配置
PUT   /api/influencer/scoring-config     # 更新评分权重配置
POST  /api/influencer/recalculate        # 重新计算所有评分
POST  /api/influencer/export             # 导出达人分析报告
```

---

## 4. 数据模型

### 4.1 数据存储策略

由于采用会话级存储，所有数据在后端内存中维护：

```python
# backend/app/services/data_import.py

from typing import Dict, Optional
import pandas as pd

class DataStore:
    """会话级数据存储"""
    
    _instance: Optional['DataStore'] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._data = {
                'hot_products': None,      # pd.DataFrame
                'product_monitor': None,   # pd.DataFrame
                'influencer': None,        # pd.DataFrame
            }
            cls._instance._mapping_templates = {}  # 字段映射模板
        return cls._instance
    
    def get_data(self, data_type: str) -> Optional[pd.DataFrame]:
        return self._data.get(data_type)
    
    def set_data(self, data_type: str, df: pd.DataFrame):
        self._data[data_type] = df
    
    def clear_all(self):
        for key in self._data:
            self._data[key] = None
```

### 4.2 Pydantic 模型定义

```python
# backend/app/models/schemas.py

from datetime import date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
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

class HotProductListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    data: List[HotProduct]

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

class ProductMonitorRequest(BaseModel):
    product_ids: List[str]
    start_date: date
    end_date: date
    metrics: List[str] = ["sales", "favorites", "views"]

class ProductMonitorResponse(BaseModel):
    summary: Dict[str, Any]
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

class InfluencerBasic(BaseModel):
    id: str
    name: str
    platform: str
    follower_count: Optional[int]

class InfluencerScore(BaseModel):
    influencer_id: str
    influencer_name: str
    total_score: float
    score_level: str  # 优秀/良好/一般/待提升
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

class InfluencerListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    summary: Dict[str, Any]
    data: List[InfluencerScore]
```

---

## 5. API 接口设计

### 5.1 通用响应格式

```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 5.2 接口列表

#### 5.2.1 数据导入模块

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/import/upload | 上传Excel文件 |
| POST | /api/import/parse | 解析Excel结构 |
| POST | /api/import/map | 执行字段映射并导入 |
| GET | /api/import/templates | 获取系统字段模板 |
| GET | /api/import/mapping-templates | 获取已保存的映射模板 |
| POST | /api/import/save-template | 保存映射模板 |

#### 5.2.2 热点选款模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/hot-products | 获取商品列表 |
| GET | /api/hot-products/{id} | 获取商品详情 |
| GET | /api/hot-products/platforms | 获取平台列表 |
| POST | /api/hot-products | 新增商品 |
| PUT | /api/hot-products/{id} | 更新商品 |
| DELETE | /api/hot-products/{id} | 删除商品 |
| POST | /api/hot-products/export | 导出数据 |
| POST | /api/hot-products/{id}/monitor | 加入监控 |

#### 5.2.3 产品监控模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/product-monitor/products | 获取可监控产品列表 |
| POST | /api/product-monitor/analyze | 执行数据分析 |
| GET | /api/product-monitor/trends | 获取趋势数据 |
| GET | /api/product-monitor/correlation | 获取相关性矩阵 |
| POST | /api/product-monitor/export | 导出分析报告 |

#### 5.2.4 达人分析模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/influencer | 获取达人列表 |
| GET | /api/influencer/{id} | 获取达人详情 |
| POST | /api/influencer/analyze | 执行达人分析 |
| GET | /api/influencer/scoring-config | 获取评分权重配置 |
| PUT | /api/influencer/scoring-config | 更新评分权重配置 |
| POST | /api/influencer/recalculate | 重新计算所有评分 |
| POST | /api/influencer/export | 导出分析报告 |

---

## 6. 前端路由设计

```javascript
// frontend/src/router/index.js

const routes = [
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
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
```

---

## 7. 实施计划

### 7.1 阶段一：项目搭建与基础架构

1. 初始化后端 FastAPI 项目
2. 初始化前端 Vue 3 + Element Plus 项目
3. 配置前后端联调（CORS、代理等）
4. 实现基础布局组件（侧边栏导航）

### 7.2 阶段二：数据导入模块

1. 实现 Excel 上传与解析（pandas）
2. 实现字段映射界面
3. 实现映射模板保存与加载
4. 实现数据预览与确认导入

### 7.3 阶段三：热点选款模块

1. 实现数据列表展示（表格+分页）
2. 实现筛选与排序功能
3. 实现快捷操作（导出、加入监控）

### 7.4 阶段四：产品监控模块

1. 实现多产品选择与数据筛选
2. 实现趋势图表（ECharts）
3. 实现相关性分析算法
4. 实现相关性矩阵展示

### 7.5 阶段五：达人分析模块

1. 实现达人列表展示
2. 实现评分计算算法
3. 实现权重配置功能
4. 实现达人详情弹窗
5. 实现趋势对比图表

### 7.6 阶段六：优化与测试

1. 界面交互优化
2. 数据导出功能完善
3. 错误处理与用户提示
4. 整体测试与调试

---

## 8. 预留接口设计

### 8.1 自动数据接口预留

为未来接入外部API做准备，设计统一的数据获取接口：

```python
# backend/app/services/data_sources/base.py

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import pandas as pd

class DataSource(ABC):
    """数据源基类"""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """数据源名称"""
        pass
    
    @abstractmethod
    def fetch_hot_products(self, params: Dict[str, Any]) -> pd.DataFrame:
        """获取热点商品数据"""
        pass
    
    @abstractmethod
    def fetch_product_data(self, product_id: str, params: Dict[str, Any]) -> pd.DataFrame:
        """获取产品监控数据"""
        pass
    
    @abstractmethod
    def fetch_influencer_data(self, influencer_id: str, params: Dict[str, Any]) -> pd.DataFrame:
        """获取达人数据"""
        pass

# backend/app/services/data_sources/excel_source.py

class ExcelDataSource(DataSource):
    """Excel文件数据源（当前实现）"""
    name = "excel"
    
    # ... 现有实现 ...

# backend/app/services/data_sources/api_source.py

class ApiDataSource(DataSource):
    """API数据源（未来扩展）"""
    name = "api"
    
    def __init__(self, api_config: Dict[str, str]):
        self.base_url = api_config.get('base_url')
        self.api_key = api_config.get('api_key')
    
    # ... 未来实现 ...
```

### 8.2 API 预留端点

```python
# backend/app/routers/data_sources.py

from fastapi import APIRouter, Depends
from typing import Dict, Any, List

router = APIRouter(prefix="/api/data-sources", tags=["数据来源管理"])

@router.get("/")
async def list_data_sources():
    """列出可用的数据源"""
    return {
        "sources": [
            {"id": "excel", "name": "Excel文件导入", "type": "file", "enabled": True},
            # {"id": "taobao_api", "name": "淘宝开放平台", "type": "api", "enabled": False, "needs_config": True},
            # {"id": "xiaohongshu_api", "name": "小红书API", "type": "api", "enabled": False, "needs_config": True},
        ]
    }

@router.post("/{source_id}/config")
async def configure_data_source(source_id: str, config: Dict[str, Any]):
    """配置数据源（未来扩展）"""
    pass

@router.post("/{source_id}/sync")
async def sync_data_from_source(source_id: str, data_type: str):
    """从数据源同步数据（未来扩展）"""
    pass
```

---

## 9. 附录

### 9.1 颜色规范

| 用途 | 颜色值 | 说明 |
|------|--------|------|
| 主色调 | #409eff | Element Plus 默认蓝色 |
| 成功色 | #67c23a | 优秀、增长、正相关 |
| 警告色 | #e6a23c | 一般、中度相关 |
| 危险色 | #f56c6c | 待提升、下降、负相关 |
| 信息色 | #909399 | 次要信息 |

### 9.2 Excel模板示例

详见 `templates/` 目录下的示例文件。

### 9.3 参考文档

- FastAPI 官方文档: https://fastapi.tiangolo.com/
- Vue 3 官方文档: https://vuejs.org/
- Element Plus 组件库: https://element-plus.org/
- ECharts 图表库: https://echarts.apache.org/
- pandas 数据分析: https://pandas.pydata.org/
