import type { WhoisInfo } from "@/types/domain";

interface WhoisApiResponse {
  WhoisRecord?: {
    registrarName?: string;
    createdDate?: string;
    expiresDate?: string;
    updatedDate?: string;
    nameServers?: { hostNames?: string[] };
    status?: string;
    domainAvailability?: string;
  };
}

export async function fetchWhois(domainName: string): Promise<WhoisInfo | null> {
  const apiKey = process.env.WHOIS_API_KEY;
  if (!apiKey) {
    console.error("WHOIS_API_KEY is not set");
    return null;
  }

  try {
    const url = new URL("https://www.whoisxmlapi.com/whoisserver/WhoisService");
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("domainName", domainName);
    url.searchParams.set("outputFormat", "JSON");

    const res = await fetch(url.toString(), {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error(`WhoisXML API error: ${res.status}`);
      return null;
    }

    const raw: WhoisApiResponse = await res.json();
    const record = raw.WhoisRecord;

    if (!record) return null;

    return {
      registrar: record.registrarName ?? "",
      createdDate: record.createdDate ?? "",
      expiresDate: record.expiresDate ?? "",
      updatedDate: record.updatedDate ?? "",
      nameServers: record.nameServers?.hostNames ?? [],
      status: record.status ? [record.status] : [],
    };
  } catch (err) {
    console.error("fetchWhois failed:", err);
    return null;
  }
}
