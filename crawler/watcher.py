"""
실시간 경매 감시자

동작:
  1. 2분마다 Namecheap 활성 경매 수집 (GraphQL API, bids>=2, 24h이내)
  2. 이전 스냅샷과 비교 → 사라진 도메인 = 낙찰 감지
  3. 낙찰된 도메인 → sales_history에 마지막 가격으로 영구 저장
  4. 활성 경매 → active_auctions 테이블 갱신
  5. 종료된(24h 초과) active_auctions 자동 정리

사용:
  python3 -m crawler.watcher
  python3 -m crawler.watcher --interval 120
"""
from __future__ import annotations

import argparse
import logging
import os
import sys
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional

# web/.env.local 자동 로드
_env_path = os.path.join(os.path.dirname(__file__), "..", "web", ".env.local")
try:
    from dotenv import load_dotenv
    load_dotenv(_env_path)
except ImportError:
    # dotenv 없으면 수동 파싱
    if os.path.exists(_env_path):
        with open(_env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())

from crawler.db import upsert_active_auction, upsert_sold_domain, delete_active_auction
from crawler.scrapers.namecheap_live import fetch_active_auctions as nc_fetch

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("watcher")

# ---------------------------------------------------------------------------
# 상수
# ---------------------------------------------------------------------------
DEFAULT_INTERVAL = 120  # 기본 2분


# ---------------------------------------------------------------------------
# DB 저장/삭제 래퍼
# ---------------------------------------------------------------------------

def _save_active(items: List[dict]) -> int:
    saved = 0
    for item in items:
        try:
            upsert_active_auction(
                domain=item["domain"],
                tld=item["tld"],
                current_price=item.get("current_price", 0),
                bid_count=item.get("bid_count"),
                end_time_raw=item.get("end_time_raw"),
                source=item.get("source"),
            )
            saved += 1
        except Exception as e:
            logger.error("active_auction 저장 실패 [%s]: %s", item["domain"], e)
    return saved


def _save_sold(items: List[dict], platform: str) -> int:
    saved = 0
    for item in items:
        try:
            upsert_sold_domain(
                domain_name=item.get("name", item["domain"].rsplit(".", 1)[0]),
                tld=item["tld"],
                platform=platform,
                sold_at=datetime.now(timezone.utc).date(),
                price_usd=item.get("current_price", 0),
                bid_count=item.get("bid_count"),
            )
            saved += 1
            logger.info(
                "  [낙찰] %s | $%s | %d건 입찰",
                item["domain"],
                f"{item.get('current_price', 0):,}",
                item.get("bid_count", 0) or 0,
            )
        except Exception as e:
            logger.error("낙찰 저장 실패 [%s]: %s", item["domain"], e)

        # active_auctions에서 삭제
        try:
            delete_active_auction(item["domain"])
        except Exception:
            pass

    return saved


# ---------------------------------------------------------------------------
# 메인 루프
# ---------------------------------------------------------------------------

class Watcher:
    def __init__(self, interval: int = DEFAULT_INTERVAL):
        self.interval = interval
        self._prev_snapshot = {}  # type: Dict[str, dict]

    def _cycle(self) -> None:
        """한 사이클: 수집 → 낙찰 감지 → DB 저장."""
        logger.info("=== 경매 수집 시작 ===")

        # 1. Namecheap 활성 경매 수집
        items = nc_fetch()
        curr_snapshot = {item["domain"]: item for item in items}

        # 2. 낙찰 감지 (이전 스냅샷과 비교)
        sold_count = 0
        if self._prev_snapshot:
            sold = []
            for domain, data in self._prev_snapshot.items():
                if domain not in curr_snapshot:
                    # 이전에 있었는데 지금 없음 → 낙찰 또는 종료
                    if data.get("current_price", 0) > 0:
                        sold.append(data)
            if sold:
                logger.info("낙찰 감지: %d건", len(sold))
                sold_count = _save_sold(sold, "namecheap")

        # 3. 활성 경매 DB 저장
        saved = _save_active(items)
        logger.info(
            "=== 완료: 활성 %d건 저장, 낙찰 %d건 감지 ===",
            saved, sold_count,
        )

        # 4. 스냅샷 갱신
        self._prev_snapshot = curr_snapshot

    def run(self) -> None:
        logger.info("Watcher 시작 — %d초(%.1f분) 간격", self.interval, self.interval / 60)
        while True:
            try:
                self._cycle()
                logger.info("다음 수집까지 %d초 대기...\n", self.interval)
                time.sleep(self.interval)
            except KeyboardInterrupt:
                logger.info("Watcher 중단 (Ctrl+C)")
                break
            except Exception as e:
                logger.error("Watcher 오류: %s", e)
                time.sleep(30)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="실시간 경매 감시자")
    parser.add_argument(
        "--interval", type=int, default=DEFAULT_INTERVAL,
        help=f"수집 간격 (초, 기본 {DEFAULT_INTERVAL})",
    )
    args = parser.parse_args()

    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        logger.error("환경변수 누락: NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)

    watcher = Watcher(interval=args.interval)
    watcher.run()


if __name__ == "__main__":
    main()
