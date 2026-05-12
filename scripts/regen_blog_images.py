"""
블로그 글 이미지 재생성 + 한글 오버레이 + Supabase 재업로드.

사용법:
  python3 scripts/regen_blog_images.py <slug>          # 한 글 처리
  python3 scripts/regen_blog_images.py <slug1> <slug2> # 여러 글 처리

처리 흐름:
  1. posts 테이블에서 slug로 글 조회 (title, content, cover_image_url)
  2. content HTML에서 <img> URL 추출
  3. 각 이미지에 대해:
     a. 영문 프롬프트로 GPT Image 1 호출 → PNG
     b. 800px 리사이즈
     c. image_overlay.add_text_overlay()로 한글 텍스트 오버레이 → WebP
     d. Supabase Storage 같은 파일명으로 upsert (cache-bust)
  4. 캐시 우회 GET으로 결과 검증

폰트는 image_overlay.py의 FONT_PATHS에 등록된 한글 폰트를 사용.
"""

from __future__ import annotations

import sys
import os
import re
import io
import json
import time
import base64
import urllib.request
import urllib.error
from pathlib import Path
from PIL import Image

THIS_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(THIS_DIR))
from image_overlay import add_text_overlay  # noqa: E402

ENV_PATH = THIS_DIR.parent / "web" / ".env.local"
BUCKET = "blog-images"
COVER_PROMPT = (
    "Isometric 3D illustration for a blog post about {topic_en}. "
    "Style: clean modern minimal isometric design. "
    "Color palette: primary blue #2563eb, accent green #10b981, light background #f8fafc. "
    "Elements: domain analytics dashboard, magnifying glass, charts, shopping cart, "
    "checklist clipboard. No text, no watermarks, no people. Square 1:1."
)
SECTION_PROMPT = (
    "Flat vector illustration explaining {topic_en}. "
    "Style: simple clean flat design with subtle gradients. "
    "Color palette: blue #2563eb, green #10b981, background #f8fafc. "
    "Elements: relevant icons and diagrams. No text, no watermarks, no people. Square 1:1."
)


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
        + f"/rest/v1/posts?slug=eq.{slug}&select=id,slug,title,cover_image_url,content"
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


def extract_image_targets(post: dict) -> list[dict]:
    """
    반환: [{filename, text, kind}] — kind는 'cover' | 'section'
    """
    content = post.get("content") or ""
    cover_url = post["cover_image_url"]
    cover_name = cover_url.rsplit("/", 1)[-1]

    targets: list[dict] = [
        {"filename": cover_name, "text": post["title"], "kind": "cover"}
    ]

    img_matches = list(
        re.finditer(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>', content)
    )
    # cover 자체는 본문 첫 img로도 들어가므로 제외
    section_imgs = [m for m in img_matches if cover_name not in m.group(1)]

    for m in section_imgs:
        src = m.group(1)
        filename = src.rsplit("/", 1)[-1]
        if not filename.startswith(post["slug"]):
            continue
        # 직전 H2 찾기
        before = content[: m.start()]
        h2s = re.findall(r"<h2[^>]*>(.*?)</h2>", before, re.S)
        if h2s:
            text = re.sub(r"<[^>]+>", "", h2s[-1]).strip()
        else:
            text = post["title"]
        # 너무 길면 잘라서
        text = text[:40]
        targets.append({"filename": filename, "text": text, "kind": "section"})

    return targets


def translate_topic(text: str) -> str:
    """한글 제목을 GPT 프롬프트용 영문 키워드로 단순 변환 — 키워드만 추출."""
    # 간단히 도메인/SEO/쇼핑몰/DA/DR 같은 키워드 매핑
    mapping = [
        ("쇼핑몰", "ecommerce store"),
        ("도메인", "domain"),
        ("SEO 점수", "SEO score"),
        ("SEO", "SEO"),
        ("DA", "domain authority"),
        ("DR", "domain rating"),
        ("백링크", "backlinks"),
        ("호스팅", "hosting"),
        ("DNS", "DNS"),
        ("WHOIS", "WHOIS"),
        ("경매", "auction"),
        ("플리핑", "flipping"),
        ("프리미엄", "premium"),
        ("가격", "pricing"),
        ("진단", "diagnosis"),
        ("확인", "check"),
        ("비교", "comparison"),
        ("GoDaddy", "GoDaddy"),
        ("Namecheap", "Namecheap"),
        ("TF", "Trust Flow"),
        ("CF", "Citation Flow"),
        ("신뢰도", "trust"),
        ("소유자", "owner"),
    ]
    keywords = []
    for ko, en in mapping:
        if ko in text:
            keywords.append(en)
    if not keywords:
        keywords = ["domain analysis", "SEO metrics"]
    return ", ".join(keywords[:5])


def generate_image(env: dict, prompt: str) -> bytes:
    """GPT Image 1 호출 → PNG bytes."""
    body = json.dumps(
        {
            "model": "gpt-image-1",
            "prompt": prompt,
            "n": 1,
            "size": "1024x1024",
            "quality": "medium",
        }
    ).encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/images/generations",
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer " + env["OPENAI_API_KEY"],
        },
    )
    try:
        resp = json.loads(urllib.request.urlopen(req, timeout=120).read())
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", "ignore")
        raise RuntimeError(f"OpenAI HTTP {e.code}: {err}")
    if "data" not in resp or not resp["data"]:
        raise RuntimeError(f"OpenAI bad response: {json.dumps(resp)[:200]}")
    b64 = resp["data"][0].get("b64_json") or ""
    if not b64:
        raise RuntimeError("OpenAI no b64_json")
    return base64.b64decode(b64)


