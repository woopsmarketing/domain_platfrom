"""
Namecheap Marketplace 실시간 스크래퍼 (Playwright 기반)

내부 API를 자동 인터셉트해 JSON 데이터 수집.

경매 목록 URL:
  https://www.namecheap.com/domains/marketplace/
"""
import asyncio
import logging
from typing import Optional

from playwright.async_api import async_playwright, Page, Response

logger = logging.getLogger(__name__)

LIST_URL = "https://www.namecheap.com/domains/marketplace/"

# 인터셉트 대상 URL 키워드 (Namecheap 내부 API 패턴)
API_KEYWORDS = ("marketplace", "auction", "listings", "domains/search")

# 최근 낙찰 감지: 이전 스냅샷과 비교해 사라진 도메인 = 낙찰
# snapshot은 호출 측(watcher/run.py)에서 관리


# ---------------------------------------------------------------------------
# 내부 유틸 (godaddy_live.py와 동일 패턴)
# ---------------------------------------------------------------------------

def _parse_price(val) -> int:
    try:
        return int(float(str(val).replace("$", "").replace(",", "").strip() or "0"))
    except (ValueError, TypeError):
        return 0


def _parse_bids(val) -> int:
    try:
        return int(val or 0)
    except (ValueError, TypeError):
        return 0


def _extract_domain_fields(item: dict) -> Optional[dict]:
    domain = ""
    for k in ("domain", "domainName", "name", "Domain", "DomainName"):
        v = item.get(k, "")
        if v and "." in str(v):
            domain = str(v).lower().strip()
            break
    if not domain:
        return None

    price = 0
    for k in ("price", "currentBid", "currentPrice", "salePrice", "Price", "buyNowPrice"):
        v = item.get(k)
        if v is not None:
            price = _parse_price(v)
            if price > 0:
                break

    bids = 0
    for k in ("bids", "bidCount", "numberOfBids", "bidNumber"):
        v = item.get(k)
        if v is not None:
            bids = _parse_bids(v)
            if bids > 0:
                break

    end_raw = None
    for k in ("endDate", "endTime", "auctionEndDate", "expiryDate", "endDateUtc"):
        v = item.get(k)
        if v:
            end_raw = str(v)
            break

    # Namecheap 경매 ID (상세 추적용)
    auction_id = item.get("auctionId") or item.get("id") or item.get("listingId") or ""

    parts = domain.rsplit(".", 1)
    return {
        "domain":        domain,
        "name":          parts[0],
        "tld":           parts[1] if len(parts) == 2 else "",
        "current_price": price,
        "bid_count":     bids,
        "end_time_raw":  end_raw,
        "auction_id":    str(auction_id),
    }


def _flatten_api_response(data) -> list[dict]:
    if isinstance(data, list):
        return data
    for key in ("items", "domains", "listings", "results", "data", "auctions"):
        val = data.get(key)
        if isinstance(val, list):
            return val
    return []


# ---------------------------------------------------------------------------
# Playwright 스크래퍼
# ---------------------------------------------------------------------------

async def _scrape(headless: bool = True) -> list[dict]:
    captured: list[dict] = []

    async def on_response(resp: Response):
        if not any(kw in resp.url for kw in API_KEYWORDS):
            return
        try:
            data = await resp.json()
        except Exception:
            return
        items = _flatten_api_response(data)
        for item in items:
            parsed = _extract_domain_fields(item)
            if parsed:
                captured.append(parsed)
        if items:
            logger.debug(f"  인터셉트 [{resp.url[:80]}] → {len(items)}건")

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=headless)
        ctx = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            )
        )
        page: Page = await ctx.new_page()
        page.on("response", on_response)

        try:
            await page.goto(LIST_URL, wait_until="networkidle", timeout=30_000)
            await page.wait_for_timeout(3_000)

            # 스크롤 → 더보기 트리거 (lazy load 대응)
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(2_000)
        except Exception as e:
            logger.warning(f"Namecheap 페이지 로드 경고: {e}")
        finally:
            await browser.close()

    if not captured:
        logger.warning("Namecheap: API 인터셉트 결과 없음 — HTML 파싱 필요 (미구현)")

    return captured


# ---------------------------------------------------------------------------
# 낙찰 감지 (스냅샷 diff)
# ---------------------------------------------------------------------------

def detect_sold(prev_snapshot: dict[str, dict], curr_snapshot: dict[str, dict]) -> list[dict]:
    """
    이전 스냅샷에 있었고 현재 스냅샷에 없는 도메인 = 낙찰.

    prev_snapshot / curr_snapshot: {domain: {...auction data...}}
    반환: 낙찰된 도메인 목록
    """
    sold = []
    for domain, data in prev_snapshot.items():
        if domain not in curr_snapshot and data.get("current_price", 0) > 0:
            sold.append({**data, "sold_detected": True})
    return sold


# ---------------------------------------------------------------------------
# 공개 인터페이스
# ---------------------------------------------------------------------------

def fetch_active_auctions(headless: bool = True) -> list[dict]:
    """
    Namecheap 진행 중인 경매 목록 반환.

    반환 형식:
        [{domain, name, tld, current_price, bid_count, end_time_raw, auction_id}, ...]
    """
    logger.info("Namecheap 활성 경매 스크래핑 시작")
    results = asyncio.run(_scrape(headless=headless))
    logger.info(f"Namecheap 활성 경매: {len(results)}건")
    return results
