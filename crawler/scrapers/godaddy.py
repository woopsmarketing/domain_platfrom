"""
GoDaddy Auctions Inventory — JSON/CSV 다운로드 기반 크롤러

공식 인벤토리: https://inventory.auctions.godaddy.com/
  - metadata.json : 파일 목록 (매일 갱신)
  - *.json.zip / *.csv.zip : 경매 도메인 목록

Bids > 0 인 도메인만 수집해 sales_history에 저장.
"""
from __future__ import annotations

import io
import csv
import json
import zipfile
import logging
import time
import requests
from datetime import datetime, timezone, date
from typing import Iterator, Optional, List, Dict

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

# 우선순위별 다운로드 대상 파일 (JSON 우선, CSV 폴백)
PREFERRED_FILES = [
    "auctions_ending_today.json.zip",       # 오늘 종료 경매 (낙찰 직전)
    "auctions_ending_tomorrow.json.zip",    # 내일 종료 경매
    "bidding_service_auctions.csv.zip",     # 입찰 진행 중 (CSV)
]

# CSV 컬럼 → 내부 필드 매핑
CSV_COLUMN_MAP = {
    "Domain":            "domain",
    "DomainName":        "domain",
    "domainName":        "domain",
    "Bids":              "bid_count",
    "BidCount":          "bid_count",
    "NumberOfBids":      "bid_count",
    "numberOfBids":      "bid_count",
    "Price":             "price_usd",
    "ClosePrice":        "price_usd",
    "SalePrice":         "price_usd",
    "CurrentBid":        "price_usd",
    "price":             "price_usd",
    "EndTime":           "end_time",
    "CloseDate":         "end_time",
    "AuctionEndDate":    "end_time",
    "auctionEndTime":    "end_time",
}


def _get_file_urls(max_files: int) -> List[str]:
    """metadata.json에서 다운로드 가능한 파일 URL 목록 반환."""
    try:
        resp = requests.get(METADATA_URL, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        meta = resp.json()

        # metadata 구조: list of {"FileName": "...", "FileSize": ..., ...}
        if isinstance(meta, list):
            available = {item.get("FileName", ""): item for item in meta}
        elif isinstance(meta, dict):
            items = meta.get("files") or meta.get("items") or []
            available = {item.get("FileName", "") or item.get("url", ""): item for item in items}
        else:
            available = {}

        urls = []
        for pref in PREFERRED_FILES:
            if pref in available:
                urls.append(f"{INVENTORY_BASE}/{pref}")
                if len(urls) >= max_files:
                    break

        if not urls:
            # fallback: CSV 파일 아무거나
            for name in available:
                if ".csv" in name or ".json" in name:
                    urls.append(f"{INVENTORY_BASE}/{name}")
                    if len(urls) >= max_files:
                        break

        logger.info(f"GoDaddy metadata: {len(urls)}개 파일 선택 (전체 {len(available)}개)")
        return urls

    except Exception as e:
        logger.error(f"metadata.json 로드 실패: {e}")
        return [f"{INVENTORY_BASE}/auctions_ending_today.json.zip"]


def _parse_price(text) -> int:
    """가격 문자열을 int로 변환."""
    try:
        s = str(text or "0").replace("$", "").replace(",", "").strip()
        return int(float(s or "0"))
    except (ValueError, TypeError):
        return 0


def _parse_date(text: str) -> date:
    """날짜 문자열을 date로 변환."""
    text = str(text or "").strip()
    for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d", "%m/%d/%Y"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return datetime.now(timezone.utc).date()


def _download_and_parse(url: str) -> List[dict]:
    """URL에서 JSON 또는 CSV 파일을 다운로드하고 파싱한 raw items 반환."""
    logger.info(f"GoDaddy 다운로드: {url}")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=120)
        resp.raise_for_status()
    except requests.HTTPError as e:
        logger.warning(f"다운로드 실패 {url}: {e}")
        return []

    content = resp.content

    # ZIP이면 압축 해제
    if url.endswith(".zip") or resp.headers.get("Content-Type", "").startswith("application/zip"):
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as z:
                if not z.namelist():
                    logger.warning("ZIP 내 파일 없음")
                    return []
                inner_name = z.namelist()[0]
                content = z.read(inner_name)
                logger.info(f"  ZIP 내 파일: {inner_name}")
        except zipfile.BadZipFile:
            pass

    text = content.decode("utf-8", errors="replace")

    # JSON인지 CSV인지 판단
    if text.lstrip().startswith("{") or text.lstrip().startswith("["):
        return _parse_json(text)
    else:
        return _parse_csv(text)


