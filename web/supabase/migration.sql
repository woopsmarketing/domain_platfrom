-- DomainPulse DB Migration
-- 도메인 거래 데이터 분석 플랫폼
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/{project-id}/sql

-- =============================================
-- 1. domains
-- =============================================
CREATE TABLE IF NOT EXISTS domains (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  tld         TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('sold', 'expired', 'active')),
  source      TEXT NOT NULL CHECK (source IN ('godaddy', 'namecheap', 'dynadot', 'other')),
  registrar   TEXT,
  expires_at  TIMESTAMPTZ,
  search_count     INTEGER NOT NULL DEFAULT 0,
  last_searched_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name)
);

-- =============================================
-- 2. domain_metrics  (SEO 지수, 7일 캐시)
-- =============================================
CREATE TABLE IF NOT EXISTS domain_metrics (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id              UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  moz_da                 INTEGER,
  moz_spam               INTEGER,
  ahrefs_dr              INTEGER,
  ahrefs_traffic         INTEGER,
  ahrefs_backlinks       INTEGER,
  ahrefs_traffic_value   INTEGER,
  majestic_tf            INTEGER,
  majestic_cf            INTEGER,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (domain_id)
);

-- =============================================
-- 3. sales_history  (낙찰 이력)
-- =============================================
CREATE TABLE IF NOT EXISTS sales_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id   UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  sold_at     DATE NOT NULL,
  price_usd   INTEGER NOT NULL,
  platform    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 4. wayback_summary
-- =============================================
CREATE TABLE IF NOT EXISTS wayback_summary (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id           UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  first_snapshot_at   TIMESTAMPTZ,
  last_snapshot_at    TIMESTAMPTZ,
  total_snapshots     INTEGER NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (domain_id)
);

-- =============================================
-- 5. active_auctions  (현재 진행 중인 경매, 실시간 갱신)
-- =============================================
CREATE TABLE IF NOT EXISTS active_auctions (
  domain          TEXT PRIMARY KEY,
  tld             TEXT NOT NULL DEFAULT '',
  current_price   INTEGER NOT NULL DEFAULT 0,
  bid_count       INTEGER,
  end_time_raw    TEXT,           -- 원본 문자열 그대로 저장 (플랫폼별 포맷 다름)
  crawled_at      TIMESTAMPTZ NOT NULL DEFAULT now()
  -- source 컬럼 없음: UI에 플랫폼 비노출
);

CREATE INDEX IF NOT EXISTS idx_active_price      ON active_auctions(current_price DESC);
CREATE INDEX IF NOT EXISTS idx_active_crawled    ON active_auctions(crawled_at DESC);
CREATE INDEX IF NOT EXISTS idx_active_bid_count  ON active_auctions(bid_count DESC NULLS LAST);

-- =============================================
-- 6. sold_auctions  (낙찰 확정 도메인)
-- =============================================
CREATE TABLE IF NOT EXISTS sold_auctions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain        TEXT NOT NULL,
  tld           TEXT NOT NULL DEFAULT '',
  price_usd     INTEGER NOT NULL DEFAULT 0,
  bid_count     INTEGER,
  sold_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  platform      TEXT NOT NULL DEFAULT 'namecheap',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sold_auctions_domain  ON sold_auctions(domain);
CREATE INDEX IF NOT EXISTS idx_sold_auctions_sold_at ON sold_auctions(sold_at DESC);
CREATE INDEX IF NOT EXISTS idx_sold_auctions_price   ON sold_auctions(price_usd DESC);

-- =============================================
-- RPC: 검색 카운트 증가
-- =============================================
CREATE OR REPLACE FUNCTION increment_search_count(domain_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE domains
  SET search_count = search_count + 1,
      last_searched_at = now()
  WHERE id = domain_id_input;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_domains_status        ON domains(status);
CREATE INDEX IF NOT EXISTS idx_domains_source        ON domains(source);
CREATE INDEX IF NOT EXISTS idx_domains_name          ON domains(name);
CREATE INDEX IF NOT EXISTS idx_domains_search_count  ON domains(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_domains_last_searched ON domains(last_searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_domain          ON sales_history(domain_id);
CREATE INDEX IF NOT EXISTS idx_sales_price           ON sales_history(price_usd DESC);
CREATE INDEX IF NOT EXISTS idx_sales_sold_at         ON sales_history(sold_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_updated       ON domain_metrics(updated_at);

-- =============================================
-- Sample seed data (development only)
-- =============================================
INSERT INTO domains (name, tld, status, source, registrar) VALUES
  ('techflow.com',        'com', 'sold',    'godaddy',   'GoDaddy.com, LLC'),
  ('cryptovault.io',      'io',  'sold',    'namecheap', 'NameCheap, Inc.'),
  ('greenlogistics.com',  'com', 'sold',    'dynadot',   'Dynadot LLC'),
  ('healthdata.org',      'org', 'sold',    'godaddy',   'GoDaddy.com, LLC'),
  ('aitools.dev',         'dev', 'sold',    'namecheap', 'NameCheap, Inc.'),
  ('socialmetrics.com',   'com', 'expired', 'godaddy',   'GoDaddy.com, LLC'),
  ('webstudio.net',       'net', 'expired', 'dynadot',   'Dynadot LLC'),
  ('financeapi.io',       'io',  'expired', 'namecheap', 'NameCheap, Inc.')
ON CONFLICT (name) DO NOTHING;

-- Metrics for sold domains
INSERT INTO domain_metrics (domain_id, moz_da, moz_spam, ahrefs_dr, ahrefs_traffic, ahrefs_backlinks, ahrefs_traffic_value, majestic_tf, majestic_cf)
SELECT id, 35, 2,  28, 1200,  4500,  850,  22, 30 FROM domains WHERE name = 'techflow.com'
ON CONFLICT (domain_id) DO NOTHING;

INSERT INTO domain_metrics (domain_id, moz_da, moz_spam, ahrefs_dr, ahrefs_traffic, ahrefs_backlinks, ahrefs_traffic_value, majestic_tf, majestic_cf)
SELECT id, 52, 1,  45, 5600, 12000, 3200,  38, 45 FROM domains WHERE name = 'cryptovault.io'
ON CONFLICT (domain_id) DO NOTHING;

INSERT INTO domain_metrics (domain_id, moz_da, moz_spam, ahrefs_dr, ahrefs_traffic, ahrefs_backlinks, ahrefs_traffic_value, majestic_tf, majestic_cf)
SELECT id, 68, 0,  62, 28000, 45000, 18000, 55, 62 FROM domains WHERE name = 'healthdata.org'
ON CONFLICT (domain_id) DO NOTHING;

-- Sales history (낙찰 이력)
INSERT INTO sales_history (domain_id, sold_at, price_usd, platform)
SELECT id, '2026-03-10', 2500, 'GoDaddy' FROM domains WHERE name = 'techflow.com'
ON CONFLICT DO NOTHING;

INSERT INTO sales_history (domain_id, sold_at, price_usd, platform)
SELECT id, '2026-03-08', 8900, 'Namecheap' FROM domains WHERE name = 'cryptovault.io'
ON CONFLICT DO NOTHING;

INSERT INTO sales_history (domain_id, sold_at, price_usd, platform)
SELECT id, '2026-03-05', 1200, 'Dynadot' FROM domains WHERE name = 'greenlogistics.com'
ON CONFLICT DO NOTHING;

INSERT INTO sales_history (domain_id, sold_at, price_usd, platform)
SELECT id, '2026-03-01', 15000, 'GoDaddy' FROM domains WHERE name = 'healthdata.org'
ON CONFLICT DO NOTHING;
