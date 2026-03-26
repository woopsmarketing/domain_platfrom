import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

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
    slug: "what-is-da",
    title: "Domain Authority(DA)란? 도메인 품질을 판단하는 핵심 지표",
    description:
      "Moz가 개발한 DA 지표의 의미, 계산 방식, 도메인 투자에서 DA가 중요한 이유를 알아봅니다.",
  },
  {
    slug: "how-to-choose-domain",
    title: "좋은 도메인 고르는 법 — 투자 가치 있는 도메인 5가지 기준",
    description:
      "DA/DR, TLD, 도메인 나이, 백링크, 브랜드 가능성 등 수익성 높은 도메인을 고르는 5가지 핵심 기준을 정리합니다.",
  },
  {
    slug: "domain-auction-guide",
    title: "도메인 경매 완벽 가이드 — GoDaddy, Namecheap 낙찰 데이터 활용법",
    description:
      "도메인 경매의 작동 방식과 도메인체커 낙찰 데이터를 활용해 투자 기회를 찾는 방법을 소개합니다.",
  },
  {
    slug: "domain-spam-score-check",
    title: "도메인 스팸 점수 확인 방법 — 내 도메인이 스팸으로 분류되고 있는지 점검하기",
    description:
      "도메인 스팸 점수(Spam Score)가 무엇인지, 왜 높아지는지, 어떻게 확인하고 낮출 수 있는지 실무 기준으로 정리했습니다.",
  },
];

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">블로그</h1>
      <p className="mt-2 text-muted-foreground">
        도메인 투자와 SEO 분석에 대한 실전 가이드
      </p>

      <div className="mt-10 grid gap-6">
        {articles.map((article) => (
          <Link key={article.slug} href={`/blog/${article.slug}`}>
            <Card className="transition-colors hover:border-primary/50">
              <CardHeader>
                <CardTitle className="text-xl">{article.title}</CardTitle>
                <CardDescription className="mt-1 text-sm">
                  {article.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  읽어보기 <ArrowRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
