---
description: SEO 블로그 글 작성 파이프라인. 키워드를 입력하면 분석→구조설계→작성→페이지생성→배포까지 자동 실행. 사용법: /write-blog [키워드]
---

# /write-blog 파이프라인 (8단계)

입력 키워드: $ARGUMENTS
프로젝트 경로: /mnt/d/Documents/domain_platform
설정 파일: /mnt/d/Documents/domain_platform/.claude/blog-config.md

아래 8단계를 순차적으로 실행한다. 각 단계에서 Agent 도구를 사용하여 서브에이전트를 호출한다.
각 단계의 출력은 `/tmp/` 디렉토리에 JSON/HTML 파일로 저장되며, 다음 단계의 입력으로 전달된다.

---

## Stage 1: 키워드 분석

`blog-keyword-analyst` 서브에이전트를 호출한다.

프롬프트:
```
키워드: $ARGUMENTS
설정 파일: /mnt/d/Documents/domain_platform/.claude/blog-config.md

blog-config.md를 읽고, 해당 키워드에 대해 아래를 수행하세요:
1. WebSearch로 한국어 검색 상위 5~10개 경쟁 콘텐츠 분석
2. 검색 의도 분류 (정보형/방법형/비교형/문제해결형/전환형)
3. 메인 키워드 1개, 서브 키워드 5~8개, LSI 키워드 5~8개 추출
4. 타겟 독자 수준 및 콘텐츠 앵글 결정
5. blog-config.md의 내부 도구/서비스에서 관련 항목 선정

결과를 /tmp/blog-keyword-analysis.json에 저장하세요.
```

출력: `/tmp/blog-keyword-analysis.json`

---

## Stage 2: 링크 큐레이션

`blog-link-curator` 서브에이전트를 호출한다.

프롬프트:
```
키워드 분석: /tmp/blog-keyword-analysis.json
설정 파일: /mnt/d/Documents/domain_platform/.claude/blog-config.md

키워드 분석 결과와 blog-config.md를 읽고 아래를 수행하세요:
1. 내부 도구 링크 2~4개 선정 (앵커 텍스트 + 배치 맥락)
2. 기존 블로그 클러스터 링크 1~3개 선정
3. 외부 링크 3단계 검증:
   - WebSearch로 후보 검색 (blog-config.md 권위 도메인만)
   - WebFetch로 접속 확인 (200 응답, 콘텐츠 관련성)
   - 최종 선별 (최대 3개, 0개도 허용)
4. 서비스 링크 0~1개 선정

결과를 /tmp/blog-links.json에 저장하세요.
```

출력: `/tmp/blog-links.json`

---

## Stage 3: 아웃라인 설계

`blog-outline-builder` 서브에이전트를 호출한다.

프롬프트:
```
키워드 분석: /tmp/blog-keyword-analysis.json
링크 큐레이션: /tmp/blog-links.json
설정 파일: /mnt/d/Documents/domain_platform/.claude/blog-config.md

두 입력 파일과 blog-config.md를 읽고 아래를 설계하세요:
1. H1 (title) — 30~40자 한국어
2. H2 섹션 5~8개 (id, 목적, 키워드, 콘텐츠 타입, 시각요소)
3. H3 소제목 (필요 시)
4. 시각요소 배치 (info-box, tip-box, warning-box, comparison-table 등 최소 4개)
5. FAQ 7~10개 (보충 정보, 본문 반복 금지)
6. CTA 배치 1~2곳
7. 메타 정보 (slug, category, 분량, read_time, hasStepStructure)

결과를 /tmp/blog-outline.json에 저장하세요.
```

출력: `/tmp/blog-outline.json`

**Stage 3.5: 사용자 확인**

/tmp/blog-outline.json을 읽어서 요약 표시:

```
블로그 아웃라인 요약

| 항목 | 내용 |
|------|------|
| 제목 | ... |
| 슬러그 | ... |
| 키워드 | ... |
| 검색 의도 | ... |
| 카테고리 | ... |
| 예상 분량 | ... |

목차:
1. H2: ...
2. H2: ...
...

FAQ (N개):
1. ...
2. ...

내부 링크: N개
외부 링크: N개
시각요소: N개
CTA: ...

이 구조로 진행할까요?
```

**사용자가 승인하면 Stage 4로, 수정 요청하면 해당 부분 수정 후 재확인.**

---

## Stage 4: 이미지 생성

`blog-image-generator` 서브에이전트를 호출한다.

프롬프트:
```
아웃라인: /tmp/blog-outline.json
설정 파일: /mnt/d/Documents/domain_platform/.claude/blog-config.md
환경변수: /mnt/d/Documents/domain_platform/web/.env.local

아웃라인을 읽고 아래를 수행하세요:
1. GPT Image 1로 커버 이미지 생성 (Isometric 3D, 브랜드 컬러)
2. 섹션 이미지 최대 2개 생성 (Flat vector)
3. sharp로 WebP 변환 + 800px 리사이즈 (1.3MB PNG → ~30KB WebP, LCP 성능 필수)
4. scripts/image_overlay.py로 텍스트 오버레이:
   - 커버 이미지: h1 제목 삽입 (font-size=72, color=random)
   - 섹션 이미지: 해당 H2 텍스트 삽입 (font-size=60, color=random)
   - Pillow 없거나 실패 시 원본 유지, 파이프라인 계속
5. 오버레이 완료 이미지를 Supabase Storage blog-images 버킷에 업로드
6. 실패 시 빈 객체로 진행 (파이프라인 중단 금지)

결과를 /tmp/blog-images.json에 저장하세요.
```

