import type { WaybackSummary } from "@/types/domain";

const CDX_BASE = "http://web.archive.org/cdx/search/cdx";

function parseTs(ts: string): string {
  return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}T${ts.slice(8, 10)}:${ts.slice(10, 12)}:${ts.slice(12, 14)}Z`;
}

/** limit=1 (첫 스냅샷) 또는 limit=-1 (마지막 스냅샷) */
async function fetchOneSnapshot(domain: string, fromEnd: boolean): Promise<string | null> {
  const url = new URL(CDX_BASE);
  url.searchParams.set("url", domain);
  url.searchParams.set("output", "json");
  url.searchParams.set("fl", "timestamp");
  url.searchParams.set("limit", fromEnd ? "-1" : "1");

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) return null;

  const raw: unknown = await res.json();
  if (!Array.isArray(raw) || raw.length < 2) return null;

  const ts = (raw[1] as string[])[0];
  return ts ? parseTs(ts) : null;
}

/** text 모드로 줄 수를 세서 총 스냅샷 수 계산 */
// 최대 10,000개까지만 카운트 (속도 우선 — 초과 시 DB에 -1 저장해 "10,000+" 표시)
const COUNT_LIMIT = 10000;

async function fetchTotalCount(domain: string): Promise<number> {
  const url = new URL(CDX_BASE);
  url.searchParams.set("url", domain);
  url.searchParams.set("fl", "timestamp");
  url.searchParams.set("limit", String(COUNT_LIMIT));
  // output=json 없이 text 모드 → 한 줄 = 한 레코드

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) return 0;

  const text = await res.text();
  if (!text.trim()) return 0;
  const lines = text.trim().split("\n");
  // limit에 도달하면 실제 개수는 더 많음 → -1로 표시
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
    };
  } catch (err) {
    console.error("fetchWayback failed:", err);
    return null;
  }
}
