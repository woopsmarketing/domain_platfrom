import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getServiceClient } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));
    const search = searchParams.get("search") ?? "";
    const offset = (page - 1) * limit;

    const service = getServiceClient();

    let query = service
      .from("user_searches")
      .select("id, domain_name, searched_at", { count: "exact" })
      .eq("user_id", user!.id)
      .order("searched_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike("domain_name", `%${search}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("[GET /api/dashboard/history] query error:", error);
      return NextResponse.json({ error: "조회 중 오류가 발생했습니다" }, { status: 500 });
    }

    return NextResponse.json({
      items: data ?? [],
      total: count ?? 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("[GET /api/dashboard/history]", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
