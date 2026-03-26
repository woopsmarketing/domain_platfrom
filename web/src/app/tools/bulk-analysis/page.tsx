import type { Metadata } from "next";
import Script from "next/script";
import { BulkAnalysis } from "@/components/tools/bulk-analysis";

export const metadata: Metadata = {
  title: "도메인 대량 분석 — 여러 도메인 한번에 분석",
  description:
    "최대 100개 도메인을 한번에 입력하면 각 도메인의 DA, PA, DR, TF, 백링크를 일괄 분석합니다. 도메인 투자 전 대량 스크리닝에 활용하세요.",
  keywords: [
    "도메인 대량 분석", "도메인 일괄 분석", "여러 도메인 분석",
    "도메인 대량 조회", "도메인 일괄 조회", "도메인 스크리닝",
    "도메인 벌크 분석", "bulk domain analysis",
  ],
};

const FAQ_ITEMS = [
  {
    q: "무료로 몇 개까지 분석할 수 있나요?",
    a: "무료 사용자는 1일 1회, 최대 5개 도메인을 한 번에 분석할 수 있습니다. Pro 구독 시 최대 100개 도메인을 횟수 제한 없이 분석할 수 있습니다.",
  },
  {
    q: "분석 결과는 실시간인가요?",
    a: "SEO 지표(DA, DR, TF 등)는 7일 캐시로 운영됩니다. 7일 이내에 분석한 적이 있는 도메인은 캐시된 결과를 즉시 반환하고, 7일이 지난 도메인은 새로 조회합니다.",
  },
  {
    q: "어떤 형식으로 입력하나요?",
    a: "한 줄에 도메인 하나씩 입력하면 됩니다. example.com 형태뿐 아니라 https://example.com/path 같은 전체 URL을 넣어도 자동으로 도메인만 추출하여 분석합니다.",
  },
  {
    q: "분석에 실패한 도메인은 어떻게 되나요?",
    a: "존재하지 않거나 데이터를 가져올 수 없는 도메인은 결과 목록에서 제외됩니다. 성공한 도메인만 결과 테이블에 표시됩니다.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function BulkAnalysisPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Script
        id="bulk-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          도메인{" "}
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            대량 분석
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          여러 도메인을 한번에 입력하면 각각의 검색 점수, 백링크, 신뢰도를 일괄 분석합니다.
          도메인 투자 전 대량 스크리닝에 활용하세요.
        </p>
      </section>

      <BulkAnalysis />

      {/* SEO 콘텐츠 */}
      <section className="mt-16 border-t pt-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">도메인 대량 분석이란?</h2>
        <p className="text-muted-foreground leading-relaxed mt-3">
          도메인 대량 분석은 여러 도메인의 SEO 지표를 한 번에 조회하여 비교하는 도구입니다.
          도메인 경매에서 수십~수백 개의 후보 중 가치 있는 도메인을 빠르게 걸러내거나,
          경쟁 사이트를 일괄 분석할 때 유용합니다.
        </p>

        <h3 className="text-lg font-semibold mt-8 mb-3 border-l-3 border-primary pl-3">
          대량 분석으로 확인할 수 있는 지표
        </h3>
        <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
          <li><strong className="text-foreground">DA (Domain Authority)</strong>: Moz 기준 도메인 권위 점수 (0~100)</li>
          <li><strong className="text-foreground">PA (Page Authority)</strong>: 메인 페이지의 개별 권위 점수</li>
          <li><strong className="text-foreground">DR (Domain Rating)</strong>: Ahrefs 기준 백링크 강도</li>
          <li><strong className="text-foreground">TF (Trust Flow)</strong>: Majestic 기준 신뢰도 점수</li>
          <li><strong className="text-foreground">CF (Citation Flow)</strong>: Majestic 기준 인용 흐름 점수</li>
          <li><strong className="text-foreground">백링크 수</strong>: 외부에서 연결된 총 링크 수</li>
          <li><strong className="text-foreground">참조 도메인</strong>: 백링크를 보내는 고유 도메인 수</li>
          <li><strong className="text-foreground">Wayback 스냅샷</strong>: 웹 아카이브에 저장된 히스토리 수</li>
        </ul>

        <h3 className="text-lg font-semibold mt-8 mb-3 border-l-3 border-primary pl-3">
          이런 분들에게 추천합니다
        </h3>
        <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
          <li>도메인 경매에서 가치 있는 도메인을 빠르게 선별하고 싶은 분</li>
          <li>여러 후보 도메인 중 최적의 선택을 하고 싶은 분</li>
          <li>경쟁사 도메인을 일괄 분석하여 SEO 전략을 세우고 싶은 분</li>
          <li>만료 도메인 목록에서 투자 가치가 높은 도메인을 찾고 싶은 분</li>
        </ul>

        <h3 className="text-lg font-semibold mt-8 mb-3 border-l-3 border-primary pl-3">
          효과적인 활용법
        </h3>
        <ol className="space-y-2 pl-6 list-decimal text-muted-foreground">
          <li>경매 사이트에서 관심 도메인 목록을 복사합니다</li>
          <li>대량 분석 도구에 한 줄에 하나씩 붙여넣습니다</li>
          <li>분석 결과에서 DA 20 이상, DR 30 이상인 도메인을 먼저 확인합니다</li>
          <li>유망한 도메인을 개별 분석 페이지에서 상세 지표를 확인합니다</li>
          <li>도메인 비교 도구로 최종 후보 2~3개를 나란히 비교합니다</li>
        </ol>

        {/* FAQ */}
        <h2 className="text-2xl font-bold mt-12 mb-6 text-center">자주 묻는 질문</h2>
        <div className="divide-y rounded-lg border">
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} className="group">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium hover:bg-muted/50">
                {item.q}
              </summary>
              <div className="px-5 pb-4 text-sm text-muted-foreground">{item.a}</div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
