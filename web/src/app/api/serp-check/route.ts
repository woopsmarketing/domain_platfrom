import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit, isProUser } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const locale = searchParams.get("locale") || "ko-KR";
  const device = searchParams.get("device") || "desktop_chrome";

  if (!q) {
    return NextResponse.json(
      { error: "검색 키워드를 입력해주세요" },
      { status: 400 }
    );
  }

  // Rate limit: Free 2회/일, Pro 무제한
  const pro = await isProUser(request);
  if (!pro) {
    const rateLimit = await checkApiRateLimit("serp_check", 2);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "일일 사용 한도를 초과했습니다. Pro 구독으로 무제한 사용하세요.",
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
      `https://vebapi.com/api/serp/google?q=${encodeURIComponent(q)}&locale=${locale}&device_type=${device}&page_count=1`,
      {
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      console.error("SERP API error:", res.status);
      return NextResponse.json(
        { error: "검색 결과를 가져올 수 없습니다" },
        { status: 502 }
      );
    }

    const json = await res.json();

    // 핵심 데이터만 추출하여 반환
    const content = json?.results?.results?.[0]?.content?.results?.results;
    if (!content) {
      return NextResponse.json(
        { error: "검색 결과가 없습니다" },
        { status: 404 }
      );
    }

    const result: {
      query: string;
      totalResults: number;
      organic: {
        pos: number;
        posOverall: number;
        title: string;
        url: string;
        urlShown: string;
        desc: string;
        faviconText: string;
        rating: number | null;
      }[];
      relatedSearches: string[];
      relatedQuestions: { question: string; answer: string | null }[];
      aiOverview: string | null;
      truncated?: boolean;
    } = {
      query: content.search_information?.query || q,
      totalResults: content.search_information?.total_results_count || 0,
      organic: (content.organic || []).map((item: Record<string, unknown>) => ({
        pos: item.pos as number,
        posOverall: item.pos_overall as number,
        title: item.title as string,
        url: item.url as string,
        urlShown: item.url_shown as string,
        desc: item.desc as string,
        faviconText: item.favicon_text as string,
        rating: (item.rating as number) || null,
      })),
      relatedSearches:
        content.related_searches?.[0]?.related_searches || [],
      relatedQuestions: (content.related_questions?.items || []).map(
        (item: Record<string, unknown>) => ({
          question: item.question as string,
          answer: (item.answer as string) || null,
        })
      ),
      aiOverview:
        content.ai_overviews?.[0]?.answer_text?.[0]?.text?.[0] || null,
    };

    // Free 사용자는 상위 5개만
    if (!pro && result.organic.length > 5) {
      result.organic = result.organic.slice(0, 5);
      result.truncated = true;
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("SERP check error:", err);
    return NextResponse.json(
      { error: "검색 순위 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
