import { NextResponse } from "next/server";
import { requireAuth, getServiceClient } from "@/lib/api-helpers";

export async function GET() {
  try {
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const service = getServiceClient();
    const { data, error } = await service
      .from("user_purchases")
      .select("id, domain_name, price_usd, status, purchased_at, notes")
      .eq("user_id", user!.id)
      .order("purchased_at", { ascending: false });

    if (error) {
      console.error("[GET /api/dashboard/purchases] query error:", error);
      return NextResponse.json({ error: "조회 중 오류가 발생했습니다" }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    console.error("[GET /api/dashboard/purchases]", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
