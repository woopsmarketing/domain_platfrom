"""
실시간 경매 감시자 (Railway 상시 실행용)

동작:
  1. 전체 활성 경매 목록 수집 (snapshot)
  2. "핫" 경매 선별 (마감 2시간 이내 OR 입찰 10개 이상)
  3. 핫 경매 상세 페이지를 POLL_INTERVAL초마다 가격 갱신
  4. 가격 변동 시 active_auctions 테이블 upsert
  5. SNAPSHOT_INTERVAL마다 전체 목록 재수집 + 낙찰 감지

사용:
  python3 -m crawler.watcher
  python3 -m crawler.watcher --interval 10 --hot-threshold 5
"""
import argparse
import asyncio
import logging
import os
import sys
import time
from datetime import datetime, timezone, timedelta
from typing import Optional

# web/.env.local 자동 로드
try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(__file__), "..", "web", ".env.local")
    load_dotenv(env_path)
except ImportError:
    pass

from crawler.db import upsert_active_auction, upsert_sold_domain
from crawler.scrapers.godaddy_live import fetch_active_auctions as gd_fetch
from crawler.scrapers.namecheap_live import fetch_active_auctions as nc_fetch, detect_sold

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("watcher")

# ---------------------------------------------------------------------------
# 상수 (CLI 인수로 오버라이드 가능)
# ---------------------------------------------------------------------------
POLL_INTERVAL    = 15   # 핫 경매 개별 폴링 간격 (초)
SNAPSHOT_INTERVAL = 600  # 전체 목록 재수집 간격 (초, 기본 10분)
HOT_BID_THRESHOLD = 5   # 입찰 수 기준: 이 이상이면 "핫"
HOT_HOURS_LEFT   = 2    # 마감까지 N시간 이하면 "핫"


# ---------------------------------------------------------------------------
# 핫 경매 판별
# ---------------------------------------------------------------------------

def _parse_end_time(raw: Optional[str]) -> Optional[datetime]:
    if not raw:
        return None
    for fmt in (
        "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
    ):
        try:
            dt = datetime.strptime(raw, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except ValueError:
            continue
    return None


def _is_hot(item: dict, bid_threshold: int, hours_left: int) -> bool:
    """핫 경매 여부 판별."""
    if item.get("bid_count", 0) >= bid_threshold:
        return True
    end_dt = _parse_end_time(item.get("end_time_raw"))
    if end_dt:
        remaining = end_dt - datetime.now(timezone.utc)
        if timedelta(0) < remaining <= timedelta(hours=hours_left):
            return True
    return False


# ---------------------------------------------------------------------------
# DB 저장 래퍼
# ---------------------------------------------------------------------------

def _save_active(items: list[dict], source_label: str) -> None:
    saved = 0
    for item in items:
        try:
            upsert_active_auction(
                domain=item["domain"],
                tld=item["tld"],
                current_price=item.get("current_price", 0),
                bid_count=item.get("bid_count"),
                end_time_raw=item.get("end_time_raw"),
            )
            saved += 1
        except Exception as e:
            logger.error(f"active_auction 저장 실패 [{item['domain']}]: {e}")
    logger.info(f"[{source_label}] active_auctions 저장: {saved}/{len(items)}건")


def _save_sold(items: list[dict], platform: str) -> None:
    for item in items:
        try:
            upsert_sold_domain(
                domain_name=item["name"],
                tld=item["tld"],
                platform=platform,
                sold_at=datetime.now(timezone.utc).date(),
                price_usd=item.get("current_price", 0),
                bid_count=item.get("bid_count"),
            )
            logger.info(f"  [낙찰 감지] {item['domain']} | ${item.get('current_price', 0):,}")
        except Exception as e:
            logger.error(f"낙찰 저장 실패 [{item['domain']}]: {e}")


# ---------------------------------------------------------------------------
# 메인 루프
# ---------------------------------------------------------------------------

class Watcher:
    def __init__(self, poll_interval: int, snapshot_interval: int,
                 bid_threshold: int, hours_left: int):
        self.poll_interval     = poll_interval
        self.snapshot_interval = snapshot_interval
        self.bid_threshold     = bid_threshold
        self.hours_left        = hours_left

        # 이전 Namecheap 스냅샷 (낙찰 감지용)
        self._nc_prev: dict[str, dict] = {}
        self._last_snapshot = 0.0

    def _take_snapshot(self) -> None:
        """전체 경매 목록 수집 + DB 저장 + 낙찰 감지."""
        logger.info("=== 전체 스냅샷 수집 ===")

        # GoDaddy
        gd_items = gd_fetch(headless=True)
        _save_active(gd_items, "GoDaddy")

        # Namecheap
        nc_items = nc_fetch(headless=True)
        nc_curr  = {item["domain"]: item for item in nc_items}

        # 낙찰 감지 (이전 스냅샷과 비교)
        if self._nc_prev:
            sold = detect_sold(self._nc_prev, nc_curr)
            if sold:
                logger.info(f"  낙찰 감지: {len(sold)}건")
                _save_sold(sold, "namecheap")

        self._nc_prev = nc_curr
        _save_active(nc_items, "Namecheap")
        self._last_snapshot = time.time()

    def run(self) -> None:
        logger.info(
            f"Watcher 시작 — poll={self.poll_interval}s, "
            f"snapshot={self.snapshot_interval}s, "
            f"hot: bids>={self.bid_threshold} or <{self.hours_left}h left"
        )
        while True:
            try:
                # 스냅샷 갱신 타이밍
                if time.time() - self._last_snapshot >= self.snapshot_interval:
                    self._take_snapshot()

                # 핫 경매 필터 후 개별 상세 폴링 (현재는 snapshot 갱신으로 대체)
                # TODO: 핫 경매 miid/auction_id 별도 폴링 구현
                hot = [
                    d for d in self._nc_prev.values()
                    if _is_hot(d, self.bid_threshold, self.hours_left)
                ]
                if hot:
                    logger.info(f"  현재 핫 경매: {len(hot)}건 추적 중")

                time.sleep(self.poll_interval)

            except KeyboardInterrupt:
                logger.info("Watcher 중단")
                break
            except Exception as e:
                logger.error(f"Watcher 루프 오류: {e}")
                time.sleep(30)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="실시간 경매 감시자")
    parser.add_argument("--interval",       type=int, default=POLL_INTERVAL,
                        help=f"폴링 간격 (초, 기본 {POLL_INTERVAL})")
    parser.add_argument("--snapshot",       type=int, default=SNAPSHOT_INTERVAL,
                        help=f"전체 목록 갱신 간격 (초, 기본 {SNAPSHOT_INTERVAL})")
    parser.add_argument("--hot-threshold",  type=int, default=HOT_BID_THRESHOLD,
                        help=f"핫 경매 입찰 수 기준 (기본 {HOT_BID_THRESHOLD})")
    parser.add_argument("--hot-hours",      type=int, default=HOT_HOURS_LEFT,
                        help=f"핫 경매 마감 기준 시간 (기본 {HOT_HOURS_LEFT})")
    args = parser.parse_args()

    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        logger.error("환경변수 누락: NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)

    watcher = Watcher(
        poll_interval=args.interval,
        snapshot_interval=args.snapshot,
        bid_threshold=args.hot_threshold,
        hours_left=args.hot_hours,
    )
    watcher.run()


if __name__ == "__main__":
    main()
