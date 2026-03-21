from __future__ import annotations

import hashlib
import json
import re
import time
import uuid
from copy import deepcopy
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import parse_qs, urlparse


HOST = "127.0.0.1"
PORT = 8000
DEFAULT_REPORTS_PAGE_SIZE = 20


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def parse_positive_int(value: str | None, default: int, *, minimum: int = 0, maximum: int | None = None) -> int:
    try:
        parsed = int(value) if value is not None else default
    except (TypeError, ValueError):
        return default

    if parsed < minimum:
        return minimum

    if maximum is not None and parsed > maximum:
        return maximum

    return parsed


def build_reports_page(items: list[dict[str, Any]], limit: int, offset: int) -> dict[str, Any]:
    total = len(items)
    start = min(offset, total)
    end = min(start + limit, total)
    page_items = items[start:end]
    has_more = end < total

    return {
        "items": page_items,
        "hasMore": has_more,
        "nextCursor": str(end) if has_more else None,
        "total": total,
    }


DEFAULT_USER = {
    "id": "user-admin",
    "name": "李晨",
    "phone": "13800138000",
    "passwordHash": hashlib.sha256("123456".encode("utf-8")).hexdigest(),
    "role": "农场管理员",
    "farmName": "北区农场",
    "onlineDeviceCount": 12,
    "monthlyInspections": 28,
    "taskCompletionRate": 96,
}


RECOMMENDATIONS: dict[str, dict[str, Any]] = {
    "rec-north-aphid": {
        "id": "rec-north-aphid",
        "title": "优先巡查北区幼苗地块",
        "summary": "建议在今日 15:00 前完成蚜虫热点复查。",
        "situation": "北区幼苗叶背虫点密度上升，局部区域已有扩散迹象。",
        "evidence": "48 小时捕获量 +18%，湿度 82%，温度 24°C，趋势连续上行。",
        "action": "优先对第 8-12 行进行点状防治，并标记高风险边缘带。",
        "timeline": "今天 18:00 前完成处理，明天 08:00 完成首次复检。",
    }
}
LATEST_RECOMMENDATION_ID = "rec-north-aphid"


