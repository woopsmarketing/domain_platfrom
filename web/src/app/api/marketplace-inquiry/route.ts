import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { listing_id, name, email, message, offered_price_usd } = body;

    if (!listing_id || !name || !email) {
      return NextResponse.json(
        { error: "필수 항목을 입력해주세요" },
        { status: 400 }
      );
    }

    const client = createServiceClient();
    const { error } = await client.from("inquiries").insert({
      listing_id,
      name,
      email,
      message: message || null,
      offered_price_usd: offered_price_usd ? Number(offered_price_usd) : null,
    });

    if (error) {
      console.error("inquiries insert error:", error);
      return NextResponse.json(
        { error: "문의 접수에 실패했습니다" },
        { status: 500 }
      );
    }

    // 사용자에게 접수 확인 이메일
    await sendEmail({
      to: email,
      toName: name,
      subject: "[도메인체커] 도메인 구매 문의가 접수되었습니다",
      htmlContent: `
        <h2>구매 문의가 접수되었습니다</h2>
        <p>${name}님, 도메인 구매 문의를 접수했습니다.</p>
        <p>빠른 시일 내 연락드리겠습니다.</p>
        <br>
        <p>— 도메인체커 팀</p>
      `,
    });

    // 어드민에게 알림
    await sendEmail({
      to: "vnfm0580@gmail.com",
      subject: "[도메인체커 어드민] 새 도메인 구매 문의 접수",
      htmlContent: `
        <h2>새 문의가 접수되었습니다</h2>
        <p><strong>유형:</strong> 도메인 구매</p>
        <p><strong>이름:</strong> ${name}</p>
        <p><strong>이메일:</strong> ${email}</p>
        <p><strong>Listing ID:</strong> ${listing_id}</p>
        <p><strong>제안 가격:</strong> ${offered_price_usd ? `$${offered_price_usd}` : '미정'}</p>
        <p><strong>메시지:</strong> ${message || '없음'}</p>
        <p><a href="https://domainchecker.co.kr/admin">어드민에서 확인</a></p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "요청을 처리할 수 없습니다" },
      { status: 400 }
    );
  }
}
