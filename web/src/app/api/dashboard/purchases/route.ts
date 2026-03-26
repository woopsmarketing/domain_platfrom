import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const service = createServiceClient();
    const { data, error } = await service
      .from("user_purchases")
      .select("id, domain_name, price_usd, status, purchased_at, notes")
      .eq("user_id", user.id)
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
