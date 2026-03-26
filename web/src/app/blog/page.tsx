import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";

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

const articles = [
  {
    slug: "domain-spam-score-check",
    title: "도메인 스팸 점수 확인 방법 — 내 도메인이 스팸으로 분류되고 있는지 점검하기",
    description:
      "도메인 스팸 점수(Spam Score)가 무엇인지, 왜 높아지는지, 어떻게 확인하고 낮출 수 있는지 실무 기준으로 정리했습니다.",
    category: "SEO 분석",
    date: "2026-03-26",
    readTime: "8분",
  },
  {
    slug: "domain-auction-guide",
    title: "도메인 경매 완벽 가이드 — GoDaddy, Namecheap 낙찰 데이터 활용법",
    description:
      "도메인 경매의 작동 방식과 도메인체커 낙찰 데이터를 활용해 투자 기회를 찾는 방법을 소개합니다.",
    category: "도메인 투자",
    date: "2026-03-20",
    readTime: "6분",
  },
  {
    slug: "how-to-choose-domain",
    title: "좋은 도메인 고르는 법 — 투자 가치 있는 도메인 5가지 기준",
    description:
      "DA/DR, TLD, 도메인 나이, 백링크, 브랜드 가능성 등 수익성 높은 도메인을 고르는 5가지 핵심 기준을 정리합니다.",
    category: "도메인 투자",
    date: "2026-03-15",
    readTime: "5분",
  },
  {
    slug: "what-is-da",
    title: "Domain Authority(DA)란? 도메인 품질을 판단하는 핵심 지표",
    description:
      "Moz가 개발한 DA 지표의 의미, 계산 방식, 도메인 투자에서 DA가 중요한 이유를 알아봅니다.",
    category: "SEO 기초",
    date: "2026-03-10",
    readTime: "4분",
  },
];

const categoryColors: Record<string, string> = {
  "SEO 분석": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "도메인 투자": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "SEO 기초": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function BlogIndexPage() {
  const categories = ["전체", ...Array.from(new Set(articles.map((a) => a.category)))];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
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
                : categoryColors[cat] || "bg-muted text-muted-foreground"
            }`}
          >
            {cat}
          </span>
        ))}
      </div>

      <div className="mt-10 grid gap-4">
        {articles.map((article, index) => (
          <Link key={article.slug} href={`/blog/${article.slug}`} className="group">
            <div className="relative rounded-xl border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/50">
              {/* NEW 배지 — 첫 번째 글 */}
              {index === 0 && (
                <span className="absolute top-4 right-4 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                  NEW
                </span>
              )}

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* 좌측: 카테고리 + 제목 + 설명 */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      categoryColors[article.category] || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {article.category}
                  </span>

                  <h2 className="mt-2.5 text-lg font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {article.title}
                  </h2>

                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                    {article.description}
                  </p>

                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    읽어보기 <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>

                {/* 우측: 날짜 + 읽는 시간 */}
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
    </div>
  );
}
