import { NextResponse } from "next/server";
import { requireAuth, getServiceClient } from "@/lib/api-helpers";

export async function GET() {
  try {
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const email = user!.email;

    // email이 null이면 email 기반 테이블은 빈 배열 반환
    if (!email) {
      return NextResponse.json({ items: [] });
    }

    const service = getServiceClient();

    const [brokerRes, inquiryRes] = await Promise.all([
      service
        .from("broker_inquiries")
        .select("id, name, email, target_keyword, budget, message, status, created_at")
        .eq("email", email)
        .order("created_at", { ascending: false }),
      service
        .from("inquiries")
        .select("id, listing_id, name, email, message, offered_price_usd, status, created_at")
        .eq("email", email)
        .order("created_at", { ascending: false }),
    ]);

    const brokerItems = (brokerRes.data ?? []).map((item) => ({
      ...item,
      type: "broker" as const,
    }));

    const inquiryItems = (inquiryRes.data ?? []).map((item) => ({
      ...item,
      type: "inquiry" as const,
    }));

    // 합치고 날짜순 정렬
    const all = [...brokerItems, ...inquiryItems].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ items: all });
  } catch (error) {
    console.error("[GET /api/dashboard/inquiries]", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
