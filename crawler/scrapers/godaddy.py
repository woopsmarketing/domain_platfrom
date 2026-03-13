"""
GoDaddy Auctions — 낙찰 완료 도메인 크롤러 (bids > 0 만 수집)

GoDaddy는 내부 JSON API를 사용함:
  GET https://auctions.godaddy.com/api/v1/domains
      ?statusTypeId=4          # 4 = closed/sold
      &hasBids=true
      &sortField=endDate&sortType=desc
      &itemsPerPage=200&pageIndex=1
"""
import time
import logging
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright, Page, TimeoutError as PWTimeout

logger = logging.getLogger(__name__)

BASE_URL = "https://auctions.godaddy.com"
API_URL = (
    f"{BASE_URL}/api/v1/domains"
    "?statusTypeId=4"   # closed/sold
    "&hasBids=true"
    "&sortField=endDate&sortType=desc"
    "&itemsPerPage=200"
)


def _parse_tld(domain: str) -> tuple[str, str]:
    """'example.com' → ('example', 'com')"""
    parts = domain.rsplit(".", 1)
    if len(parts) == 2:
        return parts[0], parts[1]
    return domain, ""


def fetch_closed_auctions(max_pages: int = 5) -> list[dict]:
    """
    GoDaddy 낙찰 완료 도메인 목록 반환.

    반환 형식:
      [{"domain": "example.com", "tld": "com", "price_usd": 500,
        "bid_count": 7, "sold_at": date(2025, 3, 10)}, ...]
    """
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            )
        )
        page = ctx.new_page()

        # 쿠키 세팅을 위해 메인 페이지 먼저 방문
        logger.info("GoDaddy: 메인 페이지 로딩...")
        try:
            page.goto(BASE_URL, timeout=30_000, wait_until="domcontentloaded")
            time.sleep(2)
        except PWTimeout:
            logger.warning("GoDaddy 메인 페이지 타임아웃, 계속 진행")

        for page_idx in range(1, max_pages + 1):
            url = f"{API_URL}&pageIndex={page_idx}"
            logger.info(f"GoDaddy: 페이지 {page_idx} 요청 중...")

            try:
                resp = page.request.get(url, timeout=20_000)
                if resp.status != 200:
                    logger.warning(f"GoDaddy API {resp.status}, 중단")
                    break

                data = resp.json()
                items = data.get("items") or data.get("results") or []

                if not items:
                    logger.info("GoDaddy: 더 이상 데이터 없음")
                    break

                for item in items:
                    bid_count = item.get("bidCount", 0) or 0
                    if bid_count == 0:
                        continue

                    domain_full = item.get("domain", "").lower().strip()
                    if not domain_full:
                        continue

                    name, tld = _parse_tld(domain_full)
                    price = item.get("currentPrice") or item.get("salePrice") or 0
                    end_ts = item.get("endTime") or item.get("closedAt") or ""

                    try:
                        sold_at = datetime.fromisoformat(
                            end_ts.replace("Z", "+00:00")
                        ).date()
                    except Exception:
                        sold_at = datetime.now(timezone.utc).date()

                    results.append({
                        "domain": domain_full,
                        "name": name,
                        "tld": tld,
                        "price_usd": int(price),
                        "bid_count": bid_count,
                        "sold_at": sold_at,
                    })

                logger.info(f"  → {len(items)}건 조회, bids 있는 것: {len([i for i in items if (i.get('bidCount') or 0) > 0])}건")
                time.sleep(1.5)  # rate limit 방지

            except Exception as e:
                logger.error(f"GoDaddy 페이지 {page_idx} 오류: {e}")
                break

        browser.close()

    logger.info(f"GoDaddy 총 수집: {len(results)}건")
    return results
