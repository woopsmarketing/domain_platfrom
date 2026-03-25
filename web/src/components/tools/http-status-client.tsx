"use client";

import { useState, useCallback } from "react";
import { Search, Loader2, ArrowRight, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface ChainEntry {
  url: string;
  status: number;
  statusText: string;
  location?: string;
}

function cleanDomain(input: string): string {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  return d;
}

function statusColor(code: number): string {
  if (code >= 200 && code < 300) return "text-green-600";
  if (code >= 300 && code < 400) return "text-blue-600";
  if (code >= 400 && code < 500) return "text-amber-600";
  if (code >= 500) return "text-red-600";
  return "text-red-500";
}

function StatusIcon({ code }: { code: number }) {
  if (code >= 200 && code < 300) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (code >= 300 && code < 400) return <ArrowRight className="h-4 w-4 text-blue-500" />;
  if (code >= 400) return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <XCircle className="h-4 w-4 text-red-500" />;
}

export function HttpStatusClient() {
  const [domain, setDomain] = useState("");
  const [chain, setChain] = useState<ChainEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async () => {
    const d = cleanDomain(domain);
    if (!d || !d.includes(".")) return;
    setLoading(true);
    setError(null);
    setChain([]);
    try {
      const resp = await fetch(`/api/http-status?domain=${encodeURIComponent(d)}`);
      const json = await resp.json();
      if (!resp.ok) { setError(json.error ?? "조회 실패"); return; }
      setChain(json.chain ?? []);
    } catch {
      setError("조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [domain]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); lookup(); };

  const finalEntry = chain[chain.length - 1];

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

      {chain.length > 0 && (
        <div className="mt-6 space-y-3">
          {/* 최종 상태 */}
          {finalEntry && (
            <div className={`flex items-center gap-3 rounded-lg border p-4 ${
              finalEntry.status >= 200 && finalEntry.status < 300 ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" :
              finalEntry.status === 0 ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" :
              "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
            }`}>
              <StatusIcon code={finalEntry.status} />
              <div>
                <p className="font-semibold text-sm">
                  {finalEntry.status === 0 ? "연결 실패" : `최종 상태: ${finalEntry.status} ${finalEntry.statusText}`}
                </p>
                {chain.length > 1 && <p className="text-xs text-muted-foreground">{chain.length - 1}번 리다이렉트 발생</p>}
              </div>
            </div>
          )}

          {/* 리다이렉트 체인 */}
          <div className="rounded-lg border">
            <div className="border-b bg-muted/30 px-4 py-2.5 text-xs font-medium text-muted-foreground">
              리다이렉트 경로 ({chain.length}단계)
            </div>
            <div className="divide-y">
              {chain.map((entry, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm font-bold ${statusColor(entry.status)}`}>
                        {entry.status || "ERR"}
                      </span>
                      <span className="text-xs text-muted-foreground">{entry.statusText}</span>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground break-all">{entry.url}</p>
                    {entry.location && (
                      <p className="mt-0.5 text-xs text-blue-500">→ {entry.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
