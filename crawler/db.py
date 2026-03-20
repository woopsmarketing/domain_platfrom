"""
Supabase REST API client for upserting domain auction data.
"""
from __future__ import annotations

import os
import requests
from datetime import date, datetime, timezone
from typing import Optional


def _get_config():
    """환경변수를 함수 호출 시점에 읽음 (dotenv 로드 이후 보장)."""
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        raise RuntimeError(
            "환경변수 누락: NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY"
        )
    return url, key


def _headers(key: str, prefer: str = "resolution=merge-duplicates,return=representation"):
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": prefer,
    }


def _post(table: str, payload, prefer: str = "resolution=merge-duplicates,return=representation",
          on_conflict: str = None):
    url, key = _get_config()
    endpoint = f"{url}/rest/v1/{table}"
    if on_conflict:
        endpoint += f"?on_conflict={on_conflict}"
    resp = requests.post(
        endpoint,
        headers=_headers(key, prefer),
        json=payload,
        timeout=15,
    )
    resp.raise_for_status()
    text = resp.text.strip()
    if not text:
        return []
    return resp.json()


def upsert_active_auction(
    domain: str,
    tld: str,
    current_price: int,
    bid_count: Optional[int] = None,
    end_time_raw: Optional[str] = None,
    source: Optional[str] = None,
) -> None:
    """
    active_auctions 테이블 upsert.
    domain이 PRIMARY KEY — 가격 변동 시 덮어씀.
    source 컬럼이 없는 경우에도 에러 없이 처리.
    """
    payload = {
        "domain":        domain,
        "tld":           tld,
        "current_price": current_price,
        "bid_count":     bid_count,
        "end_time_raw":  end_time_raw,
        "crawled_at":    datetime.now(timezone.utc).isoformat(),
    }

    # source 컬럼이 있으면 포함, 없으면 에러 시 재시도
    if source:
        payload["source"] = source

    try:
        _post(
            "active_auctions",
            payload,
            on_conflict="domain",
        )
    except requests.HTTPError as e:
        # source 컬럼이 없어서 에러가 나면 source 제거 후 재시도
        if source and "source" in str(e):
            payload.pop("source", None)
            _post(
                "active_auctions",
                payload,
                on_conflict="domain",
            )
        else:
            raise


def delete_active_auction(domain: str) -> None:
    """낙찰 완료된 도메인을 active_auctions에서 삭제."""
    url, key = _get_config()
    endpoint = f"{url}/rest/v1/active_auctions?domain=eq.{domain}"
    resp = requests.delete(
        endpoint,
        headers=_headers(key),
        timeout=15,
    )
    resp.raise_for_status()


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
    # 1. upsert domain row (name이 unique key)
    domain_rows = _post(
        "domains",
        {
            "name": domain_name,
            "tld": tld,
            "status": "sold",
            "source": platform,
        },
        on_conflict="name",
    )
    
    if not domain_rows:
        # return=representation이 빈 경우 — 도메인을 조회
        url, key = _get_config()
        resp = requests.get(
            f"{url}/rest/v1/domains?name=eq.{domain_name}&select=id",
            headers=_headers(key),
            timeout=15,
        )
        resp.raise_for_status()
        domain_rows = resp.json()
    
    if not domain_rows:
        print(f"  [DB] SKIP (domain not found): {domain_name}.{tld}")
        return
    
    domain_id = domain_rows[0]["id"]

    # 2. insert sales_history (중복이면 무시)
    try:
        _post(
            "sales_history",
            {
                "domain_id": domain_id,
                "sold_at": sold_at.isoformat(),
                "price_usd": price_usd,
                "platform": platform,
            },
            prefer="resolution=ignore-duplicates",
        )
    except requests.HTTPError:
        pass  # 중복 무시

    print(f"  [DB] saved: {domain_name}.{tld} | ${price_usd:,} | {sold_at} | {platform}")