REPORTS: list[dict[str, Any]] = [
    {
        "id": "aphid-north-plot",
        "pestName": "蚜虫",
        "severity": "medium",
        "summary": "东侧幼苗区叶背虫点持续增加，建议当日完成复查。",
        "status": "monitoring",
        "occurredAt": "2026-03-16T08:30:00Z",
        "title": "蚜虫监测报告",
        "imageUrl": "https://images.unsplash.com/photo-1615486363979-86dcbefb5076?auto=format&fit=crop&w=1200&q=80",
        "deviceName": "诱捕设备 A-03",
        "locationName": "北区 2 号棚东侧",
        "recommendationText": "建议在今日 18:00 前完成局部点状防治，并在处理后 24 小时内复测同一区域虫口密度。",
        "recommendationNote": "重点关注叶背与嫩梢交界处，避免遗漏高湿阴影带。",
    },
    {
        "id": "aphid-north-plot",
        "pestName": "蚜虫",
        "severity": "medium",
        "summary": "东侧幼苗区叶背虫点持续增加，建议当日完成复查。",
        "status": "monitoring",
        "occurredAt": "2026-03-16T08:30:00Z",
        "title": "蚜虫监测报告",
        "imageUrl": "https://images.unsplash.com/photo-1615486363979-86dcbefb5076?auto=format&fit=crop&w=1200&q=80",
        "deviceName": "诱捕设备 A-03",
        "locationName": "北区 2 号棚东侧",
        "recommendationText": "建议在今日 18:00 前完成局部点状防治，并在处理后 24 小时内复测同一区域虫口密度。",
        "recommendationNote": "重点关注叶背与嫩梢交界处，避免遗漏高湿阴影带。",
    },
    {
        "id": "aphid-north-plot",
        "pestName": "蚜虫",
        "severity": "medium",
        "summary": "东侧幼苗区叶背虫点持续增加，建议当日完成复查。",
        "status": "monitoring",
        "occurredAt": "2026-03-16T08:30:00Z",
        "title": "蚜虫监测报告",
        "imageUrl": "https://images.unsplash.com/photo-1615486363979-86dcbefb5076?auto=format&fit=crop&w=1200&q=80",
        "deviceName": "诱捕设备 A-03",
        "locationName": "北区 2 号棚东侧",
        "recommendationText": "建议在今日 18:00 前完成局部点状防治，并在处理后 24 小时内复测同一区域虫口密度。",
        "recommendationNote": "重点关注叶背与嫩梢交界处，避免遗漏高湿阴影带。",
    },
    {
        "id": "aphid-north-plot",
        "pestName": "蚜虫",
        "severity": "medium",
        "summary": "东侧幼苗区叶背虫点持续增加，建议当日完成复查。",
        "status": "monitoring",
        "occurredAt": "2026-03-16T08:30:00Z",
        "title": "蚜虫监测报告",
        "imageUrl": "https://images.unsplash.com/photo-1615486363979-86dcbefb5076?auto=format&fit=crop&w=1200&q=80",
        "deviceName": "诱捕设备 A-03",
        "locationName": "北区 2 号棚东侧",
        "recommendationText": "建议在今日 18:00 前完成局部点状防治，并在处理后 24 小时内复测同一区域虫口密度。",
        "recommendationNote": "重点关注叶背与嫩梢交界处，避免遗漏高湿阴影带。",
    },
    {
        "id": "aphid-north-plot",
        "pestName": "蚜虫",
        "severity": "medium",
        "summary": "东侧幼苗区叶背虫点持续增加，建议当日完成复查。",
        "status": "monitoring",
        "occurredAt": "2026-03-16T08:30:00Z",
        "title": "蚜虫监测报告",
        "imageUrl": "https://images.unsplash.com/photo-1615486363979-86dcbefb5076?auto=format&fit=crop&w=1200&q=80",
        "deviceName": "诱捕设备 A-03",
        "locationName": "北区 2 号棚东侧",
        "recommendationText": "建议在今日 18:00 前完成局部点状防治，并在处理后 24 小时内复测同一区域虫口密度。",
        "recommendationNote": "重点关注叶背与嫩梢交界处，避免遗漏高湿阴影带。",
    },
    {
        "id": "aphid-north-plot",
        "pestName": "蚜虫",
        "severity": "medium",
        "summary": "东侧幼苗区叶背虫点持续增加，建议当日完成复查。",
        "status": "monitoring",
        "occurredAt": "2026-03-16T08:30:00Z",
        "title": "蚜虫监测报告",
        "imageUrl": "https://images.unsplash.com/photo-1615486363979-86dcbefb5076?auto=format&fit=crop&w=1200&q=80",
        "deviceName": "诱捕设备 A-03",
        "locationName": "北区 2 号棚东侧",
        "recommendationText": "建议在今日 18:00 前完成局部点状防治，并在处理后 24 小时内复测同一区域虫口密度。",
        "recommendationNote": "重点关注叶背与嫩梢交界处，避免遗漏高湿阴影带。",
    },
    {
        "id": "aphid-north-plot",
        "pestName": "蚜虫",
        "severity": "medium",
        "summary": "东侧幼苗区叶背虫点持续增加，建议当日完成复查。",
        "status": "monitoring",
        "occurredAt": "2026-03-16T08:30:00Z",
        "title": "蚜虫监测报告",
        "imageUrl": "https://images.unsplash.com/photo-1615486363979-86dcbefb5076?auto=format&fit=crop&w=1200&q=80",
        "deviceName": "诱捕设备 A-03",
        "locationName": "北区 2 号棚东侧",
        "recommendationText": "建议在今日 18:00 前完成局部点状防治，并在处理后 24 小时内复测同一区域虫口密度。",
        "recommendationNote": "重点关注叶背与嫩梢交界处，避免遗漏高湿阴影带。",
    },
    {
        "id": "aphid-north-plot",
        "pestName": "蚜虫",
        "severity": "medium",
        "summary": "东侧幼苗区叶背虫点持续增加，建议当日完成复查。",
        "status": "monitoring",
        "occurredAt": "2026-03-16T08:30:00Z",
        "title": "蚜虫监测报告",
        "imageUrl": "https://images.unsplash.com/photo-1615486363979-86dcbefb5076?auto=format&fit=crop&w=1200&q=80",
        "deviceName": "诱捕设备 A-03",
        "locationName": "北区 2 号棚东侧",
        "recommendationText": "建议在今日 18:00 前完成局部点状防治，并在处理后 24 小时内复测同一区域虫口密度。",
        "recommendationNote": "重点关注叶背与嫩梢交界处，避免遗漏高湿阴影带。",
    },
    {
        "id": "aphid-north-plot",
        "pestName": "蚜虫",
        "severity": "medium",
        "summary": "东侧幼苗区叶背虫点持续增加，建议当日完成复查。",
        "status": "monitoring",
        "occurredAt": "2026-03-16T08:30:00Z",
        "title": "蚜虫监测报告",
        "imageUrl": "https://images.unsplash.com/photo-1615486363979-86dcbefb5076?auto=format&fit=crop&w=1200&q=80",
        "deviceName": "诱捕设备 A-03",
        "locationName": "北区 2 号棚东侧",
        "recommendationText": "建议在今日 18:00 前完成局部点状防治，并在处理后 24 小时内复测同一区域虫口密度。",
        "recommendationNote": "重点关注叶背与嫩梢交界处，避免遗漏高湿阴影带。",
    },
    {
        "id": "aphid-north-plot",
        "pestName": "蚜虫",
        "severity": "medium",
        "summary": "东侧幼苗区叶背虫点持续增加，建议当日完成复查。",
        "status": "monitoring",
        "occurredAt": "2026-03-16T08:30:00Z",
        "title": "蚜虫监测报告",
        "imageUrl": "https://images.unsplash.com/photo-1615486363979-86dcbefb5076?auto=format&fit=crop&w=1200&q=80",
        "deviceName": "诱捕设备 A-03",
        "locationName": "北区 2 号棚东侧",
        "recommendationText": "建议在今日 18:00 前完成局部点状防治，并在处理后 24 小时内复测同一区域虫口密度。",
        "recommendationNote": "重点关注叶背与嫩梢交界处，避免遗漏高湿阴影带。",
    },
    {
        "id": "aphid-north-plot",
        "pestName": "蚜虫",
        "severity": "medium",
        "summary": "东侧幼苗区叶背虫点持续增加，建议当日完成复查。",
        "status": "monitoring",
        "occurredAt": "2026-03-16T08:30:00Z",
        "title": "蚜虫监测报告",
        "imageUrl": "https://images.unsplash.com/photo-1615486363979-86dcbefb5076?auto=format&fit=crop&w=1200&q=80",
        "deviceName": "诱捕设备 A-03",
        "locationName": "北区 2 号棚东侧",
        "recommendationText": "建议在今日 18:00 前完成局部点状防治，并在处理后 24 小时内复测同一区域虫口密度。",
        "recommendationNote": "重点关注叶背与嫩梢交界处，避免遗漏高湿阴影带。",
    },
    {
        "id": "aphid-north-plot",
        "pestName": "蚜虫",
        "severity": "medium",
        "summary": "东侧幼苗区叶背虫点持续增加，建议当日完成复查。",
        "status": "monitoring",
        "occurredAt": "2026-03-16T08:30:00Z",
        "title": "蚜虫监测报告",
        "imageUrl": "https://images.unsplash.com/photo-1615486363979-86dcbefb5076?auto=format&fit=crop&w=1200&q=80",
        "deviceName": "诱捕设备 A-03",
        "locationName": "北区 2 号棚东侧",
        "recommendationText": "建议在今日 18:00 前完成局部点状防治，并在处理后 24 小时内复测同一区域虫口密度。",
        "recommendationNote": "重点关注叶背与嫩梢交界处，避免遗漏高湿阴影带。",
    },
    {
        "id": "aphid-north-plot",
        "pestName": "蚜虫",
        "severity": "medium",
        "summary": "东侧幼苗区叶背虫点持续增加，建议当日完成复查。",
        "status": "monitoring",
        "occurredAt": "2026-03-16T08:30:00Z",
        "title": "蚜虫监测报告",
        "imageUrl": "https://images.unsplash.com/photo-1615486363979-86dcbefb5076?auto=format&fit=crop&w=1200&q=80",
        "deviceName": "诱捕设备 A-03",
        "locationName": "北区 2 号棚东侧",
        "recommendationText": "建议在今日 18:00 前完成局部点状防治，并在处理后 24 小时内复测同一区域虫口密度。",
        "recommendationNote": "重点关注叶背与嫩梢交界处，避免遗漏高湿阴影带。",
    },
    {
        "id": "thrips-west-field",
        "pestName": "蓟马",
        "severity": "high",
        "summary": "西区样本斑点扩散加快，需尽快组织复检与处置。",
        "status": "warning",
        "occurredAt": "2026-03-15T10:10:00Z",
        "title": "蓟马监测报告",
        "imageUrl": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80",
        "deviceName": "高清巡检设备 B-11",
        "locationName": "西区露天 4 号垄",
        "recommendationText": "建议优先封控西区高风险带，对受害叶面进行定点处理，并于明日 08:00 前完成复检记录。",
        "recommendationNote": "若风速持续升高，优先处理边缘地块，防止虫源外扩。",
    },
    {
        "id": "whitefly-greenhouse",
        "pestName": "白粉虱",
        "severity": "light",
        "summary": "局部处理后虫口密度回落，建议维持观察。",
        "status": "treated",
        "occurredAt": "2026-03-15T15:20:00Z",
        "title": "白粉虱监测报告",
        "imageUrl": "https://images.unsplash.com/photo-1629553277601-f8cba8f7e961?auto=format&fit=crop&w=1200&q=80",
        "deviceName": "粘虫板设备 C-07",
        "locationName": "温室南侧通道口",
        "recommendationText": "建议保持现有防治频次，连续 48 小时观察诱捕量变化，确认虫口密度稳定后再调整策略。",
        "recommendationNote": "重点复核通道附近的叶片背面，防止残留虫源回升。",
    },
]


