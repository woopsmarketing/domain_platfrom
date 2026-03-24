"use client";

import { useState, useCallback } from "react";
import { Search, Loader2, Calendar, User, Building2, Server, Shield } from "lucide-react";

interface WhoisData {
  domainName: string;
  registrar?: string;
  createdDate?: string;
  expiryDate?: string;
  updatedDate?: string;
  nameservers: string[];
  status: string[];
  registrant?: string;
  dnssec?: string;
}

function cleanDomain(input: string): string {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  return d;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function calcAge(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const years = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (years < 1) return "(1년 미만)";
    return `(${years}년)`;
  } catch {
    return "";
  }
}

export function WhoisLookupClient() {
  const [domain, setDomain] = useState("");
  const [data, setData] = useState<WhoisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async () => {
    const d = cleanDomain(domain);
    if (!d || !d.includes(".")) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const resp = await fetch(`https://rdap.org/domain/${encodeURIComponent(d)}`);
      if (!resp.ok) {
        setError("WHOIS 정보를 찾을 수 없습니다. 도메인 이름을 확인해주세요.");
        setLoading(false);
        return;
      }

      const json = await resp.json();

      const nameservers = (json.nameservers ?? [])
        .map((ns: { ldhName?: string }) => ns.ldhName ?? "")
        .filter(Boolean);

      const status = (json.status ?? []) as string[];

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

      let registrant = "";
      for (const entity of json.entities ?? []) {
        if ((entity.roles ?? []).includes("registrant")) {
          registrant =
            entity.vcardArray?.[1]?.find((v: string[]) => v[0] === "fn")?.[3] ?? "";
          break;
        }
      }

      const events = json.events ?? [];
      const createdDate = events.find(
        (e: { eventAction: string }) => e.eventAction === "registration"
      )?.eventDate;
      const expiryDate = events.find(
        (e: { eventAction: string }) => e.eventAction === "expiration"
      )?.eventDate;
      const updatedDate = events.find(
        (e: { eventAction: string }) => e.eventAction === "last changed"
      )?.eventDate;

      setData({
        domainName: json.ldhName ?? d,
        registrar,
        createdDate,
        expiryDate,
        updatedDate,
        nameservers,
        status,
        registrant: registrant || "프라이버시 보호됨",
        dnssec: json.secureDNS?.delegationSigned ? "활성" : "비활성",
      });
    } catch {
      setError("조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
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

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {data && (
        <div className="mt-6 rounded-lg border">
          <div className="border-b bg-muted/30 px-5 py-4">
            <h3 className="text-lg font-bold">{data.domainName}</h3>
          </div>

          <div className="divide-y">
            {/* 등록자 */}
            <div className="flex items-start gap-3 px-5 py-4">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">등록자 (소유자)</p>
                <p className="font-medium">{data.registrant}</p>
              </div>
            </div>

            {/* 등록기관 */}
            {data.registrar && (
              <div className="flex items-start gap-3 px-5 py-4">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">등록기관 (Registrar)</p>
                  <p className="font-medium">{data.registrar}</p>
                </div>
              </div>
            )}

            {/* 날짜 */}
            <div className="flex items-start gap-3 px-5 py-4">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="grid w-full gap-2 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">등록일</p>
                  <p className="font-medium">
                    {formatDate(data.createdDate)}{" "}
                    <span className="text-xs text-muted-foreground">{calcAge(data.createdDate)}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">만료일</p>
                  <p className="font-medium">{formatDate(data.expiryDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">최종 수정일</p>
                  <p className="font-medium">{formatDate(data.updatedDate)}</p>
                </div>
              </div>
            </div>

            {/* 네임서버 */}
            {data.nameservers.length > 0 && (
              <div className="flex items-start gap-3 px-5 py-4">
                <Server className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">네임서버</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {data.nameservers.map((ns) => (
                      <span key={ns} className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                        {ns}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DNSSEC */}
            <div className="flex items-start gap-3 px-5 py-4">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">DNSSEC</p>
                <p className="font-medium">{data.dnssec}</p>
              </div>
            </div>

            {/* 상태 */}
            {data.status.length > 0 && (
              <div className="px-5 py-4">
                <p className="mb-2 text-xs text-muted-foreground">도메인 상태</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.status.map((s) => (
                    <span key={s} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
