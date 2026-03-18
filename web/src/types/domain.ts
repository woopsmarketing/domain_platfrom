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
  mozDA: number | null;
  mozSpam: number | null;
  ahrefsDR: number | null;
  ahrefsTraffic: number | null;
  ahrefsBacklinks: number | null;
  ahrefsTrafficValue: number | null;
  majesticTF: number | null;
  majesticCF: number | null;
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
}

export interface DomainListItem extends Domain {
  metrics?: Pick<DomainMetrics, "mozDA" | "ahrefsDR" | "majesticTF" | "ahrefsTraffic">;
}
