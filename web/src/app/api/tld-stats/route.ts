import { NextResponse } from "next/server";
import { getTldStats } from "@/lib/db/analytics";

export async function GET() {
  try {
    const stats = await getTldStats();
    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error("[GET /api/tld-stats] error:", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
