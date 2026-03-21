"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ALL_TLDS = ["com", "net", "org", "io", "ai", "co", "dev", "app"] as const;

const STYLES = [
  { value: "seo", label: "SEO", desc: "키워드를 포함한 직관적인 이름" },
  { value: "brand", label: "브랜드", desc: "짧고 창의적인 이름" },
  { value: "similarity", label: "유사성", desc: "기존 인기 도메인과 비슷한 이름" },
] as const;

interface GeneratedDomain {
  domain: string;
  available: boolean | null;
}

export function DomainGeneratorClient() {
  const [keyword, setKeyword] = useState("");
  const [selectedTlds, setSelectedTlds] = useState<Set<string>>(
    new Set(["com", "net", "io"])
  );
  const [style, setStyle] = useState("seo");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedDomain[]>([]);
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

  const handleGenerate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const kw = keyword.trim().toLowerCase();
      if (!kw) return;

      setLoading(true);
      setSearched(true);
      setResults([]);

      try {
        const res = await fetch("/api/domain-generator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keyword: kw,
            tlds: Array.from(selectedTlds),
            style,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setResults(data.names);
        }
      } finally {
        setLoading(false);
      }
    },
    [keyword, selectedTlds, style]
  );

  const availableCount = results.filter((r) => r.available === true).length;

  return (
    <div className="space-y-8">
      {/* Form */}
      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Sparkles className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="키워드를 입력하세요 — 예: coffee, tech, shop"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-14 rounded-xl border-border/60 bg-background pl-12 text-base shadow-sm transition-shadow focus:shadow-md focus:shadow-primary/10"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading || keyword.trim().length === 0}
            className="h-14 rounded-xl px-8 text-base font-medium shadow-sm shadow-primary/20 transition-all hover:shadow-md hover:shadow-primary/30"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                생성 중
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                생성하기
              </>
            )}
          </Button>
        </div>

        {/* TLD selection */}
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

        {/* Style selection */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStyle(s.value)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                style === s.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  style === s.value ? "text-primary" : "text-foreground"
                }`}
              >
                {s.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
            </button>
          ))}
        </div>
      </form>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">
            도메인 이름을 생성하고 있습니다...
          </span>
        </div>
      )}

      {searched && !loading && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              총 {results.length}개 생성 / 등록 가능 {availableCount}개
            </p>
          </div>
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
                {results.map((r, i) => (
                  <tr key={`${r.domain}-${i}`} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{r.domain}</td>
                    <td className="px-4 py-3 text-center">
                      {r.available === true ? (
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
                      <Link
                        href={`/domain/${r.domain}`}
                        className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                      >
                        분석하기
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {searched && !loading && results.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          결과를 생성하지 못했습니다. 다른 키워드를 시도해주세요.
        </div>
      )}
    </div>
  );
}
