import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit, isProUser } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const website = searchParams.get("website");

  if (!website) {
    return NextResponse.json(
      { error: "도메인을 입력해주세요" },
      { status: 400 }
    );
  }

  // Rate limit: Free 3회/일, Pro 무제한
  const pro = await isProUser(request);
  if (!pro) {
    const rateLimit = await checkApiRateLimit("backlink_check", 3);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "일일 사용 한도를 초과했습니다. Pro 구독으로 무제한 사용하세요.",
          limit: rateLimit.limit,
          used: rateLimit.used,
        },
        { status: 429 }
      );
    }
  }

  const apiKey = process.env.VEB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API 설정 오류" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://vebapi.com/api/seo/backlinkdata?website=${encodeURIComponent(website)}`,
      {
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Backlink API error:", res.status, errText);
      return NextResponse.json(
        { error: "백링크 데이터를 가져올 수 없습니다" },
        { status: 502 }
      );
    }

    const data = await res.json();

    // Pro가 아니면 백링크 목록을 상위 5개만 반환
    if (!pro && data.backlinks && data.backlinks.length > 5) {
      data.backlinks = data.backlinks.slice(0, 5);
      data.truncated = true;
      data.totalBacklinks = data.counts?.backlinks?.total ?? 0;
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Backlink check error:", err);
    return NextResponse.json(
      { error: "백링크 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
