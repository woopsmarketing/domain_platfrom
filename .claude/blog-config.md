# blog-config.md — 도메인체커 블로그 중앙 설정

> 모든 블로그 에이전트가 이 파일을 참조한다. 변경 시 전체 파이프라인에 반영됨.

---

## 1. 사이트 정보

| 항목 | 값 |
|------|-----|
| 사이트명 | 도메인체커 |
| 도메인 | https://domainchecker.co.kr |
| 블로그 URL 패턴 | https://domainchecker.co.kr/blog/{slug} |
| DB | Supabase `posts` 테이블 |
| 카테고리 | `"SEO 분석"` \| `"도메인 투자"` \| `"SEO 기초"` |
| author | `도메인체커` (고정) |
| 언어 | 한국어 (기술 용어만 영문 허용) |

---

## 2. 내부 도구 링크

| 도구 | URL | 용도 |
|------|-----|------|
| 도메인 분석 | `/` | DA/DR/TF 종합 분석 |
| 도메인 가용성 | `/tools/domain-availability` | 도메인 등록 가능 여부 |
| 도메인 생성기 | `/tools/domain-generator` | AI 도메인 이름 생성 |
| DNS 체크 | `/tools/dns-checker` | DNS 레코드 조회 |
| WHOIS 조회 | `/tools/whois-lookup` | 도메인 등록 정보 |
| 도메인 가치 | `/tools/domain-value` | 도메인 가치 평가 |
| 도메인 비교 | `/tools/domain-compare` | 도메인 지표 비교 |
| 벌크 분석 | `/tools/bulk-analysis` | 대량 도메인 분석 |
| 백링크 체크 | `/tools/backlink-checker` | 백링크 확인 |
| SERP 체크 | `/tools/serp-checker` | 검색 순위 확인 |
| 만료일 확인 | `/tools/domain-expiry` | 도메인 만료일 |
| SSL 체크 | `/tools/ssl-checker` | SSL 인증서 확인 |
| HTTP 상태 | `/tools/http-status` | HTTP 상태코드 확인 |

---

## 3. 내부 서비스 링크

| 서비스 | URL |
|--------|-----|
| 프리미엄 도메인 | `/marketplace` |
| 경매 대행 문의 | `/inquiry` |

---

## 4. 권위 외부 도메인 시드

> 외부 링크는 아래 목록에서만 선택한다. 목록에 없는 도메인은 사용 금지.

| 분야 | 도메인 | 설명 |
|------|--------|------|
| Google 공식 | `developers.google.com/search` | 검색 센터 |
| Moz | `moz.com` | SEO 가이드, DA/PA |
| Ahrefs | `ahrefs.com/blog` | 백링크/키워드 리서치 |
| Backlinko | `backlinko.com` | 실전 SEO 전략 |
| Semrush | `semrush.com/blog` | SEO/마케팅 리서치 |
| Search Engine Journal | `searchenginejournal.com` | SEO 뉴스 |
| web.dev | `web.dev` | 웹 성능, Core Web Vitals |
| Schema.org | `schema.org` | 구조화 데이터 |

---

## 5. 글 작성 스타일 가이드

### 5-1. 톤 & 어조
- **설명형 존댓말** ("~합니다", "~입니다")
- 친절하지만 장황하지 않음
- 전문가의 조언 톤 — 실무 경험이 묻어나는 구체적 서술
- 금지: 반말, 감탄사 남발, 이모지, "충격", "역대급" 등 클릭베이트

### 5-2. 통계/수치 인용 규칙
- 출처를 반드시 명시 (연도 + 기관/사이트명)
- 예: "Moz(2024)에 따르면 DA 40 이상 도메인의 상위 노출 확률은..."
- 근거 없는 수치 금지 — 확인 불가 시 "일반적으로", "경험상" 등 헤징 표현 사용
- 헤징 허용: "일반적으로", "보통", "경우에 따라", "실무에서는", "직접 확인이 필요합니다"
- 헤징 금지: "무조건", "100%", "확실히", "반드시 효과가 있습니다"