출력: `/tmp/blog-images.json`

---

## Stage 5: 본문 작성

`blog-content-writer` 서브에이전트를 호출한다.

프롬프트:
```
아웃라인: /tmp/blog-outline.json
링크 큐레이션: /tmp/blog-links.json
이미지: /tmp/blog-images.json
설정 파일: /mnt/d/Documents/domain_platform/.claude/blog-config.md

모든 입력 파일과 blog-config.md를 읽고 리치 HTML 본문을 작성하세요:
1. blog-config.md의 14종 CSS 컴포넌트 적극 활용
2. 5000~7000자, 모든 H2에 id 속성 필수
3. 링크 큐레이션의 내부/외부 링크 자연스럽게 삽입
4. 이미지 URL을 blog-figure로 삽입 (이미지 없으면 생략)
5. 시각요소 아웃라인에 따라 배치
6. FAQ는 본문에 포함하지 않음 — 별도 JSON 출력

결과 파일:
- /tmp/blog-content.html (리치 HTML 본문)
- /tmp/blog-faqs.json (FAQ JSON 배열)
```

출력: `/tmp/blog-content.html`, `/tmp/blog-faqs.json`

---

## Stage 6: 품질 검수 (자동 수정 루프)

`blog-quality-reviewer` 서브에이전트를 호출한다.

프롬프트:
```
HTML 본문: /tmp/blog-content.html
FAQ: /tmp/blog-faqs.json
아웃라인: /tmp/blog-outline.json
링크 큐레이션: /tmp/blog-links.json
설정 파일: /mnt/d/Documents/domain_platform/.claude/blog-config.md

모든 파일을 읽고 100점 만점으로 채점하세요:
- 필수 7항목 (각 10점 = 70점): H2 id, 키워드 밀도, 내부 링크, 비교표, 분량, 서드파티 노출, FAQ
- 권장 5항목 (각 6점 = 30점): 시각요소, 외부 링크, CTA, 첫 문단, 결론

70점 미만이면:
1. requiredFixes 작성
2. /tmp/blog-content.html 직접 수정 (1회만)
3. 재채점

결과를 /tmp/blog-quality-review.json에 저장하세요.
```

출력: `/tmp/blog-quality-review.json`

**70점 미만 + 자동 수정 실패 시**: 사용자에게 에스컬레이션 (구체적 문제점 보고).

---

## Stage 7: SEO 패키징

`blog-seo-packager` 서브에이전트를 호출한다.

프롬프트:
```
아웃라인: /tmp/blog-outline.json
HTML 본문: /tmp/blog-content.html
FAQ: /tmp/blog-faqs.json
품질 검수: /tmp/blog-quality-review.json
키워드 분석: /tmp/blog-keyword-analysis.json
설정 파일: /mnt/d/Documents/domain_platform/.claude/blog-config.md

모든 파일을 읽고 SEO 메타데이터를 확정하세요:
1. title 후보 3개 (다른 앵글, 30~40자)
2. description 60~80자
3. slug 영문 kebab-case
4. tags 5~8개 한국어
5. 카테고리: "SEO 분석" | "도메인 투자" | "SEO 기초"
6. HowTo schema 적용 여부 판단
7. read_time 확정

결과를 /tmp/blog-seo-package.json에 저장하세요.
```

출력: `/tmp/blog-seo-package.json`

---

## Stage 8: DB 저장 + 발행

`blog-publisher` 서브에이전트를 호출한다.

프롬프트:
```
아웃라인: /tmp/blog-outline.json
HTML 본문: /tmp/blog-content.html
FAQ: /tmp/blog-faqs.json
SEO 패키지: /tmp/blog-seo-package.json
이미지: /tmp/blog-images.json
품질 검수: /tmp/blog-quality-review.json
프로젝트 경로: /mnt/d/Documents/domain_platform

모든 파일을 종합하여 아래를 수행하세요:
1. posts 테이블에 draft 상태로 upsert (slug 기준)
   - mcp__supabase__execute_sql 사용 권장
   - 실패 시 Bash curl 대안
2. 저장 확인 (SELECT로 검증)
3. Google sitemap ping
4. 최종 보고서 생성

결과를 /tmp/blog-publish-report.json에 저장하세요.
```

출력: `/tmp/blog-publish-report.json`

---

## Stage 9: 완료 보고

`/tmp/blog-publish-report.json`을 읽어서 최종 보고:

```
## 블로그 작성 완료

| 항목 | 내용 |
|------|------|
| 제목 | ... |
| URL | https://domainchecker.co.kr/blog/{slug} |
| 핵심 키워드 | ... |
| 분량 | N자 / N분 |
| FAQ | N개 |
| 카테고리 | ... |
| 품질 점수 | N점/100점 |
| 커버 이미지 | 있음/없음 |
| 상태 | 초안 (draft) |

### 파이프라인 실행 요약

| 단계 | 에이전트 | 상태 |
|------|---------|------|
| 1 | blog-keyword-analyst | 완료 |
| 2 | blog-link-curator | 완료 |
| 3 | blog-outline-builder | 완료 |
| 4 | blog-image-generator | 완료/스킵 |
| 5 | blog-content-writer | 완료 |
| 6 | blog-quality-reviewer | 완료 (N점) |
| 7 | blog-seo-packager | 완료 |
| 8 | blog-publisher | 완료 |

어드민 페이지에서 확인 후 발행하세요.
```
