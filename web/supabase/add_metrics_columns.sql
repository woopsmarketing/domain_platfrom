-- domain_metrics 테이블에 새 컬럼 추가
-- Supabase SQL Editor에서 실행

ALTER TABLE domain_metrics ADD COLUMN IF NOT EXISTS moz_pa NUMERIC;
ALTER TABLE domain_metrics ADD COLUMN IF NOT EXISTS moz_links INTEGER;
ALTER TABLE domain_metrics ADD COLUMN IF NOT EXISTS majestic_links INTEGER;
ALTER TABLE domain_metrics ADD COLUMN IF NOT EXISTS majestic_ref_domains INTEGER;
ALTER TABLE domain_metrics ADD COLUMN IF NOT EXISTS majestic_ttf0_name TEXT;
ALTER TABLE domain_metrics ADD COLUMN IF NOT EXISTS ahrefs_ref_domains INTEGER;
ALTER TABLE domain_metrics ADD COLUMN IF NOT EXISTS ahrefs_organic_keywords INTEGER;
