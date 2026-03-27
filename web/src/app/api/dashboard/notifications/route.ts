import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getServiceClient } from "@/lib/api-helpers";

export async function GET() {
  try {
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const service = getServiceClient();
    const { data, error } = await service
      .from("user_notifications")
      .select("id, type, title, message, is_read, link, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[GET /api/dashboard/notifications] query error:", error);
      return NextResponse.json({ error: "조회 중 오류가 발생했습니다" }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    console.error("[GET /api/dashboard/notifications]", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id, markAllRead } = body;

    const service = getServiceClient();

    if (markAllRead) {
      const { error } = await service
        .from("user_notifications")
        .update({ is_read: true })
        .eq("user_id", user!.id)
        .eq("is_read", false);

      if (error) {
        console.error("[PATCH /api/dashboard/notifications] mark all error:", error);
        return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "ID가 필요합니다" }, { status: 400 });
    }

    const { error } = await service
      .from("user_notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", user!.id);

    if (error) {
      console.error("[PATCH /api/dashboard/notifications] mark read error:", error);
      return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/dashboard/notifications]", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
