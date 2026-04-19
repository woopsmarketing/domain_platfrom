import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { getPublishedPosts } from "@/lib/db/posts";
import { ServiceCta } from "@/components/shared/service-cta";
import { formatDateKR } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  "SEO 분석": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "도메인 투자": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "SEO 기초": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "블로그 · 도메인체커 | 도메인 투자 & SEO 가이드",
  description:
    "도메인 투자와 SEO 분석에 대한 실전 가이드. DA란 무엇인지, 좋은 도메인 고르는 법, 도메인 경매 활용법 등 핵심 정보를 제공합니다.",
  keywords: [
    "도메인 투자 가이드",
    "DA란",
    "도메인 고르는 법",
    "도메인 경매",
    "SEO 도메인 분석",
  ],
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();
  const categories = [
    "전체",
    ...Array.from(new Set(posts.map((p) => p.category))),
  ];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://domainchecker.co.kr/blog/${post.slug}`,
      name: post.title,
    })),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">블로그</h1>
      <p className="mt-2 text-muted-foreground">
        도메인 투자와 SEO 분석에 대한 실전 가이드
      </p>

      {/* 카테고리 배지 표시 */}
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <span
            key={cat}
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              cat === "전체"
                ? "bg-foreground/10 text-foreground"
                : CATEGORY_COLORS[cat] || "bg-muted text-muted-foreground"
            }`}
          >
            {cat}
          </span>
        ))}
      </div>

      <div className="mt-10 grid gap-4">
        {posts.length === 0 && (
          <div className="rounded-xl border border-border/60 border-dashed py-16 text-center text-sm text-muted-foreground">
            아직 게시된 글이 없습니다. 곧 업데이트 예정입니다.
          </div>
        )}
        {posts.map((post, index) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <div className="blog-card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* 썸네일 */}
                {post.cover_image_url && (
                  <div className="relative h-40 sm:w-40 sm:h-24 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 160px"
                      className="object-cover rounded-lg"
                      {...(index === 0 ? { priority: true } : {})}
                    />
                  </div>
                )}

                <div className="flex flex-1 min-w-0 flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          CATEGORY_COLORS[post.category] ||
                          "bg-muted text-muted-foreground"
                        }`}
                      >
                        {post.category}
                      </span>
                      {index === 0 && (
                        <span className="blog-badge-new">NEW</span>
                      )}
                    </div>

                    <h2 className="blog-card-title">{post.title}</h2>

                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>

                    <span className="blog-card-arrow mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      읽어보기 <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 text-xs text-muted-foreground shrink-0">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateKR(post.published_at)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {post.read_time}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <ServiceCta />
    </div>
  );
}
