"""
GoDaddy Auctions Inventory — CSV 다운로드 기반 크롤러

공식 인벤토리: https://inventory.auctions.godaddy.com/
  - metadata.json : 파일 목록 (매일 07-08 PST 갱신)
  - *.csv.zip     : 경매 도메인 목록 (expired / closeout)

Bids > 0 인 도메인만 수집해 sales_history에 저장.
"""
import io
import csv
import zipfile
import logging
import time
import requests
from datetime import datetime, timezone, date
from typing import Iterator

logger = logging.getLogger(__name__)

INVENTORY_BASE = "https://inventory.auctions.godaddy.com"
METADATA_URL   = f"{INVENTORY_BASE}/metadata.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    )
}

# GoDaddy CSV 컬럼 → 우리 필드 매핑 (실제 헤더는 첫 실행 시 로그로 출력됨)
COLUMN_MAP = {
    # 도메인명
    "Domain":            "domain",
    "DomainName":        "domain",
    # 입찰 수
    "Bids":              "bid_count",
    "BidCount":          "bid_count",
    "NumberOfBids":      "bid_count",
    # 낙찰가
    "Price":             "price_usd",
    "ClosePrice":        "price_usd",
    "SalePrice":         "price_usd",
    "CurrentBid":        "price_usd",
    # 종료일
    "EndTime":           "end_time",
    "CloseDate":         "end_time",
    "AuctionEndDate":    "end_time",
    # SEO 지수 (보너스)
    "MajesticTrustFlow":    "majestic_tf",
    "MajesticCitationFlow": "majestic_cf",
    "Backlinks":            "backlinks",
    "ReferringDomains":     "referring_domains",
}


def _get_csv_urls() -> list[str]:
    """metadata.json에서 다운로드 가능한 CSV URL 목록 반환."""
    try:
        resp = requests.get(METADATA_URL, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        meta = resp.json()
        # metadata 구조: {"files": [{"url": "...", "type": "csv", ...}]}
        files = meta.get("files") or meta.get("items") or []
        urls = [f.get("url") or f.get("path") for f in files if f]
        urls = [u for u in urls if u and (".csv" in u or ".zip" in u)]
        logger.info(f"GoDaddy metadata: {len(urls)}개 파일 발견")
        return urls
    except Exception as e:
        logger.error(f"metadata.json 로드 실패: {e}")
        # fallback: 알려진 파일명 패턴 시도
        today = datetime.now(timezone.utc).strftime("%Y%m%d")
        return [
            f"{INVENTORY_BASE}/expired_domains_{today}.csv.zip",
            f"{INVENTORY_BASE}/closeout_domains_{today}.csv.zip",
        ]


def _download_csv(url: str) -> list[dict]:
    """URL에서 CSV(또는 ZIP 내 CSV) 다운로드 후 rows 반환."""
    logger.info(f"GoDaddy 다운로드: {url}")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=60)
        resp.raise_for_status()
    except requests.HTTPError as e:
        logger.warning(f"다운로드 실패 {url}: {e}")
        return []

    content = resp.content

    # ZIP이면 압축 해제
    if url.endswith(".zip") or resp.headers.get("Content-Type", "").startswith("application/zip"):
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as z:
                csv_names = [n for n in z.namelist() if n.endswith(".csv")]
                if not csv_names:
                    logger.warning("ZIP 내 CSV 없음")
                    return []
                content = z.read(csv_names[0])
        except zipfile.BadZipFile:
            pass  # zip 아니면 그대로 진행

    text = content.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(text))

    rows = list(reader)
    if rows:
        # 첫 실행 시 실제 컬럼명 로깅 (디버깅용)
        logger.info(f"  컬럼 목록: {list(rows[0].keys())}")
    return rows


def _normalize_row(raw: dict) -> dict | None:
    """CSV row → 내부 필드로 변환. bid_count=0 이면 None 반환."""
    normalized = {}
    for csv_col, value in raw.items():
        key = COLUMN_MAP.get(csv_col.strip())
        if key:
            normalized[key] = value.strip() if isinstance(value, str) else value

    domain = normalized.get("domain", "").lower().strip()
    if not domain or "." not in domain:
        return None

    # 입찰 수 파싱
    bid_count = 0
    try:
        bid_count = int(normalized.get("bid_count", 0) or 0)
    except (ValueError, TypeError):
        pass

    if bid_count == 0:
        return None  # bids 없는 도메인 제외

    # 가격 파싱
    price_usd = 0
    try:
        price_str = str(normalized.get("price_usd", "0") or "0")
        price_usd = int(float(price_str.replace("$", "").replace(",", "").strip() or "0"))
    except (ValueError, TypeError):
        pass

    # 종료일 파싱
    end_time_str = normalized.get("end_time", "")
    sold_at: date = datetime.now(timezone.utc).date()
    if end_time_str:
        for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d", "%m/%d/%Y"):
            try:
                sold_at = datetime.strptime(end_time_str, fmt).date()
                break
            except ValueError:
                continue

    # TLD 분리
    parts = domain.rsplit(".", 1)
    name = parts[0]
    tld  = parts[1] if len(parts) == 2 else ""

    return {
        "domain":    domain,
        "name":      name,
        "tld":       tld,
        "price_usd": price_usd,
        "bid_count": bid_count,
        "sold_at":   sold_at,
        # 보너스 SEO 지수 (있으면)
        "majestic_tf": normalized.get("majestic_tf"),
        "majestic_cf": normalized.get("majestic_cf"),
    }


def fetch_closed_auctions(max_files: int = 3) -> list[dict]:
    """
    GoDaddy 인벤토리 CSV에서 bids > 0 도메인 목록 반환.

    max_files: 다운로드할 최대 파일 수 (기본 3개)
    """
    urls = _get_csv_urls()[:max_files]
    if not urls:
        logger.error("GoDaddy: 다운로드 URL 없음")
        return []

    results = []
    for url in urls:
        rows = _download_csv(url)
        before = len(results)
        for row in rows:
            item = _normalize_row(row)
            if item:
                results.append(item)
        logger.info(f"  → bids>0 수집: {len(results) - before}건 / 전체 {len(rows)}건")
        time.sleep(1)

    logger.info(f"GoDaddy 총 수집: {len(results)}건 (bids > 0)")
    return results
