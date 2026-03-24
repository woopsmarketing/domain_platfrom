import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get("name");
  const type = searchParams.get("type") ?? "A";

  if (!name || !name.includes(".")) {
    return NextResponse.json({ error: "도메인 이름이 필요합니다" }, { status: 400 });
  }

  try {
    const resp = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`,
      { cache: "no-store" }
    );

    if (!resp.ok) {
      return NextResponse.json({ error: "DNS 조회 실패" }, { status: resp.status });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "DNS 서버 연결 실패" }, { status: 500 });
  }
}
