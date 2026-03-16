-- =============================================
-- DomainPulse 더미 데이터 (개발용)
-- migration.sql 실행 후 이 파일 실행
-- =============================================

-- 기존 시드 데이터 삭제 (충돌 방지)
DELETE FROM sales_history;
DELETE FROM domain_metrics;
DELETE FROM wayback_summary;
DELETE FROM domains;

-- =============================================
-- 1. domains (30개 — sold 20, expired 5, active 5)
-- =============================================
INSERT INTO domains (name, tld, status, source, registrar, search_count, last_searched_at) VALUES
  -- sold (20개)
  ('techflow.com',        'com', 'sold', 'godaddy',   'GoDaddy.com, LLC',    45, now() - interval '1 hour'),
  ('cryptovault.io',      'io',  'sold', 'namecheap', 'NameCheap, Inc.',     38, now() - interval '2 hours'),
  ('greenlogistics.com',  'com', 'sold', 'dynadot',   'Dynadot LLC',        12, now() - interval '5 hours'),
  ('healthdata.org',      'org', 'sold', 'godaddy',   'GoDaddy.com, LLC',   92, now() - interval '30 minutes'),
  ('aitools.dev',         'dev', 'sold', 'namecheap', 'NameCheap, Inc.',    67, now() - interval '3 hours'),
  ('cloudmetrics.io',     'io',  'sold', 'godaddy',   'GoDaddy.com, LLC',   23, now() - interval '4 hours'),
  ('blockchainpay.com',   'com', 'sold', 'namecheap', 'NameCheap, Inc.',    56, now() - interval '6 hours'),
  ('datapipeline.net',    'net', 'sold', 'godaddy',   'GoDaddy.com, LLC',   34, now() - interval '8 hours'),
  ('ecomarket.co',        'co',  'sold', 'dynadot',   'Dynadot LLC',        19, now() - interval '10 hours'),
  ('fintechlab.io',       'io',  'sold', 'namecheap', 'NameCheap, Inc.',    41, now() - interval '12 hours'),
  ('gamedev.studio',      'studio', 'sold', 'godaddy', 'GoDaddy.com, LLC',  28, now() - interval '1 day'),
  ('smartcontract.xyz',   'xyz', 'sold', 'namecheap', 'NameCheap, Inc.',    15, now() - interval '1 day'),
  ('quantumapi.com',      'com', 'sold', 'godaddy',   'GoDaddy.com, LLC',   73, now() - interval '2 days'),
  ('devhire.io',          'io',  'sold', 'namecheap', 'NameCheap, Inc.',    51, now() - interval '2 days'),
  ('autotrader.app',      'app', 'sold', 'godaddy',   'GoDaddy.com, LLC',   33, now() - interval '3 days'),
  ('mediastream.tv',      'tv',  'sold', 'dynadot',   'Dynadot LLC',        17, now() - interval '3 days'),
  ('robotics.ai',         'ai',  'sold', 'namecheap', 'NameCheap, Inc.',    89, now() - interval '4 days'),
  ('travelguide.co',      'co',  'sold', 'godaddy',   'GoDaddy.com, LLC',   22, now() - interval '5 days'),
  ('securemail.net',      'net', 'sold', 'namecheap', 'NameCheap, Inc.',    44, now() - interval '5 days'),
  ('brandify.com',        'com', 'sold', 'godaddy',   'GoDaddy.com, LLC',   61, now() - interval '6 days'),
  -- expired (5개)
  ('socialmetrics.com',   'com', 'expired', 'godaddy',   'GoDaddy.com, LLC', 8,  now() - interval '1 day'),
  ('webstudio.net',       'net', 'expired', 'dynadot',   'Dynadot LLC',      5,  now() - interval '2 days'),
  ('financeapi.io',       'io',  'expired', 'namecheap', 'NameCheap, Inc.',  14, now() - interval '3 days'),
  ('oldnews.org',         'org', 'expired', 'godaddy',   'GoDaddy.com, LLC', 3,  now() - interval '4 days'),
  ('retroshop.co',        'co',  'expired', 'dynadot',   'Dynadot LLC',      7,  now() - interval '5 days'),
  -- active (5개 — 검색으로 자동 생성된 도메인)
  ('openai.com',          'com', 'active', 'other', NULL, 120, now() - interval '10 minutes'),
  ('stripe.com',          'com', 'active', 'other', NULL,  95, now() - interval '20 minutes'),
  ('vercel.com',          'com', 'active', 'other', NULL,  78, now() - interval '1 hour'),
  ('supabase.com',        'com', 'active', 'other', NULL,  64, now() - interval '2 hours'),
  ('linear.app',          'app', 'active', 'other', NULL,  52, now() - interval '3 hours')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 2. domain_metrics (모든 도메인에 SEO 지표)