### 5-3. 본문 구조 규칙
- 문단: 2~4문장, 한 아이디어
- 첫 문단: 핵심 질문에 2~4문장 내 답변 (장황한 서론 금지)
- H2: 5~8개, 반드시 `id` 속성 (영문 kebab-case)
- H3: 필요 시 H2 하위에 배치
- **H4 사용 금지**: 소제목은 H2, H3만 사용. 박스 내 제목은 `<strong>` 사용 (접근성 제목 순서 위반 방지)
- 비교표(`<table>`) 최소 1개
- 체크리스트 또는 단계별 리스트(`<ol>` / `<ul>`) 최소 1개
- 결론: 핵심 요약 3~5개 bullet + 다음 행동 제안

### 5-4. 내부 링크 규칙
- **최소 3개, 최대 8개**
- 도구 링크: 자연스러운 문맥에서 "도메인체커의 [도구명]으로 직접 확인해 보세요" 형태
- 블로그 링크: 관련 개념 설명 시 "자세한 내용은 [글 제목]에서 확인할 수 있습니다" 형태
- 앵커 텍스트에 키워드 포함 권장
- 같은 URL을 2회 이상 링크하지 않음

### 5-5. 외부 링크 규칙
- **최대 3개** (0개도 허용)
- 섹션 4의 권위 도메인 목록에서만 선택
- `rel="noopener noreferrer"` `target="_blank"` 필수
- 앵커: 출처명 + 간단 설명 (예: "Moz의 DA 가이드")

### 5-6. CTA 규칙
- 글당 CTA 1~2개
- 가장 관련 높은 도구/서비스 연결
- 어조: 자연스러운 제안 ("~해 보세요") — 강요 금지
- `blog-inline-cta` 컴포넌트 사용

### 5-7. FAQ 규칙
- 7~10개
- People Also Ask 기반 실제 사용자 질문
- 답변: 2~3문장 (간결)
- 본문 반복이 아닌 보충 정보
- FAQ는 HTML 본문에 포함하지 않음 (별도 JSON으로 출력, BlogLayout이 자동 렌더링)

---

## 6. HTML 리치 컴포넌트 패턴 (14종)

> `blog-content` 클래스 내부에서 사용. 본문 HTML에 아래 패턴을 적극 활용한다.

### 6-1. `blog-box-summary` — 핵심 요약 박스
```html
<div class="blog-box-summary">
  <strong>핵심 요약</strong>
  <p>이 글의 핵심 내용을 2~3문장으로 요약합니다.</p>
</div>
```

### 6-2. `blog-box-tip` — 팁 박스
```html
<div class="blog-box-tip">
  <strong>실무 팁</strong>
  <p>실전에서 유용한 팁을 안내합니다.</p>
</div>
```

### 6-3. `blog-box-info` — 정보 박스
```html
<div class="blog-box-info">
  <strong>참고</strong>
  <p>추가 배경 정보나 용어 설명을 제공합니다.</p>
</div>
```

### 6-4. `blog-box-warning` — 주의 박스
```html
<div class="blog-box-warning">
  <strong>주의</strong>
  <p>흔한 실수나 주의사항을 경고합니다.</p>
</div>
```

### 6-5. `blog-inline-cta` — 인라인 CTA
```html
<div class="blog-inline-cta">
  <strong>직접 확인해 보세요</strong>
  <p>도메인체커에서 무료로 DA/DR 지수를 분석할 수 있습니다.</p>
  <a href="/">도메인 분석하기</a>
</div>
```

### 6-6. `blog-summary-card` — 요약 카드
```html
<div class="blog-summary-card">
  <strong>도메인 가치 평가 요약</strong>
  <ul>
    <li><strong>DA:</strong> 도메인 권위 점수</li>
    <li><strong>DR:</strong> 도메인 등급</li>
    <li><strong>TF:</strong> 트러스트 플로우</li>
  </ul>
</div>
```