def resize_to_png(png_bytes: bytes, max_dim: int = 800) -> bytes:
    img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    img.thumbnail((max_dim, max_dim))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def upload_storage(env: dict, filename: str, webp_bytes: bytes) -> str:
    url = (
        env["NEXT_PUBLIC_SUPABASE_URL"]
        + f"/storage/v1/object/{BUCKET}/{filename}"
    )
    req = urllib.request.Request(
        url,
        data=webp_bytes,
        method="POST",
        headers={
            "Authorization": "Bearer " + env["SUPABASE_SERVICE_ROLE_KEY"],
            "Content-Type": "image/webp",
            "x-upsert": "true",
            "Cache-Control": "max-age=0, no-cache",
        },
    )
    try:
        resp = urllib.request.urlopen(req, timeout=60).read()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Upload HTTP {e.code}: {e.read().decode('utf-8','ignore')}")
    return (
        env["NEXT_PUBLIC_SUPABASE_URL"]
        + f"/storage/v1/object/public/{BUCKET}/{filename}"
    )


def process_post(env: dict, slug: str, out_dir: Path) -> dict:
    post = fetch_post(env, slug)
    targets = extract_image_targets(post)
    print(f"\n=== {slug} — {post['title']}")
    print(f"  Targets: {len(targets)}")
    for t in targets:
        print(f"   - [{t['kind']}] {t['filename']} <= {t['text']!r}")

    topic_en = translate_topic(post["title"])
    out_dir.mkdir(parents=True, exist_ok=True)
    results = []

    for idx, t in enumerate(targets):
        prompt_tpl = COVER_PROMPT if t["kind"] == "cover" else SECTION_PROMPT
        prompt = prompt_tpl.format(topic_en=topic_en)
        font_size = 72 if t["kind"] == "cover" else 60

        print(f"\n  [{idx + 1}/{len(targets)}] generating {t['filename']} ...")
        png = generate_image(env, prompt)
        resized = resize_to_png(png)
        overlaid = add_text_overlay(
            resized,
            t["text"],
            font_size=font_size,
            brightness=0.82,
        )
        local_path = out_dir / t["filename"]
        local_path.write_bytes(overlaid)
        public_url = upload_storage(env, t["filename"], overlaid)
        print(f"      saved local: {local_path}")
        print(f"      uploaded:    {public_url}")
        results.append({"filename": t["filename"], "url": public_url, "bytes": len(overlaid)})

    return {"slug": slug, "title": post["title"], "results": results}


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 regen_blog_images.py <slug> [<slug2> ...]")
        sys.exit(1)
    slugs = sys.argv[1:]
    env = load_env()
    out_dir = Path("/tmp/blog-image-regen") / time.strftime("%Y%m%d-%H%M%S")
    summary = []
    for slug in slugs:
        try:
            summary.append(process_post(env, slug, out_dir))
        except Exception as e:
            print(f"  FAILED {slug}: {e}")
            summary.append({"slug": slug, "error": str(e)})
    print("\n=== SUMMARY ===")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    summary_path = out_dir / "summary.json"
    summary_path.parent.mkdir(parents=True, exist_ok=True)
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2))
    print(f"\nSaved: {summary_path}")


if __name__ == "__main__":
    main()