-- =============================================
INSERT INTO domain_metrics (domain_id, moz_da, moz_spam, ahrefs_dr, ahrefs_traffic, ahrefs_backlinks, ahrefs_traffic_value, majestic_tf, majestic_cf)
SELECT id, 35, 2,  28,   1200,    4500,    850,  22, 30 FROM domains WHERE name = 'techflow.com'
UNION ALL
SELECT id, 52, 1,  45,   5600,   12000,   3200,  38, 45 FROM domains WHERE name = 'cryptovault.io'
UNION ALL
SELECT id, 18, 5,  12,    340,     800,    120,  10, 15 FROM domains WHERE name = 'greenlogistics.com'
UNION ALL
SELECT id, 68, 0,  62,  28000,   45000,  18000,  55, 62 FROM domains WHERE name = 'healthdata.org'
UNION ALL
SELECT id, 42, 3,  38,   3200,    7500,   1800,  30, 38 FROM domains WHERE name = 'aitools.dev'
UNION ALL
SELECT id, 31, 1,  25,    980,    3200,    650,  20, 28 FROM domains WHERE name = 'cloudmetrics.io'
UNION ALL
SELECT id, 55, 2,  48,   8500,   18000,   5600,  42, 50 FROM domains WHERE name = 'blockchainpay.com'
UNION ALL
SELECT id, 28, 1,  22,    750,    2100,    420,  18, 24 FROM domains WHERE name = 'datapipeline.net'
UNION ALL
SELECT id, 15, 4,   8,    180,     450,     60,   6, 12 FROM domains WHERE name = 'ecomarket.co'
UNION ALL
SELECT id, 44, 1,  40,   4100,    9200,   2400,  32, 40 FROM domains WHERE name = 'fintechlab.io'
UNION ALL
SELECT id, 22, 2,  18,    520,    1500,    280,  14, 20 FROM domains WHERE name = 'gamedev.studio'
UNION ALL
SELECT id, 12, 6,   9,    150,     380,     45,   5, 10 FROM domains WHERE name = 'smartcontract.xyz'
UNION ALL
SELECT id, 61, 0,  55,  15000,   32000,  12000,  48, 55 FROM domains WHERE name = 'quantumapi.com'
UNION ALL
SELECT id, 38, 2,  32,   2200,    5800,   1200,  26, 34 FROM domains WHERE name = 'devhire.io'
UNION ALL
SELECT id, 25, 3,  20,    680,    1800,    350,  16, 22 FROM domains WHERE name = 'autotrader.app'
UNION ALL
SELECT id, 33, 1,  28,   1500,    4000,    900,  24, 30 FROM domains WHERE name = 'mediastream.tv'
UNION ALL
SELECT id, 72, 0,  65,  42000,   68000,  25000,  58, 65 FROM domains WHERE name = 'robotics.ai'
UNION ALL
SELECT id, 20, 2,  15,    420,    1100,    200,  12, 18 FROM domains WHERE name = 'travelguide.co'
UNION ALL
SELECT id, 40, 1,  35,   2800,    6500,   1500,  28, 36 FROM domains WHERE name = 'securemail.net'
UNION ALL
SELECT id, 48, 1,  42,   6200,   14000,   4200,  36, 44 FROM domains WHERE name = 'brandify.com'
UNION ALL
SELECT id, 41, 3,  35,   2100,    5200,   1100,  28, 35 FROM domains WHERE name = 'socialmetrics.com'
UNION ALL
SELECT id, 25, 2,  20,    800,    2000,    380,  15, 22 FROM domains WHERE name = 'webstudio.net'
UNION ALL
SELECT id, 33, 1,  30,   1500,    3800,    750,  25, 32 FROM domains WHERE name = 'financeapi.io'
UNION ALL
SELECT id, 10, 8,   5,     80,     200,     25,   3,  8 FROM domains WHERE name = 'oldnews.org'
UNION ALL
SELECT id, 14, 4,  10,    200,     500,     80,   8, 14 FROM domains WHERE name = 'retroshop.co'
UNION ALL
SELECT id, 96, 1,  93, 8500000, 2800000, 9200000, 82, 90 FROM domains WHERE name = 'openai.com'
UNION ALL
SELECT id, 92, 1,  91, 3200000, 1500000, 5500000, 78, 85 FROM domains WHERE name = 'stripe.com'
UNION ALL
SELECT id, 88, 1,  85, 1800000,  980000, 3200000, 72, 80 FROM domains WHERE name = 'vercel.com'
UNION ALL
SELECT id, 82, 1,  78,  950000,  520000, 1800000, 65, 75 FROM domains WHERE name = 'supabase.com'
UNION ALL
SELECT id, 75, 1,  70,  420000,  280000,  850000, 58, 68 FROM domains WHERE name = 'linear.app'
ON CONFLICT (domain_id) DO NOTHING;

