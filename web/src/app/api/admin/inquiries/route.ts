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

  // broker_inquiries와 inquiries를 별도로 조회
  const [brokerResult, marketResult] = await Promise.all([
    client
      .from("broker_inquiries")
      .select("*")
      .order("created_at", { ascending: false }),
    client
      .from("inquiries")
      .select("*, marketplace_listings(domain_id, domains(name))")
      .order("created_at", { ascending: false }),
  ]);

  const brokerInquiries = (brokerResult.data ?? []).map((item) => ({
    ...item,
    type: "broker" as const,
  }));

  const marketInquiries = (marketResult.data ?? []).map((item) => ({
    ...item,
    type: "marketplace" as const,
  }));

  // 합쳐서 최신순 정렬
  const all = [...brokerInquiries, ...marketInquiries].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json({ inquiries: all });
}

export async function PATCH(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, type } = body;

    if (!id || !status || !type) {
      return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
    }

    const table = type === "broker" ? "broker_inquiries" : "inquiries";
    const client = createServiceClient();
    const { error } = await client
      .from(table)
      .update({ status })
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
