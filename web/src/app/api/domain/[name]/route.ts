import { NextRequest, NextResponse } from "next/server";
import { getDomainByName } from "@/lib/db/domains";
import { fetchDomainMetrics } from "@/lib/external/rapidapi";
import { fetchWayback } from "@/lib/external/wayback";
import { fetchWhois } from "@/lib/external/whois";

const METRICS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7일

function isMetricsStale(updatedAt: string): boolean {
  return Date.now() - new Date(updatedAt).getTime() > METRICS_TTL_MS;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "도메인 이름이 필요합니다" }, { status: 400 });
    }

    // 도메인 이름 기본 검증 (길이, 허용 문자)
    if (name.length > 253) {
      return NextResponse.json({ error: "유효하지 않은 도메인 이름입니다" }, { status: 400 });
    }

    const detail = await getDomainByName(name);

    if (!detail) {
      return NextResponse.json({ error: "도메인을 찾을 수 없습니다" }, { status: 404 });
    }

    // metrics 갱신 여부 판단
    const needsMetricsRefresh =
      !detail.metrics || isMetricsStale(detail.metrics.updatedAt);

    // wayback, whois, metrics(필요시)를 병렬 fetch
    const [freshMetrics, wayback, whois] = await Promise.all([
      needsMetricsRefresh
        ? fetchDomainMetrics(detail.domain.id, detail.domain.name)
        : Promise.resolve(null),
      fetchWayback(detail.domain.id, detail.domain.name),
      fetchWhois(detail.domain.name),
    ]);

    const resolvedMetrics = freshMetrics ?? detail.metrics;
    const resolvedWayback = wayback ?? detail.wayback;

    return NextResponse.json({
      data: {
        ...detail,
        metrics: resolvedMetrics,
        wayback: resolvedWayback,
        whois,
      },
    });
  } catch (error) {
    console.error("[GET /api/domain/[name]] error:", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
