import type { Metadata } from "next";
import { SoldAuctionsClient } from "@/components/domain/sold-auctions-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "도메인 낙찰 이력 — 최근 경매 낙찰 데이터",
  description:
    "경매에서 실제 낙찰된 도메인의 거래 가격과 입찰 수를 확인하세요. 최근 24시간 낙찰 데이터를 무료로 제공합니다.",
  keywords: [
    "도메인 낙찰 이력",
    "도메인 거래 가격",
    "도메인 경매 결과",
    "도메인 판매 이력",
    "도메인 거래 시세",
  ],
};

export default function MarketHistoryPage() {
  return <SoldAuctionsClient />;
}
