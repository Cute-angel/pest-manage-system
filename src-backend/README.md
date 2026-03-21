# Mock Backend

这个目录提供一个零依赖的 Python 测试后端，默认监听 `http://localhost:8000`，与当前前端 `src/api/http.ts` 的默认地址一致。

认证接口不再接收明文密码，前端会先做一次 SHA-256，再通过 `passwordHash` 字段提交。

## Run

```bash
python src-backend/server.py
```

启动后可直接配合前端联调。

默认测试账号：

- 手机号：`13800138000`
- 密码：`123456`

## Implemented Endpoints

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/users/me`
- `GET /api/dashboard/summary`
- `GET /api/recommendations/latest`
- `GET /api/recommendations/:id`
- `GET /api/reports`
- `GET /api/reports/:id`
- `POST /api/detections`
- `POST /api/detection-records`

详细字段契约见：

- [FRONTEND_API_CONTRACT.md](/D:/New%20folder/manage-system/src-backend/FRONTEND_API_CONTRACT.md)

## Notes

- 所有数据都保存在内存里，重启服务后会重置。
- `/api/detections` 会根据上传文件名中的关键词返回不同虫害结果，例如 `thrip`、`whitefly`、`healthy`。
- `POST /api/detection-records` 当前只要求请求体包含 `detectionId`。
