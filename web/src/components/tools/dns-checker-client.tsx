"use client";

import { useState, useCallback } from "react";
import { Search, Loader2, Copy, CheckCircle2 } from "lucide-react";
import { cleanDomain } from "@/lib/clean-domain";

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA"] as const;
type RecordType = (typeof RECORD_TYPES)[number];

interface DnsRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DnsResult {
  type: RecordType;
  records: DnsRecord[];
  error?: string;
}

const TYPE_MAP: Record<RecordType, number> = {
  A: 1, AAAA: 28, CNAME: 5, MX: 15, TXT: 16, NS: 2, SOA: 6,
};

const TYPE_COLORS: Record<RecordType, string> = {
  A: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  AAAA: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  CNAME: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  MX: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  TXT: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  NS: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
  SOA: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export function DnsCheckerClient() {
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<DnsResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<RecordType>>(new Set(RECORD_TYPES));
  const [copied, setCopied] = useState<string | null>(null);

  const toggleType = (t: RecordType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const lookup = useCallback(async () => {
    const d = cleanDomain(domain);
    if (!d || !d.includes(".")) return;

    setLoading(true);
    setResults([]);

    const types = Array.from(selectedTypes);
    const fetches = types.map(async (type): Promise<DnsResult> => {
      try {
        const resp = await fetch(
          `/api/dns-lookup?name=${encodeURIComponent(d)}&type=${TYPE_MAP[type]}`
        );
        if (!resp.ok) return { type, records: [], error: "조회 실패" };
        const data = await resp.json();
        if (data.Status !== 0) return { type, records: [], error: `응답 코드: ${data.Status}` };
        return { type, records: (data.Answer ?? []) as DnsRecord[] };
      } catch {
        return { type, records: [], error: "네트워크 오류" };
      }
    });

    const all = await Promise.all(fetches);
    setResults(all);
    setLoading(false);
  }, [domain, selectedTypes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookup();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      {/* Search */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="도메인 입력 (예: google.com)"
            className="h-12 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !domain.trim()}
          className="h-12 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "조회"}
        </button>
      </form>

      {/* Record type selector */}
      <div className="mt-4 flex flex-wrap gap-2">
        {RECORD_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => toggleType(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedTypes.has(t)
                ? TYPE_COLORS[t]
                : "bg-muted/60 text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((result) => (
            <div key={result.type} className="rounded-lg border">
              <div className="flex items-center gap-2 border-b px-4 py-3 bg-muted/30">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_COLORS[result.type]}`}>
                  {result.type}
                </span>
                <span className="text-sm font-medium">
                  {result.records.length}개 레코드
                </span>
              </div>
              {result.error ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  레코드 없음 또는 {result.error}
                </div>
              ) : result.records.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  해당 타입의 레코드가 없습니다.
                </div>
              ) : (
                <div className="divide-y">
                  {result.records.map((rec, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/20">
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-xs break-all">{rec.data}</span>
                      </div>
                      <div className="flex items-center gap-3 ml-3 shrink-0">
                        <span className="text-xs text-muted-foreground">TTL {rec.TTL}s</span>
                        <button
                          onClick={() => copyToClipboard(rec.data)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="복사"
                        >
                          {copied === rec.data ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
