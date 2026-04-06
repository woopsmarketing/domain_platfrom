---
description: SEO 블로그 글 작성 파이프라인. 키워드를 입력하면 분석→구조설계→작성→검증→DB저장까지 자동 실행. 사용법: /write-blog [키워드]
---

# /write-blog 파이프라인

입력 키워드: $ARGUMENTS

아래 5단계를 순차적으로 실행한다. 각 단계에서 Agent 도구를 사용하여 서브에이전트를 호출한다.

---

## Stage 1: 키워드 리서치 + 콘텐츠 구조 설계

`blog-planner` 서브에이전트를 호출한다.

프롬프트:
```
키워드: $ARGUMENTS
프로젝트: domainchecker.co.kr (도메인 분석 SaaS)

아래 작업을 수행하세요:

1. 웹 검색으로 해당 키워드의 상위 경쟁 콘텐츠 5~10개 분석
   - 어떤 구조로 쓰여있는지, 어떤 서브토픽을 다루는지 파악
   - 경쟁글에서 빠진 내용(콘텐츠 갭) 식별

2. 기존 블로그 중복 확인
   - DB에서 기존 발행글 확인 (Supabase posts 테이블)
   - 중복 키워드가 있으면 차별화 포인트 명시

3. 검색 의도 분석 (정보형/방법형/비교형/문제해결형/전환형)

4. 키워드 추출
   - 핵심 키워드 1개
   - 서브 키워드 5~8개
   - 롱테일 키워드 3~5개 (실제 검색될 만한 자연어 형태)

5. H2/H3 목차 설계
   - 각 H2 섹션의 목적, 배치 키워드, 콘텐츠 타입 명시
   - 경쟁글 대비 차별점 1~2개 명시
   - 비교표(table) 배치 위치 1곳 이상

6. FAQ 7~10개 설계 (People Also Ask 기반)
   - 실제 사용자가 검색할 만한 질문
   - 답변은 2~3문장

7. 내부 링크 맵 (기존 블로그 + 도구 페이지)
   도구: /, /tools/domain-availability, /tools/domain-generator, /tools/dns-checker,
         /tools/whois-lookup, /tools/domain-value, /tools/domain-compare,
         /tools/bulk-analysis, /tools/backlink-checker, /tools/serp-checker,
         /tools/domain-expiry, /tools/ssl-checker, /tools/http-status
   블로그: /blog/what-is-da, /blog/how-to-choose-domain, /blog/domain-auction-guide,
           /blog/domain-spam-score-check, /blog/how-to-check-domain-score,
           /blog/how-to-find-expired-domains

8. CTA 설계 (가장 관련있는 도구/페이지 연결)

9. 카테고리 선택: "SEO 분석" | "도메인 투자" | "SEO 기초"

결과를 /tmp/blog-outline.json에 아래 JSON 형식으로 저장:
{
  "keyword": "핵심 키워드",
  "sub_keywords": ["서브1", "서브2"],
  "longtail_keywords": ["롱테일1"],
  "search_intent": "방법/가이드형",
  "reader_level": "초보자",
  "slug": "english-kebab-case",
  "title": "한국어 제목 60자 이내",
  "meta_description": "150자 이내 메타 설명",
  "category": "SEO 기초",
  "estimated_length": "3500자",
  "read_time": "7분",
  "sections": [
    {
      "type": "h2",
      "id": "section-id",
      "title": "섹션 제목",
      "purpose": "이 섹션의 목적",
      "target_keyword": "배치할 키워드",
      "content_type": "설명|리스트|표|단계별|체크리스트",
      "subsections": [
        { "type": "h3", "title": "소제목", "purpose": "..." }
      ]
    }
  ],
  "faqs": [
    { "q": "질문?", "a": "답변 2~3문장" }
  ],
  "cta": {
    "title": "CTA 제목",
    "description": "CTA 설명",
    "buttonText": "버튼 텍스트",
    "href": "/링크"
  },
  "internal_links": [
    { "url": "/blog/what-is-da", "anchor": "DA란?", "context": "본문 어디에 배치" }
  ],
  "competition_gap": "경쟁글 대비 이 글의 차별점"
}
```

## Stage 1.5: 사용자 확인

/tmp/blog-outline.json을 읽어서 사용자에게 요약 표시:

