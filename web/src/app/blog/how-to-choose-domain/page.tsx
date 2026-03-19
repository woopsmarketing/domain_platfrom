import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "좋은 도메인 고르는 법 — 투자 가치 있는 도메인 5가지 기준 — 도메인체커",
  description:
    "DA/DR, TLD, 도메인 나이, 백링크 프로필, 브랜드 가능성까지. 수익성 높은 도메인을 고르는 5가지 핵심 기준을 실전 예시와 함께 정리합니다.",
  keywords: [
    "도메인 고르는 법",
    "도메인 투자 기준",
    "좋은 도메인 특징",
    "도메인 가치 평가",
    "도메인 DA DR",
    "도메인 TLD",
    "도메인 백링크",
    "도메인 브랜드 가능성",
  ],
};

export default function HowToChooseDomainPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> 블로그 목록
      </Link>

      <h1 className="text-3xl font-bold tracking-tight leading-tight">
        좋은 도메인 고르는 법 — 투자 가치 있는 도메인 5가지 기준
      </h1>

      <div className="mt-8 space-y-8 text-base leading-relaxed text-muted-foreground">
        <p>
          도메인 투자에서 수익을 내려면 &quot;어떤 도메인을 살 것인가&quot;가 가장 중요합니다.
          수천 개의 만료 도메인과 경매 도메인 중에서 가치 있는 도메인을 골라내는 5가지 핵심
          기준을 정리했습니다.
        </p>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            1. DA/DR 점수가 높은 도메인
          </h2>
          <p>
            Moz의 Domain Authority(DA)와 Ahrefs의 Domain Rating(DR)은 도메인의 SEO 파워를
            정량화한 지표입니다. DA 20 이상, DR 15 이상이면 기본적인 백링크 자산이 있는
            도메인으로 볼 수 있으며, DA 40 이상은 상당한 가치를 가진 도메인입니다. 단,
            스팸 점수(Moz Spam Score)가 높은 도메인은 인위적인 백링크가 쌓인 경우가 많으므로
            반드시 함께 확인해야 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            2. 프리미엄 TLD(.com, .net, .org)
          </h2>
          <p>
            TLD(Top-Level Domain)는 도메인의 기본 가치에 큰 영향을 미칩니다. .com은 여전히
            가장 높은 가치를 가지며, 같은 키워드라도 .com 도메인은 .xyz나 .info 도메인 대비
            10배 이상의 가격에 거래됩니다. .net과 .org도 안정적인 수요가 있으며, .io는
            기술 스타트업 시장에서 꾸준한 인기를 보입니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            3. 도메인 나이(Domain Age)
          </h2>
          <p>
            오래된 도메인은 검색엔진의 신뢰도 측면에서 유리합니다. 등록 후 5년 이상 된
            도메인은 신규 도메인보다 검색 순위 진입이 빠른 경향이 있으며, Wayback Machine에
            과거 웹사이트 이력이 남아 있다면 해당 도메인의 역사적 가치도 확인할 수 있습니다.
            도메인체커에서 Whois 등록일과 Wayback 히스토리를 한 번에 확인할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            4. 건전한 백링크 프로필
          </h2>
          <p>
            백링크의 수도 중요하지만, 더 중요한 것은 품질과 다양성입니다. Majestic의 Trust
            Flow(TF)는 백링크의 품질을 측정하는 핵심 지표이며, TF가 높으면서 Citation
            Flow(CF)와의 비율(TF/CF ratio)이 0.5 이상인 도메인은 건전한 링크 프로필을 가진
            도메인으로 평가됩니다. Ahrefs의 백링크 수와 참조 도메인 수도 함께 확인하면 더
            정확한 판단이 가능합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            5. 브랜드 가능성(Brandability)
          </h2>
          <p>
            짧고 발음하기 쉬우며 기억에 남는 도메인은 브랜드로 활용할 수 있는 가능성이
            높습니다. 일반적으로 2단어 이내, 12자 이하의 도메인이 브랜드 도메인으로 선호되며,
            특정 산업 키워드를 포함한 도메인(예: healthtrack.com, payflow.io)은 해당 분야
            스타트업에 높은 가격으로 매각할 수 있습니다. 숫자나 하이픈이 포함된 도메인은
            브랜드 가치가 크게 떨어집니다.
          </p>
        </section>
      </div>

      <div className="mt-12 rounded-xl border bg-muted/30 p-6 text-center">
        <p className="text-lg font-semibold">관심 도메인의 지표를 확인해 보세요</p>
        <p className="mt-1 text-sm text-muted-foreground">
          도메인체커에서 DA, DR, TF, 백링크 수, Whois 정보를 무료로 분석할 수 있습니다.
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
