import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Domain Authority(DA)란? 도메인 품질을 판단하는 핵심 지표 — 도메인체커",
  description:
    "Moz가 개발한 Domain Authority(DA)의 의미와 계산 방식, 도메인 투자에서 DA가 중요한 이유를 상세히 설명합니다. DA 점수로 도메인 가치를 판단하는 방법을 알아보세요.",
  keywords: [
    "Domain Authority",
    "DA란",
    "Moz DA",
    "도메인 권위 점수",
    "도메인 품질 지표",
    "SEO 도메인 분석",
    "도메인 가치 평가",
  ],
};

export default function WhatIsDaPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> 블로그 목록
      </Link>

      <h1 className="text-3xl font-bold tracking-tight leading-tight">
        Domain Authority(DA)란? 도메인 품질을 판단하는 핵심 지표
      </h1>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">DA란 무엇인가?</h2>
          <p>
            Domain Authority(DA)는 미국의 SEO 소프트웨어 기업 Moz가 개발한 검색엔진 순위 예측
            점수입니다. 1점부터 100점까지의 범위로 표시되며, 점수가 높을수록 해당 도메인이
            검색엔진 결과 페이지(SERP)에서 높은 순위를 차지할 가능성이 큽니다. DA는 단일
            페이지가 아닌 도메인 전체의 권위도를 측정하는 지표로, 도메인 투자자와 SEO
            전문가에게 가장 널리 사용되는 품질 기준 중 하나입니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">DA는 어떻게 계산되나?</h2>
          <p>
            Moz는 자체 웹 크롤러를 통해 수십억 개의 웹페이지를 분석하고, 링크 프로필 데이터를
            기반으로 DA 점수를 산출합니다. 주요 평가 요소에는 루트 도메인으로 향하는 백링크의
            수와 품질, 링크를 보내는 도메인의 다양성, MozRank와 MozTrust 등의 내부 지표가
            포함됩니다. 중요한 점은 DA가 Google의 공식 랭킹 팩터가 아니라 Moz가 독자적으로
            만든 예측 지표라는 것입니다. 그러나 실제 검색 순위와의 상관관계가 높아 업계
            표준처럼 활용되고 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            도메인 투자에서 DA가 중요한 이유
          </h2>
          <p>
            도메인 투자자에게 DA는 도메인의 잠재 가치를 빠르게 판단하는 핵심 필터 역할을
            합니다. DA 30 이상의 만료 도메인이나 경매 도메인은 이미 상당한 백링크 자산을
            보유하고 있으며, 새로운 사이트를 구축하거나 301 리디렉트를 통해 기존 사이트의
            SEO 파워를 전달하는 데 활용할 수 있습니다. 다만 DA만으로 도메인의 모든 가치를
            판단하기는 어렵습니다. Ahrefs의 Domain Rating(DR), Majestic의 Trust Flow(TF)
            등 다른 지표와 함께 종합적으로 분석해야 정확한 가치 평가가 가능합니다.
          </p>
        </section>
      </div>

      <div className="mt-12 rounded-xl border bg-muted/30 p-6 text-center">
        <p className="text-lg font-semibold">도메인의 DA를 확인해 보세요</p>
        <p className="mt-1 text-sm text-muted-foreground">
          도메인체커에서 DA, DR, TF를 포함한 주요 SEO 지수를 무료로 분석할 수 있습니다.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          도메인 분석하기
        </Link>
      </div>
    </article>
  );
}