-- =============================================
-- 3. sales_history (sold 도메인 — 다중 거래 이력)
-- =============================================
INSERT INTO sales_history (domain_id, sold_at, price_usd, platform) VALUES
  -- techflow.com (3건)
  ((SELECT id FROM domains WHERE name = 'techflow.com'),  '2026-03-10', 2500,  'GoDaddy'),
  ((SELECT id FROM domains WHERE name = 'techflow.com'),  '2024-06-15', 1800,  'Sedo'),
  ((SELECT id FROM domains WHERE name = 'techflow.com'),  '2022-01-20',  950,  'Flippa'),
  -- cryptovault.io (2건)
  ((SELECT id FROM domains WHERE name = 'cryptovault.io'), '2026-03-08', 8900,  'Namecheap'),
  ((SELECT id FROM domains WHERE name = 'cryptovault.io'), '2023-11-05', 5200,  'GoDaddy'),
  -- greenlogistics.com
  ((SELECT id FROM domains WHERE name = 'greenlogistics.com'), '2026-03-05', 1200, 'Dynadot'),
  -- healthdata.org (3건 — 고가)
  ((SELECT id FROM domains WHERE name = 'healthdata.org'), '2026-03-12', 15000, 'GoDaddy'),
  ((SELECT id FROM domains WHERE name = 'healthdata.org'), '2024-08-20', 11000, 'Sedo'),
  ((SELECT id FROM domains WHERE name = 'healthdata.org'), '2021-03-10',  6500, 'Afternic'),
  -- aitools.dev (2건)
  ((SELECT id FROM domains WHERE name = 'aitools.dev'),    '2026-03-11', 4200,  'Namecheap'),
  ((SELECT id FROM domains WHERE name = 'aitools.dev'),    '2024-02-14', 2800,  'GoDaddy'),
  -- cloudmetrics.io
  ((SELECT id FROM domains WHERE name = 'cloudmetrics.io'), '2026-03-09', 3100, 'GoDaddy'),
  -- blockchainpay.com (2건)
  ((SELECT id FROM domains WHERE name = 'blockchainpay.com'), '2026-03-07', 12500, 'Namecheap'),
  ((SELECT id FROM domains WHERE name = 'blockchainpay.com'), '2024-05-22',  8200, 'Sedo'),
  -- datapipeline.net
  ((SELECT id FROM domains WHERE name = 'datapipeline.net'), '2026-03-06', 1800, 'GoDaddy'),
  -- ecomarket.co
  ((SELECT id FROM domains WHERE name = 'ecomarket.co'),   '2026-03-04',  650, 'Dynadot'),
  -- fintechlab.io (2건)
  ((SELECT id FROM domains WHERE name = 'fintechlab.io'),  '2026-03-13', 5500, 'Namecheap'),
  ((SELECT id FROM domains WHERE name = 'fintechlab.io'),  '2023-09-18', 3800, 'GoDaddy'),
  -- gamedev.studio
  ((SELECT id FROM domains WHERE name = 'gamedev.studio'), '2026-03-02', 980, 'GoDaddy'),
  -- smartcontract.xyz
  ((SELECT id FROM domains WHERE name = 'smartcontract.xyz'), '2026-03-01', 420, 'Namecheap'),
  -- quantumapi.com (3건 — 고가)
  ((SELECT id FROM domains WHERE name = 'quantumapi.com'), '2026-03-14', 22000, 'GoDaddy'),
  ((SELECT id FROM domains WHERE name = 'quantumapi.com'), '2025-01-10', 16500, 'Sedo'),
  ((SELECT id FROM domains WHERE name = 'quantumapi.com'), '2023-04-28', 9800, 'Afternic'),
  -- devhire.io
  ((SELECT id FROM domains WHERE name = 'devhire.io'),    '2026-03-03', 3400, 'Namecheap'),
  -- autotrader.app
  ((SELECT id FROM domains WHERE name = 'autotrader.app'), '2026-02-28', 1500, 'GoDaddy'),
  -- mediastream.tv
  ((SELECT id FROM domains WHERE name = 'mediastream.tv'), '2026-02-25', 2200, 'Dynadot'),
  -- robotics.ai (2건 — 최고가)
  ((SELECT id FROM domains WHERE name = 'robotics.ai'),   '2026-03-15', 35000, 'Namecheap'),
  ((SELECT id FROM domains WHERE name = 'robotics.ai'),   '2024-12-01', 22000, 'GoDaddy'),
  -- travelguide.co
  ((SELECT id FROM domains WHERE name = 'travelguide.co'), '2026-02-20', 780, 'GoDaddy'),
  -- securemail.net (2건)
  ((SELECT id FROM domains WHERE name = 'securemail.net'), '2026-03-11', 2800, 'Namecheap'),
  ((SELECT id FROM domains WHERE name = 'securemail.net'), '2024-07-15', 1900, 'Sedo'),
  -- brandify.com (2건)
  ((SELECT id FROM domains WHERE name = 'brandify.com'),   '2026-03-13', 8500, 'GoDaddy'),
  ((SELECT id FROM domains WHERE name = 'brandify.com'),   '2025-02-10', 6200, 'Afternic');

