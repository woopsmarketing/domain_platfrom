import { NextRequest, NextResponse } from "next/server";

// 봇 UA 탐지 함수
function isSuspiciousUA(ua: string): boolean {
  // Chrome/x.0.0.0 = 헤드리스/봇 (실제 Chrome은 빌드번호 있음, 예: Chrome/147.0.7234.86)
  if (/Chrome\/\d+\.0\.0\.0/.test(ua)) return true;
  // 일반적인 봇/크롤러 패턴
  if (/bot|crawler|spider|scraper|headless|python-requests|curl|wget|go-http/i.test(ua)) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const ua = request.headers.get("user-agent") || "";

  // 봇 UA 차단 (403)
  if (isSuspiciousUA(ua)) {
    return new NextResponse(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/domain/:path*", "/marketplace/:path*"],
};
