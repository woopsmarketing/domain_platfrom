import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getServiceClient } from "@/lib/api-helpers";

const ALLOWED_STATUSES = [
  "pending",
  "availability_checking",
  "waiting_payment",
  "payment_received",
  "transferring",
  "completed",
  "failed",
] as const;
type PurchaseRequestStatus = typeof ALLOWED_STATUSES[number];

// GET: 구매 신청 목록 조회 (status 필터, 최신순)
export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = request.nextUrl;
  const statusFilter = searchParams.get("status");

  const client = getServiceClient();

  let query = client
    .from("purchase_requests")
    .select(
      `
      id,
      listing_id,
      email,
      telegram_id,
      status,
      admin_memo,
      created_at,
      updated_at,
      marketplace_listings (
        id,
        asking_price,
        is_negotiable,
        is_active,
        domains (
          name,
          tld
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (statusFilter && ALLOWED_STATUSES.includes(statusFilter as PurchaseRequestStatus)) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ requests: data ?? [] });
}

// PATCH: 상태 변경 (+ completed 시 연관 레코드 업데이트)
export async function PATCH(request: Request) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, status, admin_memo } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "id와 status는 필수입니다" },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUSES.includes(status as PurchaseRequestStatus)) {
      return NextResponse.json(
        { error: `status는 ${ALLOWED_STATUSES.join(", ")} 중 하나여야 합니다` },
        { status: 400 }
      );
    }

    const client = getServiceClient();

    // 현재 구매 신청 조회 (listing_id 필요)
    const { data: purchaseRequest, error: fetchError } = await client
      .from("purchase_requests")
      .select("id, listing_id, status")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: "조회 중 오류가 발생했습니다" }, { status: 500 });
    }

    if (!purchaseRequest) {
      return NextResponse.json({ error: "존재하지 않는 구매 신청입니다" }, { status: 404 });
    }

    // purchase_requests 상태 업데이트
    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (admin_memo !== undefined) {
      updatePayload.admin_memo = admin_memo;
    }

    const { error: updateError } = await client
      .from("purchase_requests")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // completed: marketplace_listings.is_active = false + domains.status = "sold"
    if (status === "completed" && purchaseRequest.listing_id) {
      // listing 조회 (domain_id 필요)
      const { data: listing, error: listingFetchError } = await client
        .from("marketplace_listings")
        .select("id, domain_id")
        .eq("id", purchaseRequest.listing_id)
        .maybeSingle();

      if (listingFetchError || !listing) {
        console.error("listing fetch error:", listingFetchError);
        // 상태는 이미 업데이트됐으므로 경고 로그만 남기고 계속 진행
      } else {
        // listing 비활성화 + domain 상태 sold 병렬 처리
        const [listingResult, domainResult] = await Promise.all([
          client
            .from("marketplace_listings")
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq("id", listing.id),
          listing.domain_id
            ? client
                .from("domains")
                .update({ status: "sold" })
                .eq("id", listing.domain_id)
            : Promise.resolve({ error: null }),
        ]);

        if (listingResult.error) {
          console.error("listing deactivation error:", listingResult.error);
        }
        if (domainResult.error) {
          console.error("domain status update error:", domainResult.error);
        }
      }
    }

    // failed: listing은 그대로 유지 (다른 구매자가 신청 가능)

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "요청을 처리할 수 없습니다" },
      { status: 400 }
    );
  }
}
