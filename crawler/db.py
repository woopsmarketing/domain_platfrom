"""
Supabase REST API client for upserting domain auction data.
"""
import os
import requests
from datetime import date
from typing import Optional


SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=representation",
}


def _post(table: str, payload: dict | list) -> dict | list:
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=HEADERS,
        json=payload,
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


def upsert_active_auction(
    domain: str,
    tld: str,
    current_price: int,
    bid_count: Optional[int] = None,
    end_time_raw: Optional[str] = None,
) -> None:
    """
    active_auctions 테이블 upsert.
    domain이 PRIMARY KEY — 가격 변동 시 덮어씀.
    """
    _post(
        "active_auctions",
        {
            "domain":        domain,
            "tld":           tld,
            "current_price": current_price,
            "bid_count":     bid_count,
            "end_time_raw":  end_time_raw,
            "crawled_at":    __import__("datetime").datetime.now(
                __import__("datetime").timezone.utc
            ).isoformat(),
        },
    )


def upsert_sold_domain(
    domain_name: str,
    tld: str,
    platform: str,           # 'godaddy' | 'namecheap'
    sold_at: date,
    price_usd: int,
    bid_count: Optional[int] = None,
) -> None:
    """
    1) domains 테이블에 upsert (status='sold')
    2) sales_history 테이블에 insert (중복 무시)
    """
    # 1. upsert domain row
    domain_rows = _post(
        "domains",
        {
            "name": domain_name,
            "tld": tld,
            "status": "sold",
            "source": platform,
        },
    )
    domain_id = domain_rows[0]["id"]

    # 2. insert sales_history (중복이면 무시)
    history_headers = {**HEADERS, "Prefer": "resolution=ignore-duplicates"}
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/sales_history",
        headers=history_headers,
        json={
            "domain_id": domain_id,
            "sold_at": sold_at.isoformat(),
            "price_usd": price_usd,
            "platform": platform,
        },
        timeout=15,
    )
    resp.raise_for_status()
    print(f"  [DB] saved: {domain_name}.{tld} | ${price_usd:,} | {sold_at} | {platform}")
