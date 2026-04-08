import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight, Home } from "lucide-react";
import type { Post } from "@/lib/db/posts";
import { ReadingProgress } from "./reading-progress";

const CATEGORY_COLORS: Record<string, string> = {
  "SEO 분석": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "도메인 투자": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "SEO 기초": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

const DEFAULT_CTA = {
  title: "당신이 망설이는 사이, 누군가는 이 도메인을 가져갑니다",
  description:
    "DA 50+, 백링크 수천 개 — 이런 프리미엄 도메인은 하루에도 수십 개씩 팔립니다. 지금 확인하지 않으면 내일은 이미 늦습니다.",
  buttonText: "프리미엄 도메인 보러 가기",
  href: "/marketplace",
};

interface FaqItem {
  q: string;
  a: string;
}

interface BlogLayoutProps {
  post: Post;
  faqs: FaqItem[];
  relatedPosts: Pick<Post, "title" | "slug" | "excerpt">[];
  latestPosts?: Pick<Post, "title" | "slug" | "excerpt">[];
  prevPost: { title: string; slug: string } | null;
  nextPost: { title: string; slug: string } | null;
}

export function BlogLayout({
  post,
  faqs,
  relatedPosts,
  prevPost,
  nextPost,
}: BlogLayoutProps) {
  const finalCta = DEFAULT_CTA;
  const d = new Date(post.published_at);
  const dateKR = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  const canonicalUrl = `https://domainchecker.co.kr/blog/${post.slug}`;

  /* 최종수정일 표시: updated_at이 published_at보다 1일 이상 차이나면 표시 */
  let updatedDateKR: string | null = null;
  if (post.updated_at) {
    const pubDate = new Date(post.published_at).getTime();
    const updDate = new Date(post.updated_at).getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (updDate - pubDate >= oneDayMs) {
      const ud = new Date(post.updated_at);
      updatedDateKR = `${ud.getFullYear()}년 ${ud.getMonth() + 1}월 ${ud.getDate()}일`;
    }
  }

  /* TOC: HTML에서 h2 추출 */
  const tocItems = (post.content.match(/<h2[^>]*id="([^"]*)"[^>]*>([^<]*)<\/h2>/g) || []).map((match) => {
    const idMatch = match.match(/id="([^"]*)"/);
    const textMatch = match.match(/>([^<]*)<\/h2>/);
    return {
      id: idMatch?.[1] || "",
      title: textMatch?.[1] || "",
    };
  }).filter(item => item.id && item.title);
  if (faqs.length > 0) {
    tocItems.push({ id: "faq", title: "자주 묻는 질문" });
  }

  /* JSON-LD */
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      ...(post.cover_image_url && { image: post.cover_image_url }),
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
      datePublished: post.published_at,
      dateModified: post.updated_at || post.published_at,
      ...(post.tags.length > 0 && { keywords: post.tags.join(", ") }),
    },
    ...(faqs.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]
      : []),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: "https://domainchecker.co.kr" },
        { "@type": "ListItem", position: 2, name: "블로그", item: "https://domainchecker.co.kr/blog" },
        { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
      ],
    },
    // TODO: HowTo JSON-LD — Post 인터페이스에 howToSteps 필드 추가 후 구현
    // post.howToSteps가 있으면 HowTo schema 추가 예정
  ];

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 2컬럼 레이아웃: 본문 + 사이드바 TOC */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex gap-10">
          {/* 본문 영역 */}
          <article className="min-w-0 flex-1 max-w-3xl">
            {/* 브레드크럼 */}
            <nav
              aria-label="브레드크럼"
              className="mb-6 flex items-center gap-1 text-sm text-muted-foreground"
            >
              <Link href="/" className="hover:text-foreground transition-colors">
                <Home className="h-3.5 w-3.5" />
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/blog" className="hover:text-foreground transition-colors">
                블로그
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground truncate max-w-[200px] sm:max-w-none">
                {post.title}
              </span>
            </nav>

            {/* 제목 */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              {post.title}
            </h1>

            {/* 메타 */}
            <div className="blog-meta mt-3">
              <time dateTime={post.published_at}>{dateKR}</time>
              {updatedDateKR && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-xs text-muted-foreground/70">수정: {updatedDateKR}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>{post.read_time} 읽기</span>
              {post.category && (
                <>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[post.category] || ""}`}
                  >
                    {post.category}
                  </span>
                </>
              )}
            </div>

            {/* 태그 */}
            {post.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 커버 이미지 */}
            {post.cover_image_url && (
              <div className="mt-6 overflow-hidden rounded-xl">
                <div className="relative aspect-[2/1]">
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="rounded-xl object-cover"
                    priority
                    fetchPriority="high"
                  />
                </div>
              </div>
            )}

            {/* 모바일 목차 (lg 이하에서만 표시) */}
            {tocItems.length > 0 && (
              <nav className="blog-toc lg:hidden">
                <p className="blog-toc-title">목차</p>
                <ol className="space-y-1.5">
                  {tocItems.map((item, i) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`}>
                        <span className="mr-2 text-primary font-medium">{i + 1}.</span>
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* 본문 */}
            <div className="blog-prose mt-10">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />

              {/* FAQ */}
              {faqs.length > 0 && (
                <section>
                  <h2 id="faq">자주 묻는 질문</h2>
                  <div className="mt-4 space-y-2">
                    {faqs.map((item, i) => (
                      <details key={i} className="group">
                        <summary className="cursor-pointer text-sm font-medium">
                          {item.q}
                        </summary>
                        <div className="text-sm">
                          {item.a}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* CTA */}
            <div className="blog-cta">
              <p className="text-lg font-semibold">{finalCta.title}</p>
              <p className="mt-2 text-sm">{finalCta.description}</p>
              <Link
                href={finalCta.href}
                className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100 hover:shadow-lg"
              >
                {finalCta.buttonText} →
              </Link>
            </div>

            {/* 저자 */}
            <div className="mt-12 flex items-center gap-4 rounded-xl border border-border/60 bg-card p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                DC
              </div>
              <div>
                <p className="font-semibold text-sm">도메인체커 팀</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  도메인 분석과 SEO에 대한 실전 가이드를 제공합니다.
                </p>
              </div>
            </div>

            {/* 관련 글 */}
            {relatedPosts.length > 0 && (
              <div className="blog-related">
                <h3 className="text-lg font-semibold mb-4">관련 글</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {relatedPosts.map((a) => (
                    <Link key={a.slug} href={`/blog/${a.slug}`} className="blog-related-card">
                      <p className="font-medium text-sm">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{a.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 이전/다음글 */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="group flex flex-col rounded-lg border p-4 transition-colors hover:border-primary/50"
                >
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ArrowLeft className="h-3 w-3" /> 이전 글
                  </span>
                  <span className="mt-1 text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                    {prevPost.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {nextPost ? (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="group flex flex-col items-end rounded-lg border p-4 transition-colors hover:border-primary/50 text-right"
                >
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    다음 글 <ArrowRight className="h-3 w-3" />
                  </span>
                  <span className="mt-1 text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                    {nextPost.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </article>

          {/* 사이드바 TOC — 데스크탑에서만 표시 */}
          {tocItems.length > 0 && (
            <aside className="hidden lg:block w-64 shrink-0">
              <nav className="sticky top-20 rounded-xl border border-border/60 bg-card p-5">
                <p className="mb-4 text-sm font-bold text-foreground">
                  목차
                </p>
                <ol className="space-y-3 border-l-2 border-primary/20 pl-4">
                  {tocItems.map((item, i) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block text-sm text-muted-foreground transition-colors hover:text-primary leading-relaxed"
                      >
                        <span className="mr-2 text-primary font-semibold">{i + 1}.</span>
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ol>
                <ReadingProgress />
              </nav>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
