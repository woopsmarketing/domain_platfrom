"""
크롤러 오케스트레이터.

사용법:
  python3 crawler/run.py                  # GoDaddy + Namecheap 모두 실행
  python3 crawler/run.py --source godaddy
  python3 crawler/run.py --source namecheap
  python3 crawler/run.py --pages 10       # 페이지 수 지정 (기본 5)
"""
import argparse
import logging
import os
import sys

# .env.local 자동 로드 (dotenv 설치 시)
try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(__file__), "..", "web", ".env.local")
    load_dotenv(env_path)
except ImportError:
    pass

from crawler.db import upsert_sold_domain
from crawler.scrapers.godaddy import fetch_closed_auctions as godaddy_fetch
from crawler.scrapers.namecheap import fetch_closed_auctions as namecheap_fetch

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("run")


def run_source(source: str, max_pages: int) -> int:
    logger.info(f"=== {source.upper()} 크롤링 시작 (최대 {max_pages} 페이지) ===")

    if source == "godaddy":
        items = godaddy_fetch(max_pages=max_pages)
    elif source == "namecheap":
        items = namecheap_fetch(max_pages=max_pages)
    else:
        logger.error(f"알 수 없는 소스: {source}")
        return 0

    saved = 0
    for item in items:
        try:
            upsert_sold_domain(
                domain_name=item["name"],
                tld=item["tld"],
                platform=source,
                sold_at=item["sold_at"],
                price_usd=item["price_usd"],
                bid_count=item.get("bid_count"),
            )
            saved += 1
        except Exception as e:
            logger.error(f"  DB 저장 실패 {item['domain']}: {e}")

    logger.info(f"=== {source.upper()} 완료: {saved}/{len(items)}건 저장 ===")
    return saved


def main():
    parser = argparse.ArgumentParser(description="도메인 경매 낙찰 데이터 크롤러")
    parser.add_argument(
        "--source",
        choices=["godaddy", "namecheap", "all"],
        default="all",
        help="크롤링 소스 (기본: all)",
    )
    parser.add_argument(
        "--pages",
        type=int,
        default=5,
        help="소스당 최대 페이지 수 (기본: 5)",
    )
    args = parser.parse_args()

    # 환경변수 체크
    required_env = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
    missing = [k for k in required_env if not os.environ.get(k)]
    if missing:
        logger.error(f"환경변수 누락: {', '.join(missing)}")
        logger.error("web/.env.local 파일 확인 또는 환경변수를 직접 설정하세요.")
        sys.exit(1)

    sources = ["godaddy", "namecheap"] if args.source == "all" else [args.source]
    total = 0
    for source in sources:
        total += run_source(source, args.pages)

    logger.info(f"\n총 {total}건 DB 저장 완료")


if __name__ == "__main__":
    main()