### 6-7. `blog-figure` — 이미지 + 캡션
```html
<figure class="blog-figure">
  <img src="이미지URL" alt="설명적 대체 텍스트" width="800" height="450" loading="lazy" />
  <figcaption>이미지 설명 캡션</figcaption>
</figure>
```

### 6-8. `details` — 아코디언 (접기/펼치기)
```html
<details>
  <summary>더 자세한 설명 보기</summary>
  <p>접혀 있다가 클릭하면 펼쳐지는 보충 내용입니다.</p>
</details>
```

### 6-9. `blog-stats-grid` — 통계 그리드
```html
<div class="blog-stats-grid">
  <div><strong>50+</strong><span>DA 기준</span></div>
  <div><strong>1,000+</strong><span>분석 도메인</span></div>
  <div><strong>7일</strong><span>캐시 주기</span></div>
</div>
```

### 6-10. `blog-checklist` — 체크리스트
```html
<ul class="blog-checklist">
  <li>DA 30 이상인지 확인</li>
  <li>스팸 스코어 10% 미만인지 확인</li>
  <li>백링크 품질 점검</li>
</ul>
```

### 6-11. `blog-comparison` — 비교 테이블
```html
<div class="blog-comparison">
  <table>
    <thead><tr><th>항목</th><th>옵션 A</th><th>옵션 B</th></tr></thead>
    <tbody>
      <tr><td>가격</td><td>무료</td><td>유료</td></tr>
      <tr><td>정확도</td><td>높음</td><td>매우 높음</td></tr>
    </tbody>
  </table>
</div>
```

### 6-12. `blog-external-link` — 외부 링크 (권위 출처)
```html
<a class="blog-external-link" href="https://moz.com/learn/seo/domain-authority" target="_blank" rel="noopener noreferrer">
  Moz — Domain Authority 가이드
</a>
```

### 6-13. `blog-content h2` — H2 스타일링
```html
<h2 id="what-is-da">DA(Domain Authority)란?</h2>
```
- 반드시 `id` 속성 포함 (영문 kebab-case)
- BlogLayout이 id를 읽어 자동 목차(TOC) 생성

### 6-14. `blog-content h3` — H3 스타일링
```html
<h3>DA 점수 해석 방법</h3>
```
- id 불필요 (TOC에 포함되지 않음)
- H2 하위에만 배치

---

## 7. SEO 규칙

### 7-1. title
- **30~40자** (한국어 기준)
- 핵심 키워드를 앞쪽에 배치
- 연도 또는 구체적 수치 포함 권장 (예: "2025 도메인 가치 평가 방법 5가지")

### 7-2. description (excerpt)
- **60~80자**
- 검색 결과에서 클릭을 유도하는 요약
- 핵심 키워드 1회 포함

### 7-3. slug
- 영문 kebab-case
- 2~5단어
- 핵심 키워드 반영 (예: `domain-value-check`)

### 7-4. tags
- 5~8개
- 핵심 + 서브 키워드에서 선정
- 한국어

### 7-5. excerpt
- description과 동일하거나 약간 확장
- 150자 이내

---

## 8. 구조화 데이터

### 8-1. Article (BlogLayout 자동 적용)
```json
{
  "@type": "Article",
  "headline": "title",
  "description": "excerpt",
  "author": { "@type": "Organization", "name": "도메인체커" },
  "publisher": { "@type": "Organization", "name": "도메인체커" },
  "datePublished": "published_at",
  "dateModified": "updated_at"
}
```

### 8-2. FAQPage (BlogLayout 자동 적용)
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "질문",
      "acceptedAnswer": { "@type": "Answer", "text": "답변" }
    }
  ]
}
```

### 8-3. BreadcrumbList (BlogLayout 자동 적용)
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "name": "홈", "item": "https://domainchecker.co.kr" },
    { "name": "블로그", "item": "https://domainchecker.co.kr/blog" },
    { "name": "{title}", "item": "https://domainchecker.co.kr/blog/{slug}" }
  ]
}
```

