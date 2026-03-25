import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
