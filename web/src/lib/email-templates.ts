const BRAND_COLOR = "#4f46e5";
const SITE_URL = "https://domainchecker.co.kr";

function layout(content: string) {
  return `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <!-- 헤더 -->
        <tr>
          <td style="background:${BRAND_COLOR};padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">도메인체커</span>
                </td>
                <td align="right">
                  <a href="${SITE_URL}" style="color:rgba(255,255,255,0.8);font-size:13px;text-decoration:none;">domainchecker.co.kr</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- 본문 -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- 푸터 -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e4e4e7;background:#fafafa;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#a1a1aa;font-size:12px;line-height:1.5;">
                  본 메일은 도메인체커에서 자동 발송된 메일입니다.<br>
                  문의사항이 있으시면 사이트를 통해 연락해 주세요.
                </td>
                <td align="right" style="color:#a1a1aa;font-size:12px;">
                  <a href="${SITE_URL}" style="color:${BRAND_COLOR};text-decoration:none;">도메인체커 바로가기</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function infoRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:8px 12px;color:#71717a;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:8px 12px;font-size:14px;color:#18181b;font-weight:500;">${value}</td>
    </tr>`;
}

function button(text: string, href: string) {
  return `
    <a href="${href}" style="display:inline-block;padding:12px 28px;background:${BRAND_COLOR};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;margin-top:8px;">${text}</a>`;
}

// ── 경매 대행: 사용자 확인 이메일 ──
export function brokerConfirmation(params: {
  name: string;
  targetKeyword: string;
  budget: string;
}) {
  return layout(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:#ecfdf5;border-radius:50%;line-height:56px;font-size:28px;">✅</div>
    </div>
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;text-align:center;">문의가 접수되었습니다</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#71717a;text-align:center;line-height:1.6;">
      ${params.name}님, 경매 대행 문의를 정상적으로 접수했습니다.<br>
      24시간 내 이메일로 상세 답변을 드리겠습니다.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e4e4e7;margin-bottom:24px;">
      ${infoRow("타겟 키워드", params.targetKeyword)}
      ${infoRow("예산", params.budget)}
    </table>
    <div style="text-align:center;">
      ${button("프리미엄 도메인 보기", `${SITE_URL}/marketplace`)}
    </div>
  `);
}

// ── 경매 대행: 어드민 알림 이메일 ──
export function brokerAdminNotification(params: {
  name: string;
  email: string;
  telegram: string;
  targetKeyword: string;
  budget: string;
  message: string;
}) {
  return layout(`
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
      <span style="display:inline-block;padding:4px 10px;background:#fef2f2;color:#dc2626;font-size:12px;font-weight:600;border-radius:4px;">새 문의</span>
      <span style="display:inline-block;padding:4px 10px;background:#eff6ff;color:#2563eb;font-size:12px;font-weight:600;border-radius:4px;">경매 대행</span>
    </div>
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#18181b;">새 경매 대행 문의가 접수되었습니다</h1>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e4e4e7;margin-bottom:24px;">
      ${infoRow("이름", params.name)}
      ${infoRow("이메일", `<a href="mailto:${params.email}" style="color:${BRAND_COLOR};text-decoration:none;">${params.email}</a>`)}
      ${params.telegram ? infoRow("텔레그램", "@" + params.telegram) : ""}
      ${infoRow("타겟 키워드", params.targetKeyword)}
      ${infoRow("예산", params.budget)}
      ${params.message ? infoRow("메시지", params.message) : ""}
    </table>
    ${button("어드민에서 확인", `${SITE_URL}/admin`)}
  `);
}

// ── 마켓플레이스: 사용자 확인 이메일 ──
export function marketplaceConfirmation(params: {
  name: string;
  domain?: string;
}) {
  return layout(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:#ecfdf5;border-radius:50%;line-height:56px;font-size:28px;">✅</div>
    </div>
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;text-align:center;">구매 문의가 접수되었습니다</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#71717a;text-align:center;line-height:1.6;">
      ${params.name}님, 도메인 구매 문의를 정상적으로 접수했습니다.<br>
      ${params.domain ? `<strong style="color:#18181b;">${params.domain}</strong>에 대한 ` : ""}빠른 시일 내 연락드리겠습니다.
    </p>
    <div style="text-align:center;">
      ${button("다른 도메인 둘러보기", `${SITE_URL}/marketplace`)}
    </div>
  `);
}

// ── 마켓플레이스: 어드민 알림 이메일 ──
export function marketplaceAdminNotification(params: {
  name: string;
  email: string;
  domain?: string;
  offeredPrice?: number;
  message: string;
}) {
  return layout(`
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
      <span style="display:inline-block;padding:4px 10px;background:#fef2f2;color:#dc2626;font-size:12px;font-weight:600;border-radius:4px;">새 문의</span>
      <span style="display:inline-block;padding:4px 10px;background:#f0fdf4;color:#16a34a;font-size:12px;font-weight:600;border-radius:4px;">도메인 구매</span>
    </div>
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#18181b;">새 도메인 구매 문의</h1>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e4e4e7;margin-bottom:24px;">
      ${infoRow("이름", params.name)}
      ${infoRow("이메일", `<a href="mailto:${params.email}" style="color:${BRAND_COLOR};text-decoration:none;">${params.email}</a>`)}
      ${params.domain ? infoRow("관심 도메인", `<strong>${params.domain}</strong>`) : ""}
      ${params.offeredPrice ? infoRow("제안 가격", `$${params.offeredPrice.toLocaleString()}`) : ""}
      ${params.message ? infoRow("메시지", params.message) : ""}
    </table>
    ${button("어드민에서 확인", `${SITE_URL}/admin`)}
  `);
}
