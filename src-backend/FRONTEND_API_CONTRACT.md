# Frontend API Contract

这份文档基于 `src/api` 当前实现整理，描述的是前端真实依赖的接口契约，后端联调时应以这里为准。

## 通用约定

- 默认 Base URL：`http://localhost:8000`
- 除文件上传外，请求体使用 `application/json`
- 需要登录的接口会自动带上请求头：

```http
Authorization: Bearer <token>
```

- 前端兼容以下两种成功响应格式：
  - 直接返回对象 / 数组
  - 包一层 `data`

```json
{
  "data": {}
}
```

- 列表接口 `/api/reports` 额外兼容以下格式：

```json
{
  "items": []
}
```

或：

```json
{
  "data": {
    "items": []
  }
}
```

- 出错时前端优先读取这些字段作为错误文案：
  - `message`
  - `error`
- 若接口返回 `401`，前端会清空本地登录态。

## 数据类型

### DeviceStatusKind

可选值：

- `online`
- `offline`
- `maintenance`

### ReportSeverity

可选值：

- `light`
- `medium`
- `high`

### ReportStatus

可选值：

- `monitoring`
- `warning`
- `treated`

### DetectionKind

可选值：

- `pest`
- `clean`

## 接口清单

### 1. 登录

- 方法：`POST`
- 路径：`/api/auth/login`
- 是否鉴权：否

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
  "token": "mock-token",
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

- `token: string` 必填
- `user.id: string` 必填
- `user.name: string` 必填
- `user.phone: string` 必填
- `user.role?: string` 可选
- `user.farmName?: string` 可选

### 2. 注册

- 方法：`POST`
- 路径：`/api/auth/register`
- 是否鉴权：否

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

### 3. 退出登录

- 方法：`POST`
- 路径：`/api/auth/logout`
- 是否鉴权：是

请求体：无

成功响应：

- 前端不消费具体字段，返回 `200` 即可。

### 4. 获取当前用户信息

- 方法：`GET`
- 路径：`/api/users/me`
- 是否鉴权：是

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

- `onlineDeviceCount` 目前仍在用户信息类型里，但“我的”页面在线设备展示已经改为复用 dashboard 数据。
- 这个字段暂时建议继续保留，避免前端其他位置后续直接使用时缺字段。

### 5. 获取首页 Dashboard 摘要

- 方法：`GET`
- 路径：`/api/dashboard/summary`
- 是否鉴权：是

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
- `pestTrend: DashboardTrendPoint[]`
- `pestTrendChange: number`
- `deviceStatuses: DashboardDeviceStatus[]`

其中：

```json
{
  "recommendation": {
    "id": "string",
    "title": "string",
    "description": "string",
    "evidence": "string"
  }
}
```

```json
{
  "label": "3/16",
  "value": 18
}
```

```json
{
  "label": "在线",
  "count": 12,
  "status": "online"
}
```

说明：

- `pestTrendChange` 是数值，前端组件内部会拼成 `较上周 +18%` 这类文案。
- `deviceStatuses` 中前端会按 `status === "online"` 找在线设备数量。

### 6. 获取最新推荐详情

- 方法：`GET`
- 路径：`/api/recommendations/latest`
- 是否鉴权：是

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

### 7. 按 ID 获取推荐详情

- 方法：`GET`
- 路径：`/api/recommendations/:id`
- 是否鉴权：是

成功响应结构与 `/api/recommendations/latest` 完全一致。

### 8. 获取报告列表

- 方法：`GET`
- 路径：`/api/reports`
- 是否鉴权：是

查询参数：

- `status?: "monitoring" | "warning" | "treated"`

成功响应示例：

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

- `id: string`
- `pestName: string`
- `severity: "light" | "medium" | "high"`
- `summary: string`
- `status: "monitoring" | "warning" | "treated"`
- `occurredAt: string`

说明：

- `occurredAt` 建议返回 ISO 8601 时间字符串。

### 9. 获取报告详情

- 方法：`GET`
- 路径：`/api/reports/:id`
- 是否鉴权：是

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
- 另外还需要：
- `title: string`
- `imageUrl: string`
- `deviceName: string`
- `locationName: string`
- `recommendationText: string`
- `recommendationNote: string`

### 10. 上传图片并识别

- 方法：`POST`
- 路径：`/api/detections`
- 是否鉴权：是
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

- `id?: string`
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

### 11. 保存识别记录

- 方法：`POST`
- 路径：`/api/detection-records`
- 是否鉴权：是

请求体：

```json
{
  "detectionId": "det-123",
  "sourceImageName": "leaf.jpg",
  "result": {
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
}
```

字段要求：

- `detectionId?: string`
- `sourceImageName: string`
- `result: DetectionResult`

成功响应：

```json
{
  "success": true
}
```

字段要求：

- `success: boolean`

## 后端实现注意点

- 登录和注册都要接收 `passwordHash`，不要只接受 `password`。
- `/api/dashboard/summary` 里的 `pestTrendChange` 现在是必需字段。
- `/api/reports` 列表接口要支持按 `status` 过滤。
- `/api/detections` 必须支持 `multipart/form-data` 文件上传。
- 所有需要登录的接口在 token 无效时应返回 `401`。
