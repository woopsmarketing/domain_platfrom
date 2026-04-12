import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface AuctionItem {
  domain: string;
  tld: string;
  current_price: number;
  bid_count: number;
  end_time_raw: string;
}

/**
 * GET /api/active-auctions
 *
 * DB-only read: returns cached rows from `active_auctions` table.
 * Writing to the table is handled by the external VPS poller.
 */
export async function GET() {
  try {
    const client = createServiceClient();

    const { data, error } = await client
      .from("active_auctions")
      .select("domain, tld, current_price, bid_count, end_time_raw")
      .order("bid_count", { ascending: false });

    if (error) {
      console.error("active-auctions DB error:", error.message);
      return NextResponse.json(
        { error: "DB 조회 오류" },
        { status: 502 }
      );
    }

    const items: AuctionItem[] = (data ?? []).map((row) => ({
      domain: row.domain ?? "",
      tld: row.tld ?? "",
      current_price: Number(row.current_price ?? 0),
      bid_count: Number(row.bid_count ?? 0),
      end_time_raw: row.end_time_raw ?? "",
    }));

    // updated_at: most recent end_time_raw among results, or current time
    const timestamps = items
      .map((i) => new Date(i.end_time_raw).getTime())
      .filter((t) => !isNaN(t));
    const updated_at =
      timestamps.length > 0
        ? new Date(Math.max(...timestamps)).toISOString()
        : new Date().toISOString();

    return NextResponse.json({ items, updated_at });
  } catch (err) {
    console.error("active-auctions error:", err);
    return NextResponse.json({ items: [], updated_at: new Date().toISOString() });
  }
}