USERS_BY_PHONE: dict[str, dict[str, Any]] = {DEFAULT_USER["phone"]: deepcopy(DEFAULT_USER)}
TOKENS_TO_PHONE: dict[str, str] = {}
DETECTION_RECORDS: list[dict[str, Any]] = []


def create_token(phone: str) -> str:
    token = f"mock-token-{phone}-{uuid.uuid4().hex[:8]}"
    TOKENS_TO_PHONE[token] = phone
    return token


def get_user_from_token(token: str | None) -> dict[str, Any] | None:
    if not token:
        return None

    phone = TOKENS_TO_PHONE.get(token)
    if not phone:
        return None

    user = USERS_BY_PHONE.get(phone)
    return deepcopy(user) if user else None


def parse_bearer_token(header: str | None) -> str | None:
    if not header:
        return None

    prefix = "Bearer "
    if not header.startswith(prefix):
        return None

    return header[len(prefix) :].strip() or None


def sanitize_user(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": user["id"],
        "name": user["name"],
        "phone": user["phone"],
        "role": user["role"],
        "farmName": user["farmName"],
        "onlineDeviceCount": user["onlineDeviceCount"],
        "monthlyInspections": user["monthlyInspections"],
        "taskCompletionRate": user["taskCompletionRate"],
    }