-- =============================================
-- 4. wayback_summary
-- =============================================
INSERT INTO wayback_summary (domain_id, first_snapshot_at, last_snapshot_at, total_snapshots) VALUES
  ((SELECT id FROM domains WHERE name = 'techflow.com'),        '2015-06-10', '2026-02-28', 342),
  ((SELECT id FROM domains WHERE name = 'cryptovault.io'),      '2017-03-15', '2026-03-01', 218),
  ((SELECT id FROM domains WHERE name = 'greenlogistics.com'),  '2019-08-22', '2025-12-15', 85),
  ((SELECT id FROM domains WHERE name = 'healthdata.org'),      '2008-11-03', '2026-03-10', 1250),
  ((SELECT id FROM domains WHERE name = 'aitools.dev'),         '2020-01-15', '2026-03-05', 156),
  ((SELECT id FROM domains WHERE name = 'blockchainpay.com'),   '2016-04-20', '2026-02-22', 420),
  ((SELECT id FROM domains WHERE name = 'quantumapi.com'),      '2012-09-10', '2026-03-12', 680),
  ((SELECT id FROM domains WHERE name = 'robotics.ai'),         '2018-02-14', '2026-03-14', 520),
  ((SELECT id FROM domains WHERE name = 'brandify.com'),        '2014-07-01', '2026-03-08', 390),
  ((SELECT id FROM domains WHERE name = 'openai.com'),          '2015-12-11', '2026-03-15', 2800),
  ((SELECT id FROM domains WHERE name = 'stripe.com'),          '2010-03-05', '2026-03-15', 4200),
  ((SELECT id FROM domains WHERE name = 'vercel.com'),          '2015-04-22', '2026-03-15', 1850),
  ((SELECT id FROM domains WHERE name = 'supabase.com'),        '2020-01-10', '2026-03-15', 620),
  ((SELECT id FROM domains WHERE name = 'linear.app'),          '2019-06-18', '2026-03-15', 480)
ON CONFLICT (domain_id) DO NOTHING;
