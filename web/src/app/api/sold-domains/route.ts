import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/sold-domains?page=1&per_page=50&sort=recent
 *
 * sold_auctions 테이블에서 낙찰 완료된 도메인 목록을 페이지네이션으로 반환합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("per_page") ?? "50", 10)));
    const sort = searchParams.get("sort") ?? "recent";

    const client = createServiceClient();

    // 정렬 설정
    let orderColumn = "sold_at";
    let ascending = false;
    if (sort === "price_desc") {
      orderColumn = "price_usd";
      ascending = false;
    } else if (sort === "price_asc") {
      orderColumn = "price_usd";
      ascending = true;
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // 데이터 + 총 개수 동시 조회
    const { data, error, count } = await client
      .from("sold_auctions")
      .select("id, domain, tld, price_usd, bid_count, sold_at, platform", { count: "exact" })
      .order(orderColumn, { ascending })
      .range(from, to);

    if (error) {
      console.error("sold-domains query error:", error.message);
      return NextResponse.json({ items: [], total: 0, page, perPage });
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

    return NextResponse.json({
      items,
      total: count ?? 0,
      page,
      perPage,
    });
  } catch (err) {
    console.error("sold-domains error:", err);
    return NextResponse.json({ items: [], total: 0, page: 1, perPage: 50 });
  }
}
