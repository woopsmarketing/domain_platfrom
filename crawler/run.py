"""
크롤러 오케스트레이터.

사용법:
  # CSV 기반 (낙찰 이력 적재 — 기존 방식)
  python3 -m crawler.run                     # GoDaddy + Namecheap CSV 모두 실행
  python3 -m crawler.run --source godaddy
  python3 -m crawler.run --source namecheap
  python3 -m crawler.run --mode csv --source godaddy
  python3 -m crawler.run --mode csv --source namecheap
  python3 -m crawler.run --files 2           # GoDaddy: 최대 파일 수 (기본 3)
  python3 -m crawler.run --rows 500          # Namecheap: 최대 행 수 (기본 전체)

  # 실시간 스크래핑 (active_auctions 적재 — 새 방식)
  python3 -m crawler.run --mode live         # 현재 진행 중인 경매 1회 수집
  python3 -m crawler.run --mode live --source godaddy

  # 상시 감시 (Railway 배포용)
  python3 -m crawler.watcher
"""
from __future__ import annotations

import argparse
import logging
import os
import sys

# web/.env.local 자동 로드 (dotenv 없어도 동작)
def _load_env_file():
    env_path = os.path.join(os.path.dirname(__file__), "..", "web", ".env.local")
    if not os.path.exists(env_path):
        return
    try:
        from dotenv import load_dotenv
        load_dotenv(env_path)
        return
    except ImportError:
        pass
    # dotenv 없으면 수동 파싱
    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value

_load_env_file()

# CSV 크롤러는 항상 import (경량, 외부 의존성 없음)
from crawler.scrapers.godaddy import fetch_closed_auctions as godaddy_fetch
from crawler.scrapers.namecheap import fetch_closed_auctions as namecheap_fetch

# Live 크롤러는 lazy import (Playwright 의존 — csv 모드에서는 불필요)
# godaddy_live, namecheap_live 는 --mode live 일 때만 import

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("run")


def _get_db_funcs():
    """DB 함수를 lazy로 가져옴 (환경변수 로드 후 호출되도록)."""
    from crawler.db import upsert_sold_domain, upsert_active_auction
    return upsert_sold_domain, upsert_active_auction


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
    upsert_sold_domain, _ = _get_db_funcs()
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
            logger.error(f"DB 저장 실패 [{item.get('domain', 'unknown')}]: {e}")

    logger.info(f"=== {source.upper()} 완료: {saved}/{len(items)}건 저장 ===")
    return saved


def run_live_godaddy() -> int:
    try:
        from crawler.scrapers.godaddy_live import fetch_active_auctions as godaddy_live_fetch
    except ImportError as e:
        logger.error(f"GoDaddy live 모드 import 실패 (Playwright 설치 필요): {e}")
        return 0

    _, upsert_active_auction = _get_db_funcs()
    logger.info("=== GODADDY 실시간 스크래핑 ===")
    items = godaddy_live_fetch(headless=True)
    saved = 0
    for item in items:
        try:
            upsert_active_auction(
                domain=item["domain"],
                tld=item["tld"],
                current_price=item.get("current_price", 0),
                bid_count=item.get("bid_count"),
                end_time_raw=item.get("end_time_raw"),
                source=item.get("source", "godaddy"),
            )
            saved += 1
        except Exception as e:
            logger.error(f"DB 저장 실패 [{item['domain']}]: {e}")
    logger.info(f"=== GODADDY LIVE 완료: {saved}/{len(items)}건 ===")
    return saved


def run_live_namecheap() -> int:
    try:
        from crawler.scrapers.namecheap_live import fetch_active_auctions as namecheap_live_fetch
    except ImportError as e:
        logger.error(f"Namecheap live 모드 import 실패 (Playwright 설치 필요): {e}")
        return 0

    _, upsert_active_auction = _get_db_funcs()
    logger.info("=== NAMECHEAP 실시간 스크래핑 ===")
    items = namecheap_live_fetch(headless=True)
    saved = 0
    for item in items:
        try:
            upsert_active_auction(
                domain=item["domain"],
                tld=item["tld"],
                current_price=item.get("current_price", 0),
                bid_count=item.get("bid_count"),
                end_time_raw=item.get("end_time_raw"),
                source=item.get("source", "namecheap"),
            )
            saved += 1
        except Exception as e:
            logger.error(f"DB 저장 실패 [{item['domain']}]: {e}")
    logger.info(f"=== NAMECHEAP LIVE 완료: {saved}/{len(items)}건 ===")
    return saved


def main():
    parser = argparse.ArgumentParser(description="도메인 경매 크롤러")
    parser.add_argument(
        "--mode",
        choices=["csv", "live"],
        default="csv",
        help="csv: CSV 기반 낙찰 이력 / live: 실시간 스크래핑 (기본 csv)",
    )
    parser.add_argument(
        "--source",
        choices=["godaddy", "namecheap", "all"],
        default="all",
    )
    parser.add_argument(
        "--files",
        type=int,
        default=3,
        help="GoDaddy CSV: 최대 파일 수 (기본 3)",
    )
    parser.add_argument(
        "--rows",
        type=int,
        default=None,
        help="Namecheap CSV: 최대 행 수 (기본 전체)",
    )
    args = parser.parse_args()

    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        logger.error("환경변수 누락: NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY")
        logger.error("web/.env.local 파일을 확인하세요.")
        sys.exit(1)

    total = 0
    if args.mode == "csv":
        if args.source in ("godaddy", "all"):
            total += run_godaddy(args.files)
        if args.source in ("namecheap", "all"):
            total += run_namecheap(args.rows)
    else:  # live
        if args.source in ("godaddy", "all"):
            total += run_live_godaddy()
        if args.source in ("namecheap", "all"):
            total += run_live_namecheap()

    logger.info(f"\n총 {total}건 DB 저장 완료")


if __name__ == "__main__":
    main()
