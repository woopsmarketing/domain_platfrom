"""
Namecheap Marketplace — 낙찰 완료 도메인 크롤러 (bids > 0 만 수집)

Namecheap은 공개 검색 API 없음 → Playwright로 HTML 파싱.
경로: https://www.namecheap.com/domains/expired-auctions/results/
      ?category=closedsales&sortBy=bids&sortOrder=desc&page=1
"""
import time
import logging
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

logger = logging.getLogger(__name__)

BASE_URL = "https://www.namecheap.com"
CLOSED_URL = f"{BASE_URL}/domains/expired-auctions/results/"


def _parse_tld(domain: str) -> tuple[str, str]:
    parts = domain.rsplit(".", 1)
    if len(parts) == 2:
        return parts[0], parts[1]
    return domain, ""


def _parse_price(text: str) -> int:
    """'$1,234' → 1234"""
    try:
        return int(text.replace("$", "").replace(",", "").strip())
    except Exception:
        return 0


def _parse_date(text: str) -> "date":
    """'Mar 10, 2025' or '03/10/2025' → date"""
    from datetime import date
    text = text.strip()
    for fmt in ("%b %d, %Y", "%m/%d/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return datetime.now(timezone.utc).date()


def fetch_closed_auctions(max_pages: int = 5) -> list[dict]:
    """
    Namecheap 낙찰 완료 도메인 목록 반환 (bids > 0).
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

        for page_idx in range(1, max_pages + 1):
            url = (
                f"{CLOSED_URL}"
                f"?category=closedsales"
                f"&sortBy=bids&sortOrder=desc"
                f"&page={page_idx}"
            )
            logger.info(f"Namecheap: 페이지 {page_idx} → {url}")

            try:
                page.goto(url, timeout=30_000, wait_until="networkidle")
                time.sleep(2)

                # 테이블 행 선택 (실제 셀렉터는 사이트 구조에 따라 조정 필요)
                rows = page.query_selector_all("table tbody tr")
                if not rows:
                    # 다른 셀렉터 시도
                    rows = page.query_selector_all(".domain-row, [data-testid='domain-row']")

                if not rows:
                    logger.warning(f"Namecheap 페이지 {page_idx}: 행 없음, 셀렉터 확인 필요")
                    # 페이지 HTML 저장 (디버깅용)
                    html = page.content()
                    with open(f"/tmp/namecheap_page{page_idx}.html", "w") as f:
                        f.write(html)
                    logger.info(f"  디버그 HTML 저장: /tmp/namecheap_page{page_idx}.html")
                    break

                page_count = 0
                for row in rows:
                    cells = row.query_selector_all("td")
                    if len(cells) < 4:
                        continue

                    texts = [c.inner_text().strip() for c in cells]

                    # Namecheap closed auctions 컬럼 순서 (일반적):
                    # [도메인명, 낙찰가, 입찰수, 종료일, ...]
                    domain_full = texts[0].lower().strip()
                    if not domain_full or "." not in domain_full:
                        continue

                    price_text = texts[1] if len(texts) > 1 else "0"
                    bids_text = texts[2] if len(texts) > 2 else "0"
                    date_text = texts[3] if len(texts) > 3 else ""

                    bid_count = int(bids_text) if bids_text.isdigit() else 0
                    if bid_count == 0:
                        continue

                    name, tld = _parse_tld(domain_full)
                    price = _parse_price(price_text)
                    sold_at = _parse_date(date_text)

                    results.append({
                        "domain": domain_full,
                        "name": name,
                        "tld": tld,
                        "price_usd": price,
                        "bid_count": bid_count,
                        "sold_at": sold_at,
                    })
                    page_count += 1

                logger.info(f"  → {page_count}건 수집")

                # 다음 페이지 버튼 확인
                next_btn = page.query_selector("a[aria-label='Next page'], .pagination-next:not(.disabled)")
                if not next_btn:
                    logger.info("Namecheap: 마지막 페이지")
                    break

                time.sleep(1.5)

            except PWTimeout:
                logger.error(f"Namecheap 페이지 {page_idx} 타임아웃")
                break
            except Exception as e:
                logger.error(f"Namecheap 페이지 {page_idx} 오류: {e}")
                break

        browser.close()

    logger.info(f"Namecheap 총 수집: {len(results)}건")
    return results
