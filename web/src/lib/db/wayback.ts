import { createServiceClient } from "@/lib/supabase";

/**
 * Wayback 결과를 DB에 저장 (upsert, 7일 캐시)
 */
export async function saveWaybackToDb(
  domainId: string,
  wayback: {
    totalSnapshots: number;
    firstSnapshotAt: string | null;
    lastSnapshotAt: string | null;
  }
) {
  const client = createServiceClient();
  await client.from("wayback_summary").upsert(
    {
      domain_id: domainId,
      total_snapshots: wayback.totalSnapshots,
      first_snapshot_at: wayback.firstSnapshotAt,
      last_snapshot_at: wayback.lastSnapshotAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "domain_id" }
  );
}
