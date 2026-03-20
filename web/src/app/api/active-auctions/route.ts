import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/active-auctions
 *
 * 현재 진행 중인 경매 도메인 목록 조회.
 * 쿼리 파라미터:
 *   - limit: 최대 개수 (기본 20, 최대 100)
 *   - sort: 정렬 기준 (price | bids | time, 기본 bids)
 *
 * crawled_at 기준 최근 7일 이내 데이터만 반환.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20", 10) || 20, 1),
      100
    );
    const sort = searchParams.get("sort") || "bids";

    const client = createServiceClient();

    // 7일 이내 데이터만
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const now = new Date().toISOString();

    let query = client
      .from("active_auctions")
      .select("domain, tld, current_price, bid_count, end_time_raw, crawled_at")
      .gte("crawled_at", sevenDaysAgo)
      .gte("end_time_raw", now);

    // 정렬
    switch (sort) {
      case "price":
        query = query.order("current_price", { ascending: false });
        break;
      case "time":
        query = query.order("crawled_at", { ascending: false });
        break;
      case "bids":
      default:
        query = query.order("bid_count", { ascending: false, nullsFirst: false });
        break;
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error("active-auctions query error:", error.message);
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (err) {
    console.error("active-auctions error:", err);
    return NextResponse.json({ items: [] });
  }
}
