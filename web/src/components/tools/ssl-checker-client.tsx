"use client";

import { useState, useCallback } from "react";
import { Search, Loader2, Shield, Calendar, Lock, Globe, Fingerprint } from "lucide-react";

interface SslData {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  fingerprint: string;
  subjectAltNames: string[];
  protocol: string;
}

function cleanDomain(input: string): string {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  return d;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export function SslCheckerClient() {
  const [domain, setDomain] = useState("");
  const [data, setData] = useState<SslData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async () => {
    const d = cleanDomain(domain);
    if (!d || !d.includes(".")) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const resp = await fetch(`/api/ssl-check?domain=${encodeURIComponent(d)}`);
      const json = await resp.json();
      if (!resp.ok) { setError(json.error ?? "조회 실패"); return; }
      setData(json);
    } catch {
      setError("조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [domain]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); lookup(); };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)}
            placeholder="도메인 입력 (예: google.com)"
            className="h-12 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <button type="submit" disabled={loading || !domain.trim()}
          className="h-12 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "확인"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">{error}</div>
      )}

      {data && (() => {
        const days = daysUntil(data.validTo);
        const isExpired = days < 0;
        const isWarning = days >= 0 && days <= 30;
        return (
          <div className="mt-6 rounded-lg border">
            {/* 상태 헤더 */}
            <div className={`flex items-center gap-3 border-b px-5 py-4 ${isExpired ? "bg-red-50 dark:bg-red-950/30" : isWarning ? "bg-amber-50 dark:bg-amber-950/30" : "bg-green-50 dark:bg-green-950/30"}`}>
              <Shield className={`h-5 w-5 ${isExpired ? "text-red-500" : isWarning ? "text-amber-500" : "text-green-500"}`} />
              <div>
                <p className={`font-semibold ${isExpired ? "text-red-600" : isWarning ? "text-amber-600" : "text-green-600"}`}>
                  {isExpired ? "SSL 인증서 만료됨" : isWarning ? `SSL 만료 ${days}일 전` : "SSL 인증서 유효"}
                </p>
                <p className="text-xs text-muted-foreground">{data.subject}</p>
              </div>
            </div>

            <div className="divide-y">
              <div className="flex items-start gap-3 px-5 py-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div><p className="text-xs text-muted-foreground">발급 기관</p><p className="font-medium text-sm">{data.issuer}</p></div>
              </div>
              <div className="flex items-start gap-3 px-5 py-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="grid gap-2 sm:grid-cols-2 w-full">
                  <div><p className="text-xs text-muted-foreground">발급일</p><p className="font-medium text-sm">{formatDate(data.validFrom)}</p></div>
                  <div>
                    <p className="text-xs text-muted-foreground">만료일</p>
                    <p className="font-medium text-sm">
                      {formatDate(data.validTo)}{" "}
                      <span className={`text-xs ${isExpired ? "text-red-500" : isWarning ? "text-amber-500" : "text-muted-foreground"}`}>
                        ({days > 0 ? `${days}일 남음` : `${Math.abs(days)}일 전 만료`})
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 px-5 py-3">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div><p className="text-xs text-muted-foreground">보안 프로토콜</p><p className="font-medium text-sm">{data.protocol ?? "—"}</p></div>
              </div>
              {data.subjectAltNames.length > 0 && (
                <div className="px-5 py-3">
                  <p className="text-xs text-muted-foreground mb-1.5">적용 도메인 (SAN)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.subjectAltNames.slice(0, 10).map((san) => (
                      <span key={san} className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{san}</span>
                    ))}
                    {data.subjectAltNames.length > 10 && (
                      <span className="text-xs text-muted-foreground">+{data.subjectAltNames.length - 10}개 더</span>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 px-5 py-3">
                <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">핑거프린트 (SHA-256)</p>
                  <p className="font-mono text-xs text-muted-foreground break-all">{data.fingerprint}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
