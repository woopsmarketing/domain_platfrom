import { describe, it, expect, vi } from "vitest";

// BREVO_API_KEY가 없을 때 에러 없이 스킵하는지
describe("sendEmail", () => {
  it("API 키 없으면 콘솔 에러만 출력", async () => {
    // 환경변수 없이 import
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { sendEmail } = await import("@/lib/email");

    await sendEmail({
      to: "test@test.com",
      subject: "test",
      htmlContent: "<p>test</p>",
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "BREVO_API_KEY not set, skipping email"
    );
    consoleSpy.mockRestore();
  });
});
