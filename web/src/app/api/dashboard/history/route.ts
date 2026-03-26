import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));
    const search = searchParams.get("search") ?? "";
    const offset = (page - 1) * limit;

    const service = createServiceClient();

    let query = service
      .from("user_searches")
      .select("id, domain_name, searched_at", { count: "exact" })
      .eq("user_id", user.id)
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
