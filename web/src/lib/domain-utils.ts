import type { DomainMetrics } from "@/types/domain";

/**
 * 도메인 등급 산출 (A/B/C/D/F)
 * DA + DR + TF 종합 평균 기반
 */
export type DomainGrade = "A" | "B" | "C" | "D" | "F";

export interface DomainGradeResult {
  grade: DomainGrade;
  score: number; // 0~100
  label: string;
  color: string; // tailwind color class
}

export function calculateDomainGrade(metrics: DomainMetrics | null): DomainGradeResult {
  if (!metrics) {
    return { grade: "F", score: 0, label: "데이터 없음", color: "text-gray-400" };
  }

  const da = metrics.mozDA ?? 0;
  const dr = metrics.ahrefsDR ?? 0;
  const tf = metrics.majesticTF ?? 0;

  // 가중 평균: DA 40%, DR 40%, TF 20%
  const score = Math.round(da * 0.4 + dr * 0.4 + tf * 0.2);

  if (score >= 70) return { grade: "A", score, label: "매우 우수", color: "text-green-600" };
  if (score >= 50) return { grade: "B", score, label: "우수", color: "text-blue-600" };
  if (score >= 30) return { grade: "C", score, label: "보통", color: "text-yellow-600" };
  if (score >= 15) return { grade: "D", score, label: "낮음", color: "text-orange-600" };
  return { grade: "F", score, label: "매우 낮음", color: "text-red-600" };
}

/**
 * 도메인 나이 계산
 */
export interface DomainAge {
  years: number;
  months: number;
  totalDays: number;
  label: string; // "12년 3개월"
}

export function calculateDomainAge(createdDate: string | null | undefined): DomainAge | null {
  if (!createdDate) return null;

  const created = new Date(createdDate);
  if (isNaN(created.getTime())) return null;

  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  if (diffMs < 0) return null;

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);

  let label = "";
  if (years > 0) label += `${years}년 `;
  if (months > 0) label += `${months}개월`;
  if (!label) label = "1개월 미만";

  return { years, months, totalDays, label: label.trim() };
}

/**
 * 스팸 점수 위험 수준 판단
 * Moz Spam Score: 0~17 (1~4 낮음, 5~7 중간, 8+ 높음)
 */
export type SpamLevel = "safe" | "warning" | "danger";

export interface SpamResult {
  level: SpamLevel;
  label: string;
  color: string;
  description: string;
}

export function checkSpamScore(mozSpam: number | null): SpamResult {
  if (mozSpam === null) {
    return { level: "safe", label: "확인 불가", color: "text-gray-400", description: "스팸 점수 데이터가 없습니다." };
  }

  if (mozSpam >= 8) {
    return { level: "danger", label: "위험", color: "text-red-600", description: `스팸 점수 ${mozSpam}%로 매우 높습니다. 이 도메인은 검색 엔진 패널티 위험이 있습니다.` };
  }
  if (mozSpam >= 5) {
    return { level: "warning", label: "주의", color: "text-yellow-600", description: `스팸 점수 ${mozSpam}%로 중간 수준입니다. 백링크 프로필을 확인하세요.` };
  }
  return { level: "safe", label: "안전", color: "text-green-600", description: `스팸 점수 ${mozSpam}%로 안전합니다.` };
}
