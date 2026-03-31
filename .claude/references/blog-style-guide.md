# 블로그 스타일 가이드

> 모든 블로그 글은 이 가이드를 따라야 합니다.
> 에이전트(seo-blog-writer, blog-builder)가 참조하는 문서입니다.

---

## 페이지 구조 (위에서 아래 순서)

```
1. <article> 래퍼 (max-w-3xl mx-auto px-4 py-16)
2. JSON-LD (Article + FAQPage)
3. 뒤로가기 링크 (← 블로그 목록)
4. H1 제목
5. blog-meta (날짜 · 읽기 시간)
6. blog-toc (목차 — 모든 h2 앵커)
7. blog-prose (본문)
   ├─ section > h2#id + 내용
   ├─ section > h2#id + 내용
   ├─ ...
   └─ section > h2#faq + FAQ (details/summary)
8. blog-related (관련 글 2열 그리드)
9. blog-cta (CTA 카드)
```

---

## CSS 클래스 (필수 사용)

| 요소 | CSS 클래스 | 설명 |
|------|-----------|------|
| 본문 래퍼 | `blog-prose mt-10` | 자동 타이포그래피 |
| 목차 | `blog-toc` + `blog-toc-title` | 둥근 박스 |
| 메타 | `blog-meta` | 날짜/시간 flex |
| CTA | `blog-cta` | 그라데이션 배경 |
| 관련글 래퍼 | `blog-related` | 상단 보더 |
| 관련글 카드 | `blog-related-card` | hover 효과 |

### blog-prose 내부 자동 스타일

| 태그 | 자동 스타일 |
|------|-----------|
| `h2` | 하단 primary 보더, mt-3rem, font-weight 800 |
| `h3` | 좌측 primary 바 (::before), mt-2rem |
| `p` | line-height 1.85 |
| `strong` | foreground 색상 |
| `a` | primary 색상, hover underline |
| `ul/ol` | disc/decimal, primary 마커 |
| `table` | border-collapse, th 배경 |
| `blockquote` | 좌측 보더, 배경, italic |

---

## 금지 사항

1. **인라인 CSS로 blog.css와 동일한 스타일 작성 금지**
   ```tsx
   // ❌ 금지
   <div className="mt-8 space-y-6 text-base leading-relaxed">

   // ✅ 올바름
   <div className="blog-prose mt-10">
   ```

2. **"use client" 사용 금지** — 블로그는 Server Component

3. **서드파티 API 이름 노출 금지** — RapidAPI, VebAPI, Moz, Ahrefs 등 도구명은 일반명으로 표현
   ```
   // ❌ "RapidAPI의 domain-metrics-check를 통해"
   // ✅ "도메인체커의 분석 도구를 통해"
   ```

4. **키워드 스터핑 금지** — 같은 키워드 연속 2문장 반복 불가

5. **과장 표현 금지** — "100% 보장", "무조건", "확실히" 등

---

## 관련 글 패턴

```tsx
// lib/blog.ts에서 자동 생성
const currentSlug = "new-post";
const relatedArticles = articles
  .filter((a) => a.slug !== currentSlug)
  .slice(0, 3);

// JSX
<div className="blog-related">
  <h3 className="text-lg font-semibold mb-4">관련 글</h3>
  <div className="grid gap-3 sm:grid-cols-2">
    {relatedArticles.map((a) => (
      <Link key={a.slug} href={`/blog/${a.slug}`} className="blog-related-card">
        <p className="font-medium text-sm">{a.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
      </Link>
    ))}
  </div>
</div>
```

---

## JSON-LD 패턴

```tsx
// Article + FAQPage 이중 구조
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "제목",
        description: "설명",
        author: { "@type": "Organization", name: "도메인체커" },
        publisher: {
          "@type": "Organization",
          name: "도메인체커",
          logo: { "@type": "ImageObject", url: "https://domainchecker.co.kr/icon.svg" },
        },
        mainEntityOfPage: "https://domainchecker.co.kr/blog/{slug}",
        datePublished: "YYYY-MM-DD",
        dateModified: "YYYY-MM-DD",
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ]),
  }}
/>
```

---

## FAQ 패턴

```tsx
<section>
  <h2 id="faq">자주 묻는 질문</h2>
  <div className="divide-y rounded-lg border mt-4">
    {faqs.map((item, i) => (
      <details key={i} className="group">
        <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium hover:bg-muted/50">
          {item.q}
        </summary>
        <div className="px-5 pb-4 text-sm text-muted-foreground">{item.a}</div>
      </details>
    ))}
  </div>
</section>
```

---

## CTA 패턴

```tsx
<div className="blog-cta">
  <p className="text-lg font-semibold">{CTA 제목}</p>
  <p className="mt-1 text-sm text-muted-foreground">{CTA 설명}</p>
  <Link
    href="{관련 도구 URL}"
    className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
  >
    {CTA 버튼 텍스트}
  </Link>
</div>
```

---

## lib/blog.ts 등록

새 글을 배열 **맨 위**에 추가 (최신순):

```typescript
{
  slug: "new-post-slug",
  title: "새 글 제목",
  description: "150자 이내 설명",
  category: "SEO 분석" | "도메인 투자" | "SEO 기초",
  date: "YYYY-MM-DD",
  readTime: "N분",
},
```

이것만 하면 `/blog` 목록 + `sitemap.xml`에 자동 반영.
