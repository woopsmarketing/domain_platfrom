"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DomainQuickSummary } from "@/components/domain/domain-quick-summary";
import { trackEvent } from "@/lib/gtag";

export function DomainSearchBox() {
  const [query, setQuery] = useState("");
  const [searchedDomain, setSearchedDomain] = useState<string | null>(null);

  const parseDomain = (input: string): string => {
    let value = input.trim().toLowerCase();
    // https:// 또는 http:// 제거
    value = value.replace(/^https?:\/\//, "");
    // www. 제거
    value = value.replace(/^www\./, "");
    // 경로(/...) 제거
    value = value.split("/")[0];
    // 포트(:8080 등) 제거
    value = value.split(":")[0];
    return value;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const domain = parseDomain(query);
    if (domain && domain.includes(".")) {
      trackEvent("domain_search_submit", { domain });
      setSearchedDomain(domain);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="분석할 도메인을 입력하세요 — example.com"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 rounded-xl border-border/60 bg-background pl-12 text-base shadow-sm transition-shadow focus:shadow-md focus:shadow-primary/10"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-14 rounded-xl px-8 text-base font-medium shadow-sm shadow-primary/20 transition-all hover:shadow-md hover:shadow-primary/30"
        >
          분석하기
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      {searchedDomain && (
        <DomainQuickSummary
          domain={searchedDomain}
          onClose={() => setSearchedDomain(null)}
        />
      )}
    </div>
  );
}
