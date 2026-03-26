import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit, isProUser } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const RDAP_BASE = "https://rdap.org/domain";
const TIMEOUT_MS = 5000;

interface AvailabilityResult {
  tld: string;
  domain: string;
  available: boolean | null;
}

async function checkDomain(
  name: string,
  tld: string
): Promise<AvailabilityResult> {
  const fullDomain = `${name}.${tld}`;

  // 1차: RDAP 시도
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(`${RDAP_BASE}/${fullDomain}`, {
      signal: controller.signal,
      headers: { Accept: "application/rdap+json" },
    });
    clearTimeout(timer);

    if (res.status === 404) {
      return { tld, domain: fullDomain, available: true };
    }
    if (res.status === 200) {
      return { tld, domain: fullDomain, available: false };
    }
  } catch {
    // RDAP 실패 — DNS fallback
  }

  // 2차: DNS 조회 fallback (A 레코드 없으면 미등록 가능성)
  try {
    const dnsResp = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(fullDomain)}&type=A`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (dnsResp.ok) {
      const dnsData = await dnsResp.json();
      // NXDOMAIN (Status 3) = 도메인 존재하지 않음 = 등록 가능
      if (dnsData.Status === 3) {
        return { tld, domain: fullDomain, available: true };
      }
      // 정상 응답 = 도메인 존재 = 등록됨
      if (dnsData.Status === 0 && dnsData.Answer?.length > 0) {
        return { tld, domain: fullDomain, available: false };
      }
    }
  } catch {
    // DNS도 실패
  }

  return { tld, domain: fullDomain, available: null };
}

const ALLOWED_TLDS = new Set([
  "com",
  "net",
  "org",
  "io",
  "ai",
  "co",
  "dev",
  "app",
]);

export async function GET(request: NextRequest) {
  // Rate limit 체크
  const pro = await isProUser(request);
  if (!pro) {
    const rateLimit = await checkApiRateLimit("domain_availability", 30);
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

  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain")?.trim().toLowerCase();
  const tldsParam = searchParams.get("tlds");

  if (!domain || domain.length === 0) {
    return NextResponse.json(
      { error: "domain parameter is required" },
      { status: 400 }
    );
  }

  // Remove any existing TLD from input
  const name = domain.replace(/\.[a-z]+$/, "");

  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(name)) {
    return NextResponse.json(
      { error: "Invalid domain name" },
      { status: 400 }
    );
  }

  const tlds = tldsParam
    ? tldsParam
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => ALLOWED_TLDS.has(t))
    : Array.from(ALLOWED_TLDS);

  if (tlds.length === 0) {
    return NextResponse.json(
      { error: "No valid TLDs specified" },
      { status: 400 }
    );
  }

  const settled = await Promise.allSettled(
    tlds.map((tld) => checkDomain(name, tld))
  );

  const results: AvailabilityResult[] = settled.map((result, i) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return {
      tld: tlds[i],
      domain: `${name}.${tlds[i]}`,
      available: null,
    };
  });

  return NextResponse.json({ results });
}
