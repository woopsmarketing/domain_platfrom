# Image Text Overlay Script

이미지에 텍스트를 중앙 배치하는 Python 스크립트. 블로그 커버 이미지, 썸네일, SNS 공유 이미지 등에 사용.

## 필요 환경

```bash
pip install Pillow
```

Windows: 맑은 고딕 Bold 자동 사용. Mac/Linux: 폰트 경로를 `FONT_PATHS`에 추가 필요.

## 파일 구성

| 파일 | 역할 |
|---|---|
| `image_overlay.py` | Python 핵심 스크립트 (CLI + 모듈) |
| `image-overlay-helper.mjs` | Node.js에서 Python 호출하는 래퍼 |

## CLI 사용법

```bash
# 기본 (랜덤 색상, 폰트 64px)
python image_overlay.py input.png output.webp "블로그 제목 텍스트"

# 색상 지정
python image_overlay.py input.png output.webp "제목" --color=white
python image_overlay.py input.png output.webp "제목" --color=255,236,100

# 폰트 크기 변경
python image_overlay.py input.png output.webp "제목" --font-size=80

# 밝기 조정 (0.7 = 30% 어둡게)
python image_overlay.py input.png output.webp "제목" --brightness=0.7
```

## Node.js에서 사용

```javascript
import { applyImageOverlay } from './image-overlay-helper.mjs';

const processedBuffer = await applyImageOverlay(imageBuffer, "제목 텍스트", {
  fontSize: 64,        // 기본 64
  brightness: 0.85,    // 기본 0.85
  color: "random",     // 기본 random
});
```

## 색상 팔레트 (8가지)

| 색상 | RGB |
|---|---|
| 흰색 | 255, 255, 255 |
| 밝은 노랑 | 255, 236, 100 |
| 하늘색 | 100, 230, 255 |
| 민트 그린 | 120, 255, 180 |
| 오렌지 | 255, 170, 100 |
| 연보라 | 220, 160, 255 |
| 코랄 핑크 | 255, 130, 150 |
| 라임 그린 | 160, 230, 120 |

## 다른 프로젝트에 복사하기

1. `image_overlay.py`를 프로젝트의 `scripts/` 폴더에 복사
2. (Node.js 연동 필요 시) `image-overlay-helper.mjs`도 함께 복사
3. Mac/Linux 환경이면 `FONT_PATHS`에 시스템 폰트 경로 추가:

```python
FONT_PATHS = [
    "/usr/share/fonts/truetype/noto/NotoSansKR-Bold.ttf",
    "/System/Library/Fonts/AppleSDGothicNeo.ttc",
    # ...
]
```

## Claude Code에게 이렇게 말하세요

```
scripts/image_overlay.py 스크립트를 사용해서 
이미지에 텍스트 오버레이를 추가해줘.

- 입력: [이미지 경로]
- 텍스트: [넣을 문구]
- 색상: random (또는 white, 또는 R,G,B)

사용법: python scripts/image_overlay.py input.png output.webp "텍스트" --color=random
```

또는 파이프라인 구축 시:

```
블로그 이미지 생성 파이프라인에 텍스트 오버레이 단계를 추가해줘.
scripts/image_overlay.py를 사용해서:
1. AI로 이미지 생성 (OpenAI API)
2. 이미지 압축 (WebP)
3. image_overlay.py로 제목/H2 텍스트 오버레이 (랜덤 색상)
4. Storage 업로드
```
