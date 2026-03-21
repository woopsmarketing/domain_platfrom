"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Search, ExternalLink, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ALL_TLDS = ["com", "net", "org", "io", "ai", "co", "dev", "app"] as const;

interface Result {
  tld: string;
  domain: string;
  available: boolean | null;
}

export function DomainAvailabilityClient() {
  const [query, setQuery] = useState("");
  const [selectedTlds, setSelectedTlds] = useState<Set<string>>(
    new Set(ALL_TLDS)
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [searched, setSearched] = useState(false);

  const toggleTld = (tld: string) => {
    setSelectedTlds((prev) => {
      const next = new Set(prev);
      if (next.has(tld)) {
        if (next.size > 1) next.delete(tld);
      } else {
        next.add(tld);
      }
      return next;
    });
  };

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const name = query
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/^-+|-+$/g, "");

      if (!name) return;

      setLoading(true);
      setSearched(true);
      // Set initial loading state
      const initialResults: Result[] = Array.from(selectedTlds).map(
        (tld) => ({
          tld,
          domain: `${name}.${tld}`,
          available: null,
        })
      );
      setResults(initialResults);

      try {
        const tlds = Array.from(selectedTlds).join(",");
        const res = await fetch(
          `/api/domain-availability?domain=${encodeURIComponent(name)}&tlds=${tlds}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results);
        }
      } finally {
        setLoading(false);
      }
    },
    [query, selectedTlds]
  );

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="도메인 이름을 입력하세요 — 예: myshop"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-14 rounded-xl border-border/60 bg-background pl-12 text-base shadow-sm transition-shadow focus:shadow-md focus:shadow-primary/10"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading || query.trim().length === 0}
            className="h-14 rounded-xl px-8 text-base font-medium shadow-sm shadow-primary/20 transition-all hover:shadow-md hover:shadow-primary/30"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                확인 중
              </>
            ) : (
              "확인하기"
            )}
          </Button>
        </div>

        {/* TLD checkboxes */}
        <div className="flex flex-wrap gap-2">
          {ALL_TLDS.map((tld) => (
            <button
              key={tld}
              type="button"
              onClick={() => toggleTld(tld)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedTlds.has(tld)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              .{tld}
            </button>
          ))}
        </div>
      </form>

      {/* Results */}
      {searched && results.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">도메인</th>
                <th className="px-4 py-3 text-center font-medium">상태</th>
                <th className="px-4 py-3 text-right font-medium">링크</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.tld} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{r.domain}</td>
                  <td className="px-4 py-3 text-center">
                    {loading ? (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        확인 중
                      </span>
                    ) : r.available === true ? (
                      <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        등록 가능
                      </span>
                    ) : r.available === false ? (
                      <span className="inline-flex items-center gap-1.5 text-red-500 dark:text-red-400">
                        <XCircle className="h-4 w-4" />
                        등록됨
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        확인 불가
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.available === true && (
                      <Link
                        href={`/domain/${r.domain}`}
                        className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                      >
                        분석하기
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    {r.available === false && (
                      <Link
                        href={`/domain/${r.domain}`}
                        className="inline-flex items-center gap-1 text-muted-foreground underline-offset-4 hover:underline"
                      >
                        분석하기
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
