import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase";
import { SoldAuctionsClient } from "@/components/domain/sold-auctions-client";

// On-Demand Revalidation: 낙찰 발생 시에만 캐시 갱신 (active-auctions에서 트리거)
// 시간 기반 revalidate 없음 — 낙찰 없으면 DB 호출도 없음

export const metadata: Metadata = {
  title: "도메인 거래 시세 — 실제 경매 낙찰 가격 데이터",
  description:
    "도메인이 실제로 얼마에 거래되는지 궁금하셨나요? 경매에서 낙찰된 도메인의 실제 거래 가격과 입찰 수를 무료로 확인하세요. 도메인 가치 판단의 기준이 됩니다.",
  keywords: [
    "도메인 거래 시세", "도메인 낙찰 가격", "도메인 매매 이력", "도메인 가격 확인",
    "도메인 시세 조회", "도메인 거래 가격", "도메인 얼마에 팔리나", "도메인 가치 평가",
    "경매도메인 가치 평가", "만료도메인 시세", "도메인 감정", "도메인 가격 측정",
    "도메인 판매가 예측", "프리미엄 도메인 조회", "도메인 투자 가치", "도메인 매매 시세",
  ],
  openGraph: {
    title: "도메인 거래 시세 — 실제 낙찰 가격 데이터",
    description: "도메인이 실제로 얼마에 거래되는지 확인하세요. 경매 낙찰 가격 무료 조회.",
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
    <SoldAuctionsClient
      initialItems={initialItems}
      initialTotal={count ?? 0}
      recent24hCount={recent24hCount ?? 0}
    />
  );
}
