/**
 * backlinkshop.co.kr 공유 캐시 헬퍼
 *
 * - 모든 함수는 절대 throw하지 않음 (캐시 실패가 메인 기능을 막으면 안 됨)
 * - CACHE_API_URL / CACHE_API_KEY 미설정 시 null 반환하여 캐시 스킵
 */

const getBaseUrl = () => process.env.CACHE_API_URL ?? "https://backlinkshop.co.kr";
const getApiKey = () => process.env.CACHE_API_KEY ?? "";

function buildHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-api-key": getApiKey(),
  };
}

// ─────────────────────────────────────────────
// GET helpers
// ─────────────────────────────────────────────

export interface CachedMetricsData {
  mozDA?: number | null;
  mozPA?: number | null;
  mozLinks?: number | null;
  mozSpam?: number | null;
  majesticTF?: number | null;
  majesticCF?: number | null;
  majesticLinks?: number | null;
  majesticRefDomains?: number | null;
  majesticTTF0Name?: string | null;
  ahrefsDR?: number | null;
  ahrefsBacklinks?: number | null;
  ahrefsRefDomains?: number | null;
  ahrefsTraffic?: number | null;
  ahrefsTrafficValue?: number | null;
  ahrefsOrganicKeywords?: number | null;
}

export interface CachedMetricsResponse {
  source: "cache" | "api";
  domain: string;
  data: CachedMetricsData;
  fetched_at: string;
}

export async function getCachedMetrics(
  domain: string
): Promise<CachedMetricsResponse | null> {
  if (!getApiKey()) return null;
  try {
    const res = await fetch(
      `${getBaseUrl()}/api/cache/metrics?domain=${encodeURIComponent(domain)}`,
      { headers: buildHeaders(), next: { revalidate: 0 } }
    );
    if (!res.ok) return null;
    return (await res.json()) as CachedMetricsResponse;
  } catch {
    return null;
  }
}

export interface CachedBacklinkData {
  backlinkTotal?: number | null;
  backlinkDoFollow?: number | null;
  referringDomains?: number | null;
  referringDoFollow?: number | null;
}

export interface CachedBacklinkResponse {
  source: "cache" | "api";
  domain: string;
  data: CachedBacklinkData;
  fetched_at: string;
}

export async function getCachedBacklink(
  domain: string
): Promise<CachedBacklinkResponse | null> {
  if (!getApiKey()) return null;
  try {
    const res = await fetch(
      `${getBaseUrl()}/api/cache/backlink?domain=${encodeURIComponent(domain)}`,
      { headers: buildHeaders(), next: { revalidate: 0 } }
    );
    if (!res.ok) return null;
    return (await res.json()) as CachedBacklinkResponse;
  } catch {
    return null;
  }
}

export interface CachedSerpItem {
  url: string;
  title: string;
}

export interface CachedSerpResponse {
  source: "cache" | "api";
  keyword: string;
  data: CachedSerpItem[];
  fetched_at: string;
}

export async function getCachedSerp(
  keyword: string
): Promise<CachedSerpResponse | null> {
  if (!getApiKey()) return null;
  try {
    const res = await fetch(
      `${getBaseUrl()}/api/cache/serp?keyword=${encodeURIComponent(keyword)}`,
      { headers: buildHeaders(), next: { revalidate: 0 } }
    );
    if (!res.ok) return null;
    return (await res.json()) as CachedSerpResponse;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// POST helpers (fire-and-forget 용도)
// ─────────────────────────────────────────────

export async function saveMetricsToCache(
  domain: string,
  metrics: CachedMetricsData
): Promise<void> {
  if (!getApiKey()) return;
  try {
    await fetch(`${getBaseUrl()}/api/cache/metrics`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ domain, metrics }),
    });
  } catch {
    // 실패 무시
  }
}

export async function saveBacklinkToCache(
  domain: string,
  metrics: {
    backlinkTotal: number | null;
    backlinkDoFollow: number | null;
    referringDomains: number | null;
    referringDoFollow: number | null;
  }
): Promise<void> {
  if (!getApiKey()) return;
  try {
    await fetch(`${getBaseUrl()}/api/cache/backlink`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ domain, metrics }),
    });
  } catch {
    // 실패 무시
  }
}

export async function saveSerpToCache(
  keyword: string,
  results: CachedSerpItem[]
): Promise<void> {
  if (!getApiKey()) return;
  try {
    await fetch(`${getBaseUrl()}/api/cache/serp`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ keyword, results }),
    });
  } catch {
    // 실패 무시
  }
}
