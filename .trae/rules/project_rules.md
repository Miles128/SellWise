# Project Rules

## PR 创建方式
- 创建 PR 时，始终使用浏览器方式（打开 GitHub PR 创建页面链接），不使用 `gh` CLI
- PR 创建链接格式：`https://github.com/Miles128/SellWise/compare/{base}...{head}`
- 默认 PR 方向：从功能分支合并到 main 分支

## 后端开发环境
- 后端使用 `uv` 作为 Python 包管理器和虚拟环境
- 运行后端命令前，必须进入 `backend` 目录并使用 `uv run` 前缀
- 正确的运行方式：
  ```bash
  cd backend
  uv run python run.py
  uv run python <script.py>
  uv sync  # 同步依赖
  ```
- 不要直接使用系统 Python (`python3`) 或 `pip` 安装依赖
- 依赖配置文件：`backend/pyproject.toml`

## 前端开发环境
- 前端使用 `npm` 作为包管理器
- 运行命令：`npm run dev`（开发模式）、`npm run build`（构建）
