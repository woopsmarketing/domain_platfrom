-- DomainPulse DB Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/{project-id}/sql

-- =============================================
-- 1. domains
-- =============================================
CREATE TABLE IF NOT EXISTS domains (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  tld         TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('auction', 'expired', 'active', 'sold')),
  source      TEXT NOT NULL CHECK (source IN ('godaddy', 'namecheap', 'dynadot', 'other')),
  registrar   TEXT,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
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
-- 3. sales_history
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
-- 5. auction_listings
-- =============================================
CREATE TABLE IF NOT EXISTS auction_listings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id           UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  platform            TEXT NOT NULL,
  auction_end_at      TIMESTAMPTZ,
  current_price_usd   INTEGER,
  buy_now_price_usd   INTEGER,
  listing_url         TEXT,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (domain_id, platform)
);

-- =============================================
-- 6. marketplace_listings  (내 도메인 판매)
-- =============================================
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id       UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  asking_price    INTEGER NOT NULL,
  description     TEXT,
  is_negotiable   BOOLEAN NOT NULL DEFAULT true,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  listed_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (domain_id)
);

-- =============================================
-- 7. inquiries  (구매 문의)
-- =============================================
CREATE TABLE IF NOT EXISTS inquiries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id          UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  email               TEXT NOT NULL,
  message             TEXT NOT NULL,
  offered_price_usd   INTEGER,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'closed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 8. wishlists  (관심 도메인, 비로그인 포함 대비)
-- =============================================
CREATE TABLE IF NOT EXISTS wishlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,  -- Supabase auth.users.id
  domain_id   UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, domain_id)
);

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_domains_status   ON domains(status);
CREATE INDEX IF NOT EXISTS idx_domains_source   ON domains(source);
CREATE INDEX IF NOT EXISTS idx_domains_name     ON domains(name);
CREATE INDEX IF NOT EXISTS idx_auction_end      ON auction_listings(auction_end_at);
CREATE INDEX IF NOT EXISTS idx_metrics_updated  ON domain_metrics(updated_at);
CREATE INDEX IF NOT EXISTS idx_wishlist_user    ON wishlists(user_id);

-- =============================================
-- Sample seed data (development only)
-- =============================================
INSERT INTO domains (name, tld, status, source, registrar) VALUES
  ('techflow.com',        'com', 'auction', 'godaddy',   'GoDaddy.com, LLC'),
  ('cryptovault.io',      'io',  'auction', 'namecheap', 'NameCheap, Inc.'),
  ('greenlogistics.com',  'com', 'auction', 'dynadot',   'Dynadot LLC'),
  ('healthdata.org',      'org', 'auction', 'godaddy',   'GoDaddy.com, LLC'),
  ('aitools.dev',         'dev', 'auction', 'namecheap', 'NameCheap, Inc.'),
  ('socialmetrics.com',   'com', 'expired', 'godaddy',   'GoDaddy.com, LLC'),
  ('webstudio.net',       'net', 'expired', 'dynadot',   'Dynadot LLC'),
  ('financeapi.io',       'io',  'expired', 'namecheap', 'NameCheap, Inc.'),
  ('brandify.com',        'com', 'active',  'other',     NULL),
  ('devhire.io',          'io',  'active',  'other',     NULL),
  ('quickship.co',        'co',  'active',  'other',     NULL)
ON CONFLICT (name) DO NOTHING;

-- Metrics for auction domains (after domains inserted)
INSERT INTO domain_metrics (domain_id, moz_da, moz_spam, ahrefs_dr, ahrefs_traffic, ahrefs_backlinks, ahrefs_traffic_value, majestic_tf, majestic_cf)
SELECT id, 35, 2,  28, 1200,  4500,  850,  22, 30 FROM domains WHERE name = 'techflow.com'
ON CONFLICT (domain_id) DO NOTHING;

INSERT INTO domain_metrics (domain_id, moz_da, moz_spam, ahrefs_dr, ahrefs_traffic, ahrefs_backlinks, ahrefs_traffic_value, majestic_tf, majestic_cf)
SELECT id, 52, 1,  45, 5600, 12000, 3200,  38, 45 FROM domains WHERE name = 'cryptovault.io'
ON CONFLICT (domain_id) DO NOTHING;

INSERT INTO domain_metrics (domain_id, moz_da, moz_spam, ahrefs_dr, ahrefs_traffic, ahrefs_backlinks, ahrefs_traffic_value, majestic_tf, majestic_cf)
SELECT id, 68, 0,  62, 28000, 45000, 18000, 55, 62 FROM domains WHERE name = 'healthdata.org'
ON CONFLICT (domain_id) DO NOTHING;

-- Marketplace listings
INSERT INTO marketplace_listings (domain_id, asking_price, description, is_negotiable)
SELECT id, 25000, '브랜딩에 최적화된 프리미엄 .com 도메인. DA 45, 월 3K 오가닉 트래픽.', true
FROM domains WHERE name = 'brandify.com'
ON CONFLICT (domain_id) DO NOTHING;

INSERT INTO marketplace_listings (domain_id, asking_price, description, is_negotiable)
SELECT id, 8500, '개발자 채용 플랫폼에 딱 맞는 도메인. 깔끔한 히스토리.', true
FROM domains WHERE name = 'devhire.io'
ON CONFLICT (domain_id) DO NOTHING;

INSERT INTO marketplace_listings (domain_id, asking_price, description, is_negotiable)
SELECT id, 12000, '물류·배송 서비스 브랜드에 적합. DR 30+.', false
FROM domains WHERE name = 'quickship.co'
ON CONFLICT (domain_id) DO NOTHING;

-- Auction listings
INSERT INTO auction_listings (domain_id, platform, auction_end_at, current_price_usd)
SELECT id, 'GoDaddy', now() + interval '7 days', 2500 FROM domains WHERE name = 'techflow.com'
ON CONFLICT (domain_id, platform) DO NOTHING;

INSERT INTO auction_listings (domain_id, platform, auction_end_at, current_price_usd)
SELECT id, 'NameCheap', now() + interval '5 days', 8900 FROM domains WHERE name = 'cryptovault.io'
ON CONFLICT (domain_id, platform) DO NOTHING;
