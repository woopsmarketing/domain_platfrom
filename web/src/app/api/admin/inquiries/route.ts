import { NextResponse } from "next/server";
import { requireAdmin, getServiceClient } from "@/lib/api-helpers";

export async function GET() {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const client = getServiceClient();

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
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, status, type } = body;

    if (!id || !status || !type) {
      return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
    }

    const table = type === "broker" ? "broker_inquiries" : "inquiries";
    const client = getServiceClient();
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
