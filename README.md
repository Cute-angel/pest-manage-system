# 管理系统

一个面向农场虫害监测场景的管理端应用，使用 `Tauri 2 + Vue 3 + TypeScript` 构建，当前包含移动端风格首页、实时检测、巡检时间线、个人中心，以及一个用于本地联调的 Python Mock Backend。



## 功能概览

- 登录 / 注册 / 退出登录，前端内置 `accessToken + refreshToken` 刷新逻辑
- 首页仪表盘，支持农场总览和地块切换
- 实时检测页，可上传图片并展示虫害识别结果、框选图和处置建议
- 巡检时间线，支持按状态筛选和详情查看
- 个人中心，支持读取用户资料与账户设置面板
- 天气状态组件，可接入和风天气接口

## 技术栈

- 前端：`Vue 3`、`TypeScript`、`Vite`
- 状态管理：`Pinia`
- 路由：`vue-router`
- UI：`Tailwind CSS 4`、`daisyUI`、`lucide-vue-next`
- 桌面端：`Tauri 2`
- 远端静态部署：`Wrangler` / Cloudflare
- 本地测试后端：Python 标准库 HTTP 服务

## 目录结构

```text
.
├─ src/                 前端源码
│  ├─ api/              接口层、鉴权、天气配置
│  ├─ components/       共享组件
│  ├─ pages/            页面级组件
│  ├─ stores/           Pinia 状态
│  └─ styles/           全局样式
├─ src-tauri/           Tauri Rust 入口与配置
├─ src-backend/         Python Mock Backend 与接口文档
├─ public/              静态资源
├─ docs/                项目文档
└─ manager-system.pen   设计稿源文件
```

## 环境要求

- `Node.js` 18+
- `pnpm`
- `Rust` 与 Tauri 开发环境
- `Python` 3.10+（用于本地 Mock Backend）

如果是首次配置 Tauri 环境，需先按官方文档安装对应平台依赖。

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置接口地址

前端默认读取 `VITE_API_BASE_URL`。

本地联调 Python Mock Backend 时，建议设置为：

```env
VITE_API_BASE_URL=http://localhost:8000
```

项目中还预留了和风天气相关变量：

```env
VITE_QWEATHER_API_HOST=
VITE_QWEATHER_LOCATION=
VITE_QWEATHER_API_KEY=
VITE_QWEATHER_JWT_TOKEN=
```

说明：

- `src/api/http.ts` 在未配置时会回退到 `http://localhost:8000`
- `src/api/weather.ts` 会读取和风天气 Host、Location、Key、JWT
- 远端环境可单独维护在 `.env.remote`

### 3. 启动 Mock Backend

```bash
pnpm run backend:dev
```

或：

```bash
python src-backend/server.py
```

默认地址：`http://localhost:8000`

默认测试账号：

- 手机号：`13800138000`
- 密码：`123456`

更多接口说明见 [src-backend/README.md](/D:/New%20folder/manage-system/src-backend/README.md)。

### 4. 启动前端开发服务

```bash
pnpm dev
```

默认开发地址：`http://localhost:1420`

### 5. 启动 Tauri 桌面端

```bash
pnpm tauri dev
```

## 常用命令

```bash
pnpm dev            # 启动 Vite 前端开发服务
pnpm build          # 类型检查并构建前端产物
pnpm preview        # 远端模式构建后使用 wrangler dev 本地预览
pnpm run backend:dev# 启动 Python Mock Backend
pnpm tauri dev      # 启动 Tauri 桌面调试
pnpm tauri build    # 构建 Tauri 桌面应用
pnpm deploy         # 远端模式构建并发布到 Cloudflare
cargo test --manifest-path src-tauri/Cargo.toml
```

注意：

- 当前 `pnpm preview` 不是 Vite 默认的 `vite preview`，而是执行远端构建后启动 `wrangler dev`
- `pnpm build` 是前端变更后最基本的校验命令

## 开发说明

### 路由

当前主要页面路由如下：

- `/home` 首页总览
- `/detect` 实时检测
- `/timeline` 巡检时间线
- `/timeline/:id` 巡检详情
- `/me` 我的
- `/login` 登录 / 注册

其中 `/home`、`/timeline`、`/me` 需要登录后访问。

### 鉴权

- 登录成功后前端会保存 `accessToken` 和 `refreshToken`
- 请求统一经 `src/api/http.ts` 发出
- 遇到 `401` 或 token 过期码时会自动尝试刷新
- 刷新失败后会清空本地会话并跳转到登录页

### 检测联调

检测页通过上传图片调用后端识别接口。本地 Mock Backend 会根据文件名中的关键词返回不同结果，例如：

- `thrip`
- `whitefly`
- `healthy`

适合在前端阶段快速联调识别流程和状态切换。

## 测试与校验

当前仓库未配置前端自动化测试框架，建议至少执行：

```bash
pnpm build
```

如有 Rust 端修改，再执行：

```bash
cargo test --manifest-path src-tauri/Cargo.toml
```

## 相关文档

- [src-backend/README.md](/D:/New%20folder/manage-system/src-backend/README.md)
- [src-backend/FRONTEND_API_CONTRACT.md](/D:/New%20folder/manage-system/src-backend/FRONTEND_API_CONTRACT.md)
- [AGENTS.md](/D:/New%20folder/manage-system/AGENTS.md)

