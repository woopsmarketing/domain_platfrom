const BREVO_API = "https://api.brevo.com/v3/smtp/email";

interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmail({ to, toName, subject, htmlContent }: SendEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("BREVO_API_KEY not set, skipping email");
    return;
  }

  const res = await fetch(BREVO_API, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        name: "도메인체커",
        email: process.env.BREVO_SENDER_EMAIL || "vnfm0580@gmail.com"
      },
      to: [{ email: to, name: toName || to }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Brevo email error:", res.status, err);
    return { success: false, error: err };
  }

  const result = await res.json();
  console.log("Brevo email sent:", result.messageId);
  return { success: true, messageId: result.messageId };
}
