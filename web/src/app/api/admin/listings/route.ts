import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

async function verifyAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return !!user && user.id === ADMIN_USER_ID;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = createServiceClient();
  const { data, error } = await client
    .from("marketplace_listings")
    .select("*, domains(name, tld)")
    .order("listed_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listings: data ?? [] });
}

export async function POST(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { domain_name, asking_price, description, is_negotiable } = body;

    if (!domain_name || !asking_price) {
      return NextResponse.json(
        { error: "도메인 이름과 가격은 필수입니다" },
        { status: 400 }
      );
    }

    const client = createServiceClient();

    // domains 테이블에서 검색, 없으면 자동 생성
    const parts = domain_name.split(".");
    const tld = parts.length > 1 ? parts.slice(1).join(".") : "com";

    let { data: domain } = await client
      .from("domains")
      .select("id")
      .eq("name", domain_name)
      .maybeSingle();

    if (!domain) {
      const { data: newDomain, error: domainError } = await client
        .from("domains")
        .insert({ name: domain_name, tld, status: "active", source: "other" })
        .select("id")
        .single();

      if (domainError) {
        return NextResponse.json(
          { error: "도메인 등록에 실패했습니다" },
          { status: 500 }
        );
      }
      domain = newDomain;
    }

    const { error: listingError } = await client
      .from("marketplace_listings")
      .insert({
        domain_id: domain.id,
        asking_price: Number(asking_price),
        description: description || null,
        is_negotiable: is_negotiable ?? false,
        is_active: true,
      });

    if (listingError) {
      return NextResponse.json(
        { error: "판매 등록에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "요청을 처리할 수 없습니다" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, is_active } = body;

    if (!id || typeof is_active !== "boolean") {
      return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
    }

    const client = createServiceClient();
    const { error } = await client
      .from("marketplace_listings")
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "요청을 처리할 수 없습니다" },
      { status: 400 }
    );
  }
}