```
📋 블로그 아웃라인 요약

| 항목 | 내용 |
|------|------|
| 제목 | ... |
| 슬러그 | ... |
| 키워드 | ... |
| 검색 의도 | ... |
| 카테고리 | ... |
| 예상 분량 | ... |

📑 목차:
1. H2: ...
2. H2: ...

❓ FAQ (N개):
1. ...
2. ...

🔗 내부 링크: N개
🎯 CTA: ...

이 구조로 진행할까요?
```

**사용자가 승인하면 Stage 2로, 수정 요청하면 해당 부분 수정 후 재확인.**

---

## Stage 2: SEO 본문 작성

`seo-blog-writer` 서브에이전트를 호출한다.

프롬프트:
```
/tmp/blog-outline.json의 아웃라인을 읽고, 해당 구조에 맞춰 전체 본문을 HTML로 작성하세요.

중요 규칙:
- 분량: 3000~5000자
- 출력: 순수 HTML (h2, h3, p, ul, ol, table, blockquote 등)
- h2에 반드시 id 속성 (아웃라인의 id와 일치, 영문 kebab-case)
- 비교표(table) 최소 1개 포함
- 체크리스트 또는 단계별 리스트(ol) 최소 1개 포함
- 내부 링크(a href)를 아웃라인의 internal_links에 따라 배치
- 키워드 자연 배치 (1.5~2% 밀도, 스터핑 금지)
- 서드파티 API 이름(RapidAPI, VebAPI 등) 절대 노출 금지
- 도메인체커 도구는 자연스럽게 언급 (광고 느낌 금지)
- 금지 요소: div, span, style, script, class 속성
- FAQ는 본문에 포함하지 않음 (BlogLayout이 자동 처리)

결과를 /tmp/blog-content.html에 저장하세요. (순수 HTML 본문만, head/body 태그 없이)
```

---

## Stage 3: 콘텐츠 품질 검증

Orchestrator가 직접 수행한다. Bash로 아래 항목을 검증:

### 3-1. 키워드 밀도 체크
```bash
KEYWORD=$(python3 -c "import json; print(json.load(open('/tmp/blog-outline.json'))['keyword'])")
COUNT=$(grep -oi "$KEYWORD" /tmp/blog-content.html | wc -l)
TOTAL=$(sed 's/<[^>]*>//g' /tmp/blog-content.html | wc -m)
echo "키워드: $KEYWORD / 출현: ${COUNT}회 / 글자수: $TOTAL"
```

### 3-2. H2 목차 일치 검증
아웃라인의 sections[].id와 HTML의 h2 id가 모두 매칭되는지 확인.

### 3-3. 내부 링크 URL 검증
HTML에서 href로 참조하는 내부 URL이 실제 존재하는 페이지인지 확인.

### 3-4. 서드파티 API명 노출 스캔
```bash
grep -iE "(rapidapi|vebapi|moz\.com/api|ahrefs\.com/api|majestic|semrush)" /tmp/blog-content.html
```
결과가 있으면 Stage 2로 돌아가 수정 요청.

### 3-5. HTML 태그 유효성
닫히지 않은 태그, 잘못된 중첩 확인.

**문제 발견 시**: 구체적 피드백과 함께 Stage 2 재실행. 최대 2회 반복.

---

## Stage 4: DB 저장

`blog-builder` 서브에이전트를 호출한다.

프롬프트:
```
/tmp/blog-outline.json과 /tmp/blog-content.html을 읽어서
/tmp/blog-post.json에 posts 테이블 형식의 JSON을 생성하세요.
규칙은 /mnt/d/Documents/domain_platform/.claude/agents/blog-builder.md를 따르세요.
```

blog-builder가 /tmp/blog-post.json을 생성하면, mcp__supabase__execute_sql로 직접 INSERT:

```sql
INSERT INTO posts (title, slug, excerpt, content, category, tags, status, read_time, faqs, author, created_at, updated_at)
VALUES (
  '{title}', '{slug}', '{excerpt}', '{content}', '{category}',
  ARRAY['{tag1}', '{tag2}'],
  'draft', '{read_time}',
  '{faqs_json}'::jsonb,
  '도메인체커', NOW(), NOW()
);
```

---

## Stage 5: 완료 보고

```
## 블로그 작성 완료

| 항목 | 내용 |
|------|------|
| 제목 | ... |
| URL | /blog/{slug} |
| 핵심 키워드 | ... |
| 분량 | N자 / N분 |
| FAQ | N개 |
| 카테고리 | ... |
| 상태 | 초안 (draft) |

📌 어드민 페이지(/admin → 블로그 관리 탭)에서 확인 후 발행하세요.
```