def dashboard_summary() -> dict[str, Any]:
    return {
        "fieldName": "北区地块",
        "weatherText": "24°C · 微风",
        "recommendation": {
            "id": LATEST_RECOMMENDATION_ID,
            "title": RECOMMENDATIONS[LATEST_RECOMMENDATION_ID]["title"],
            "description": RECOMMENDATIONS[LATEST_RECOMMENDATION_ID]["summary"],
            "evidence": RECOMMENDATIONS[LATEST_RECOMMENDATION_ID]["evidence"],
        },
        "pestTrend": [
            {"label": "3/10", "value": 12},
            {"label": "3/11", "value": 15},
            {"label": "3/12", "value": 14},
            {"label": "3/13", "value": 19},
            {"label": "3/14", "value": 20},
            {"label": "3/15", "value": 24},
            {"label": "3/16", "value": 18},
        ],
        "pestTrendChange": 18,
        "deviceStatuses": [
            {"label": "在线", "count": 12, "status": "online"},
            {"label": "离线", "count": 2, "status": "offline"},
            {"label": "维护中", "count": 1, "status": "maintenance"},
        ],
    }


def detection_result_for_filename(filename: str) -> dict[str, Any]:
    time.sleep(10)
    lower = filename.lower()
    detection_id = f"det-{uuid.uuid4().hex[:10]}"

    if any(keyword in lower for keyword in ("healthy", "clean", "normal", "safe", "正常", "健康")):
        return {
            "id": detection_id,
            "kind": "clean",
            "title": "未发现明显害虫",
            "confidence": 93,
            "summary": "叶面纹理完整，暂未发现明显虫体或虫害斑点，建议保持常规巡检频次。",
            "annotatedImageUrl": "",
            "pestCounts": [],
        }

    if "thrip" in lower or "蓟马" in lower:
        return {
            "id": detection_id,
            "kind": "pest",
            "title": "识别到疑似蓟马",
            "pestName": "蓟马",
            "confidence": 91,
            "summary": "叶缘和嫩梢区域存在疑似蓟马活动痕迹，局部斑点分布密集，建议尽快复核。",
            "annotatedImageUrl": "",
            "pestCounts": [{"label": "蓟马", "count": 6}, {"label": "蚜虫", "count": 2}],
            "severity": "偏高",
            "advice": "建议优先巡查高温干燥区域，并在 12 小时内完成局部点状防治与复拍。",
        }

    if "whitefly" in lower or "白粉虱" in lower:
        return {
            "id": detection_id,
            "kind": "pest",
            "title": "识别到疑似白粉虱",
            "pestName": "白粉虱",
            "confidence": 88,
            "summary": "图像中叶背区域出现成片浅色虫点，疑似白粉虱附着，建议结合现场设备继续复核。",
            "annotatedImageUrl": "",
            "pestCounts": [{"label": "白粉虱", "count": 4}],
            "severity": "轻度",
            "advice": "建议继续观察通风口与边缘带，维持诱捕频次，并记录未来 48 小时变化趋势。",
        }

    return {
        "id": detection_id,
        "kind": "pest",
        "title": "识别到疑似蚜虫",
        "pestName": "蚜虫",
        "confidence": 95,
        "summary": "叶背与嫩梢位置存在明显聚集虫点，符合蚜虫活动特征，建议尽快安排二次巡查。",
        "annotatedImageUrl": "",
        "pestCounts": [{"label": "蚜虫", "count": 9}, {"label": "白粉虱", "count": 1}],
        "severity": "中等",
        "advice": "建议优先处理幼苗与高湿区域，完成局部处置后 24 小时内再次采样复核。",
    }


