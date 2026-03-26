import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit, isProUser } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Rate limit 체크
  const pro = await isProUser(request);
  if (!pro) {
    const rateLimit = await checkApiRateLimit("dns_checker", 5);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "일일 사용 한도를 초과했습니다. Pro 구독으로 무제한 사용하세요.",
          limit: rateLimit.limit,
          used: rateLimit.used,
        },
        { status: 429 }
      );
    }
  }

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