### 8-4. HowTo (단계별 가이드 글에만 적용)
- `seo-packager` 에이전트가 판단하여 포함 여부 결정
- 방법/가이드형 글에서 `<ol>` 기반 단계가 3개 이상이면 추가

---

## 9. 이미지 생성 규칙

### 9-1. 기본 설정
- 모델: GPT Image 1 (gpt-image-1)
- 크기: 1024x1024
- 품질: medium
- 저장소: Supabase Storage `blog-images` 버킷
- 형식: PNG

### 9-2. 브랜드 컬러
- 메인 파랑: `#2563eb`
- 보조 초록: `#10b981`
- 배경: `#f8fafc`
- 텍스트: `#1e293b`

### 9-3. 커버 이미지 프롬프트 템플릿
```
Isometric 3D illustration for a blog post about "{주제}".
Style: Clean, modern, minimal isometric design.
Color palette: Primary blue #2563eb, accent green #10b981, light background #f8fafc.
Elements: {주제 관련 오브젝트 3~4개}.
No text, no watermarks, no people.
Aspect ratio: 1:1, 1024x1024px.
```

### 9-4. 섹션 이미지 프롬프트 템플릿
```
Flat vector illustration explaining "{섹션 주제}".
Style: Simple, clean flat design with subtle gradients.
Color palette: Blue #2563eb, green #10b981, background #f8fafc.
Elements: {관련 아이콘/다이어그램}.
No text, no watermarks.
Aspect ratio: 1:1, 1024x1024px.
```

### 9-5. 이미지 실패 처리
- API 호출 실패 시 빈 객체(`{}`)로 진행
- 본문에서 `blog-figure` 태그 생략
- 커버 이미지 없이도 발행 가능

---

## 10. 금지사항

- **키워드 스터핑**: 키워드 밀도 2% 초과 금지
- **콘텐츠 복사**: 타 사이트 문장 그대로 사용 금지
- **근거 없는 통계**: 출처 없는 수치 인용 금지
- **외부 링크 남용**: 3개 초과 금지, 권위 도메인 목록 외 금지
- **스팸 사이트 링크**: 저품질/무관한 외부 사이트 링크 금지
- **alt 누락**: 모든 `<img>`에 설명적 alt 텍스트 필수
- **서드파티 API 노출**: RapidAPI, VebAPI, Moz API 등 구현 세부사항 언급 금지
- **이모지 사용**: 본문, 제목, FAQ에 이모지 사용 금지
- **H4 태그 사용 금지**: H2·H3·strong만 허용 (접근성 제목 순서 위반 방지)

---

## 11. Posts 테이블 스키마

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  status TEXT DEFAULT 'draft',
  tags TEXT[],
  cover_image_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  read_time TEXT,
  author TEXT DEFAULT '도메인체커',
  faqs JSONB
);
```

### 필드 설명

| 필드 | 타입 | 규칙 |
|------|------|------|
| `slug` | TEXT UNIQUE | 영문 kebab-case, 2~5단어 |
| `title` | TEXT | 30~40자 한국어 |
| `excerpt` | TEXT | 60~80자, 메타 description 겸용 |
| `content` | TEXT | 리치 HTML 본문 |
| `category` | TEXT | "SEO 분석" \| "도메인 투자" \| "SEO 기초" |
| `status` | TEXT | 항상 `draft`로 저장, 관리자가 수동 발행 |
| `tags` | TEXT[] | 5~8개 한국어 태그 |
| `cover_image_url` | TEXT | Supabase Storage URL (없으면 NULL) |
| `published_at` | TIMESTAMPTZ | draft 시 NULL |
| `read_time` | TEXT | "N분" 형식 |
| `author` | TEXT | 항상 `도메인체커` |
| `faqs` | JSONB | `[{"q": "질문", "a": "답변"}, ...]` |
