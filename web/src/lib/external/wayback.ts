import type { WaybackSummary } from "@/types/domain";

interface CdxEntry {
  timestamp: string;
  statuscode: string;
}

export async function fetchWayback(
  domainId: string,
  domainName: string
): Promise<WaybackSummary | null> {
  try {
    const url = new URL("http://web.archive.org/cdx/search/cdx");
    url.searchParams.set("url", domainName);
    url.searchParams.set("output", "json");
    url.searchParams.set("limit", "10");
    url.searchParams.set("fl", "timestamp,statuscode");

    const res = await fetch(url.toString(), {
      next: { revalidate: 0 },
    });

    if (!res.ok) return null;

    const raw: unknown = await res.json();

    // CDX returns array of arrays; first row is header
    if (!Array.isArray(raw) || raw.length < 2) {
      return {
        domainId,
        firstSnapshotAt: null,
        lastSnapshotAt: null,
        totalSnapshots: 0,
      };
    }

    const rows = raw.slice(1) as string[][];
    const entries: CdxEntry[] = rows.map((r) => ({
      timestamp: r[0],
      statuscode: r[1],
    }));

    const parseTs = (ts: string): string => {
      // Format: YYYYMMDDHHmmss → ISO
      return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}T${ts.slice(8, 10)}:${ts.slice(10, 12)}:${ts.slice(12, 14)}Z`;
    };

    return {
      domainId,
      firstSnapshotAt: entries.length > 0 ? parseTs(entries[0].timestamp) : null,
      lastSnapshotAt: entries.length > 0 ? parseTs(entries[entries.length - 1].timestamp) : null,
      totalSnapshots: entries.length,
    };
  } catch (err) {
    console.error("fetchWayback failed:", err);
    return null;
  }
}
