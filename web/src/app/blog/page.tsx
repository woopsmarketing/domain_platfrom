import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { articles, CATEGORY_COLORS } from "@/lib/blog";
import { ServiceCta } from "@/components/shared/service-cta";

export const metadata: Metadata = {
  title: "블로그 — 도메인체커 | 도메인 투자 & SEO 가이드",
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

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function BlogIndexPage() {
  const categories = ["전체", ...Array.from(new Set(articles.map((a) => a.category)))];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight">블로그</h1>
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
                : CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || "bg-muted text-muted-foreground"
            }`}
          >
            {cat}
          </span>
        ))}
      </div>

      <div className="mt-10 grid gap-4">
        {articles.map((article, index) => (
          <Link key={article.slug} href={`/blog/${article.slug}`} className="group">
            <div className="blog-card">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        CATEGORY_COLORS[article.category] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {article.category}
                    </span>
                    {index === 0 && (
                      <span className="blog-badge-new">NEW</span>
                    )}
                  </div>

                  <h2 className="blog-card-title">{article.title}</h2>

                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                    {article.description}
                  </p>

                  <span className="blog-card-arrow mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    읽어보기 <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 text-xs text-muted-foreground shrink-0">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(article.date)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {article.readTime}
                  </span>
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
