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
    const email = user.email;

    const [searchesRes, favoritesRes, inquiriesRes, notificationsRes] = await Promise.all([
      service.from("user_searches").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      service.from("wishlists").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      // email이 null이면 쿼리 스킵 — count 0으로 처리
      email
        ? service.from("broker_inquiries").select("id", { count: "exact", head: true }).eq("email", email)
        : Promise.resolve({ count: 0 }),
      service.from("user_notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
    ]);

    return NextResponse.json({
      searches: searchesRes.count ?? 0,
      favorites: favoritesRes.count ?? 0,
      inquiries: inquiriesRes.count ?? 0,
      unreadNotifications: notificationsRes.count ?? 0,
    });
  } catch (error) {
    console.error("[GET /api/dashboard/stats]", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
