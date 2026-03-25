"use client";

import { useState, useCallback } from "react";
import { Search, Loader2, Calendar, Clock, AlertTriangle, CheckCircle2, Gavel, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cleanDomain } from "@/lib/clean-domain";

interface ExpiryData {
  domainName: string;
  createdDate: string | null;
  expiryDate: string | null;
  updatedDate: string | null;
  registrar: string;
  ageYears: number;
  daysUntilExpiry: number | null;
  status: "safe" | "warning" | "danger" | "expired" | "unknown";
}


function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function getStatus(daysUntilExpiry: number | null): ExpiryData["status"] {
  if (daysUntilExpiry === null) return "unknown";
  if (daysUntilExpiry < 0) return "expired";
  if (daysUntilExpiry <= 30) return "danger";
  if (daysUntilExpiry <= 90) return "warning";
  return "safe";
}

const STATUS_CONFIG = {
  safe: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    label: "안전",
    desc: "만료까지 충분한 기간이 남아있습니다.",
  },
  warning: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    label: "주의",
    desc: "만료가 가까워지고 있습니다. 갱신하지 않으면 경매에 나올 수 있습니다.",
  },
  danger: {
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    label: "위험",
    desc: "곧 만료됩니다! 갱신하지 않으면 경매 또는 삭제됩니다.",
  },
  expired: {
    icon: Gavel,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    label: "만료됨",
    desc: "이미 만료되었습니다. 경매에 나왔거나 곧 등록 가능해질 수 있습니다.",
  },
  unknown: {
    icon: Clock,
    color: "text-muted-foreground",
    bg: "bg-muted/30 border-border",
    label: "확인 불가",
    desc: "만료일 정보를 가져올 수 없습니다.",
  },
};

export function DomainExpiryClient() {
  const [domain, setDomain] = useState("");
  const [data, setData] = useState<ExpiryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async () => {
    const d = cleanDomain(domain);
    if (!d || !d.includes(".")) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const resp = await fetch(`/api/whois-lookup?domain=${encodeURIComponent(d)}`);
      if (!resp.ok) {
        setError("도메인 정보를 찾을 수 없습니다. 도메인 이름을 확인해주세요.");
        setLoading(false);
        return;
      }

      const json = await resp.json();
      const events = json.events ?? [];
      const createdDate: string | null =
        events.find((e: { eventAction: string }) => e.eventAction === "registration")?.eventDate ?? null;
      const expiryDate: string | null =
        events.find((e: { eventAction: string }) => e.eventAction === "expiration")?.eventDate ?? null;
      const updatedDate: string | null =
        events.find((e: { eventAction: string }) => e.eventAction === "last changed")?.eventDate ?? null;

      let registrar = "";
      for (const entity of json.entities ?? []) {
        if ((entity.roles ?? []).includes("registrar")) {
          registrar =
            entity.vcardArray?.[1]?.find((v: string[]) => v[0] === "fn")?.[3] ??
            entity.handle ??
            "";
          break;
        }
      }

      const ageYears = createdDate
        ? Math.floor((Date.now() - new Date(createdDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 0;

      const daysUntilExpiry = expiryDate
        ? Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
        : null;

      setData({
        domainName: json.ldhName ?? d,
        createdDate,
        expiryDate,
        updatedDate,
        registrar,
        ageYears,
        daysUntilExpiry,
        status: getStatus(daysUntilExpiry),
      });
    } catch {
      setError("조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [domain]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookup();
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
            placeholder="도메인 입력 (예: example.com)"
            className="h-12 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !domain.trim()}
          className="h-12 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "확인"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {data && (
        <div className="mt-6 space-y-4">
          {/* 상태 배너 */}
          {(() => {
            const cfg = STATUS_CONFIG[data.status];
            return (
              <div className={`flex items-start gap-3 rounded-lg border p-4 ${cfg.bg}`}>
                <cfg.icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.color}`} />
                <div>
                  <p className={`font-semibold ${cfg.color}`}>{cfg.label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{cfg.desc}</p>
                </div>
              </div>
            );
          })()}

          {/* 핵심 정보 카드 */}
          <div className="rounded-lg border">
            <div className="border-b bg-muted/30 px-5 py-4">
              <h3 className="text-lg font-bold">{data.domainName}</h3>
              {data.registrar && (
                <p className="text-xs text-muted-foreground mt-0.5">{data.registrar}</p>
              )}
            </div>

            <div className="grid gap-px bg-border sm:grid-cols-3">
              <div className="bg-card p-4 text-center">
                <Calendar className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">등록일</p>
                <p className="font-semibold text-sm mt-0.5">{formatDate(data.createdDate)}</p>
              </div>
              <div className="bg-card p-4 text-center">
                <Calendar className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">만료일</p>
                <p className="font-semibold text-sm mt-0.5">{formatDate(data.expiryDate)}</p>
                {data.daysUntilExpiry !== null && (
                  <p
                    className={`text-xs mt-0.5 ${
                      data.daysUntilExpiry <= 30
                        ? "text-red-500 font-medium"
                        : data.daysUntilExpiry <= 90
                        ? "text-amber-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {data.daysUntilExpiry > 0
                      ? `${data.daysUntilExpiry}일 남음`
                      : `${Math.abs(data.daysUntilExpiry)}일 전 만료`}
                  </p>
                )}
              </div>
              <div className="bg-card p-4 text-center">
                <Clock className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">도메인 나이</p>
                <p className="font-semibold text-sm mt-0.5">
                  {data.ageYears > 0 ? `${data.ageYears}년` : "1년 미만"}
                </p>
              </div>
            </div>
          </div>

          {/* 만료 가까우면 경매 CTA */}
          {(data.status === "danger" || data.status === "expired") && (
            <div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5 p-4">
              <div className="flex items-start gap-3">
                <Gavel className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">이 도메인이 경매에 나왔을 수 있습니다</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    만료된 도메인은 경매를 통해 거래되는 경우가 많습니다. 경매 페이지에서 확인해보세요.
                  </p>
                  <Link
                    href="/auctions"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    실시간 경매 확인 <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 상세 분석 링크 */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/domain/${data.domainName}`}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              {data.domainName} 종합 분석
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/tools/whois-lookup"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              WHOIS 상세 조회
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
