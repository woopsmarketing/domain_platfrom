import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ─── JWT / OAuth2 ─────────────────────────────────────────────────────────────

function createJWT(email: string, privateKey: string): string {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const unsignedToken = `${encode(header)}.${encode(payload)}`;
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(unsignedToken);
  const signature = sign.sign(privateKey, "base64url");

  return `${unsignedToken}.${signature}`;
}

async function getAccessToken(
  email: string,
  privateKey: string
): Promise<string> {
  const jwt = createJWT(email, privateKey);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    throw new Error(`OAuth2 token exchange failed: ${res.status}`);
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("No access_token in OAuth2 response");
  }
  return data.access_token;
}

// ─── Google Indexing API ──────────────────────────────────────────────────────

async function submitToGoogle(
  url: string,
  accessToken: string
): Promise<{ url: string; status: number; ok: boolean }> {
  const res = await fetch(
    "https://indexing.googleapis.com/v3/urlNotifications:publish",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ url, type: "URL_UPDATED" }),
    }
  );
  return { url, status: res.status, ok: res.ok };
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 인증: SUPABASE_SERVICE_ROLE_KEY로 내부 호출 여부 확인
  const authHeader = request.headers.get("authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 요청 파싱
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
  const validUrls = urls
    .filter((u): u is string => typeof u === "string" && u.startsWith("https://"))
    .slice(0, 100);

  if (validUrls.length === 0) {
    return NextResponse.json(
      { error: "urls must be non-empty https:// strings" },
      { status: 400 }
    );
  }

  // 서비스 계정 키 로드 (base64 → JSON.parse)
  const encodedKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!encodedKey) {
    return NextResponse.json(
      { error: "Google service account not configured" },
      { status: 503 }
    );
  }

  let serviceAccount: { client_email: string; private_key: string };
  try {
    const decoded = Buffer.from(encodedKey, "base64").toString("utf-8");
    serviceAccount = JSON.parse(decoded) as {
      client_email: string;
      private_key: string;
    };
    if (!serviceAccount.client_email || !serviceAccount.private_key) {
      throw new Error("Missing required fields");
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid service account configuration" },
      { status: 503 }
    );
  }

  // Access token 발급
  let accessToken: string;
  try {
    accessToken = await getAccessToken(
      serviceAccount.client_email,
      serviceAccount.private_key
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to obtain Google access token" },
      { status: 502 }
    );
  }

  // 각 URL에 대해 Google Indexing API 호출
  const results = await Promise.allSettled(
    validUrls.map((url) => submitToGoogle(url, accessToken))
  );

  const summary = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return { url: validUrls[i], status: 0, ok: false };
  });

  const allOk = summary.every((s) => s.ok);

  return NextResponse.json(
    { success: allOk, submitted: summary },
    { status: allOk ? 200 : 207 }
  );
}
