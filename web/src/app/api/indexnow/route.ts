import { NextRequest, NextResponse } from "next/server";

const INDEXNOW_KEY = "5e719efc685a7216a93e057ed57a0c68";
const SITE_URL = "https://domainchecker.co.kr";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export async function POST(request: NextRequest) {
  // 인증: SUPABASE_SERVICE_ROLE_KEY로 내부 호출 여부 확인
  const authHeader = request.headers.get("authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { urls } = body as { urls?: unknown };

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: "urls array required" }, { status: 400 });
  }

  // 문자열만 허용, 최대 100개 제한
  const validUrls = urls.filter((u): u is string => typeof u === "string").slice(0, 100);
  if (validUrls.length === 0) {
    return NextResponse.json({ error: "urls must be non-empty strings" }, { status: 400 });
  }

  const fullUrls = validUrls.map((u) =>
    u.startsWith("http") ? u : `${SITE_URL}${u}`
  );

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "domainchecker.co.kr",
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: fullUrls,
      }),
    });

    return NextResponse.json({
      success: true,
      status: response.status,
      submitted: fullUrls,
    });
  } catch {
    return NextResponse.json(
      { error: "IndexNow submission failed" },
      { status: 502 }
    );
  }
}
