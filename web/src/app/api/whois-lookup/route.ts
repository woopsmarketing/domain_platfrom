import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const domain = searchParams.get("domain");

  if (!domain || !domain.includes(".")) {
    return NextResponse.json({ error: "도메인 이름이 필요합니다" }, { status: 400 });
  }

  try {
    const resp = await fetch(
      `https://rdap.org/domain/${encodeURIComponent(domain)}`,
      {
        cache: "no-store",
        headers: { Accept: "application/rdap+json" },
      }
    );

    if (!resp.ok) {
      return NextResponse.json(
        { error: "WHOIS 정보를 찾을 수 없습니다" },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "WHOIS 서버 연결 실패" }, { status: 500 });
  }
}
