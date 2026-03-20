"""
Namecheap Marketplace 경매 수집기 (GraphQL API 직접 호출)

Playwright 불필요 — requests만으로 동작.
필터: bids >= 2, 24시간 이내 종료 예정 도메인만 수집.

데이터 소스:
  aftermarketapi.namecheap.com/client/graphql (SaleTable operation)
"""
import logging
import math
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional

import requests

logger = logging.getLogger(__name__)

GRAPHQL_URL = "https://aftermarketapi.namecheap.com/client/graphql"
GRAPHQL_HASH = "fe84e690294ebd46f5cbc0a2b3fe1fe7fc606395c28f54afab18ff6521d98110"

HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Origin": "https://www.namecheap.com",
    "Referer": "https://www.namecheap.com/",
}

# ---------------------------------------------------------------------------
# 필터 설정
# ---------------------------------------------------------------------------
MIN_BIDS = 2           # 최소 입찰 수
MAX_HOURS_LEFT = 24    # 종료까지 남은 최대 시간 (시간)
PAGE_SIZE = 100        # 한 번에 가져올 건수


def _build_payload(page: int = 1, sort_col: str = "bidCount", sort_dir: str = "desc") -> dict:
    return {
        "operationName": "SaleTable",
        "variables": {
            "filter": {},
            "sort": [{"column": sort_col, "direction": sort_dir}],
            "page": page,
            "pageSize": PAGE_SIZE,
        },
        "extensions": {
            "persistedQuery": {
                "version": 1,
                "sha256Hash": GRAPHQL_HASH,
            }
        },
    }


def _parse_item(item: dict) -> Optional[dict]:
    """GraphQL 응답 item을 내부 형식으로 변환."""
    product = item.get("product") or {}
    domain = (product.get("name") or "").lower().strip()
    if not domain or "." not in domain:
        return None

    parts = domain.rsplit(".", 1)
    return {
        "domain":        domain,
        "name":          parts[0],
        "tld":           parts[1] if len(parts) == 2 else "",
        "current_price": int(float(item.get("price", 0) or 0)),
        "bid_count":     int(item.get("bidCount", 0) or 0),
        "end_time_raw":  item.get("endDate"),
        "auction_id":    item.get("id", ""),
        "source":        "namecheap",
    }


def _fetch_page(page: int = 1) -> tuple:
    """한 페이지 조회. (items, total) 반환."""
    payload = _build_payload(page=page)
    try:
        resp = requests.post(GRAPHQL_URL, json=payload, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        sales = data.get("data", {}).get("sales", {})
        return sales.get("items", []), sales.get("total", 0)
    except Exception as e:
        logger.warning("Namecheap GraphQL 요청 실패 (page=%d): %s", page, e)
        return [], 0


def _is_within_deadline(end_date_str: str, max_hours: float = MAX_HOURS_LEFT) -> bool:
    """종료 시간이 현재로부터 max_hours 이내인지 확인."""
    try:
        end_dt = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        diff = (end_dt - now).total_seconds() / 3600
        return 0 < diff <= max_hours
    except Exception:
        return False


def fetch_active_auctions(headless: bool = True) -> List[dict]:
    """
    Namecheap 경매 도메인 수집.

    bidCount 내림차순으로 페이지를 순회하며,
    bids >= MIN_BIDS AND 24시간 이내 종료 도메인만 반환.

    반환 형식:
        [{domain, name, tld, current_price, bid_count, end_time_raw, auction_id, source}, ...]
    """
    logger.info("Namecheap 활성 경매 수집 시작 (GraphQL API)")

    all_results = []  # type: List[dict]
    page = 1
    max_pages = 10  # 안전 장치: 최대 10페이지 (1000건)
    consecutive_zero_bids = 0

    while page <= max_pages:
        items, total = _fetch_page(page)
        if not items:
            break

        if page == 1:
            logger.info("Namecheap 전체 경매: %d건 → 필터 적용 중 (bids>=%d, %dh 이내)",
                        total, MIN_BIDS, MAX_HOURS_LEFT)

        for item in items:
            bid_count = int(item.get("bidCount", 0) or 0)

            # bidCount 내림차순이므로, bids < MIN_BIDS면 이후 전부 불필요
            if bid_count < MIN_BIDS:
                consecutive_zero_bids += 1
                if consecutive_zero_bids >= 3:
                    logger.info("Namecheap: bids < %d 도달 → 수집 종료 (page %d)", MIN_BIDS, page)
                    page = max_pages + 1  # break outer
                    break
                continue

            consecutive_zero_bids = 0

            end_date = item.get("endDate", "")
            if not _is_within_deadline(end_date):
                continue

            parsed = _parse_item(item)
            if parsed:
                all_results.append(parsed)

        page += 1

    logger.info("Namecheap 활성 경매: %d건 (bids>=%d, %dh 이내)",
                len(all_results), MIN_BIDS, MAX_HOURS_LEFT)
    return all_results


# ---------------------------------------------------------------------------
# 낙찰 감지 (스냅샷 diff) — watcher.py 용
# ---------------------------------------------------------------------------

def detect_sold(prev_snapshot: Dict[str, dict], curr_snapshot: Dict[str, dict]) -> List[dict]:
    sold = []
    for domain, data in prev_snapshot.items():
        if domain not in curr_snapshot and data.get("current_price", 0) > 0:
            sold.append({**data, "sold_detected": True})
    return sold
