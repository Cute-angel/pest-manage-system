# Dashboard / Plots API Contract

这份文档基于当前前端源码 `src/api/dashboard.ts` 和 `src/api/plotsinfo.ts` 整理，描述的是前端当前真实依赖的接口契约。

## 通用约定

- 默认 Base URL：`http://localhost:8000`
- 默认请求超时：`15000ms`
- 前端兼容以下成功响应格式：
  - 直接返回对象或数组
  - 包一层 `data`

对象示例：

```json
{
  "data": {
    "fieldName": "北区农场"
  }
}
```

数组示例：

```json
{
  "data": [
    {
      "id": "plot-001"
    }
  ]
}
```

- 需要登录的接口会自动携带：

```http
Authorization: Bearer <accessToken>
```

- 错误时前端优先读取：
  - `message`
  - `error`

## 类型定义

### DeviceStatusKind

- `online`
- `offline`
- `maintenance`

### PendData

```ts
interface PendData {
  kind: string
  value: number
}
```

说明：

- `kind` 当前前端没有做枚举限制，后端可按业务返回，如 `aphid`、`thrips`、`whitefly`、`total`。
- `value` 为数值。

### DashboardTrendPoint

```ts
interface DashboardTrendPoint {
  label: string
  values: PendData[]
}
```

说明：

- `label` 一般用于横轴展示，如日期、时段、批次名。
- `values` 是该时间点下的多个系列值，不再是旧版的单个 `value` 字段。

### DashboardRecommendationPreview

```ts
interface DashboardRecommendationPreview {
  id: string
  title: string
  description: string
  evidence: string
}
```

### DashboardDeviceStatus

```ts
interface DashboardDeviceStatus {
  label: string
  count: number
  status: "online" | "offline" | "maintenance"
}
```

### DashboardSummary

```ts
interface DashboardSummary {
  fieldName: string
  weatherText?: string
  recommendation: DashboardRecommendationPreview | null
  pestTrend: DashboardTrendPoint[]
  pestTrendChange: number
  deviceStatuses: DashboardDeviceStatus[]
}
```

### Plot

```ts
interface Plot {
  id: string
  name?: string
  description?: string
  risk: number
  location?: [number, number][]
}
```

说明：

- 虽然前端内部会把 `risk` 校验成 `PlotRisk`，但后端响应里仍然直接返回普通 `number`。
- `risk` 必须是 `0` 到 `255` 的整数。
- `location` 为二维点数组，每个点是 `[x, y]`。

## 接口清单

### 1. 获取 Dashboard 总览

- 方法：`GET`
- 路径：`/api/dashboard/summary`
- 鉴权：当前前端会携带 token，建议按需鉴权

成功响应：

```json
{
  "fieldName": "北区农场",
  "weatherText": "24°C · 微风",
  "recommendation": {
    "id": "rec-north-aphid",
    "title": "优先巡查北区幼苗地块",
    "description": "建议在今日 15:00 前完成蚜虫热点复查。",
    "evidence": "48 小时捕获量 +18%，湿度 82%，温度 24°C，趋势连续上行。"
  },
  "pestTrend": [
    {
      "label": "3/10",
      "values": [
        { "kind": "aphid", "value": 12 },
        { "kind": "thrips", "value": 5 }
      ]
    },
    {
      "label": "3/11",
      "values": [
        { "kind": "aphid", "value": 15 },
        { "kind": "thrips", "value": 7 }
      ]
    }
  ],
  "pestTrendChange": 18,
  "deviceStatuses": [
    { "label": "在线", "count": 12, "status": "online" },
    { "label": "离线", "count": 2, "status": "offline" },
    { "label": "维护中", "count": 1, "status": "maintenance" }
  ]
}
```

字段要求：

- `fieldName: string` 必填
- `weatherText?: string`
- `recommendation: DashboardRecommendationPreview | null` 必填
- `pestTrend: DashboardTrendPoint[]` 必填
- `pestTrendChange: number` 必填
- `deviceStatuses: DashboardDeviceStatus[]` 必填

说明：

- `recommendation` 允许为 `null`。
- `pestTrend` 中每一项都必须返回 `values` 数组；不要返回旧字段 `value`。
- `pestTrendChange` 为数值，正负都允许，前端自行决定展示文案。

### 2. 获取单个地块 Dashboard

- 方法：`GET`
- 路径：`/api/dashboard/plot/:id`
- 鉴权：当前前端会携带 token，建议按需鉴权

路径参数：

- `id: string`

成功响应结构与 `/api/dashboard/summary` 完全一致：

```json
{
  "fieldName": "北区 2 号棚",
  "weatherText": "23°C · 湿度 81%",
  "recommendation": {
    "id": "rec-plot-002",
    "title": "建议优先复查东侧叶背区域",
    "description": "近 24 小时虫口密度上升明显。",
    "evidence": "诱捕量环比 +21%，高湿环境持续。"
  },
  "pestTrend": [
    {
      "label": "3/10",
      "values": [
        { "kind": "aphid", "value": 8 },
        { "kind": "thrips", "value": 1 }
      ]
    }
  ],
  "pestTrendChange": 21,
  "deviceStatuses": [
    { "label": "在线", "count": 3, "status": "online" },
    { "label": "离线", "count": 0, "status": "offline" },
    { "label": "维护中", "count": 1, "status": "maintenance" }
  ]
}
```

说明：

- 前端当前直接复用 `DashboardSummary` 类型。
- 如果 `id` 不存在，建议返回 `404` 和清晰的 `message`。

### 3. 获取地块列表

- 方法：`GET`
- 路径：`/api/plots`
- 鉴权：当前前端会携带 token，建议按需鉴权

成功响应：

```json
[
  {
    "id": "plot-001",
    "name": "北区 1 号棚",
    "description": "幼苗区，近期重点观察蚜虫",
    "risk": 168,
    "location": [
      [121.4737, 31.2304],
      [121.4739, 31.2306],
      [121.4741, 31.2303]
    ]
  },
  {
    "id": "plot-002",
    "name": "西区露天 4 号垄",
    "description": "风口区域，需关注蓟马扩散",
    "risk": 220
  }
]
```

字段要求：

- `id: string` 必填
- `name?: string`
- `description?: string`
- `risk: number` 必填，必须满足：
  - 整数
  - `0 <= risk <= 255`
- `location?: Array<[number, number]>`

说明：

- 前端在收到响应后会校验 `risk` 是否为 `0..255` 的整数。
- 如果某条数据的 `risk` 超出范围，前端会抛出运行时错误。
- `location` 当前是可选字段；没有位置信息时可以不返回。

## 错误响应建议

建议统一返回：

```json
{
  "message": "错误原因"
}
```

或：

```json
{
  "error": "错误原因"
}
```

推荐状态码：

- `400`：参数错误
- `401`：未登录或 token 失效
- `404`：地块不存在
- `500`：服务内部错误

## 后端实现注意点

- `/api/dashboard/summary` 和 `/api/dashboard/plot/:id` 的 `pestTrend` 字段必须返回 `values`，不要返回旧版 `value`。
- `/api/plots` 的 `risk` 必须严格控制为 `0..255` 的整数。
- 三个接口都兼容直接返回数据或包一层 `data`，但建议全站统一一种风格。
- 如果接口需要登录，请在 token 无效时返回 `401`。
