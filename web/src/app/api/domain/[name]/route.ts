import { NextRequest, NextResponse } from "next/server";
import { getDomainByName, ensureDomainInDb } from "@/lib/db/domains";
import { saveWaybackToDb } from "@/lib/db/wayback";
import { fetchDomainMetrics } from "@/lib/external/rapidapi";
import { fetchWayback } from "@/lib/external/wayback";
import { isStale } from "@/lib/cache";
import { checkApiRateLimit, isProUser } from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    // Rate limit 체크
    const pro = await isProUser(request);
    if (!pro) {
      const rateLimit = await checkApiRateLimit("domain_analysis", 10);
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

    const { name } = await params;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "도메인 이름이 필요합니다" }, { status: 400 });
    }

    if (name.length > 253 || !name.includes(".")) {
      return NextResponse.json({ error: "유효하지 않은 도메인 이름입니다" }, { status: 400 });
    }

    // 1. DB에 도메인이 없으면 자동 생성
    const domainId = await ensureDomainInDb(name);

    // 2. DB에서 기존 데이터 조회
    const detail = await getDomainByName(name);

    // 3. 갱신 필요 여부 판단 (7일 캐시)
    const needsMetricsRefresh =
      !detail?.metrics || isStale(detail.metrics.updatedAt);
    const needsWaybackRefresh = !detail?.wayback;

    // 4. 필요한 외부 API만 호출 (병렬)
    const [freshMetrics, freshWayback] = await Promise.all([
      needsMetricsRefresh
        ? fetchDomainMetrics(domainId, name)
        : Promise.resolve(null),
      needsWaybackRefresh
        ? fetchWayback(domainId, name)
        : Promise.resolve(null),
    ]);

    // 5. Wayback 결과 DB 저장
    if (freshWayback) {
      await saveWaybackToDb(domainId, freshWayback);
    }

    // 6. 최종 데이터 조합
    return NextResponse.json({
      data: {
        domain: detail?.domain ?? {
          id: domainId,
          name,
          tld: name.split(".").pop() ?? "",
          status: "active",
          source: "other",
          createdAt: new Date().toISOString(),
        },
        metrics: freshMetrics ?? detail?.metrics ?? null,
        salesHistory: detail?.salesHistory ?? [],
        wayback: freshWayback ?? detail?.wayback ?? null,
        whois: null,
      },
    });
  } catch (error) {
    console.error("[GET /api/domain/[name]] error:", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
