import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight, Home } from "lucide-react";
import { articles, CATEGORY_COLORS } from "@/lib/blog";

interface TocItem {
  id: string;
  title: string;
}

interface FaqItem {
  q: string;
  a: string;
}

interface BlogLayoutProps {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  toc: TocItem[];
  faqs: FaqItem[];
  cta?: {
    title: string;
    description: string;
    buttonText: string;
    href: string;
  };
  children: React.ReactNode;
}

/* ── 기본 CTA (모든 블로그 글 공통) ── */
const DEFAULT_CTA = {
  title: "도메인의 SEO 점수를 확인해 보세요",
  description:
    "도메인을 입력하면 DA·DR·TF·백링크·스팸 점수까지 한눈에 분석됩니다. 회원가입 없이 완전 무료.",
  buttonText: "무료로 도메인 분석하기",
  href: "/",
};

export function BlogLayout({
  slug,
  title,
  date,
  readTime,
  toc,
  faqs,
  cta,
  children,
}: BlogLayoutProps) {
  const finalCta = cta ?? DEFAULT_CTA;
  const currentArticle = articles.find((a) => a.slug === slug);
  const currentCategory = currentArticle?.category;
  const currentTags = currentArticle?.tags ?? [];

  /* ── 관련 글: 같은 카테고리 우선, 최대 3개 ── */
  const sameCategory = articles.filter(
    (a) => a.slug !== slug && a.category === currentCategory,
  );
  const otherCategory = articles.filter(
    (a) => a.slug !== slug && a.category !== currentCategory,
  );
  const relatedArticles = [...sameCategory, ...otherCategory].slice(0, 3);

  /* ── 최신 글: 단순 최신 3개 (현재 글 제외) ── */
  const latestArticles = articles.filter((a) => a.slug !== slug).slice(0, 3);

  /* ── 이전글/다음글 ── */
  const currentIndex = articles.findIndex((a) => a.slug === slug);
  const prevArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;
  const nextArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;

  /* ── 한국어 날짜 포맷 ── */
  const d = new Date(date);
  const dateKR = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;

  /* ── Canonical URL ── */
  const canonicalUrl = `https://domainchecker.co.kr/blog/${slug}`;

  /* ── JSON-LD (Article + FAQPage + BreadcrumbList) ── */
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: currentArticle?.description || "",
      author: { "@type": "Organization", name: "도메인체커" },
      publisher: {
        "@type": "Organization",
        name: "도메인체커",
        logo: {
          "@type": "ImageObject",
          url: "https://domainchecker.co.kr/icon.svg",
        },
      },
      mainEntityOfPage: canonicalUrl,
      datePublished: date,
      dateModified: date,
      ...(currentTags.length > 0 && { keywords: currentTags.join(", ") }),
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
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: "https://domainchecker.co.kr" },
        { "@type": "ListItem", position: 2, name: "블로그", item: "https://domainchecker.co.kr/blog" },
        { "@type": "ListItem", position: 3, name: title, item: canonicalUrl },
      ],
    },
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 브레드크럼 UI */}
      <nav aria-label="브레드크럼" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          <Home className="h-3.5 w-3.5" />
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/blog" className="hover:text-foreground transition-colors">
          블로그
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{title}</span>
      </nav>

      {/* 제목 */}
      <h1 className="text-3xl font-bold tracking-tight leading-tight">{title}</h1>

      {/* 메타 (날짜 · 읽기 시간 · 카테고리) */}
      <div className="blog-meta mt-3">
        <time dateTime={date}>{dateKR}</time>
        <span aria-hidden="true">·</span>
        <span>{readTime} 읽기</span>
        {currentCategory && (
          <>
            <span aria-hidden="true">·</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[currentCategory] || ""}`}>
              {currentCategory}
            </span>
          </>
        )}
      </div>

      {/* 태그 칩 */}
      {currentTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {currentTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 목차 */}
      <nav className="blog-toc">
        <p className="blog-toc-title">목차</p>
        <ol className="space-y-1.5">
          {toc.map((item, i) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>
                <span className="mr-2 text-primary font-medium">{i + 1}.</span>
                {item.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* 본문 */}
      <div className="blog-prose mt-10">
        {children}

        {/* FAQ 섹션 */}
        {faqs.length > 0 && (
          <section>
            <h2 id="faq">자주 묻는 질문</h2>
            <div className="divide-y rounded-lg border mt-4">
              {faqs.map((item, i) => (
                <details key={i} className="group">
                  <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium hover:bg-muted/50">
                    {item.q}
                  </summary>
                  <div className="px-5 pb-4 text-sm text-muted-foreground">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 저자 정보 (AuthorBox) */}
      <div className="mt-12 flex items-center gap-4 rounded-xl border border-border/60 bg-card p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
          DC
        </div>
        <div>
          <p className="font-semibold text-sm">도메인체커 팀</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            도메인 분석과 SEO에 대한 실전 가이드를 제공합니다. 도메인 투자, 백링크 분석, 검색 순위 최적화에 대한 최신 정보를 공유합니다.
          </p>
        </div>
      </div>

      {/* 관련 글 */}
      {relatedArticles.length > 0 && (
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
      )}

      {/* 최신 글 */}
      {latestArticles.length > 0 && (
        <div className="blog-related">
          <h3 className="text-lg font-semibold mb-4">최신 글</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {latestArticles.map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} className="blog-related-card">
                <p className="font-medium text-sm">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 이전글 / 다음글 네비게이션 */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        {prevArticle ? (
          <Link
            href={`/blog/${prevArticle.slug}`}
            className="group flex flex-col rounded-lg border p-4 transition-colors hover:border-primary/50"
          >
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowLeft className="h-3 w-3" /> 이전 글
            </span>
            <span className="mt-1 text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
              {prevArticle.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {nextArticle ? (
          <Link
            href={`/blog/${nextArticle.slug}`}
            className="group flex flex-col items-end rounded-lg border p-4 transition-colors hover:border-primary/50 text-right"
          >
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              다음 글 <ArrowRight className="h-3 w-3" />
            </span>
            <span className="mt-1 text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
              {nextArticle.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* CTA — 기본값 고정, 필요시만 override */}
      <div className="blog-cta">
        <p className="text-lg font-semibold">{finalCta.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{finalCta.description}</p>
        <Link
          href={finalCta.href}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {finalCta.buttonText}
        </Link>
      </div>
    </article>
  );
}
