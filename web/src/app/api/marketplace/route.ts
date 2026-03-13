import { NextResponse } from "next/server";
import { getMarketplaceListings } from "@/lib/db/marketplace";

export async function GET() {
  try {
    const listings = await getMarketplaceListings();

    return NextResponse.json({ data: listings });
  } catch (error) {
    console.error("[GET /api/marketplace] error:", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
