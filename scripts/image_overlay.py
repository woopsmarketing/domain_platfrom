"""
이미지 텍스트 오버레이 모듈 (Pillow 기반)

이미지에 텍스트를 중앙 배치로 삽입 (이미지는 배경, 텍스트가 주인공):
1. 전체 밝기 감소 + 반투명 어둠 레이어 (배경화)
2. 텍스트 블록 주변 집중 어둠 (vignette)
3. 큰 글씨 + 2~3줄 줄바꿈 + 수평·수직 중앙 정렬
4. 매 실행마다 8가지 팔레트에서 랜덤 색상 선택

사용법:
  python image_overlay.py <input_path> <output_path> <text> [--font-size=64] [--color=random]
  python image_overlay.py cover.png cover_out.webp "블로그 제목입니다"
  python image_overlay.py img.png out.webp "텍스트" --color=255,236,100

또는 모듈로 import:
  from image_overlay import add_text_overlay
  result_bytes = add_text_overlay(image_bytes, "텍스트", font_size=64)
"""

import sys
import io
import os
import random
import textwrap
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

# 폰트 경로 (맑은 고딕 Bold)
FONT_PATHS = [
    "C:/Windows/Fonts/malgunbd.ttf",   # 맑은 고딕 Bold
    "C:/Windows/Fonts/malgun.ttf",     # 맑은 고딕
    "C:/Windows/Fonts/GOTHICB.TTF",    # Gothic Bold
    "C:/Windows/Fonts/GOTHIC.TTF",
]

# 어두운 배경 위에 잘 보이는 색상 팔레트 (RGBA)
TEXT_COLOR_PALETTE = [
    (255, 255, 255, 255),   # 흰색
    (255, 236, 100, 255),   # 밝은 노랑
    (100, 230, 255, 255),   # 하늘색
    (120, 255, 180, 255),   # 민트 그린
    (255, 170, 100, 255),   # 오렌지
    (220, 160, 255, 255),   # 연보라
    (255, 130, 150, 255),   # 코랄 핑크
    (160, 230, 120, 255),   # 라임 그린
]


def pick_color(color_arg: str) -> tuple:
    """
    color_arg: "random" → 팔레트에서 랜덤 선택
               "white" → 흰색
               "R,G,B" → 직접 지정
    """
    if color_arg == "random":
        return random.choice(TEXT_COLOR_PALETTE)
    if color_arg == "white":
        return (255, 255, 255, 255)
    try:
        parts = [int(x.strip()) for x in color_arg.split(",")]
        if len(parts) == 3:
            return (*parts, 255)
        if len(parts) == 4:
            return tuple(parts)
    except ValueError:
        pass
    return (255, 255, 255, 255)


def get_font(size: int) -> ImageFont.FreeTypeFont:
    for path in FONT_PATHS:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def add_text_overlay(
    image_bytes: bytes,
    text: str,
    font_size: int = 64,
    brightness: float = 0.85,
    position: str = "bottom",  # "bottom" | "top"
    color: tuple = None,        # (R, G, B, A) — None이면 랜덤 선택
) -> bytes:
    """
    이미지 바이트에 텍스트 오버레이를 추가하고 WebP 바이트로 반환.

    Args:
        image_bytes: 원본 이미지 (PNG/JPEG/WebP)
        text: 삽입할 텍스트
        font_size: 폰트 크기 (픽셀)
        brightness: 밝기 조정 (1.0=원본, 0.85=15% 어둡게)
        position: 텍스트 위치
        color: 텍스트 색상 (R, G, B, A) — None이면 팔레트에서 랜덤
    """
    if color is None:
        color = random.choice(TEXT_COLOR_PALETTE)
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    w, h = img.size

    # 1. 전체 밝기 낮추기 (배경 느낌)
    enhancer = ImageEnhance.Brightness(img.convert("RGB"))
    img_dark = enhancer.enhance(brightness).convert("RGBA")

    # 2. 전체 반투명 어두운 레이어 (이미지 전체를 배경으로)
    full_dim = Image.new("RGBA", (w, h), (0, 0, 0, 120))
    img_dark = Image.alpha_composite(img_dark, full_dim)

    # 3. 텍스트 준비 (중앙 배치 기준)
    padding_x = 48
    max_chars = max(8, int(w / font_size * 0.70))

    lines = textwrap.wrap(text, width=max_chars)
    if not lines:
        lines = [text[:max_chars]]

    font = get_font(font_size)
    line_height = int(font_size * 1.40)
    total_text_h = len(lines) * line_height

    # 수직 중앙 정렬
    text_y = (h - total_text_h) // 2

    # 4. 텍스트 블록 뒤에 집중 어둠 (가독성 강화)
    band_pad = font_size
    band_top = max(0, text_y - band_pad)
    band_bottom = min(h, text_y + total_text_h + band_pad)
    band_h = band_bottom - band_top

    band = Image.new("RGBA", (w, band_h), (0, 0, 0, 0))
    draw_band = ImageDraw.Draw(band)
    for y in range(band_h):
        # 위아래 가장자리에서 중앙으로 갈수록 진하게 (부드러운 vignette)
        ratio = 1.0 - abs(y / band_h - 0.5) * 2  # 0→1→0
        alpha = int(ratio ** 0.7 * 110)
        draw_band.line([(0, y), (w, y)], fill=(0, 0, 0, alpha))
    img_dark.paste(band, (0, band_top), band)

    # 5. 텍스트 렌더링 (중앙 정렬)
    draw = ImageDraw.Draw(img_dark)

    for i, line in enumerate(lines):
        y = text_y + i * line_height

        # 텍스트 너비 측정해서 수평 중앙 정렬
        try:
            bbox = font.getbbox(line)
            text_w = bbox[2] - bbox[0]
        except AttributeError:
            text_w = len(line) * font_size  # fallback

        x = (w - text_w) // 2

        # 그림자 효과 (여러 방향)
        for dx, dy in [(-3, -3), (3, -3), (-3, 3), (3, 3), (0, 4), (4, 0), (-4, 0)]:
            draw.text((x + dx, y + dy), line, font=font, fill=(0, 0, 0, 200))

        # 본문 텍스트 (선택된 색상)
        draw.text((x, y), line, font=font, fill=color)

    # 4. WebP로 출력
    result = img_dark.convert("RGB")
    buf = io.BytesIO()
    result.save(buf, format="WEBP", quality=88, method=6)
    return buf.getvalue()


def main():
    import argparse

    parser = argparse.ArgumentParser(description="블로그 이미지 텍스트 오버레이")
    parser.add_argument("input", help="입력 이미지 경로")
    parser.add_argument("output", help="출력 이미지 경로 (.webp)")
    parser.add_argument("text", help="삽입할 텍스트")
    parser.add_argument("--font-size", type=int, default=64)
    parser.add_argument("--brightness", type=float, default=0.85)
    parser.add_argument("--position", choices=["bottom", "top"], default="bottom")
    parser.add_argument(
        "--color",
        default="random",
        help="텍스트 색상: random | white | R,G,B (예: 255,236,100)",
    )
    args = parser.parse_args()

    chosen_color = pick_color(args.color)

    with open(args.input, "rb") as f:
        image_bytes = f.read()

    result = add_text_overlay(
        image_bytes,
        args.text,
        font_size=args.font_size,
        brightness=args.brightness,
        position=args.position,
        color=chosen_color,
    )

    with open(args.output, "wb") as f:
        f.write(result)

    size_kb = len(result) // 1024
    r, g, b, a = chosen_color
    print(f"Done: {args.output} ({size_kb}KB) color=({r},{g},{b})")


if __name__ == "__main__":
    main()
