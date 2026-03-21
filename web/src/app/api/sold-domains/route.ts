import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/sold-domains
 *
 * sold_auctions 테이블에서 낙찰 완료된 도메인 목록을 반환합니다.
 */
export async function GET() {
  try {
    const client = createServiceClient();

    const { data, error } = await client
      .from("sold_auctions")
      .select("id, domain, tld, price_usd, bid_count, sold_at, platform")
      .order("sold_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("sold-domains query error:", error.message);
      return NextResponse.json({ items: [] });
    }

    const items = (data ?? []).map((row) => ({
      id: row.id,
      name: row.domain,
      tld: row.tld,
      source: row.platform,
      soldAt: row.sold_at,
      soldPrice: row.price_usd,
      bidCount: row.bid_count,
    }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("sold-domains error:", err);
    return NextResponse.json({ items: [] });
  }
}
