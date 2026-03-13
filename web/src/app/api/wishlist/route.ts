import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const client = createServerClient();
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    const client = createServerClient();
    const { data, error } = await client
      .from("wishlists")
      .select("id, created_at, domains!inner(id, name, tld, status, source, domain_metrics!left(moz_da, ahrefs_dr, majestic_tf, ahrefs_traffic), auction_listings!left(current_price_usd))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error("[GET /api/wishlist] error:", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    const body: unknown = await req.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "올바른 JSON 형식이 필요합니다" }, { status: 400 });
    }
    const { domainId } = body as Record<string, unknown>;
    if (!domainId || typeof domainId !== "string") {
      return NextResponse.json({ error: "domainId가 필요합니다" }, { status: 400 });
    }
    const client = createServerClient();
    const { data: existing } = await client
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("domain_id", domainId)
      .single();
    if (existing) {
      await client.from("wishlists").delete().eq("id", existing.id);
      return NextResponse.json({ data: { action: "removed" } });
    } else {
      await client.from("wishlists").insert({ user_id: user.id, domain_id: domainId });
      return NextResponse.json({ data: { action: "added" } }, { status: 201 });
    }
  } catch (error) {
    console.error("[POST /api/wishlist] error:", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
