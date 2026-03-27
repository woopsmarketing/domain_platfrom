import { NextResponse } from "next/server";
import { requireAuth, getServiceClient } from "@/lib/api-helpers";

export async function GET() {
  try {
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const service = getServiceClient();
    const email = user!.email;

    const [searchesRes, favoritesRes, inquiriesRes, notificationsRes] = await Promise.all([
      service.from("user_searches").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      service.from("wishlists").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      email
        ? service.from("broker_inquiries").select("id", { count: "exact", head: true }).eq("email", email)
        : Promise.resolve({ count: 0 }),
      service.from("user_notifications").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("is_read", false),
    ]);

    return NextResponse.json({
      searches: searchesRes.count ?? 0,
      favorites: favoritesRes.count ?? 0,
      inquiries: inquiriesRes.count ?? 0,
      unreadNotifications: notificationsRes.count ?? 0,
    }, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("[GET /api/dashboard/stats]", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
