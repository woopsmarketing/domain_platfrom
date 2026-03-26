import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit, isProUser } from "@/lib/rate-limit";
import * as net from "net";

// ccTLD별 WHOIS 서버 매핑
const WHOIS_SERVERS: Record<string, string> = {
  kr: "whois.kr",
  jp: "whois.jprs.jp",
  cn: "whois.cnnic.cn",
  uk: "whois.nic.uk",
  de: "whois.denic.de",
  fr: "whois.nic.fr",
  au: "whois.auda.org.au",
  ca: "whois.cira.ca",
  br: "whois.registro.br",
  in: "whois.registry.in",
  ru: "whois.tcinet.ru",
  nl: "whois.sidn.nl",
  it: "whois.nic.it",
  es: "whois.nic.es",
  se: "whois.iis.se",
  ch: "whois.nic.ch",
  be: "whois.dns.be",
  at: "whois.nic.at",
  pl: "whois.dns.pl",
  cz: "whois.nic.cz",
  tw: "whois.twnic.net.tw",
  hk: "whois.hkirc.hk",
  sg: "whois.sgnic.sg",
  th: "whois.thnic.co.th",
};

function getWhoisServer(domain: string): string | null {
  const parts = domain.split(".");
  // co.kr, or.kr 같은 2레벨 ccTLD
  if (parts.length >= 3) {
    const topLevel = parts[parts.length - 1];
    if (WHOIS_SERVERS[topLevel]) return WHOIS_SERVERS[topLevel];
  }
  const tld = parts[parts.length - 1];
  return WHOIS_SERVERS[tld] ?? null;
}

function parseWhoisText(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const match = line.match(/^\s*([^:]+?)\s*:\s*(.+?)\s*$/);
    if (match) {
      const key = match[1].trim().toLowerCase();
      const value = match[2].trim();
      if (!result[key]) result[key] = value;
    }
  }
  return result;
}

function whoisTcpQuery(server: string, domain: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let data = "";

    socket.setTimeout(8000);
    socket.connect(43, server, () => {
      socket.write(domain + "\r\n");
    });

    socket.on("data", (chunk) => { data += chunk.toString(); });
    socket.on("end", () => { socket.destroy(); resolve(data); });
    socket.on("error", (err) => { socket.destroy(); reject(err); });
    socket.on("timeout", () => { socket.destroy(); reject(new Error("timeout")); });
  });
}

function convertWhoisToRdapFormat(raw: string, domain: string): Record<string, unknown> {
  const parsed = parseWhoisText(raw);

  // 날짜 필드 추출 (다양한 포맷 대응)
  const dateKeys = {
    registration: ["registered date", "registration date", "created", "creation date", "domain registered", "등록일"],
    expiration: ["expiration date", "expiry date", "expires", "domain expires", "paid-till", "만료일"],
    lastChanged: ["last updated", "updated date", "modified", "last modified", "최근 수정일"],
  };

  const events: { eventAction: string; eventDate: string }[] = [];
  for (const [action, keys] of Object.entries(dateKeys)) {
    for (const key of keys) {
      if (parsed[key]) {
        const d = new Date(parsed[key]);
        if (!isNaN(d.getTime())) {
          events.push({ eventAction: action === "lastChanged" ? "last changed" : action, eventDate: d.toISOString() });
        } else {
          events.push({ eventAction: action === "lastChanged" ? "last changed" : action, eventDate: parsed[key] });
        }
        break;
      }
    }
  }

  // 등록기관 추출
  const registrarKeys = ["registrar", "authorized agency", "등록대행자"];
  let registrarName = "";
  for (const key of registrarKeys) {
    if (parsed[key]) { registrarName = parsed[key]; break; }
  }

  // 네임서버 추출
  const nameservers: { ldhName: string }[] = [];
  for (const [key, value] of Object.entries(parsed)) {
    if (key.includes("name server") || key.includes("nameserver") || key === "host name" || key.includes("ns ")) {
      nameservers.push({ ldhName: value.toLowerCase() });
    }
  }
  // 멀티라인 네임서버 (kr WHOIS 형식)
  const nsMatches = raw.match(/Name Server\s*:\s*(.+)/gi);
  if (nsMatches) {
    for (const m of nsMatches) {
      const ns = m.split(":")[1]?.trim().toLowerCase();
      if (ns && !nameservers.find(n => n.ldhName === ns)) {
        nameservers.push({ ldhName: ns });
      }
    }
  }

  // DNSSEC
  const dnssec = parsed["dnssec"] ?? parsed["ds record"] ?? "";

  // 상태 추출
  const statusKeys = ["status", "domain status", "state"];
  const statuses: string[] = [];
  for (const key of statusKeys) {
    if (parsed[key]) {
      statuses.push(...parsed[key].split(/[,;]/).map(s => s.trim()));
    }
  }

  return {
    ldhName: domain,
    events,
    entities: registrarName ? [
      { roles: ["registrar"], vcardArray: ["vcard", [["fn", {}, "text", registrarName]]], handle: registrarName }
    ] : [],
    nameservers,
    status: statuses,
    secureDNS: { delegationSigned: dnssec.toLowerCase().includes("sign") },
    _raw: raw,
    _source: "whois-tcp",
  };
}

export async function GET(request: NextRequest) {
  // Rate limit 체크
  const pro = await isProUser(request);
  if (!pro) {
    const rateLimit = await checkApiRateLimit("whois_lookup", 30);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "일일 사용 한도를 초과했습니다. Pro 구독으로 무제한 사용하세요.",
          limit: rateLimit.limit,
          used: rateLimit.used,
        },
        { status: 429 }
      );
    }
  }

  const { searchParams } = request.nextUrl;
  const domain = searchParams.get("domain");

  if (!domain || !domain.includes(".")) {
    return NextResponse.json({ error: "도메인 이름이 필요합니다" }, { status: 400 });
  }

  const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  // 1차: RDAP 시도
  try {
    const resp = await fetch(
      `https://rdap.org/domain/${encodeURIComponent(clean)}`,
      { cache: "no-store", headers: { Accept: "application/rdap+json" }, signal: AbortSignal.timeout(5000) }
    );

    if (resp.ok) {
      const data = await resp.json();
      return NextResponse.json(data);
    }
  } catch {
    // RDAP 실패 — fallback으로 진행
  }

  // 2차: WHOIS TCP 소켓 fallback (ccTLD 지원)
  const whoisServer = getWhoisServer(clean);
  if (whoisServer) {
    try {
      const raw = await whoisTcpQuery(whoisServer, clean);
      if (raw.length > 50) {
        const rdapLike = convertWhoisToRdapFormat(raw, clean);
        return NextResponse.json(rdapLike);
      }
    } catch {
      // whois도 실패
    }
  }

  // 3차: whois.iana.org로 서버 자동 탐색 시도
  try {
    const ianaRaw = await whoisTcpQuery("whois.iana.org", clean.split(".").pop() ?? "");
    const referMatch = ianaRaw.match(/refer:\s*(.+)/i) ?? ianaRaw.match(/whois:\s*(.+)/i);
    if (referMatch) {
      const referServer = referMatch[1].trim();
      const raw = await whoisTcpQuery(referServer, clean);
      if (raw.length > 50) {
        const rdapLike = convertWhoisToRdapFormat(raw, clean);
        return NextResponse.json(rdapLike);
      }
    }
  } catch {
    // 최종 실패
  }

  return NextResponse.json({ error: "WHOIS 정보를 찾을 수 없습니다" }, { status: 404 });
}
