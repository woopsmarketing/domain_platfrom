import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getServiceClient } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const check = searchParams.get("check");

    const service = getServiceClient();

    // 단건 체크: 특정 도메인이 즐겨찾기에 있는지 확인
    if (check) {
      const { data } = await service
        .from("wishlists")
        .select("id")
        .eq("user_id", user!.id)
        .eq("domain_name", check)
        .maybeSingle();
      return NextResponse.json({ isFavorite: !!data, id: data?.id ?? null });
    }

    const { data, error } = await service
      .from("wishlists")
      .select("id, domain_name, memo, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/dashboard/favorites] query error:", error);
      return NextResponse.json({ error: "조회 중 오류가 발생했습니다" }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    console.error("[GET /api/dashboard/favorites]", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { domain_name, memo } = body;

    if (!domain_name) {
      return NextResponse.json({ error: "도메인 이름이 필요합니다" }, { status: 400 });
    }

    const service = getServiceClient();

    // 중복 체크
    const { data: existing } = await service
      .from("wishlists")
      .select("id")
      .eq("user_id", user!.id)
      .eq("domain_name", domain_name)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "이미 즐겨찾기에 추가된 도메인입니다" }, { status: 409 });
    }

    const { data, error } = await service
      .from("wishlists")
      .insert({
        user_id: user!.id,
        domain_name,
        memo: memo ?? null,
      })
      .select("id, domain_name, memo, created_at")
      .maybeSingle();

    if (error) {
      console.error("[POST /api/dashboard/favorites] insert error:", error);
      return NextResponse.json({ error: "추가 중 오류가 발생했습니다" }, { status: 500 });
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/dashboard/favorites]", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID가 필요합니다" }, { status: 400 });
    }

    const service = getServiceClient();
    const { error } = await service
      .from("wishlists")
      .delete()
      .eq("id", id)
      .eq("user_id", user!.id);

    if (error) {
      console.error("[DELETE /api/dashboard/favorites] delete error:", error);
      return NextResponse.json({ error: "삭제 중 오류가 발생했습니다" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/dashboard/favorites]", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id, memo } = body;

    if (!id) {
      return NextResponse.json({ error: "ID가 필요합니다" }, { status: 400 });
    }

    const service = getServiceClient();
    const { data, error } = await service
      .from("wishlists")
      .update({ memo: memo ?? null })
      .eq("id", id)
      .eq("user_id", user!.id)
      .select("id, domain_name, memo, created_at")
      .maybeSingle();

    if (error) {
      console.error("[PATCH /api/dashboard/favorites] update error:", error);
      return NextResponse.json({ error: "수정 중 오류가 발생했습니다" }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    console.error("[PATCH /api/dashboard/favorites]", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