class MockApiHandler(BaseHTTPRequestHandler):
    server_version = "ManageSystemMock/0.1"

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)

        if parsed.path == "/api/dashboard/summary":
            self._json_response(HTTPStatus.OK, dashboard_summary())
            return

        if parsed.path == "/api/recommendations/latest":
            self._json_response(HTTPStatus.OK, RECOMMENDATIONS[LATEST_RECOMMENDATION_ID])
            return

        if parsed.path.startswith("/api/recommendations/"):
            recommendation_id = parsed.path.rsplit("/", 1)[-1]
            recommendation = RECOMMENDATIONS.get(recommendation_id)
            if not recommendation:
                self._json_response(HTTPStatus.NOT_FOUND, {"message": "recommendation not found"})
                return

            self._json_response(HTTPStatus.OK, recommendation)
            return

        if parsed.path == "/api/reports":
            query = parse_qs(parsed.query)
            status_filter = (query.get("status") or [None])[0]
            limit = parse_positive_int((query.get("limit") or [None])[0], DEFAULT_REPORTS_PAGE_SIZE, minimum=1, maximum=100)
            cursor = (query.get("cursor") or [None])[0]
            offset_fallback = (query.get("offset") or [None])[0]
            offset = parse_positive_int(cursor, parse_positive_int(offset_fallback, 0), minimum=0)
            items = deepcopy(REPORTS)
            if status_filter:
                items = [item for item in items if item["status"] == status_filter]

            self._json_response(HTTPStatus.OK, build_reports_page(items, limit, offset))
            return

        if parsed.path.startswith("/api/reports/"):
            report_id = parsed.path.rsplit("/", 1)[-1]
            report = next((item for item in REPORTS if item["id"] == report_id), None)
            if not report:
                self._json_response(HTTPStatus.NOT_FOUND, {"message": "report not found"})
                return

            self._json_response(HTTPStatus.OK, report)
            return

        if parsed.path == "/api/users/me":
            user = self._require_auth_user()
            if not user:
                return

            self._json_response(HTTPStatus.OK, sanitize_user(user))
            return

        self._json_response(HTTPStatus.NOT_FOUND, {"message": "not found"})

    def do_POST(self) -> None:
        parsed = urlparse(self.path)

        if parsed.path == "/api/auth/login":
            payload = self._read_json_body()
            phone = str(payload.get("phone", "")).strip()
            password_hash = str(payload.get("passwordHash", "")).strip().lower()

            user = USERS_BY_PHONE.get(phone)
            if not user or user["passwordHash"] != password_hash:
                self._json_response(HTTPStatus.UNAUTHORIZED, {"message": "手机号或密码错误"})
                return

            token = create_token(phone)
            self._json_response(
                HTTPStatus.OK,
                {
                    "token": token,
                    "user": sanitize_user(user),
                },
            )
            return

        if parsed.path == "/api/auth/register":
            payload = self._read_json_body()
            phone = str(payload.get("phone", "")).strip()
            password_hash = str(payload.get("passwordHash", "")).strip().lower()

            if not re.fullmatch(r"1\d{10}", phone):
                self._json_response(HTTPStatus.BAD_REQUEST, {"message": "手机号格式不正确"})
                return

            if not re.fullmatch(r"[0-9a-f]{64}", password_hash):
                self._json_response(HTTPStatus.BAD_REQUEST, {"message": "密码摘要格式不正确"})
                return

            if phone in USERS_BY_PHONE:
                self._json_response(HTTPStatus.CONFLICT, {"message": "该手机号已注册"})
                return

            user_id = f"user-{uuid.uuid4().hex[:8]}"
            USERS_BY_PHONE[phone] = {
                "id": user_id,
                "name": f"用户{phone[-4:]}",
                "phone": phone,
                "passwordHash": password_hash,
                "role": "巡检员",
                "farmName": "北区农场",
                "onlineDeviceCount": 12,
                "monthlyInspections": 0,
                "taskCompletionRate": 0,
            }
            self._json_response(HTTPStatus.CREATED, {"userId": user_id, "message": "注册成功"})
            return

        if parsed.path == "/api/auth/logout":
            token = parse_bearer_token(self.headers.get("Authorization"))
            if token:
                TOKENS_TO_PHONE.pop(token, None)
            self._json_response(HTTPStatus.OK, {"success": True})
            return

        if parsed.path == "/api/detections":
            raw_body = self._read_raw_body()
            filename = self._extract_filename(raw_body) or "uploaded-image.jpg"
            self._json_response(HTTPStatus.OK, detection_result_for_filename(filename))
            return

        if parsed.path == "/api/detection-records":
            user = self._require_auth_user()
            if not user:
                return

            payload = self._read_json_body()
            record = {
                "id": f"record-{uuid.uuid4().hex[:8]}",
                "userId": user["id"],
                "createdAt": utc_now().isoformat(),
                "payload": payload,
            }
            DETECTION_RECORDS.append(record)
            self._json_response(HTTPStatus.CREATED, {"success": True, "recordId": record["id"]})
            return

        self._json_response(HTTPStatus.NOT_FOUND, {"message": "not found"})

    def log_message(self, format: str, *args: Any) -> None:
        return

    def _send_cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def _json_response(self, status: HTTPStatus, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_raw_body(self) -> bytes:
        length = int(self.headers.get("Content-Length", "0"))
        return self.rfile.read(length)

    def _read_json_body(self) -> dict[str, Any]:
        raw_body = self._read_raw_body()
        if not raw_body:
            return {}

        try:
            return json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError:
            return {}

    def _require_auth_user(self) -> dict[str, Any] | None:
        token = parse_bearer_token(self.headers.get("Authorization"))
        user = get_user_from_token(token)
        if not user:
            self._json_response(HTTPStatus.UNAUTHORIZED, {"message": "未登录或登录已失效"})
            return None
        return user

    def _extract_filename(self, raw_body: bytes) -> str | None:
        match = re.search(rb'filename="([^"]+)"', raw_body)
        if not match:
            return None

        try:
            return match.group(1).decode("utf-8", errors="ignore")
        except UnicodeDecodeError:
            return None


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), MockApiHandler)
    print(f"Mock backend listening on http://{HOST}:{PORT}")
    print("Default test account: 13800138000 / 123456")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
