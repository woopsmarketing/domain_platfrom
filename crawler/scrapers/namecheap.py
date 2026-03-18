"""
Namecheap Marketplace — 공개 S3 CSV 다운로드 크롤러

공개 CSV:
  https://nc-aftermarket-www-production.s3.amazonaws.com/reports/Namecheap_Market_Sales.csv

컬럼 (확인된 필드):
  name, url, endDate, price, startPrice, renewPrice, registeredDate

bids 정보는 CSV에 없으므로 price > 0 이고 endDate가 과거인 항목만 수집.
"""
import io
import csv
import logging
import requests
from datetime import datetime, timezone, date

logger = logging.getLogger(__name__)

CSV_URL = (
    "https://nc-aftermarket-www-production.s3.amazonaws.com"
    "/reports/Namecheap_Market_Sales.csv"
)
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    )
}


def _parse_price(text: str) -> int:
    try:
        return int(float(str(text).replace("$", "").replace(",", "").strip() or "0"))
    except (ValueError, TypeError):
        return 0


def _parse_date(text: str) -> date:
    text = str(text).strip()
    for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ",
                "%Y-%m-%d", "%m/%d/%Y", "%b %d, %Y"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return datetime.now(timezone.utc).date()


def _is_expired(end_date: date) -> bool:
    """경매가 이미 종료됐는지 확인."""
    return end_date <= datetime.now(timezone.utc).date()


def fetch_closed_auctions(max_rows: int | None = None) -> list[dict]:
    """
    Namecheap Market Sales CSV에서 종료된 경매(= sold) 도메인 반환.

    max_rows: 최대 처리할 행 수 (None=전체)
    """
    logger.info(f"Namecheap CSV 다운로드: {CSV_URL}")

    try:
        resp = requests.get(CSV_URL, headers=HEADERS, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as e:
        logger.error(f"Namecheap CSV 다운로드 실패: {e}")
        return []

    text = resp.content.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    all_rows = list(reader)

    if all_rows:
        logger.info(f"Namecheap CSV 컬럼: {list(all_rows[0].keys())}")
        logger.info(f"전체 행 수: {len(all_rows)}")

    if max_rows:
        all_rows = all_rows[:max_rows]

    results = []
    today = datetime.now(timezone.utc).date()

    for row in all_rows:
        domain_full = str(row.get("name") or row.get("domain") or "").lower().strip()
        if not domain_full or "." not in domain_full:
            continue

        price = _parse_price(row.get("price") or row.get("Price") or "0")
        end_date_str = str(row.get("endDate") or row.get("enddate") or row.get("EndDate") or "")
        sold_at = _parse_date(end_date_str) if end_date_str else today

        # 종료된 경매 + 가격 있는 것만 (= 낙찰된 것)
        if not _is_expired(sold_at):
            continue
        if price == 0:
            continue

        parts = domain_full.rsplit(".", 1)
        name = parts[0]
        tld  = parts[1] if len(parts) == 2 else ""

        marketplace_url = row.get("url") or row.get("URL") or ""

        results.append({
            "domain":           domain_full,
            "name":             name,
            "tld":              tld,
            "price_usd":        price,
            "bid_count":        None,  # Namecheap CSV에 bids 컬럼 없음
            "sold_at":          sold_at,
            "marketplace_url":  marketplace_url,
        })

    logger.info(f"Namecheap 총 수집: {len(results)}건 (종료 + 가격>0)")
    return results
