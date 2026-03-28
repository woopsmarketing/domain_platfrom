import type { Metadata } from "next";
import { BacklinkCheckerClient } from "@/components/tools/backlink-checker-client";

export const metadata: Metadata = {
  title: "백링크 확인 · 무료 백링크 조회 · 백링크 분석 도구 | 도메인체커",
  description:
    "도메인의 백링크를 무료로 확인하세요. 백링크 수, DoFollow/NoFollow 비율, 참조 도메인, 앵커 텍스트를 한눈에 분석합니다.",
  keywords: [
    "백링크 확인",
    "백링크 조회",
    "백링크 분석",
    "backlink checker",
    "사이트 백링크 확인",
    "도메인 백링크 확인",
    "무료 백링크 확인",
    "백링크 체크",
    "참조 도메인 확인",
    "백링크 분석 도구",
  ],
  openGraph: {
    title: "백링크 확인 · 무료 백링크 조회 | 도메인체커",
    description:
      "도메인의 백링크를 무료로 확인하세요. DoFollow/NoFollow, 참조 도메인, 앵커 텍스트 분석.",
  },
};

const FAQ_ITEMS = [
  {
    q: "백링크가 많으면 무조건 좋은 건가요?",
    a: "수량보다 품질이 중요합니다. 신뢰할 수 있는 사이트에서 온 DoFollow 링크가 스팸 사이트의 수천 개 링크보다 가치가 높습니다.",
  },
  {
    q: "DoFollow와 NoFollow의 차이는?",
    a: "DoFollow 링크는 검색엔진에 '이 사이트를 신뢰합니다'라는 신호를 전달합니다. NoFollow는 그 신호를 전달하지 않지만, 트래픽 유입에는 기여할 수 있습니다.",
  },
  {
    q: "참조 도메인이 왜 중요한가요?",
    a: "같은 사이트에서 100개의 링크보다, 100개의 서로 다른 사이트에서 각 1개의 링크를 받는 것이 SEO에 더 효과적입니다. 다양한 출처의 백링크가 중요합니다.",
  },
  {
    q: "무료로 몇 번 확인할 수 있나요?",
    a: "무료 사용자는 하루 3회, 상위 5개 백링크를 확인할 수 있습니다. Pro 구독 시 무제한으로 전체 백링크 목록을 확인할 수 있습니다.",
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

export default function BacklinkCheckerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <section className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            백링크{" "}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              확인
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            도메인의 백링크 프로필을 분석합니다. 백링크 수, DoFollow/NoFollow
            비율, 참조 도메인, 앵커 텍스트를 확인하세요.
          </p>
        </section>
        <BacklinkCheckerClient />

        {/* SEO 콘텐츠 */}
        <section className="mt-16 border-t pt-12 mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">백링크 확인이란?</h2>
          <p className="text-muted-foreground leading-relaxed">
            백링크는 다른 웹사이트에서 내 사이트로 연결된 링크를 말합니다.
            검색엔진은 백링크를 사이트의 신뢰도와 권위를 판단하는 중요한 신호로
            활용합니다. 양질의 백링크가 많을수록 검색 순위에 긍정적인 영향을 줄
            수 있습니다.
          </p>

          <h3 className="text-lg font-semibold mt-8 mb-3 border-l-3 border-primary pl-3">
            확인할 수 있는 정보
          </h3>
          <ul className="space-y-2 pl-6 list-disc text-muted-foreground leading-relaxed">
            <li>
              <strong>총 백링크 수</strong> — 외부 사이트에서 연결된 전체 링크 수
            </li>
            <li>
              <strong>DoFollow / NoFollow 비율</strong> — SEO 가치가 전달되는
              링크와 그렇지 않은 링크
            </li>
            <li>
              <strong>참조 도메인 수</strong> — 백링크를 보내는 고유 도메인의 수
              (다양성이 중요)
            </li>
            <li>
              <strong>앵커 텍스트</strong> — 링크에 사용된 텍스트 (키워드 분포
              확인)
            </li>
            <li>
              <strong>권한 점수</strong> — 백링크 출처 도메인의 신뢰도
            </li>
            <li>
              <strong>발견일</strong> — 백링크가 처음 감지된 날짜
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-8 mb-3 border-l-3 border-primary pl-3">
            백링크 분석 활용법
          </h3>
          <div className="bg-primary/5 rounded-lg p-4 border-l-2 border-primary mt-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>활용 팁:</strong> 경쟁 사이트의 백링크를 분석하면 어디서
              링크를 얻고 있는지 파악할 수 있습니다. 이를 통해 자신의 링크 빌딩
              전략을 수립하는 데 참고할 수 있습니다.
            </p>
          </div>

          {/* FAQ */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8">
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
