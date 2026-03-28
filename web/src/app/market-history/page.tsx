import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase";
import { SoldAuctionsClient } from "@/components/domain/sold-auctions-client";
import { ServiceCta } from "@/components/shared/service-cta";

// 동적 렌더링: 빌드 시 DB 쿼리 타임아웃 방지
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "도메인 경매 시세 — 실제 낙찰가 · 경매 도메인 거래 이력 | 도메인체커",
  description:
    "경매 도메인이 실제로 얼마에 낙찰되는지 확인하세요. 경매 도메인 낙찰 이력, 낙찰가, 입찰 수를 무료로 조회할 수 있습니다.",
  keywords: [
    "경매 도메인 낙찰 이력", "도메인 경매 시세", "경매 도메인 낙찰가", "도메인 거래 이력",
    "도메인 경매 결과", "도메인 매매 이력", "도메인 거래 가격",
  ],
  openGraph: {
    title: "도메인 경매 시세 — 실제 낙찰가 · 거래 이력 | 도메인체커",
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

  return (
    <>
      <SoldAuctionsClient
        initialItems={initialItems}
        initialTotal={count ?? 0}
        recent24hCount={recent24hCount ?? 0}
      />
      <ServiceCta />
    </>
  );
}
