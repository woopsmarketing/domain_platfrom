import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, telegram, target_keyword, budget, message } = body;

    if (!name || !email || !target_keyword) {
      return NextResponse.json(
        { error: "필수 항목을 입력해주세요" },
        { status: 400 }
      );
    }

    const client = createServiceClient();
    const { error } = await client.from("broker_inquiries").insert({
      name,
      email,
      telegram: telegram || null,
      target_keyword,
      budget: budget || null,
      message: message || null,
    });

    if (error) {
      console.error("broker_inquiries insert error:", error);
      return NextResponse.json(
        { error: "문의 접수에 실패했습니다" },
        { status: 500 }
      );
    }

    // 사용자에게 접수 확인 이메일
    await sendEmail({
      to: email,
      toName: name,
      subject: "[도메인체커] 경매 대행 문의가 접수되었습니다",
      htmlContent: `
        <h2>문의가 접수되었습니다</h2>
        <p>${name}님, 경매 대행 문의를 접수했습니다.</p>
        <p><strong>타겟 키워드:</strong> ${target_keyword}</p>
        <p><strong>예산:</strong> ${budget || '미정'}</p>
        <p>24시간 내 이메일로 연락드리겠습니다.</p>
        <br>
        <p>— 도메인체커 팀</p>
      `,
    });

    // 어드민에게 알림
    await sendEmail({
      to: "vnfm0580@gmail.com",
      subject: "[도메인체커 어드민] 새 경매 대행 문의 접수",
      htmlContent: `
        <h2>새 문의가 접수되었습니다</h2>
        <p><strong>유형:</strong> 경매 대행</p>
        <p><strong>이름:</strong> ${name}</p>
        <p><strong>이메일:</strong> ${email}</p>
        <p><strong>타겟 키워드:</strong> ${target_keyword}</p>
        <p><strong>예산:</strong> ${budget || '미정'}</p>
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
