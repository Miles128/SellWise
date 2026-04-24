# SellWise - 智能销售分析平台

一个功能强大的销售分析平台，帮助用户分析热销产品、管理红人合作、监控产品动态。

## 项目结构

```
SellWise/
├── backend/                 # 后端代码
│   ├── app/
│   │   ├── models/         # 数据模型
│   │   ├── routers/        # API路由
│   │   ├── services/       # 业务逻辑
│   │   ├── config.py       # 配置文件
│   │   └── main.py         # 应用入口
│   ├── requirements.txt    # Python依赖
│   └── run.py              # 启动脚本
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── api/           # API调用
│   │   ├── router/        # 路由配置
│   │   ├── styles/        # 样式文件
│   │   ├── views/         # 视图组件
│   │   ├── App.vue        # 根组件
│   │   └── main.js        # 入口文件
│   ├── index.html         # HTML模板
│   ├── package.json       # 项目配置
│   └── vite.config.js     # Vite配置
├── docs/                   # 文档
├── .gitignore             # Git忽略文件
├── LICENSE                # 许可证
└── README.md              # 项目说明
```

## 功能特性

- **热销产品分析**：查看和分析当前市场上的热销产品
- **数据导入**：支持导入产品数据、销售数据和红人数据
- **红人分析**：分析和管理合作红人信息
- **产品监控**：实时监控产品价格、库存和销售情况

## 快速开始

### 后端启动

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

3. 启动服务：
```bash
python run.py
```

后端服务将在 http://localhost:8000 启动

### 前端启动

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

前端应用将在 http://localhost:3000 启动

## API 文档

启动后端服务后，可以访问以下地址查看API文档：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 技术栈

### 后端
- Python 3.8+
- FastAPI
- Uvicorn
- Pydantic

### 前端
- Vue 3
- Vue Router
- Axios
- Vite

## 许可证

MIT License
