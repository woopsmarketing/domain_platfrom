"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Sparkles, Loader2, CheckCircle2, XCircle, AlertCircle, ExternalLink, Search, Target } from "lucide-react";

const ALL_TLDS = ["com", "net", "org", "io", "ai", "co", "dev", "app"] as const;

interface GeneratedDomain {
  domain: string;
  available: boolean | null;
}

interface GeneratorResults {
  seo: GeneratedDomain[];
  brand: GeneratedDomain[];
  similar: GeneratedDomain[];
}

const SECTION_CONFIG = {
  seo: { label: "SEO 최적화", desc: "키워드가 포함된 검색 친화적 이름", icon: Search, color: "text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-400" },
  brand: { label: "브랜드", desc: "짧고 기억에 남는 창의적 이름", icon: Sparkles, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400" },
  similar: { label: "트렌드", desc: "인기 브랜드에서 영감을 받은 이름", icon: Target, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-400" },
} as const;

export function DomainGeneratorClient() {
  const [keyword, setKeyword] = useState("");
  const [selectedTlds, setSelectedTlds] = useState<Set<string>>(new Set(["com", "net", "io"]));
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratorResults | null>(null);

  const toggleTld = (tld: string) => {
    setSelectedTlds((prev) => {
      const next = new Set(prev);
      if (next.has(tld)) { if (next.size > 1) next.delete(tld); }
      else next.add(tld);
      return next;
    });
  };

  const handleGenerate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const kw = keyword.trim().toLowerCase();
    if (!kw) return;

    setLoading(true);
    setResults(null);

    try {
      const res = await fetch("/api/domain-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: kw, tlds: Array.from(selectedTlds) }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedTlds]);

  const totalCount = results ? results.seo.length + results.brand.length + results.similar.length : 0;
  const availableCount = results
    ? [...results.seo, ...results.brand, ...results.similar].filter((r) => r.available === true).length
    : 0;

  return (
    <div className="space-y-8">
      {/* Form */}
      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Sparkles className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="키워드를 입력하세요 — 예: coffee, 쇼핑, tech"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-14 w-full rounded-xl border bg-background pl-12 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading || keyword.trim().length === 0}
            className="h-14 rounded-xl bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <><Loader2 className="mr-2 h-4 w-4 inline animate-spin" />생성 중</> : <><Sparkles className="mr-2 h-4 w-4 inline" />생성하기</>}
          </button>
        </div>

        {/* TLD selection */}
        <div className="flex flex-wrap gap-2">
          {ALL_TLDS.map((tld) => (
            <button key={tld} type="button" onClick={() => toggleTld(tld)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedTlds.has(tld)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}>
              .{tld}
            </button>
          ))}
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">AI가 도메인 이름을 생성하고 있습니다...</span>
        </div>
      )}

      {/* Results — 3 sections */}
      {results && !loading && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            총 {totalCount}개 생성 / 등록 가능 {availableCount}개
          </p>

          {(["seo", "brand", "similar"] as const).map((category) => {
            const config = SECTION_CONFIG[category];
            const items = results[category];
            if (items.length === 0) return null;

            return (
              <div key={category} className="rounded-xl border border-border/60">
                <div className="flex items-center gap-3 border-b border-border/60 bg-muted/30 px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color}`}>
                    <config.icon className="h-3 w-3" />
                    {config.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{config.desc}</span>
                </div>

                <div className="divide-y divide-border/40">
                  {items.map((item) => (
                    <div key={item.domain} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
                      <span className="font-medium text-sm">{item.domain}</span>
                      <div className="flex items-center gap-3">
                        {item.available === true && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="h-3.5 w-3.5" />등록 가능</span>
                        )}
                        {item.available === false && (
                          <span className="inline-flex items-center gap-1 text-xs text-red-500"><XCircle className="h-3.5 w-3.5" />등록됨</span>
                        )}
                        {item.available === null && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><AlertCircle className="h-3.5 w-3.5" />확인 불가</span>
                        )}
                        <Link href={`/domain/${item.domain}`} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                          분석하기<ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
