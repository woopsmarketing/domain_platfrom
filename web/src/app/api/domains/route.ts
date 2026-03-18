import { NextRequest, NextResponse } from "next/server";
import { getDomains } from "@/lib/db/domains";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const tabParam = searchParams.get("tab") ?? "recent";
    const sourceParam = searchParams.get("source") ?? "all";
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    // Validate source
    const allowedSources = ["all", "godaddy", "namecheap", "dynadot"] as const;
    type Source = (typeof allowedSources)[number];
    if (!allowedSources.includes(sourceParam as Source)) {
      return NextResponse.json(
        { error: "source 값은 all | godaddy | namecheap | dynadot 중 하나여야 합니다" },
        { status: 400 }
      );
    }
    const source = sourceParam as Source;

    // Validate tab
    const allowedTabs = ["recent", "highvalue", "all"] as const;
    type Tab = (typeof allowedTabs)[number];
    if (!allowedTabs.includes(tabParam as Tab)) {
      return NextResponse.json(
        { error: "tab 값은 recent | highvalue | all 중 하나여야 합니다" },
        { status: 400 }
      );
    }
    const tab = tabParam as Tab;

    // Validate page / limit
    const page = pageParam !== null ? parseInt(pageParam, 10) : 1;
    const limit = limitParam !== null ? parseInt(limitParam, 10) : 50;

    if (isNaN(page) || page < 1) {
      return NextResponse.json({ error: "page는 1 이상의 정수여야 합니다" }, { status: 400 });
    }
    if (isNaN(limit) || limit < 1 || limit > 200) {
      return NextResponse.json(
        { error: "limit는 1~200 사이의 정수여야 합니다" },
        { status: 400 }
      );
    }

    const { data, total } = await getDomains({ tab, source, page, limit });

    return NextResponse.json({
      data,
      meta: { total, page, limit },
    });
  } catch (error) {
    console.error("[GET /api/domains] error:", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
