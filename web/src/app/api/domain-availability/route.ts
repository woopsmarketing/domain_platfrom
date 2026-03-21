import { NextRequest, NextResponse } from "next/server";

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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${RDAP_BASE}/${fullDomain}`, {
      signal: controller.signal,
      headers: {
        Accept: "application/rdap+json",
      },
    });
    clearTimeout(timer);

    if (res.status === 404) {
      return { tld, domain: fullDomain, available: true };
    }
    if (res.status === 200) {
      return { tld, domain: fullDomain, available: false };
    }
    return { tld, domain: fullDomain, available: null };
  } catch {
    clearTimeout(timer);
    return { tld, domain: fullDomain, available: null };
  }
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
