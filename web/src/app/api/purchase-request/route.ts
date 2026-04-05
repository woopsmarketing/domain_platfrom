import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import {
  purchaseRequestConfirmation,
  purchaseRequestAdminNotification,
} from "@/lib/email-templates";

const ADMIN_EMAIL = "vnfm0580@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { listing_id, email, telegram_id } = body;

    // 입력 검증
    if (!listing_id || !email) {
      return NextResponse.json(
        { error: "listing_id와 email은 필수입니다" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "유효하지 않은 이메일 형식입니다" },
        { status: 400 }
      );
    }

    if (typeof listing_id !== "string" && typeof listing_id !== "number") {
      return NextResponse.json(
        { error: "잘못된 listing_id입니다" },
        { status: 400 }
      );
    }

    const client = createServiceClient();

    // 1. listing 유효성 + is_active 확인
    const { data: listing, error: listingError } = await client
      .from("marketplace_listings")
      .select("id, is_active, asking_price, domains(name, tld)")
      .eq("id", listing_id)
      .maybeSingle();

    if (listingError) {
      return NextResponse.json({ error: "조회 중 오류가 발생했습니다" }, { status: 500 });
    }

    if (!listing) {
      return NextResponse.json({ error: "존재하지 않는 매물입니다" }, { status: 404 });
    }

    if (!listing.is_active) {
      return NextResponse.json(
        { error: "이미 판매 완료된 매물입니다" },
        { status: 409 }
      );
    }

    // 2. purchase_requests insert
    const { error: insertError } = await client
      .from("purchase_requests")
      .insert({
        listing_id,
        email: email.trim().toLowerCase(),
        telegram_id: telegram_id?.trim() || null,
        status: "pending",
      });

    if (insertError) {
      console.error("purchase_requests insert error:", insertError);
      return NextResponse.json(
        { error: "신청 처리 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    // 3. 이메일 발송 (비동기 — 이메일 실패가 응답을 막지 않음)
    const rawDomains = listing.domains as unknown;
    const domainData = Array.isArray(rawDomains)
      ? (rawDomains[0] as { name: string; tld: string } | undefined) ?? null
      : (rawDomains as { name: string; tld: string } | null);
    const domainName = domainData?.name ?? String(listing_id);
    const askingPrice = listing.asking_price ?? 0;

    // 사용자에게 접수 확인 이메일
    sendEmail({
      to: email.trim(),
      subject: `[도메인체커] ${domainName} 구매 신청이 접수되었습니다`,
      htmlContent: purchaseRequestConfirmation({
        domain: domainName,
        price: askingPrice,
      }),
    }).catch((err) => console.error("User email send failed:", err));

    // 어드민에게 알림 이메일
    sendEmail({
      to: ADMIN_EMAIL,
      subject: `[구매 신청] ${domainName}`,
      htmlContent: purchaseRequestAdminNotification({
        email: email.trim(),
        telegramId: telegram_id?.trim() || undefined,
        domain: domainName,
        price: askingPrice,
      }),
    }).catch((err) => console.error("Admin email send failed:", err));

    // 4. 응답
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "요청을 처리할 수 없습니다" },
      { status: 400 }
    );
  }
}
