# Frontend API Contract

这份文档基于当前 `src/api`、页面调用方式和错误处理逻辑整理，描述的是前端真实依赖的接口契约。后端联调请以这里为准。

## 通用约定

- 默认 Base URL：`http://localhost:8000`
- 默认请求超时：`15000ms`
- `/api/detections` 单独使用 `60000ms` 超时
- 除文件上传外，请求体默认使用 `application/json`
- 当前端本地存在登录态时，会自动附带请求头：

```http
Authorization: Bearer <accessToken>
```

- 前端兼容以下成功响应格式：
  - 直接返回对象或数组
  - 包一层 `data`

```json
{
  "data": {}
}
```

- `/api/reports` 列表接口额外兼容：
  - 直接返回 `items`
  - `data.items`

```json
{
  "items": []
}
```

```json
{
  "data": {
    "items": []
  }
}
```

- 出错时前端优先读取以下字段作为错误文案：
  - `message`
  - `error`
- accessToken 过期时，后端应返回 `401` 或明确的过期业务码。
- 前端捕获到过期后会调用 `POST /api/auth/refresh`，请求体仅携带 `refreshToken`。
- refresh 成功后前端会替换本地 `accessToken` 和 `refreshToken`，并自动重试刚才失败的请求。
- refresh 失败或接口继续返回 `401` 时，前端会清空本地登录态。

## 枚举值

### DeviceStatusKind

- `online`
- `offline`
- `maintenance`

### ReportSeverity

- `light`
- `medium`
- `high`

### ReportStatus

- `monitoring`
- `warning`
- `treated`

### DetectionKind

- `pest`
- `clean`

## 接口清单

### 1. 登录

- 方法：`POST`
- 路径：`/api/auth/login`
- 鉴权：否

请求体：

```json
{
  "phone": "13800138000",
  "passwordHash": "sha256-hex-string"
}
```

说明：

- 前端不会发送明文密码。
- `passwordHash` 是密码的 SHA-256 十六进制小写字符串。

成功响应：

```json
{
  "accessToken": "mock-access-token",
  "refreshToken": "mock-refresh-token",
  "user": {
    "id": "user-admin",
    "name": "李晨",
    "phone": "13800138000",
    "role": "农场管理员",
    "farmName": "北区农场"
  }
}
```

字段要求：

- `accessToken: string` 必填
- `refreshToken: string` 必填
- `user.id: string` 必填
- `user.name: string` 必填
- `user.phone: string` 必填
- `user.role?: string`
- `user.farmName?: string`

### 2. 刷新 token

- 方法：`POST`
- 路径：`/api/auth/refresh`
- 鉴权：否

请求体：

```json
{
  "refreshToken": "mock-refresh-token"
}
```

成功响应：

```json
{
  "accessToken": "mock-access-token",
  "refreshToken": "mock-refresh-token"
}
```

字段要求：

- `accessToken: string` 必填
- `refreshToken: string` 必填

说明：

- refresh 成功后旧 `refreshToken` 立即失效，后端返回新的 token 对。
- refresh 失败建议返回 `401`，并可附带 `code: "TOKEN_EXPIRED"`。

### 3. 注册

- 方法：`POST`
- 路径：`/api/auth/register`
- 鉴权：否

请求体：

```json
{
  "phone": "13800138000",
  "passwordHash": "sha256-hex-string"
}
```

成功响应：

```json
{
  "userId": "user-admin",
  "message": "注册成功"
}
```

字段要求：

- `userId?: string`
- `message?: string`

说明：

- 前端兼容 `200` 或 `201`。

### 4. 退出登录

- 方法：`POST`
- 路径：`/api/auth/logout`
- 鉴权：可选，有 token 时会自动携带

请求体：无

成功响应：

- 前端不消费响应体字段。
- 返回任意 `2xx` 都可以，常见为 `200` 或 `204`。

### 5. 获取当前用户信息

- 方法：`GET`
- 路径：`/api/users/me`
- 鉴权：是

成功响应：

