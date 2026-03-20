import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/sold-domains
 *
 * 낙찰 완료된 도메인 목록을 반환합니다.
 * sales_history + domains 조인하여 최근 낙찰 데이터 제공.
 */
export async function GET() {
  try {
    const client = createServiceClient();

    const { data, error } = await client
      .from("sales_history")
      .select(`
        id,
        sold_at,
        price_usd,
        platform,
        domains!inner(name, tld, source)
      `)
      .order("sold_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("sold-domains query error:", error.message);
      return NextResponse.json({ items: [] });
    }

    const items = (data ?? []).map((row: Record<string, unknown>) => {
      const domain = row.domains as Record<string, string> | null;
      return {
        id: row.id as string,
        name: domain?.name ?? "",
        tld: domain?.tld ?? "",
        source: domain?.source ?? "other",
        soldAt: row.sold_at as string,
        soldPrice: row.price_usd as number,
      };
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("sold-domains error:", err);
    return NextResponse.json({ items: [] });
  }
}
