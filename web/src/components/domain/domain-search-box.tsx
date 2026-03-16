"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DomainSearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const domain = query.trim().toLowerCase();
    if (domain) {
      router.push(`/domain/${domain}`);
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="분석할 도메인을 입력하세요 — example.com"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-14 pl-11 text-lg"
        />
      </div>
      <Button type="submit" size="lg" className="h-14 px-8 text-lg">
        분석하기
      </Button>
    </form>
  );
}
