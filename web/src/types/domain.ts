export type DomainStatus = "sold" | "expired" | "active";
export type DomainSource = "godaddy" | "namecheap" | "dynadot" | "other";

export interface Domain {
  id: string;
  name: string;
  tld: string;
  status: DomainStatus;
  source: DomainSource;
  soldPrice?: number;
  soldAt?: string;
  registrar?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface DomainMetrics {
  domainId: string;
  // Moz
  mozDA: number | null;
  mozPA: number | null;
  mozLinks: number | null;
  mozSpam: number | null;
  // Majestic
  majesticTF: number | null;
  majesticCF: number | null;
  majesticLinks: number | null;
  majesticRefDomains: number | null;
  majesticTTF0Name: string | null;
  // Ahrefs
  ahrefsDR: number | null;
  ahrefsBacklinks: number | null;
  ahrefsRefDomains: number | null;
  ahrefsTraffic: number | null;
  ahrefsTrafficValue: number | null;
  ahrefsOrganicKeywords: number | null;
  updatedAt: string;
}

export interface SalesHistory {
  id: string;
  domainId: string;
  soldAt: string;
  priceUsd: number;
  platform: string;
}

export interface WaybackSummary {
  domainId: string;
  firstSnapshotAt: string | null;
  lastSnapshotAt: string | null;
  totalSnapshots: number;
}

export interface WhoisInfo {
  registrar: string;
  createdDate: string;
  expiresDate: string;
  updatedDate: string;
  nameServers: string[];
  status: string[];
}

export interface DomainDetail {
  domain: Domain;
  metrics: DomainMetrics | null;
  salesHistory: SalesHistory[];
  wayback: WaybackSummary | null;
  whois: WhoisInfo | null;
  rateLimitReached?: boolean;
}

export interface DomainListItem extends Domain {
  bidCount?: number | null;
  metrics?: Pick<DomainMetrics, "mozDA" | "ahrefsDR" | "majesticTF" | "ahrefsTraffic">;
}
