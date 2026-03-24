"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Loader2, TrendingUp, ArrowRight, Sparkles, BarChart3, Globe, Link2, DollarSign } from "lucide-react";

interface ValueResult {
  domain: string;
  length: number;
  tld: string;
  estimatedValue: string;
  grade: string;
  totalScore: number;
  factors: { label: string; score: number; max: number; note: string }[];
}

interface AdvancedResult {
  da: number | null;
  dr: number | null;
  backlinks: number | null;
  refDomains: number | null;
  traffic: number | null;
  trafficValue: number | null;
  organicKeywords: number | null;
  spamScore: number | null;
  estimatedValue: string;
  grade: string;
  totalScore: number;
  factors: { label: string; score: number; max: number; note: string }[];
  aiSummary: string;
}

function cleanDomain(input: string): string {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  return d;
}

const TLD_SCORES: Record<string, number> = {
  com: 25, net: 20, org: 20, kr: 20, "co.kr": 20,
  io: 18, ai: 18, co: 18,
  dev: 15, app: 15, me: 15, xyz: 12, info: 12,
};

const GRADE_STYLES: Record<string, { bg: string; label: string }> = {
  Premium: { bg: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400", label: "Premium" },
  High: { bg: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400", label: "High" },
  Medium: { bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400", label: "Medium" },
  Standard: { bg: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", label: "Standard" },
  Basic: { bg: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400", label: "Basic" },
};

function evaluate(domain: string): ValueResult {
  const parts = domain.split(".");
  const tld = parts.length > 2 ? parts.slice(-2).join(".") : parts[parts.length - 1];
  const name = parts[0];
  const length = name.length;

  const factors: ValueResult["factors"] = [];

  // 길이 점수 (완만한 곡선)
  let lengthScore = 4;
  if (length <= 3) lengthScore = 25;
  else if (length <= 6) lengthScore = 22;
  else if (length <= 10) lengthScore = 18;
  else if (length <= 15) lengthScore = 12;
  else if (length <= 20) lengthScore = 8;

  factors.push({
    label: "도메인 길이",
    score: lengthScore,
    max: 25,
    note: `${length}자 — ${length <= 6 ? "짧고 기억하기 좋음" : length <= 10 ? "적당한 길이" : length <= 15 ? "다소 긴 편" : "매우 긴 편"}`,
  });

  // TLD 점수 (편향 없음)
  const tldScore = TLD_SCORES[tld] ?? 12;
  factors.push({
    label: "확장자 (TLD)",
    score: tldScore,
    max: 25,
    note: `.${tld} — ${tldScore >= 25 ? "가장 범용적" : tldScore >= 20 ? "안정적" : tldScore >= 18 ? "인기 확장자" : "일반"}`,
  });

  // 문자 구성
  const isAlphaOnly = /^[a-z]+$/.test(name);
  const isAlphaNum = /^[a-z0-9]+$/.test(name);
  const isNumOnly = /^\d+$/.test(name);
  const hasHyphens = name.includes("-");
  let charScore = 15;
  if (isAlphaOnly) charScore = 25;
  else if (isAlphaNum && !isNumOnly) charScore = 18;
  else if (isNumOnly) charScore = 12;
  else if (hasHyphens) charScore = 8;

  factors.push({
    label: "문자 구성",
    score: charScore,
    max: 25,
    note: isAlphaOnly ? "영문자만 — 깔끔함" : hasHyphens ? "하이픈 포함" : isNumOnly ? "숫자만" : "영문+숫자 혼합",
  });

  // 발음 용이성
  const vowels = (name.match(/[aeiou]/g) ?? []).length;
  const ratio = length > 0 ? vowels / length : 0;
  let pronounceScore = 12;
  if (ratio >= 0.3 && ratio <= 0.5) pronounceScore = 25;
  else if (ratio >= 0.2) pronounceScore = 18;

  factors.push({
    label: "발음 용이성",
    score: pronounceScore,
    max: 25,
    note: pronounceScore >= 22 ? "발음하기 쉬움" : pronounceScore >= 16 ? "보통" : "발음 어려울 수 있음",
  });

  const totalScore = lengthScore + tldScore + charScore + pronounceScore;
  let grade = "Basic";
  let estimatedValue = "$10 ~ $50";

  if (totalScore >= 85) { grade = "Premium"; estimatedValue = "$10,000+"; }
  else if (totalScore >= 65) { grade = "High"; estimatedValue = "$1,000 ~ $10,000"; }
  else if (totalScore >= 45) { grade = "Medium"; estimatedValue = "$100 ~ $1,000"; }
  else if (totalScore >= 30) { grade = "Standard"; estimatedValue = "$50 ~ $500"; }

  return { domain, length, tld, estimatedValue, grade, totalScore, factors };
}

function buildAdvanced(basicScore: number, domain: string, metrics: Record<string, unknown>): AdvancedResult {
  const da = (metrics.mozDA as number) ?? 0;
  const dr = (metrics.ahrefsDR as number) ?? 0;
  const backlinks = (metrics.ahrefsBacklinks as number) ?? 0;
  const refDomains = (metrics.ahrefsRefDomains as number) ?? 0;
  const traffic = (metrics.ahrefsTraffic as number) ?? 0;
  const trafficValue = (metrics.ahrefsTrafficValue as number) ?? 0;
  const organicKeywords = (metrics.ahrefsOrganicKeywords as number) ?? 0;
  const spamScore = (metrics.mozSpam as number) ?? 0;

  const factors: AdvancedResult["factors"] = [];

  // DA 점수
  let daScore = 3;
  if (da >= 50) daScore = 30;
  else if (da >= 30) daScore = 22;
  else if (da >= 15) daScore = 15;
  else if (da >= 5) daScore = 8;
  factors.push({ label: "검색 순위 점수 (DA)", score: daScore, max: 30, note: `DA ${da} — ${da >= 50 ? "높은 권위도" : da >= 30 ? "중상위" : da >= 15 ? "보통" : "낮음"}` });

  // 백링크 프로필
  let linkScore = 3;
  if (refDomains >= 1000) linkScore = 25;
  else if (refDomains >= 100) linkScore = 18;
  else if (refDomains >= 10) linkScore = 12;
  else if (refDomains >= 1) linkScore = 6;
  factors.push({ label: "백링크 프로필", score: linkScore, max: 25, note: `참조 도메인 ${refDomains.toLocaleString()}개, 백링크 ${backlinks.toLocaleString()}개` });

  // 트래픽 가치
  let tvScore = 3;
  if (trafficValue >= 10000) tvScore = 25;
  else if (trafficValue >= 1000) tvScore = 18;
  else if (trafficValue >= 100) tvScore = 12;
  else if (trafficValue >= 10) tvScore = 6;
  factors.push({ label: "트래픽 가치", score: tvScore, max: 25, note: `월 트래픽 ${traffic.toLocaleString()}, 가치 $${trafficValue.toLocaleString()}` });

  // 기본 점수 환산
  const basicConverted = Math.round((basicScore / 100) * 20);
  factors.push({ label: "도메인 이름 품질", score: basicConverted, max: 20, note: `기본 평가 ${basicScore}점 기반` });

  const totalScore = daScore + linkScore + tvScore + basicConverted;
  let grade = "Basic";
  let estimatedValue = "$10 ~ $50";

  if (totalScore >= 80) { grade = "Premium"; estimatedValue = "$50,000+"; }
  else if (totalScore >= 60) { grade = "High"; estimatedValue = "$5,000 ~ $50,000"; }
  else if (totalScore >= 40) { grade = "Medium"; estimatedValue = "$500 ~ $5,000"; }
  else if (totalScore >= 25) { grade = "Standard"; estimatedValue = "$50 ~ $500"; }

  // AI 분석 요약 생성
  const parts: string[] = [];
  if (da > 0) parts.push(`DA ${da}로 ${da >= 30 ? "높은" : "보통의"} 검색 권위도를 보유하고 있습니다`);
  if (refDomains > 0) parts.push(`${refDomains.toLocaleString()}개 참조 도메인에서 ${backlinks.toLocaleString()}개의 백링크를 받고 있습니다`);
  if (trafficValue > 0) parts.push(`월 예상 트래픽 가치는 $${trafficValue.toLocaleString()}입니다`);
  if (organicKeywords > 0) parts.push(`${organicKeywords.toLocaleString()}개의 키워드로 검색 노출되고 있습니다`);
  if (spamScore > 5) parts.push(`스팸 점수가 ${spamScore}점으로 주의가 필요합니다`);
  if (parts.length === 0) parts.push("SEO 데이터가 충분하지 않아 도메인 이름 특성 기반으로 평가했습니다");

  const aiSummary = `이 도메인(${domain})의 분석 결과: ${parts.join(". ")}. 종합적으로 ${grade} 등급, 예상 시장 가치는 ${estimatedValue}입니다.`;

  return {
    da, dr, backlinks, refDomains, traffic, trafficValue, organicKeywords, spamScore,
    estimatedValue, grade, totalScore, factors, aiSummary,
  };
}

function formatNum(n: number | null): string {
  if (n == null || n === 0) return "—";
  return n.toLocaleString();
}

export function DomainValueClient() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<ValueResult | null>(null);
  const [advanced, setAdvanced] = useState<AdvancedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [advancedLoading, setAdvancedLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = cleanDomain(domain);
    if (!d || !d.includes(".")) return;
    setLoading(true);
    setAdvanced(null);
    setTimeout(() => {
      setResult(evaluate(d));
      setLoading(false);
    }, 600);
  };

  const handleAdvanced = async () => {
    if (!result) return;
    setAdvancedLoading(true);
    try {
      const resp = await fetch(`/api/domain/${encodeURIComponent(result.domain)}`);
      const json = await resp.json();
      const metrics = json.data?.metrics ?? {};
      setAdvanced(buildAdvanced(result.totalScore, result.domain, metrics));
    } catch {
      setAdvanced(buildAdvanced(result.totalScore, result.domain, {}));
    } finally {
      setAdvancedLoading(false);
    }
  };

  const gradeStyle = (grade: string) => GRADE_STYLES[grade] ?? GRADE_STYLES.Basic;

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

      {/* 기본 평가 결과 */}
      {result && (
        <div className="mt-6 rounded-lg border">
          <div className="border-b bg-muted/30 px-5 py-5 text-center">
            <p className="text-xs text-muted-foreground">기본 평가 · 도메인 이름 특성 분석</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{result.domain}</p>
            <p className="mt-2 text-3xl font-bold text-primary">{result.estimatedValue}</p>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${gradeStyle(result.grade).bg}`}>
              {result.grade} 등급
            </span>
          </div>

          <div className="space-y-4 p-5">
            {result.factors.map((f) => (
              <div key={f.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{f.label}</span>
                  <span className="text-muted-foreground">{f.score}/{f.max}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${(f.score / f.max) * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{f.note}</p>
              </div>
            ))}
          </div>

          {/* 고도화 평가 CTA */}
          {!advanced && (
            <div className="border-t px-5 py-5">
              <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">더 정확한 결과가 필요하신가요?</p>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  실제 검색 점수, 백링크 수, 트래픽 데이터를 종합 분석하여 더 정확한 시장 가치를 산출합니다.
                </p>
                <button
                  onClick={handleAdvanced}
                  disabled={advancedLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {advancedLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      SEO 데이터 분석 중...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      고도화 도메인 가치평가 바로보기
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 고도화 평가 결과 */}
      {advanced && (
        <div className="mt-6 rounded-lg border border-primary/30">
          <div className="border-b bg-gradient-to-r from-primary/10 to-blue-500/10 px-5 py-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium text-primary">고도화 가치 평가 · SEO 데이터 기반</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-primary">{advanced.estimatedValue}</p>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${gradeStyle(advanced.grade).bg}`}>
              {advanced.grade} 등급
            </span>
          </div>

          {/* SEO 데이터 카드 */}
          <div className="grid grid-cols-2 gap-px border-b bg-border sm:grid-cols-4">
            {[
              { icon: BarChart3, label: "DA", value: formatNum(advanced.da) },
              { icon: Globe, label: "DR", value: formatNum(advanced.dr) },
              { icon: Link2, label: "백링크", value: formatNum(advanced.backlinks) },
              { icon: DollarSign, label: "트래픽 가치", value: advanced.trafficValue ? `$${advanced.trafficValue.toLocaleString()}` : "—" },
            ].map((item) => (
              <div key={item.label} className="bg-card px-4 py-3 text-center">
                <item.icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                <p className="text-lg font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          {/* 고도화 지표 */}
          <div className="space-y-4 p-5">
            {advanced.factors.map((f) => (
              <div key={f.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{f.label}</span>
                  <span className="text-muted-foreground">{f.score}/{f.max}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all" style={{ width: `${(f.score / f.max) * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{f.note}</p>
              </div>
            ))}
          </div>

          {/* AI 분석 요약 */}
          <div className="border-t px-5 py-4 bg-muted/20">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold mb-1">AI 분석 의견</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{advanced.aiSummary}</p>
              </div>
            </div>
          </div>

          {/* 종합 분석 CTA */}
          <div className="border-t px-5 py-4">
            <Link
              href={`/domain/${result?.domain}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              {result?.domain} 종합 분석 페이지에서 상세 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
