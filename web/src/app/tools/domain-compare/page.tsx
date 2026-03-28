import type { Metadata } from "next";
import Script from "next/script";
import { DomainCompare } from "@/components/tools/domain-compare";

export const metadata: Metadata = {
  title: "도메인 비교 분석 — 도메인 점수 비교 · SEO 지표 비교 | 도메인체커",
  description:
    "2~3개 도메인의 SEO 점수, 백링크, 신뢰도를 나란히 비교합니다. 도메인 비교 분석으로 최적의 도메인을 선택하세요.",
  keywords: [
    "도메인 비교", "도메인 비교 분석", "도메인 점수 비교", "SEO 지표 비교",
    "도메인 비교 도구", "도메인 비교 사이트", "도메인 어떤게 좋을까",
  ],
};

const FAQ_ITEMS = [
  {
    q: "몇 개의 도메인을 비교할 수 있나요?",
    a: "무료 사용자는 최대 2개, Pro 사용자는 최대 10개의 도메인을 동시에 비교할 수 있습니다.",
  },
  {
    q: "어떤 지표를 비교할 수 있나요?",
    a: "DA, PA, DR, TF, CF, 백링크 수, 참조 도메인 수, Wayback 스냅샷 등 기본 지표를 비교할 수 있습니다. Pro 구독 시 트래픽, 키워드 수, 스팸 점수까지 추가로 비교할 수 있습니다.",
  },
  {
    q: "대량 분석과 비교 분석의 차이점은 무엇인가요?",
    a: "대량 분석은 수십 개 도메인을 빠르게 스크리닝하여 후보를 좁히는 용도이고, 비교 분석은 최종 후보 몇 개를 나란히 놓고 세밀하게 비교하는 용도입니다.",
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

export default function DomainComparePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Script
        id="compare-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          도메인{" "}
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            비교 분석
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          2~3개 도메인을 나란히 비교하여 어떤 도메인이 더 좋은지 한눈에 파악하세요.
          검색 점수, 백링크, 트래픽, 스팸 점수를 비교합니다.
        </p>
      </section>

      <DomainCompare />

      {/* SEO 콘텐츠 */}
      <section className="mt-16 border-t pt-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">도메인 비교 분석이란?</h2>
        <p className="text-muted-foreground leading-relaxed mt-3">
          도메인 비교 분석은 2개 이상의 도메인을 나란히 놓고 SEO 지표를 한눈에
          비교하는 도구입니다. 도메인 구매를 결정하기 전 후보 도메인들의 장단점을
          객관적으로 파악할 수 있습니다.
        </p>

        <h3 className="text-lg font-semibold mt-8 mb-3 border-l-3 border-primary pl-3">
          비교 분석의 핵심 포인트
        </h3>
        <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
          <li><strong className="text-foreground">DA/DR 비교</strong>: 도메인 권위도가 높을수록 검색 노출에 유리합니다</li>
          <li><strong className="text-foreground">백링크 품질</strong>: 단순 수량보다 참조 도메인 다양성이 중요합니다</li>
          <li><strong className="text-foreground">TF/CF 비율</strong>: Trust Flow가 Citation Flow보다 높으면 양질의 백링크</li>
          <li><strong className="text-foreground">스팸 점수</strong>: 낮을수록 안전한 도메인입니다 (Pro 지표)</li>
        </ul>

        <h3 className="text-lg font-semibold mt-8 mb-3 border-l-3 border-primary pl-3">
          이런 상황에서 활용하세요
        </h3>
        <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
          <li>비슷한 가격대의 경매 도메인 중 하나를 선택해야 할 때</li>
          <li>신규 사업용 도메인 후보를 비교할 때</li>
          <li>경쟁사 도메인과 내 도메인의 SEO 격차를 파악할 때</li>
        </ul>

        <h3 className="text-lg font-semibold mt-8 mb-3 border-l-3 border-primary pl-3">
          현명한 도메인 선택 기준
        </h3>
        <ol className="space-y-2 pl-6 list-decimal text-muted-foreground">
          <li>DA/DR만 보지 마세요 — 스팸 점수가 높으면 가치가 떨어집니다</li>
          <li>백링크 수보다 참조 도메인 수가 더 중요합니다</li>
          <li>TF &gt; CF인 도메인이 TF &lt; CF인 도메인보다 신뢰할 수 있습니다</li>
          <li>Wayback 히스토리가 많은 도메인은 오랜 역사를 가진 증거입니다</li>
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