```json
{
  "id": "user-admin",
  "name": "李晨",
  "phone": "13800138000",
  "role": "农场管理员",
  "farmName": "北区农场",
  "onlineDeviceCount": 12,
  "monthlyInspections": 28,
  "taskCompletionRate": 96
}
```

字段要求：

- `id: string`
- `name: string`
- `phone: string`
- `role: string`
- `farmName: string`
- `onlineDeviceCount: number`
- `monthlyInspections: number`
- `taskCompletionRate: number`

说明：

- `onlineDeviceCount` 当前仍保留在用户信息中，虽然“我的”页在线设备展示已主要复用 dashboard 数据。

### 6. 获取首页 Dashboard 摘要

- 方法：`GET`
- 路径：`/api/dashboard/summary`
- 鉴权：是

成功响应：

```json
{
  "fieldName": "北区地块",
  "weatherText": "24°C · 微风",
  "recommendation": {
    "id": "rec-north-aphid",
    "title": "优先巡查北区幼苗地块",
    "description": "建议在今日 15:00 前完成蚜虫热点复查。",
    "evidence": "48 小时捕获量 +18%，湿度 82%，温度 24°C，趋势连续上行。"
  },
  "pestTrend": [
    { "label": "3/10", "value": 12 },
    { "label": "3/11", "value": 15 }
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

- `fieldName: string`
- `weatherText: string`
- `recommendation: DashboardRecommendationPreview | null`
- `pestTrend: Array<{ label: string; value: number }>`
- `pestTrendChange: number`
- `deviceStatuses: Array<{ label: string; count: number; status: "online" | "offline" | "maintenance" }>`

说明：

- `pestTrendChange` 是必填数值，前端会自行拼接展示文案。
- `deviceStatuses` 中前端会按 `status === "online"` 提取在线设备数。

### 7. 获取最新推荐详情

- 方法：`GET`
- 路径：`/api/recommendations/latest`
- 鉴权：建议返回需登录结果；前端可处理 `401`

成功响应：

```json
{
  "id": "rec-north-aphid",
  "title": "优先巡查北区幼苗地块",
  "summary": "建议在今日 15:00 前完成蚜虫热点复查。",
  "situation": "北区幼苗叶背虫点密度上升，局部区域已有扩散迹象。",
  "evidence": "48 小时捕获量 +18%，湿度 82%，温度 24°C，趋势连续上行。",
  "action": "优先对第 8-12 行进行点状防治，并标记高风险边缘带。",
  "timeline": "今天 18:00 前完成处理，明天 08:00 完成首次复检。"
}
```

字段要求：

- `id: string`
- `title: string`
- `summary: string`
- `situation: string`
- `evidence: string`
- `action: string`
- `timeline: string`

### 8. 按 ID 获取推荐详情

- 方法：`GET`
- 路径：`/api/recommendations/:id`
- 鉴权：建议返回需登录结果；前端可处理 `401`

成功响应结构与 `/api/recommendations/latest` 一致。

### 9. 获取报告列表

- 方法：`GET`
- 路径：`/api/reports`
- 鉴权：是

查询参数：

- `status?: "monitoring" | "warning" | "treated"`
- `limit?: number`
- `offset?: number`
- `cursor?: string`

推荐成功响应：

```json
{
  "items": [
    {
      "id": "aphid-north-plot",
      "pestName": "蚜虫",
      "severity": "medium",
      "summary": "东侧幼苗区叶背虫点持续增加，建议当日完成复查。",
      "status": "monitoring",
      "occurredAt": "2026-03-16T08:30:00Z"
    }
  ],
  "hasMore": true,
  "nextCursor": "5",
  "total": 12
}
```

兼容成功响应：

```json
[
  {
    "id": "aphid-north-plot",
    "pestName": "蚜虫",
    "severity": "medium",
    "summary": "东侧幼苗区叶背虫点持续增加，建议当日完成复查。",
    "status": "monitoring",
    "occurredAt": "2026-03-16T08:30:00Z"
  }
]
```

字段要求：

- `items[].id: string`
- `items[].pestName: string`
- `items[].severity: "light" | "medium" | "high"`
- `items[].summary: string`
- `items[].status: "monitoring" | "warning" | "treated"`
- `items[].occurredAt: string`
- `hasMore?: boolean`
- `nextCursor?: string`
- `total?: number`

说明：

- `occurredAt` 建议返回 ISO 8601 时间字符串。
- 前端优先支持分页结构；如果只返回数组，也能工作，但 `hasMore` 会退化为按 `limit` 推断。

### 10. 获取报告详情

- 方法：`GET`
- 路径：`/api/reports/:id`
- 鉴权：是

成功响应：

```json
{
  "id": "aphid-north-plot",
  "pestName": "蚜虫",
  "severity": "medium",
  "summary": "东侧幼苗区叶背虫点持续增加，建议当日完成复查。",
  "status": "monitoring",
  "occurredAt": "2026-03-16T08:30:00Z",
  "title": "蚜虫监测报告",
  "imageUrl": "https://example.com/report.jpg",
  "deviceName": "诱捕设备 A-03",
  "locationName": "北区 2 号棚东侧",
  "recommendationText": "建议在今日 18:00 前完成局部点状防治，并在处理后 24 小时内复测同一区域虫口密度。",
  "recommendationNote": "重点关注叶背与嫩梢交界处，避免遗漏高湿阴影带。"
}
```

字段要求：

- 需包含列表接口全部字段
- `title: string`
- `imageUrl: string`
- `deviceName: string`
- `locationName: string`
- `recommendationText: string`
- `recommendationNote: string`

### 11. 上传图片并识别

- 方法：`POST`
- 路径：`/api/detections`
- 鉴权：否，游客可用
- Content-Type：`multipart/form-data`

表单字段：

- `file: File`

成功响应：

```json
{
  "id": "det-123",
  "kind": "pest",
  "title": "识别到疑似蚜虫",
  "confidence": 95,
  "summary": "叶背与嫩梢位置存在明显聚集虫点，符合蚜虫活动特征，建议尽快安排二次巡查。",
  "annotatedImageUrl": "https://example.com/annotated.jpg",
  "pestCounts": [
    { "label": "蚜虫", "count": 6 }
  ],
  "pestName": "蚜虫",
  "severity": "偏高",
  "advice": "建议优先巡查高温干燥区域，并在 12 小时内完成局部点状防治与复拍。"
}
```

字段要求：

- `id: string`
- `kind: "pest" | "clean"`
- `title: string`
- `confidence: number`
- `summary: string`
- `annotatedImageUrl?: string`
- `pestCounts: Array<{ label: string; count: number }>`
- `pestName?: string`
- `severity?: string`
- `advice?: string`

说明：

- 当 `kind = "clean"` 时，`pestCounts` 也必须返回数组，允许为空数组 `[]`。
- `annotatedImageUrl` 允许为空字符串，前端会回退展示原图。

### 12. 保存识别记录

- 方法：`POST`
- 路径：`/api/detection-records`
- 鉴权：是

请求体：

```json
{
  "detectionId": "det-123"
}
```

字段要求：

- `detectionId: string`

成功响应：

```json
{
  "success": true
}
```

字段要求：

- `success: boolean`

说明：

- 前端当前只依赖 `success`，如果后端额外返回 `recordId` 等字段不会有问题。

## 后端实现注意点

- 登录和注册都要接收 `passwordHash`，不要只接受 `password`。
- `/api/dashboard/summary` 的 `pestTrendChange` 是必填字段。
- `/api/reports` 应支持 `status` 过滤，并建议支持 `limit`、`offset`、`cursor` 分页。
- `/api/detections` 必须支持 `multipart/form-data` 文件上传。
- `/api/detections` 当前按产品交互应允许未登录访问。
- `/api/detection-records` 当前请求体只需要 `detectionId`。
- 所有需要登录的接口在 `accessToken` 无效时应返回 `401`。
- `/api/auth/login` 应返回 `accessToken` 和 `refreshToken`，不要再返回旧的 `token` 单字段。
- `/api/auth/refresh` 应校验 `refreshToken`，成功后返回新的 `accessToken` 和 `refreshToken`，并使旧 `refreshToken` 失效。
