"""
posts.cover_image_url에 ?v={timestamp} 쿼리를 추가해 Vercel/Next Image 캐시 무효화.

용도:
  Storage 파일을 upsert로 갱신했지만 Next Image Optimization 캐시 때문에
  옛 이미지가 글 카드/hero에 표시될 때 사용.

흐름:
  1. posts에서 slug로 cover_image_url 조회
  2. URL 끝에 ?v={timestamp} 추가 (기존 ?v= 있으면 새 timestamp로 교체)
  3. PATCH /rest/v1/posts?slug=eq.{slug} 로 업데이트
  4. (옵션) content_html 내의 같은 cover URL도 동일하게 치환

사용법:
  python3 scripts/bust_cover_cache.py <slug> [<slug2> ...]
"""

from __future__ import annotations

import sys
import json
import time
import re
import urllib.request
import urllib.error
from pathlib import Path

ENV_PATH = Path(__file__).resolve().parent.parent / "web" / ".env.local"


def load_env() -> dict:
    env = {}
    with open(ENV_PATH, encoding="utf-8") as f:
        for line in f:
            line = line.strip().rstrip("\r")
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def fetch_post(env: dict, slug: str) -> dict:
    url = (
        env["NEXT_PUBLIC_SUPABASE_URL"]
        + f"/rest/v1/posts?slug=eq.{slug}&select=id,slug,cover_image_url,content"
    )
    req = urllib.request.Request(
        url,
        headers={
            "apikey": env["SUPABASE_SERVICE_ROLE_KEY"],
            "Authorization": "Bearer " + env["SUPABASE_SERVICE_ROLE_KEY"],
        },
    )
    data = json.loads(urllib.request.urlopen(req).read())
    if not data:
        raise SystemExit(f"Post not found: {slug}")
    return data[0]


def bust(url: str, version: str) -> str:
    # 기존 ?v= 또는 &v= 쿼리 제거 후 새 ?v= 추가
    base = re.sub(r"[?&]v=[^&]*", "", url)
    sep = "&" if "?" in base else "?"
    return f"{base}{sep}v={version}"


def update_post(env: dict, slug: str, cover_url: str, content: str) -> None:
    url = env["NEXT_PUBLIC_SUPABASE_URL"] + f"/rest/v1/posts?slug=eq.{slug}"
    body = json.dumps({"cover_image_url": cover_url, "content": content}).encode()
    req = urllib.request.Request(
        url,
        data=body,
        method="PATCH",
        headers={
            "apikey": env["SUPABASE_SERVICE_ROLE_KEY"],
            "Authorization": "Bearer " + env["SUPABASE_SERVICE_ROLE_KEY"],
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
    )
    try:
        resp = urllib.request.urlopen(req, timeout=30).read()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"PATCH HTTP {e.code}: {e.read().decode('utf-8','ignore')}")
    if not resp:
        raise RuntimeError("PATCH returned empty")


def process(env: dict, slug: str, version: str) -> dict:
    post = fetch_post(env, slug)
    old_cover = post["cover_image_url"] or ""
    if not old_cover:
        return {"slug": slug, "skipped": "no cover_image_url"}
    new_cover = bust(old_cover, version)

    content = post.get("content") or ""
    # content 안에 들어있는 cover 파일명을 가진 img src도 동일하게 cache-bust
    cover_filename = old_cover.split("?")[0].rsplit("/", 1)[-1]
    pattern = re.compile(
        r'(<img[^>]+src=["\'])([^"\']*' + re.escape(cover_filename) + r')([^"\']*)(["\'])'
    )
    new_content, n = pattern.subn(
        lambda m: m.group(1) + bust(m.group(2), version) + m.group(4),
        content,
    )

    update_post(env, slug, new_cover, new_content)
    return {
        "slug": slug,
        "old_cover": old_cover,
        "new_cover": new_cover,
        "content_replacements": n,
    }


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python3 bust_cover_cache.py <slug> [<slug2> ...]")
        sys.exit(1)
    slugs = sys.argv[1:]
    env = load_env()
    version = time.strftime("%Y%m%d%H%M%S")
    results = []
    for slug in slugs:
        try:
            results.append(process(env, slug, version))
        except Exception as e:
            results.append({"slug": slug, "error": str(e)})
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
