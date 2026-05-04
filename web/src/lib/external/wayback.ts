import type { WaybackSummary } from "@/types/domain";

const CDX_BASE = "http://web.archive.org/cdx/search/cdx";

function parseTs(ts: string): string {
  return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}T${ts.slice(8, 10)}:${ts.slice(10, 12)}:${ts.slice(12, 14)}Z`;
}

/** Internet Archive가 오프라인일 때 200 + HTML을 반환하는 경우 감지 */
function isHtmlResponse(text: string): boolean {
  const head = text.trim().slice(0, 200).toLowerCase();
  return head.startsWith("<!doctype") || head.startsWith("<html") || head.startsWith("<head");
}

/** limit=1 (첫 스냅샷) 또는 limit=-1 (마지막 스냅샷). API 실패 시 throw. */
async function fetchOneSnapshot(domain: string, fromEnd: boolean): Promise<string | null> {
  const url = new URL(CDX_BASE);
  url.searchParams.set("url", domain);
  url.searchParams.set("output", "json");
  url.searchParams.set("fl", "timestamp");
  url.searchParams.set("limit", fromEnd ? "-1" : "1");

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`CDX fetchOneSnapshot status ${res.status}`);

  const text = await res.text();
  if (isHtmlResponse(text)) {
    throw new Error("CDX returned HTML — Internet Archive likely offline");
  }
  if (!text.trim()) return null;

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("CDX returned non-JSON body");
  }
  if (!Array.isArray(raw) || raw.length < 2) return null;

  const ts = (raw[1] as string[])[0];
  return ts ? parseTs(ts) : null;
}

const COUNT_LIMIT = 10000;

/** 총 스냅샷 수. API 실패 시 throw. */
async function fetchTotalCount(domain: string): Promise<number> {
  const url = new URL(CDX_BASE);
  url.searchParams.set("url", domain);
  url.searchParams.set("fl", "timestamp");
  url.searchParams.set("limit", String(COUNT_LIMIT));

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`CDX fetchTotalCount status ${res.status}`);

  const text = await res.text();
  if (isHtmlResponse(text)) {
    throw new Error("CDX returned HTML — Internet Archive likely offline");
  }
  if (!text.trim()) return 0;

  const lines = text.trim().split("\n");
  return lines.length >= COUNT_LIMIT ? -1 : lines.length;
}

export async function fetchWayback(
  domainId: string,
  domainName: string
): Promise<WaybackSummary | null> {
  try {
    const [firstSnapshotAt, lastSnapshotAt, totalSnapshots] = await Promise.all([
      fetchOneSnapshot(domainName, false),
      fetchOneSnapshot(domainName, true),
      fetchTotalCount(domainName),
    ]);

    return {
      domainId,
      firstSnapshotAt,
      lastSnapshotAt,
      totalSnapshots,
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[Wayback] fetch failed for ${domainName}:`, err);
    return null;
  }
}
