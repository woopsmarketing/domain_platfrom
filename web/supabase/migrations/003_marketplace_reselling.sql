-- =============================================
-- 003_marketplace_reselling.sql
-- 마켓플레이스 리셀링 기능 확장 마이그레이션
-- 실행 위치: Supabase SQL Editor
-- =============================================


-- =============================================
-- 1. marketplace_listings 컬럼 확장
-- =============================================

-- 매입 원가 (수익 계산용, 관리자 전용)
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS cost_price_usd NUMERIC(10,2);

-- 도메인 니치/카테고리 (e.g. 'finance', 'health', 'tech')
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS niche TEXT;

-- 도메인 등록 연수 (e.g. 5.5 → 5년 6개월)
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS domain_age_years NUMERIC(5,1);

-- 현재 등록자 이름 (Whois registrant)
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS registrant TEXT;

-- 백링크 출처 도메인 목록 (e.g. ARRAY['naver.com', 'daum.net'])
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS backlinks_from TEXT[];

-- Page Authority (Moz PA 지수)
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS pa INTEGER;

-- Referring Domains 수 (연결된 외부 도메인 수)
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS rd INTEGER;

-- 데이터 입력 경로 (manual / csv_import / api_sync)
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- 일괄 임포트 배치 식별자 (CSV 업로드 묶음 추적용)
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS import_batch_id TEXT;

-- updated_at 컬럼이 없는 경우 추가
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();


-- =============================================
-- 2. marketplace_listings 인덱스 추가
-- =============================================

-- 니치별 필터링 검색 성능 향상
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_niche
  ON marketplace_listings(niche);

-- 데이터 입력 경로별 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_source
  ON marketplace_listings(source);

-- 가격 범위 검색 및 정렬 성능 향상
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_asking_price
  ON marketplace_listings(asking_price);


-- =============================================
-- 3. purchase_requests 테이블 생성
-- 구매 문의 요청 관리 (이메일/텔레그램 접수 → 관리자 처리)
-- =============================================
CREATE TABLE IF NOT EXISTS purchase_requests (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 문의 대상 리스팅 (삭제 시 연계 보존을 위해 CASCADE 제외)
  listing_id  UUID    NOT NULL REFERENCES marketplace_listings(id),

  -- 구매 희망자 연락처
  email       TEXT    NOT NULL,
  telegram_id TEXT,

  -- 처리 상태:
  --   pending(신청접수) → availability_checking(가용확인중) → waiting_payment(입금대기)
  --   → payment_received(입금완료) → transferring(이전진행중) → completed(이전완료)
  --   failed(확보실패) — 어느 단계에서든 전이 가능
  status      TEXT    NOT NULL DEFAULT 'pending'
                CHECK (status IN (
                  'pending', 'availability_checking', 'waiting_payment',
                  'payment_received', 'transferring', 'completed', 'failed'
                )),

  -- 관리자 메모 (내부용)
  admin_memo  TEXT,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 리스팅별 문의 목록 조회
CREATE INDEX IF NOT EXISTS idx_purchase_requests_listing_id
  ON purchase_requests(listing_id);

-- 처리 상태별 필터링 (관리자 대시보드)
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status
  ON purchase_requests(status);

-- 최신 문의 우선 정렬
CREATE INDEX IF NOT EXISTS idx_purchase_requests_created_at
  ON purchase_requests(created_at DESC);


-- =============================================
-- 4. RLS (Row Level Security) 정책
-- =============================================

-- purchase_requests: 서비스 롤 전용 접근
-- 공개 insert는 API Route에서 서비스 클라이언트(SUPABASE_SERVICE_ROLE_KEY)를 통해 처리
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;

-- marketplace_listings: 활성 매물(is_active=true)은 비인증 사용자도 조회 가능
-- (이미 정책이 존재하는 경우 에러 방지를 위해 DROP 후 재생성)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'marketplace_listings'
      AND policyname = 'marketplace_listings_public_read'
  ) THEN
    EXECUTE '
      CREATE POLICY "marketplace_listings_public_read"
        ON marketplace_listings
        FOR SELECT
        USING (is_active = true)
    ';
  END IF;
END
$$;
