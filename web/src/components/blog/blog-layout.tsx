import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { articles } from "@/lib/blog";

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
  cta: {
    title: string;
    description: string;
    buttonText: string;
    href: string;
  };
  children: React.ReactNode;
}

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
  /* ── 관련 글: 같은 카테고리 우선, 최대 3개 ── */
  const currentCategory = articles.find((a) => a.slug === slug)?.category;
  const sameCategory = articles.filter(
    (a) => a.slug !== slug && a.category === currentCategory,
  );
  const otherCategory = articles.filter(
    (a) => a.slug !== slug && a.category !== currentCategory,
  );
  const relatedArticles = [...sameCategory, ...otherCategory].slice(0, 3);

  /* ── 최신 글: 관련글에 없는 나머지, 최대 3개 ── */
  const relatedSlugs = new Set(relatedArticles.map((a) => a.slug));
  const latestArticles = articles
    .filter((a) => a.slug !== slug && !relatedSlugs.has(a.slug))
    .slice(0, 3);

  /* ── 한국어 날짜 포맷 ── */
  const d = new Date(date);
  const dateKR = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;

  /* ── JSON-LD ── */
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: articles.find((a) => a.slug === slug)?.description || "",
      author: { "@type": "Organization", name: "도메인체커" },
      publisher: {
        "@type": "Organization",
        name: "도메인체커",
        logo: {
          "@type": "ImageObject",
          url: "https://domainchecker.co.kr/icon.svg",
        },
      },
      mainEntityOfPage: `https://domainchecker.co.kr/blog/${slug}`,
      datePublished: date,
      dateModified: date,
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
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 뒤로가기 */}
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> 블로그 목록
      </Link>

      {/* 제목 */}
      <h1 className="text-3xl font-bold tracking-tight leading-tight">
        {title}
      </h1>

      {/* 메타 */}
      <div className="blog-meta">
        <time dateTime={date}>{dateKR}</time>
        <span aria-hidden="true">·</span>
        <span>{readTime} 읽기</span>
      </div>

      {/* 목차 */}
      <nav className="blog-toc">
        <p className="blog-toc-title">목차</p>
        <ol className="space-y-1.5">
          {toc.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.title}</a>
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

      {/* 관련 글 */}
      <div className="blog-related">
        <h3 className="text-lg font-semibold mb-4">관련 글</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {relatedArticles.map((a) => (
            <Link
              key={a.slug}
              href={`/blog/${a.slug}`}
              className="blog-related-card"
            >
              <p className="font-medium text-sm">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {a.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* 최신 글 (관련 글과 겹치지 않는 나머지) */}
      {latestArticles.length > 0 && (
        <div className="blog-related">
          <h3 className="text-lg font-semibold mb-4">최신 글</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {latestArticles.map((a) => (
              <Link
                key={a.slug}
                href={`/blog/${a.slug}`}
                className="blog-related-card"
              >
                <p className="font-medium text-sm">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {a.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="blog-cta">
        <p className="text-lg font-semibold">{cta.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{cta.description}</p>
        <Link
          href={cta.href}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {cta.buttonText}
        </Link>
      </div>
    </article>
  );
}
