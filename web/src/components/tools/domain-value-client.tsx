"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Loader2, TrendingUp, ArrowRight } from "lucide-react";

interface ValueResult {
  domain: string;
  length: number;
  tld: string;
  estimatedValue: string;
  grade: "Premium" | "High" | "Medium" | "Low";
  factors: { label: string; score: number; max: number; note: string }[];
}

function cleanDomain(input: string): string {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  return d;
}

const TLD_VALUES: Record<string, number> = {
  com: 30, net: 20, org: 18, io: 15, ai: 15, co: 12, dev: 10, app: 10, kr: 8,
};

const GRADE_COLORS: Record<ValueResult["grade"], string> = {
  Premium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  High: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

function evaluate(domain: string): ValueResult {
  const parts = domain.split(".");
  const tld = parts[parts.length - 1];
  const name = parts.slice(0, -1).join(".");
  const length = name.length;

  const factors: ValueResult["factors"] = [];

  // 길이 점수
  let lengthScore = 0;
  if (length <= 3) lengthScore = 30;
  else if (length <= 5) lengthScore = 25;
  else if (length <= 7) lengthScore = 20;
  else if (length <= 10) lengthScore = 12;
  else if (length <= 15) lengthScore = 5;
  else lengthScore = 2;

  factors.push({
    label: "도메인 길이",
    score: lengthScore,
    max: 30,
    note: `${length}자 — ${length <= 5 ? "매우 짧고 가치 높음" : length <= 10 ? "적당한 길이" : "다소 긴 편"}`,
  });

  // TLD 점수
  const tldScore = TLD_VALUES[tld] ?? 5;
  factors.push({
    label: "확장자 (TLD)",
    score: tldScore,
    max: 30,
    note: `.${tld} — ${tld === "com" ? "가장 높은 가치" : tld === "net" || tld === "org" ? "안정적 가치" : "보통"}`,
  });

  // 문자 구성
  const isAlphaOnly = /^[a-z]+$/.test(name);
  const hasNumbers = /\d/.test(name);
  const hasHyphens = name.includes("-");
  let charScore = 15;
  if (isAlphaOnly) charScore = 20;
  else if (hasHyphens) charScore = 5;
  else if (hasNumbers) charScore = 10;

  factors.push({
    label: "문자 구성",
    score: charScore,
    max: 20,
    note: isAlphaOnly
      ? "영문자만 — 깔끔하고 가치 높음"
      : hasHyphens
      ? "하이픈 포함 — 가치 하락"
      : "숫자 포함",
  });

  // 발음 용이성
  const vowels = (name.match(/[aeiou]/g) ?? []).length;
  const ratio = length > 0 ? vowels / length : 0;
  let pronounceScore = 10;
  if (ratio >= 0.3 && ratio <= 0.5) pronounceScore = 20;
  else if (ratio >= 0.2) pronounceScore = 15;

  factors.push({
    label: "발음 용이성",
    score: pronounceScore,
    max: 20,
    note:
      pronounceScore >= 18
        ? "발음하기 쉬움"
        : pronounceScore >= 13
        ? "보통"
        : "발음 어려울 수 있음",
  });

  const totalScore = lengthScore + tldScore + charScore + pronounceScore;
  let grade: ValueResult["grade"] = "Low";
  let estimatedValue = "$10 ~ $100";

  if (totalScore >= 80) {
    grade = "Premium";
    estimatedValue = "$10,000+";
  } else if (totalScore >= 60) {
    grade = "High";
    estimatedValue = "$1,000 ~ $10,000";
  } else if (totalScore >= 40) {
    grade = "Medium";
    estimatedValue = "$100 ~ $1,000";
  }

  return { domain, length, tld, estimatedValue, grade, factors };
}

export function DomainValueClient() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<ValueResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = cleanDomain(domain);
    if (!d || !d.includes(".")) return;
    setLoading(true);
    setTimeout(() => {
      setResult(evaluate(d));
      setLoading(false);
    }, 800);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="도메인 입력 (예: mybrand.com)"
            className="h-12 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !domain.trim()}
          className="h-12 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "평가"}
        </button>
      </form>

      {result && (
        <div className="mt-6 rounded-lg border">
          {/* 결과 헤더 */}
          <div className="border-b bg-muted/30 px-5 py-5 text-center">
            <p className="text-sm text-muted-foreground">{result.domain}의 예상 가치</p>
            <p className="mt-2 text-3xl font-bold text-primary">{result.estimatedValue}</p>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${GRADE_COLORS[result.grade]}`}
            >
              {result.grade} 등급
            </span>
          </div>

          {/* 점수 상세 */}
          <div className="space-y-4 p-5">
            {result.factors.map((f) => (
              <div key={f.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{f.label}</span>
                  <span className="text-muted-foreground">
                    {f.score}/{f.max}
                  </span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${(f.score / f.max) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{f.note}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="border-t bg-muted/20 px-5 py-4">
            <p className="mb-3 text-sm text-muted-foreground">
              더 정확한 분석을 원하시면 도메인 종합 분석에서 검색 점수, 백링크,
              과거 이력까지 확인하세요.
            </p>
            <Link
              href={`/domain/${result.domain}`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <TrendingUp className="h-4 w-4" />
              {result.domain} 종합 분석하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
