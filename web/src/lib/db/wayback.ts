import { createServiceClient } from "@/lib/supabase";

/**
 * Wayback 결과를 DB에 저장 (upsert).
 * - 모든 값이 비어있는 결과(`total=0 + first=null + last=null`)는 저장 거부.
 *   API 실패가 정상 결과처럼 보일 가능성을 차단 — 다음 호출 때 재시도하도록 둠.
 */
export async function saveWaybackToDb(
  domainId: string,
  wayback: {
    totalSnapshots: number;
    firstSnapshotAt: string | null;
    lastSnapshotAt: string | null;
  }
) {
  const isEmpty =
    wayback.totalSnapshots === 0 &&
    wayback.firstSnapshotAt === null &&
    wayback.lastSnapshotAt === null;

  if (isEmpty) {
    console.log("[Wayback] empty result — skipping DB save (will retry next call)");
    return;
  }

  const client = createServiceClient();
  const { error } = await client.from("wayback_summary").upsert(
    {
      domain_id: domainId,
      total_snapshots: wayback.totalSnapshots,
      first_snapshot_at: wayback.firstSnapshotAt,
      last_snapshot_at: wayback.lastSnapshotAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "domain_id" }
  );

  if (error) {
    console.error("[Wayback] DB upsert failed:", error.message);
  }
}
