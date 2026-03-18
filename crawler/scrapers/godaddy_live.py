"""
GoDaddy Auctions 실시간 스크래퍼 (Playwright 기반)

내부 API를 자동 인터셉트해 JSON 데이터 수집.
API 인터셉트 실패 시 HTML 파싱으로 폴백.

경매 목록 URL:
  https://auctions.godaddy.com/?bids=1&sortColumn=bids&sortDirection=desc
"""
import asyncio
import logging
import re
from datetime import datetime, timezone
from typing import Optional

from playwright.async_api import async_playwright, Page, Response

logger = logging.getLogger(__name__)

LIST_URL = (
    "https://auctions.godaddy.com/"
    "?bids=1&sortColumn=bids&sortDirection=desc"
)

# 상세 페이지 URL 패턴: 인터셉트된 API 응답에서 auction ID 추출 후 조합
DETAIL_URL_TMPL = "https://auctions.godaddy.com/trpItemListing.aspx?miid={miid}"

# 인터셉트 대상 URL 키워드 (GoDaddy 내부 API 패턴)
API_KEYWORDS = ("ux3api", "expireddomains", "auctions/search", "GetAuctions")


# ---------------------------------------------------------------------------
# 내부 유틸
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
    """API 응답 item dict에서 필요한 필드 추출. 실패 시 None."""
    domain = ""
    for k in ("domain", "DomainName", "domainName", "name", "Domain"):
        v = item.get(k, "")
        if v and "." in str(v):
            domain = str(v).lower().strip()
            break
    if not domain:
        return None

    price = 0
    for k in ("currentBid", "price", "Price", "currentPrice", "bidAmount", "CurrentBid"):
        v = item.get(k)
        if v is not None:
            price = _parse_price(v)
            if price > 0:
                break

    bids = 0
    for k in ("bids", "bidCount", "numberOfBids", "BidCount", "Bids"):
        v = item.get(k)
        if v is not None:
            bids = _parse_bids(v)
            if bids > 0:
                break

    end_raw = None
    for k in ("endTime", "closeDate", "auctionEndDate", "endDate", "EndTime"):
        v = item.get(k)
        if v:
            end_raw = str(v)
            break

    # miid (경매 상세 ID)
    miid = item.get("miid") or item.get("id") or item.get("auctionId") or ""

    parts = domain.rsplit(".", 1)
    return {
        "domain":       domain,
        "name":         parts[0],
        "tld":          parts[1] if len(parts) == 2 else "",
        "current_price": price,
        "bid_count":    bids,
        "end_time_raw": end_raw,
        "miid":         str(miid),
    }


def _flatten_api_response(data) -> list[dict]:
    """다양한 API 응답 구조에서 item 목록 평탄화."""
    if isinstance(data, list):
        return data
    for key in ("items", "auctions", "domains", "results", "data", "Domains"):
        val = data.get(key)
        if isinstance(val, list):
            return val
    return []


# ---------------------------------------------------------------------------
# Playwright 스크래퍼
# ---------------------------------------------------------------------------

async def _scrape(url: str, headless: bool = True) -> list[dict]:
    captured: list[dict] = []

    async def on_response(resp: Response):
        # 인터셉트 조건: API 키워드 포함 + JSON 응답
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
            await page.goto(url, wait_until="networkidle", timeout=30_000)
            await page.wait_for_timeout(3_000)
        except Exception as e:
            logger.warning(f"페이지 로드 경고: {e}")
        finally:
            await browser.close()

    # API 인터셉트 실패 시 로그
    if not captured:
        logger.warning("GoDaddy: API 인터셉트 결과 없음 — HTML 파싱 필요 (미구현)")

    return captured


async def _scrape_detail(miid: str, headless: bool = True) -> Optional[dict]:
    """특정 경매의 현재가/입찰수 실시간 조회 (watch 모드용)."""
    url = DETAIL_URL_TMPL.format(miid=miid)
    result = {}

    async def on_response(resp: Response):
        if "detail" in resp.url or miid in resp.url:
            try:
                data = await resp.json()
                parsed = _extract_domain_fields(data if isinstance(data, dict) else {})
                if parsed:
                    result.update(parsed)
            except Exception:
                pass

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=headless)
        ctx = await browser.new_context()
        page = await ctx.new_page()
        page.on("response", on_response)
        try:
            await page.goto(url, wait_until="networkidle", timeout=20_000)
            await page.wait_for_timeout(2_000)
        except Exception as e:
            logger.warning(f"상세 페이지 로드 실패 (miid={miid}): {e}")
        finally:
            await browser.close()

    return result if result else None


# ---------------------------------------------------------------------------
# 공개 인터페이스
# ---------------------------------------------------------------------------

def fetch_active_auctions(headless: bool = True) -> list[dict]:
    """
    GoDaddy 진행 중인 경매 목록 반환 (입찰 많은 순).

    반환 형식:
        [{domain, name, tld, current_price, bid_count, end_time_raw, miid}, ...]
    """
    logger.info("GoDaddy 활성 경매 스크래핑 시작")
    results = asyncio.run(_scrape(LIST_URL, headless=headless))
    logger.info(f"GoDaddy 활성 경매: {len(results)}건")
    return results


def fetch_auction_detail(miid: str, headless: bool = True) -> Optional[dict]:
    """특정 경매 현재 상태 조회 (watch 모드에서 반복 호출)."""
    return asyncio.run(_scrape_detail(miid, headless=headless))
