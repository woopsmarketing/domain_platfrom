/**
 * URL이나 도메인 입력에서 순수 도메인만 추출합니다.
 * 예: "https://www.hulk24.com/page?q=1" → "hulk24.com"
 *     "quick-tv.com/main_index/" → "quick-tv.com"
 *     "www.example.com" → "example.com"
 */
export function cleanDomain(input: string): string {
  let d = input.trim().toLowerCase();
  // 프로토콜 제거
  d = d.replace(/^https?:\/\//, "");
  // www. 제거
  d = d.replace(/^www\./, "");
  // 경로, 쿼리, 해시 제거
  d = d.replace(/[/?#].*$/, "");
  // 포트 제거
  d = d.replace(/:\d+$/, "");
  return d;
}
