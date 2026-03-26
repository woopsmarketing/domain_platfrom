import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit, isProUser } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Rate limit 체크
  const pro = await isProUser(request);
  if (!pro) {
    const rateLimit = await checkApiRateLimit("http_status", 5);
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

  const domain = request.nextUrl.searchParams.get("domain");
  if (!domain || !domain.includes(".")) {
    return NextResponse.json({ error: "도메인이 필요합니다" }, { status: 400 });
  }

  const clean = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  const results: { url: string; status: number; statusText: string; location?: string }[] = [];

  let currentUrl = `https://${clean}`;
  const maxRedirects = 10;

  for (let i = 0; i < maxRedirects; i++) {
    try {
      const resp = await fetch(currentUrl, {
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; DomainChecker/1.0)" },
        signal: AbortSignal.timeout(5000),
      });

      const entry: (typeof results)[number] = {
        url: currentUrl,
        status: resp.status,
        statusText: resp.statusText,
      };

      if (resp.status >= 300 && resp.status < 400) {
        const location = resp.headers.get("location");
        if (location) {
          entry.location = location;
          results.push(entry);
          currentUrl = location.startsWith("http") ? location : new URL(location, currentUrl).href;
          continue;
        }
      }

      results.push(entry);
      break;
    } catch {
      results.push({ url: currentUrl, status: 0, statusText: "연결 실패" });
      break;
    }
  }

  return NextResponse.json({ chain: results, finalStatus: results[results.length - 1]?.status ?? 0 });
}
