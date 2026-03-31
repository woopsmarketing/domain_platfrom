---
description: SEO 최적화 블로그 글을 작성하고 페이지를 생성한다. 사용법: /write-blog [키워드]
---

# /write-blog 파이프라인

입력 키워드: $ARGUMENTS

## 실행 흐름 (5단계)

### Step 1: 키워드 분석

`seo-blog-writer` 에이전트를 호출하여 키워드를 분석한다.

**에이전트 프롬프트:**
```
Main keyword: {$ARGUMENTS}
Target reader: SEO 초보자, 도메인 투자 입문자
Goal: 정보 전달 + 도메인체커 도구 사용 유도
Desired tone: 설명형, 친절, 실무적

Step 1~2만 수행하세요 (검색 의도 분석 + 아웃라인 작성).
아직 본문을 작성하지 마세요.

출력 형식:
1. 검색 의도 분석 (의도 유형, 독자 수준, 목적)
2. 핵심 키워드 (메인 1개 + 서브 5~8개)
3. 롱테일 키워드 3~5개
4. 추천 슬러그 (영문)
5. 추천 제목 (한국어, 60자 이내)
6. H2/H3 목차 구조 (섹션별 목적 + 배치할 키워드)
7. FAQ 질문 목록 5개
8. CTA 연결 도구/페이지 추천
9. 내부 링크 대상 3~5개
10. 추천 카테고리: "SEO 분석" | "도메인 투자" | "SEO 기초"
11. 예상 읽기 시간

/tmp/blog-{slug}-outline.md 에 저장하세요.
```

### Step 2: 사용자 확인

Step 1의 결과(아웃라인)를 사용자에게 보여주고 승인을 받는다.
- 제목, 슬러그, 키워드, 목차 구조를 요약하여 표시
- "이 구조로 진행할까요?" 질문

### Step 3: 콘텐츠 작성

승인 후, `seo-blog-writer` 에이전트를 다시 호출하여 본문을 작성한다.

**에이전트 프롬프트:**
```
/tmp/blog-{slug}-outline.md 의 아웃라인을 읽고, 해당 구조에 맞춰 전체 본문을 작성하세요.

중요 규칙:
- Word count: 3000~5000자
- 키워드 스터핑 금지 — 자연스러운 한국어
- 서드파티 API 이름(RapidAPI, VebAPI 등) 절대 언급 금지
- 도메인체커 도구는 자연스럽게 언급 (내부 링크 포함)
- 본문에서 "도메인체커에서 확인하세요" 같은 직접 광고 금지
- FAQ 답변은 각 2~3문장
- 실용적 예시/수치 포함

/tmp/blog-{slug}.md 에 저장하세요.
seo-blog-writer.md의 Output Format을 정확히 따르세요.
```

### Step 4: TSX 페이지 생성

`blog-builder` 에이전트를 호출하여 마크다운을 TSX로 변환한다.

**에이전트 프롬프트:**
```
/tmp/blog-{slug}.md 원고를 읽고, Next.js TSX 페이지로 변환하세요.

필수 사항:
- blog-builder.md의 MANDATORY Page Structure를 정확히 따를 것
- CSS는 blog.css 클래스만 사용 (인라인 금지)
- 관련 글은 lib/blog.ts의 articles 배열에서 자동 생성
- FAQ는 details/summary + JSON-LD 이중 구현

생성할 파일:
1. web/src/app/blog/{slug}/page.tsx

추가 수정할 파일:
2. web/src/lib/blog.ts — articles 배열 맨 위에 새 항목 추가:
   {
     slug: "{slug}",
     title: "{제목}",
     description: "{설명}",
     category: "{카테고리}",
     date: "{오늘 날짜 YYYY-MM-DD}",
     readTime: "{N}분",
   }
```

### Step 5: 빌드 검증 + 커밋

1. `cd /mnt/d/Documents/domain_platform/web && pnpm build 2>&1 | tail -10` 실행
2. 빌드 에러 있으면 수정
3. 성공하면:
   ```bash
   git add web/src/app/blog/{slug}/page.tsx web/src/lib/blog.ts
   git commit -m "feat: 블로그 — {제목 요약}

   키워드: {핵심 키워드 3~4개}
   구조: {의도 유형} {섹션 수}개 섹션 + FAQ {N}개
   JSON-LD: Article + FAQPage

   Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
   git push origin master
   ```

## 실행 보고

완료 후 아래 형식으로 보고:

```
## 블로그 작성 완료

| 항목 | 내용 |
|------|------|
| 제목 | {제목} |
| URL | /blog/{slug} |
| 키워드 | {핵심 + 서브 키워드} |
| 분량 | {N}자 / {N}분 읽기 |
| FAQ | {N}개 |
| JSON-LD | Article + FAQPage |
| 카테고리 | {카테고리} |
| 내부 링크 | {연결된 페이지 목록} |
```

## 주의사항

- 사용자가 키워드만 입력하면 전체 파이프라인이 순차 실행
- Step 2에서 사용자 승인을 반드시 받을 것
- blog.css 클래스 외 인라인 스타일 절대 금지
- 서드파티 API 이름 노출 금지
- lib/blog.ts 등록 필수 (sitemap 자동 반영)
