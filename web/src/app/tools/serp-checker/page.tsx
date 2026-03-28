import type { Metadata } from "next";
import { SerpCheckerClient } from "@/components/tools/serp-checker-client";

export const metadata: Metadata = {
  title: "구글 검색 순위 확인 · 키워드 순위 조회 · SERP 분석 | 도메인체커",
  description:
    "키워드를 입력하면 구글 검색 결과 순위를 실시간으로 확인할 수 있습니다. 검색 순위, AI 개요, 관련 검색어를 한눈에 파악하세요.",
  keywords: [
    "구글 검색 순위 확인",
    "키워드 순위 확인",
    "검색 순위 조회",
    "구글 순위 확인",
    "SERP 분석",
    "검색 결과 확인",
    "키워드 검색 순위",
    "구글 노출 순위",
  ],
  openGraph: {
    title: "구글 검색 순위 확인 · 키워드 순위 조회 | 도메인체커",
    description:
      "키워드를 입력하면 구글 검색 결과 순위를 실시간으로 확인합니다. 검색 순위, AI 개요, 관련 검색어를 한눈에 파악하세요.",
  },
};

const FAQ_ITEMS = [
  {
    q: "검색 순위는 실시간인가요?",
    a: "네, 조회 시점의 실시간 구글 검색 결과를 가져옵니다. 같은 키워드라도 시간에 따라 결과가 달라질 수 있습니다.",
  },
  {
    q: "지역 설정은 왜 필요한가요?",
    a: "같은 키워드라도 국가마다 검색 결과가 다릅니다. 한국에서 검색한 결과와 미국에서 검색한 결과가 다를 수 있으므로, 타겟 지역을 선택하여 정확한 순위를 확인하세요.",
  },
  {
    q: "무료로 몇 번 사용할 수 있나요?",
    a: "무료 사용자는 하루 2회, 상위 5개 결과를 확인할 수 있습니다. Pro 구독 시 무제한으로 전체 검색 결과를 확인할 수 있습니다.",
  },
  {
    q: "모바일과 데스크탑 결과가 다른가요?",
    a: "네, 구글은 모바일 우선 인덱싱(Mobile-First Indexing)을 적용하여 모바일과 데스크탑에서 다른 검색 결과를 보여줄 수 있습니다. 디바이스 옵션을 변경하여 각각의 순위를 확인해보세요.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function SerpCheckerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <section className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            구글 검색{" "}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              순위 확인
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            키워드를 입력하면 구글 검색 결과의 실시간 순위를 확인할 수 있습니다.
            내 사이트가 몇 번째에 노출되는지 파악하세요.
          </p>
        </section>
        <SerpCheckerClient />

        {/* SEO 콘텐츠 */}
        <section className="mx-auto mt-16 max-w-4xl border-t pt-12">
          <h2 className="mb-4 text-2xl font-bold">
            구글 검색 순위 확인이란?
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            구글 검색 순위 확인은 특정 키워드로 검색했을 때 어떤 웹사이트가 상위에
            노출되는지 실시간으로 확인하는 도구입니다. SEO 전략을 수립하거나 경쟁
            키워드를 분석할 때 유용합니다.
          </p>

          <h3 className="mt-8 mb-3 border-l-3 border-primary pl-3 text-lg font-semibold">
            활용 방법
          </h3>
          <ul className="list-disc space-y-2 pl-6 leading-relaxed text-muted-foreground">
            <li>
              <strong>내 사이트 순위 확인</strong> — 타겟 키워드로 검색하여 내
              사이트가 몇 번째인지 확인
            </li>
            <li>
              <strong>경쟁 키워드 분석</strong> — 경쟁사가 어떤 키워드에서 상위
              노출되는지 파악
            </li>
            <li>
              <strong>SEO 효과 측정</strong> — SEO 작업 전후의 순위 변화를 비교
            </li>
            <li>
              <strong>지역별 순위 차이</strong> — 한국, 미국, 일본 등 지역에 따른
              순위 차이 확인
            </li>
          </ul>

          <div className="mt-6 rounded-lg border-l-2 border-primary bg-primary/5 p-4">
            <p className="text-sm text-muted-foreground">
              <strong>팁:</strong> 같은 키워드라도 지역과 디바이스에 따라 검색
              순위가 다를 수 있습니다. 타겟 고객이 주로 사용하는 환경에 맞춰
              확인하세요.
            </p>
          </div>

          {/* FAQ */}
          <div className="mt-12">
            <h2 className="mb-8 text-center text-2xl font-bold">
              자주 묻는 질문
            </h2>
            <div className="divide-y rounded-lg border">
              {FAQ_ITEMS.map((item, i) => (
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
          </div>
        </section>
      </div>
    </>
  );
}
