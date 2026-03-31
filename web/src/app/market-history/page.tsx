import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase";
import { SoldAuctionsClient } from "@/components/domain/sold-auctions-client";
import Link from "next/link";
import { ServiceCta } from "@/components/shared/service-cta";

// 동적 렌더링: 빌드 시 DB 쿼리 타임아웃 방지
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "도메인 경매 시세 · 실제 낙찰가 · 경매 도메인 거래 이력 | 도메인체커",
  description:
    "경매 도메인이 실제로 얼마에 낙찰되는지 확인하세요. 경매 도메인 낙찰 이력, 낙찰가, 입찰 수를 무료로 조회할 수 있습니다.",
  keywords: [
    "경매 도메인 낙찰 이력", "도메인 경매 시세", "경매 도메인 낙찰가", "도메인 거래 이력",
    "도메인 경매 결과", "도메인 매매 이력", "도메인 거래 가격",
  ],
  openGraph: {
    title: "도메인 경매 시세 · 실제 낙찰가 · 거래 이력 | 도메인체커",
    description: "경매 도메인이 실제로 얼마에 낙찰되는지 확인하세요. 낙찰 이력 무료 조회.",
    type: "website",
    siteName: "도메인체커",
  },
};

const PER_PAGE = 50;

export default async function MarketHistoryPage() {
  const client = createServiceClient();

  // 전체 데이터 (1페이지) + 전체 건수
  const { data, count } = await client
    .from("sold_auctions")
    .select("id, domain, tld, price_usd, bid_count, sold_at, platform", { count: "exact" })
    .order("sold_at", { ascending: false })
    .range(0, PER_PAGE - 1);

  // 최근 24시간 낙찰 건수
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recent24hCount } = await client
    .from("sold_auctions")
    .select("id", { count: "exact", head: true })
    .gte("sold_at", oneDayAgo);

  // 서버 사이드에서는 Pro 여부를 알 수 없으므로 전체 데이터를 전달
  // 클라이언트에서 useAuth() tier 기반으로 잠금 처리
  const initialItems = (data ?? []).map((row) => ({
    id: row.id,
    name: row.domain,
    tld: row.tld,
    source: row.platform,
    soldAt: row.sold_at,
    soldPrice: row.price_usd,
    bidCount: row.bid_count,
  }));


const faqItems = [
  {
    q: "경매 도메인 낙찰 이력은 어떻게 활용하나요?",
    a: "낙찰 이력을 통해 특정 도메인이나 TLD의 시장 시세를 파악할 수 있습니다. 비슷한 도메인의 실제 거래 가격을 참고하여 입찰 예산을 설정하거나 도메인 투자 결정에 활용하세요.",
  },
  {
    q: "낙찰 데이터는 실시간으로 업데이트되나요?",
    a: "네, 경매가 종료되면 낙찰 데이터가 자동으로 수집되어 업데이트됩니다. 최신 낙찰 결과를 빠르게 확인할 수 있습니다.",
  },
  {
    q: "24시간 이전 낙찰 데이터는 왜 잠겨있나요?",
    a: "최근 24시간 이내의 낙찰 데이터는 무료로 공개됩니다. 그 이전 데이터는 Pro 구독 회원에게 전체 이력이 제공됩니다.",
  },
  {
    q: "도메인 경매 시세는 어떻게 파악하나요?",
    a: "낙찰 이력 페이지에서 TLD별, 가격대별 필터를 활용하여 관심 도메인과 유사한 거래 내역을 비교해 보세요. 입찰 수가 많을수록 수요가 높은 도메인입니다.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* SEO 상단 설명 */}
      <section className="mx-auto max-w-5xl px-4 pt-8">
        <p className="text-muted-foreground leading-relaxed">
          도메인 경매에서 실제로 얼마에 거래되는지 궁금하셨나요? 이 페이지에서는
          경매 도메인의 실제 낙찰가와 입찰 수를 확인할 수 있습니다.
          도메인 경매 시세를 파악하여 투자 결정에 참고하세요.
        </p>
      </section>

      <SoldAuctionsClient
        initialItems={initialItems}
        initialTotal={count ?? 0}
        recent24hCount={recent24hCount ?? 0}
      />

      {/* SEO 하단 콘텐츠 */}
      <section className="mx-auto max-w-4xl px-4 py-12 border-t">
        <h2 className="text-2xl font-bold mb-4">도메인 경매 낙찰 데이터 활용법</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            경매 도메인의 낙찰 이력은 도메인 투자에서 가장 중요한 참고 자료입니다.
            실제 거래 가격을 기반으로 도메인의 시장 가치를 객관적으로 판단할 수 있습니다.
          </p>

          <h3 className="text-lg font-semibold text-foreground mt-6">낙찰 데이터로 알 수 있는 것</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>시장 시세</strong> — 특정 TLD(.com, .net, .org)의 평균 낙찰가</li>
            <li><strong>수요 트렌드</strong> — 입찰 수가 많은 도메인의 특성</li>
            <li><strong>투자 타이밍</strong> — 경매가 활발한 시기와 가격대</li>
            <li><strong>가치 판단 기준</strong> — 비슷한 도메인이 얼마에 거래되었는지 비교</li>
          </ul>

          <p className="mt-4">
            도메인체커에서 관심 도메인을 분석하면 DA, DR, 백링크 수를 확인할 수 있어
            낙찰 데이터와 함께 종합적인 가치 판단이 가능합니다.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <Link href="/auctions" className="text-primary hover:underline">
              실시간 경매 보기 →
            </Link>
            <Link href="/blog/domain-auction-guide" className="text-primary hover:underline">
              경매 가이드 읽기 →
            </Link>
          </div>
        </div>
      </section>

      <ServiceCta />
    </>
  );
}