def _parse_json(text: str) -> List[dict]:
    """JSON 데이터 파싱. GoDaddy 형식: {"meta": ..., "data": [...]}"""
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        logger.error(f"JSON 파싱 실패: {e}")
        return []

    if isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        items = data.get("data") or data.get("items") or data.get("auctions") or []
    else:
        return []

    if items:
        logger.info(f"  JSON 항목 수: {len(items)}")
        logger.info(f"  컬럼 목록: {list(items[0].keys())}")

    return items


def _parse_csv(text: str) -> List[dict]:
    """CSV 데이터 파싱."""
    reader = csv.DictReader(io.StringIO(text))
    rows = list(reader)
    if rows:
        logger.info(f"  CSV 행 수: {len(rows)}")
        logger.info(f"  컬럼 목록: {list(rows[0].keys())}")
    return rows


def _normalize_item(raw: dict) -> Optional[dict]:
    """raw item → 내부 필드로 변환. bid_count=0이면 None 반환."""

    # 도메인명 추출
    domain = ""
    for key in ("domainName", "DomainName", "Domain", "domain", "name"):
        v = raw.get(key, "")
        if v and "." in str(v):
            domain = str(v).lower().strip()
            break
    if not domain:
        return None

    # 입찰 수
    bid_count = 0
    for key in ("numberOfBids", "NumberOfBids", "BidCount", "Bids", "bids", "bid_count"):
        v = raw.get(key)
        if v is not None:
            try:
                bid_count = int(v)
            except (ValueError, TypeError):
                pass
            if bid_count > 0:
                break

    if bid_count == 0:
        return None

    # 가격
    price_usd = 0
    for key in ("price", "Price", "ClosePrice", "SalePrice", "CurrentBid", "currentBid"):
        v = raw.get(key)
        if v is not None:
            price_usd = _parse_price(v)
            if price_usd > 0:
                break

    # 종료일
    end_time_str = ""
    for key in ("auctionEndTime", "EndTime", "CloseDate", "AuctionEndDate", "endTime"):
        v = raw.get(key)
        if v:
            end_time_str = str(v)
            break

    sold_at = _parse_date(end_time_str) if end_time_str else datetime.now(timezone.utc).date()

    # TLD 분리
    parts = domain.rsplit(".", 1)
    name = parts[0]
    tld = parts[1] if len(parts) == 2 else ""

    return {
        "domain":    domain,
        "name":      domain,  # DB의 name 컬럼에 전체 도메인명 저장 (기존 관례)
        "tld":       tld,
        "price_usd": price_usd,
        "bid_count": bid_count,
        "sold_at":   sold_at,
    }


def fetch_closed_auctions(max_files: int = 3) -> List[dict]:
    """
    GoDaddy 인벤토리에서 bids > 0 도메인 목록 반환.

    max_files: 다운로드할 최대 파일 수 (기본 3개)
    """
    urls = _get_file_urls(max_files)
    if not urls:
        logger.error("GoDaddy: 다운로드 URL 없음")
        return []

    results = []
    for url in urls:
        items = _download_and_parse(url)
        before = len(results)
        for item in items:
            normalized = _normalize_item(item)
            if normalized:
                results.append(normalized)
        logger.info(f"  -> bids>0 수집: {len(results) - before}건 / 전체 {len(items)}건")
        time.sleep(1)

    logger.info(f"GoDaddy 총 수집: {len(results)}건 (bids > 0)")
    return results
