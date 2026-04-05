// 마켓플레이스 리셀링 관련 타입 정의

export interface MarketplaceListing {
  id: string;
  domain_id: string;
  asking_price: number;
  description: string | null;
  is_negotiable: boolean;
  is_active: boolean;
  listed_at: string;
  updated_at: string;
  // CSV import 확장 필드
  niche: string | null;
  domain_age_years: number | null;
  registrant: string | null;
  backlinks_from: string[] | null;
  pa: number | null;
  rd: number | null;
  source: "manual" | "csv_import";
  import_batch_id: string | null;
  // 조인 데이터
  domains: { name: string; tld: string } | null;
}

export interface MarketplaceListingDetail extends MarketplaceListing {
  domain_metrics: {
    moz_da: number | null;
    moz_pa: number | null;
    ahrefs_dr: number | null;
    ahrefs_backlinks: number | null;
    ahrefs_ref_domains: number | null;
  } | null;
}

export type PurchaseRequestStatus =
  | "pending"
  | "availability_checking"
  | "waiting_payment"
  | "payment_received"
  | "transferring"
  | "completed"
  | "failed";

export interface PurchaseRequest {
  id: string;
  listing_id: string;
  email: string;
  telegram_id: string | null;
  status: PurchaseRequestStatus;
  admin_memo: string | null;
  created_at: string;
  updated_at: string;
  // 조인 데이터
  marketplace_listings?: {
    asking_price: number;
    domains: { name: string; tld: string } | null;
  } | null;
}

export const PURCHASE_STATUS_LABELS: Record<PurchaseRequestStatus, string> = {
  pending: "신청접수",
  availability_checking: "가용확인중",
  waiting_payment: "입금대기",
  payment_received: "입금완료",
  transferring: "이전진행중",
  completed: "이전완료",
  failed: "확보실패",
};

export const PURCHASE_STATUS_COLORS: Record<PurchaseRequestStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  availability_checking: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  waiting_payment: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  payment_received: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  transferring: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

// 마진율 상수
export const MARGIN_RATE = 1.5;

// KRW 환산 (대략)
export const USD_TO_KRW = 1300;
