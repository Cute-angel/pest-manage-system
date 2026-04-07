# 用户设置接口联调说明

## 1. 修改用户名

- 方法：`POST`
- 路径：`/api/users/me`
- 鉴权：需要 `Authorization: Bearer <accessToken>`
- Content-Type：`application/json`

请求体：

```json
{
  "name": "李晨"
}
```

说明：

- `name` 为必填字符串。
- 前端发送前会先做 `trim()`，后端也建议再次去除首尾空格。

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

前端兼容：

- 直接返回用户对象
- 或返回：

```json
{
  "data": {
    "id": "user-admin",
    "name": "李晨",
    "phone": "13800138000",
    "role": "农场管理员",
    "farmName": "北区农场",
    "onlineDeviceCount": 12,
    "monthlyInspections": 28,
    "taskCompletionRate": 96
  }
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

## 2. 修改密码

- 方法：`POST`
- 路径：`/api/users/change-password`
- 鉴权：需要 `Authorization: Bearer <accessToken>`
- Content-Type：`application/json`

请求体：

```json
{
  "currentPasswordHash": "sha256-hex-string",
  "newPasswordHash": "sha256-hex-string"
}
```

说明：

- 前端不会发送明文密码。
- `currentPasswordHash` 和 `newPasswordHash` 都是密码的 SHA-256 十六进制小写字符串。

成功响应：

```json
{
  "success": true
}
```

前端兼容：

- 直接返回：

```json
{
  "success": true
}
```

- 或返回：

```json
{
  "data": {
    "success": true
  }
}
```

字段要求：

- `success: boolean`

## 3. 错误响应建议

建议后端在失败时返回：

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

前端会优先读取 `message`，其次读取 `error`。

## 4. 当前前端约定

- 获取当前用户信息仍然是 `GET /api/users/me`
- 更新用户名改为 `POST /api/users/me`
- 修改密码使用 `POST /api/users/change-password`
- token 失效时请返回 `401`
