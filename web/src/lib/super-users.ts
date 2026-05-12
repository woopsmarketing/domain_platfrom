/**
 * 슈퍼유저 화이트리스트.
 *
 * 슈퍼유저는 모든 도구에서 Pro 한도를 무시하고 무제한으로 사용한다.
 * - 클라이언트: auth-provider가 tier='pro'로 강제, isSuper 노출
 * - 서버: isProUser가 슈퍼유저면 항상 true 반환 (DB 동기화 사고 대비 안전망)
 */
const SUPER_USER_EMAILS: readonly string[] = ["vnfm0580@gmail.com"];

export function isSuperEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPER_USER_EMAILS.includes(email.toLowerCase());
}
