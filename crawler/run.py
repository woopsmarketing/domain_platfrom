"""
크롤러 오케스트레이터.

사용법:
  python3 -m crawler.run                     # GoDaddy + Namecheap 모두 실행
  python3 -m crawler.run --source godaddy
  python3 -m crawler.run --source namecheap
  python3 -m crawler.run --files 2           # GoDaddy: 최대 파일 수 (기본 3)
  python3 -m crawler.run --rows 500          # Namecheap: 최대 행 수 (기본 전체)
"""
import argparse
import logging
import os
import sys

# web/.env.local 자동 로드
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


def run_godaddy(max_files: int) -> int:
    logger.info(f"=== GODADDY 크롤링 시작 (최대 {max_files}개 파일) ===")
    items = godaddy_fetch(max_files=max_files)
    return _save(items, "godaddy")


def run_namecheap(max_rows: int | None) -> int:
    label = f"최대 {max_rows}행" if max_rows else "전체"
    logger.info(f"=== NAMECHEAP 크롤링 시작 ({label}) ===")
    items = namecheap_fetch(max_rows=max_rows)
    return _save(items, "namecheap")


def _save(items: list[dict], source: str) -> int:
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
            logger.error(f"DB 저장 실패 [{item['domain']}]: {e}")

    logger.info(f"=== {source.upper()} 완료: {saved}/{len(items)}건 저장 ===")
    return saved


def main():
    parser = argparse.ArgumentParser(description="도메인 경매 낙찰 데이터 크롤러")
    parser.add_argument(
        "--source",
        choices=["godaddy", "namecheap", "all"],
        default="all",
    )
    parser.add_argument(
        "--files",
        type=int,
        default=3,
        help="GoDaddy: 다운로드할 최대 CSV 파일 수 (기본 3)",
    )
    parser.add_argument(
        "--rows",
        type=int,
        default=None,
        help="Namecheap: 처리할 최대 행 수 (기본 전체)",
    )
    args = parser.parse_args()

    # 환경변수 체크
    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        logger.error("환경변수 누락: NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY")
        logger.error("web/.env.local 파일을 확인하세요.")
        sys.exit(1)

    total = 0
    if args.source in ("godaddy", "all"):
        total += run_godaddy(args.files)
    if args.source in ("namecheap", "all"):
        total += run_namecheap(args.rows)

    logger.info(f"\n총 {total}건 DB 저장 완료")


if __name__ == "__main__":
    main()
