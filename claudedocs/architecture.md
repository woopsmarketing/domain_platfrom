# Architecture: 도메인 리셀링 마켓플레이스 확장

## 현황 분석 (기존 구조 요약)

### 기존 marketplace 관련 파일
- `src/app/marketplace/page.tsx` — 도메인 카드 그리드, FAQ, SEO 메타 (Server Component)
- `src/app/marketplace/inquiry/page.tsx` — 문의 폼 ("use client", 이름/이메일/제안가/메시지)
- `src/app/api/marketplace-inquiry/route.ts` — inquiries 저장 + 이메일 발송
- `src/app/api/admin/listings/route.ts` — GET/POST/PATCH
- `src/app/api/admin/inquiries/route.ts` — broker_inquiries + inquiries 통합 조회/상태변경
- `src/app/admin/page.tsx` — ListingsTab + InquiriesTab ("use client")

### 기존 테이블 구조 (코드 추론)
```
domains              — id, name, tld, status, source, registrar, expires_at
domain_metrics       — domain_id, moz_da, moz_pa, ahrefs_dr, ahrefs_backlinks, ahrefs_ref_domains ...
marketplace_listings — id, domain_id, asking_price, description, is_negotiable, is_active, listed_at
inquiries            — id, listing_id, name, email, message, offered_price_usd, status, created_at
broker_inquiries     — id, name, email, telegram, target_keyword, budget, message, status, created_at
sales_history        — id, domain_id, sold_at, price_usd, platform
```

---

## 1. DB 스키마 변경

### 결정: marketplace_listings 테이블 확장 (새 테이블 생성 안 함)

**이유**: 기존 API(`/api/admin/listings`), 어드민 페이지, 목록 페이지가 모두 `marketplace_listings`를 직접 참조한다. 새 테이블을 만들면 기존 코드를 전면 교체해야 한다. 컬럼 추가는 기존 행(수동 등록 데이터)에 NULL을 허용하면 하위 호환성이 유지된다.

### marketplace_listings 확장 컬럼

```sql
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS
  cost_price_usd      NUMERIC(10,2),   -- 원가 (CSV: Price)
  niche               TEXT,            -- 카테고리 (CSV: Niche)
  domain_age_years    NUMERIC(5,1),    -- 도메인 나이 (CSV: Age)
  registrant          TEXT,            -- 등록사 (CSV: Registrant, e.g. "GoDaddy")
  backlinks_from      TEXT[],          -- 참조 사이트 목록 (CSV: Backlinks From, 배열)
  pa                  INTEGER,         -- Page Authority (CSV: PA)
  rd                  INTEGER,         -- Referring Domains (CSV: RD)
  source              TEXT DEFAULT 'manual',  -- 'manual' | 'csv_import'
  import_batch_id     TEXT,            -- CSV import 묶음 식별자 (rollback/추적용)
  updated_at          TIMESTAMPTZ DEFAULT now();
```

**주의**: `asking_price`는 이미 존재하며, 마진 적용된 판매가로 사용한다.
`cost_price_usd`는 원가로만 사용하며 프론트엔드에 노출하지 않는다.

### DA/PA 저장 위치 결정

CSV에서 오는 DA, PA는 `marketplace_listings`에 직접 저장한다 (`pa` 컬럼).
DA는 `domain_metrics.moz_da`와 중복될 수 있으나, CSV import 시 `domain_metrics`도 동시에 upsert하여 동기화한다.
RD(Referring Domains)는 `marketplace_listings.rd`에 저장하고, `domain_metrics.ahrefs_ref_domains`에도 upsert한다.

### purchase_requests 테이블 (신규)

```sql
CREATE TABLE purchase_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      UUID NOT NULL REFERENCES marketplace_listings(id),
  email           TEXT NOT NULL,
  telegram_id     TEXT,
  status          TEXT NOT NULL DEFAULT 'pending',
  -- status enum: pending | availability_checking | waiting_payment
  --              payment_received | transferring | completed | failed
  admin_memo      TEXT,           -- 내부 메모 (어드민용)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_purchase_requests_listing_id ON purchase_requests(listing_id);
CREATE INDEX idx_purchase_requests_status ON purchase_requests(status);
```

### 기존 inquiries 테이블과의 관계

`inquiries`는 "가격 협의 문의"(is_negotiable 도메인용) 용도로 유지한다.
`purchase_requests`는 "구매 신청"(구매 의사가 확정된 플로우) 전용이다.
두 테이블은 모두 `listing_id`로 `marketplace_listings`를 참조하지만 독립적으로 관리한다.

| 테이블 | 용도 | 폼 필드 |
|--------|------|---------|
| inquiries | 문의/협의 (기존 유지) | 이름, 이메일, 제안가, 메시지 |
| purchase_requests | 구매 신청 (신규) | 이메일, 텔레그램 ID |

---

## 2. CSV Import 전략

### Import 흐름

```
Google Sheet CSV 다운로드
  → Python 스크립트 실행 (crawler/ 디렉토리)
  → 각 행 처리:
      1. domains 테이블 upsert (name, tld, status=active, source=other)
      2. domain_metrics 테이블 upsert (moz_da=DA, moz_pa=PA, ahrefs_ref_domains=RD)
      3. marketplace_listings 테이블 insert
         - asking_price = cost_price_usd * 1.5 (마진 적용)
         - pa, rd, niche, domain_age_years, registrant, backlinks_from 저장
         - source = 'csv_import', import_batch_id = 타임스탬프
```

### 마진 적용 시점: Import 시 asking_price에 반영

**이유**: 마진율이 바뀔 때 일괄 재계산이 필요하지만, 현재 MVP에서는 고정 x1.5이므로 단순성을 우선한다. 표시 시 계산하면 cost_price_usd를 프론트엔드로 전달해야 해서 원가가 노출될 위험이 있다.

### 중복 처리

- `marketplace_listings`에 `UNIQUE(domain_id)` 제약을 추가 권장.
- 이미 `is_active = true`인 listing이 있으면 skip (재import 시 덮어쓰지 않음).
- `is_active = false` (판매 완료/비활성)인 경우 새 row로 insert.

### Import 스크립트 위치

```
crawler/
└── import_marketplace.py   -- CSV → DB import 스크립트 (신규)
```

기존 `crawler/run.py` 패턴을 따른다.

---

## 3. 파일 구조

### 수정할 기존 파일

| 파일 | 수정 내용 |
|------|-----------|
| `src/app/marketplace/page.tsx` | 필터(가격대/TLD/Age 정렬) 추가, 상세 페이지 링크(`/marketplace/[domain]`) 연결, PA/RD 뱃지 추가 |
| `src/app/marketplace/inquiry/page.tsx` | 이름/전화번호 필드 제거, 텔레그램 ID 필드 추가, 제출 API를 `/api/purchase-request`로 변경. 기존 문의 폼은 협의 가능 도메인 전용으로 유지 판단 필요 (하단 주의사항 참조) |
| `src/app/api/admin/listings/route.ts` | POST에 신규 컬럼(niche, domain_age_years, registrant, backlinks_from, pa, rd, cost_price_usd) 처리 추가 |
| `src/app/admin/page.tsx` | PurchaseRequestsTab 추가, ListingsTab에 신규 컬럼 표시 |
| `src/types/domain.ts` | MarketplaceListing, PurchaseRequest 타입 추가 |

### 새로 만들 파일

```
src/
├── app/
│   ├── marketplace/
│   │   └── [domain]/
│   │       └── page.tsx                    -- 도메인 상세 페이지 (Server Component)
│   └── api/
│       ├── purchase-request/
│       │   └── route.ts                    -- 구매 신청 접수 API
│       └── admin/
│           └── purchase-requests/
│               └── route.ts               -- 구매 신청 목록/상태변경 API
├── components/
│   └── marketplace/
│       ├── listing-filters.tsx             -- 필터 바 (가격대, TLD, 정렬) "use client"
│       ├── listing-grid.tsx                -- 도메인 카드 그리드 (Server Component)
│       ├── listing-card.tsx                -- 개별 도메인 카드 (Server Component)
│       ├── backlink-stats-card.tsx         -- 백링크 통계 카드 4종 (Server Component)
│       └── purchase-request-form.tsx       -- 구매신청 폼 "use client"
└── types/
    └── marketplace.ts                      -- 마켓플레이스 전용 타입 (신규)

crawler/
└── import_marketplace.py                   -- CSV import 스크립트 (신규)
```

---

## 4. API 설계

### 신규 API

#### POST /api/purchase-request
구매 신청 접수. `purchase_requests` 테이블에 저장 후 어드민 알림 이메일 발송.

**Request body**
```json
{
  "listing_id": "uuid",
  "email": "string (required)",
  "telegram_id": "string (optional)"
}
```

**Response**
```json
{ "ok": true }
```

**에러**: listing이 `is_active = false`이면 409 반환 (판매 완료).

#### GET /api/admin/purchase-requests
어드민 전용. 전체 구매 신청 목록 반환. `requireAdmin()` 미들웨어 사용.

**Query params**: `status` (필터), `listing_id` (필터)

#### PATCH /api/admin/purchase-requests
어드민 전용. 상태 변경 + 판매 완료 처리.

**Request body**
```json
{
  "id": "uuid",
  "status": "completed | failed | ...",
  "admin_memo": "string (optional)"
}
```

`status = "completed"`일 때 사이드 이펙트:
1. `marketplace_listings.is_active = false` 업데이트
2. `domains.status = "sold"` 업데이트

### 기존 API 수정

#### GET /api/marketplace-listings (신규 공개 API)
목록 페이지용. `is_active = true` 필터링 + 필터 파라미터 지원.

**Query params**
```
min_price, max_price    -- asking_price 범위 (USD)
tld                     -- 예: "com", "net"
sort                    -- "price_asc" | "price_desc" | "age_desc" | "newest"
page, limit
```

현재 `marketplace/page.tsx`는 서버 컴포넌트에서 직접 Supabase를 호출한다. 필터 기능 추가 시 클라이언트에서 쿼리 파라미터를 다뤄야 하므로, 공개 API 엔드포인트로 분리하는 방식과 `searchParams`를 서버 컴포넌트에서 받는 방식 중 선택이 필요하다.

**권장**: `searchParams` prop을 `marketplace/page.tsx`에서 받아 서버 컴포넌트에서 직접 필터 쿼리 실행. 필터 UI만 Client Component로 분리 (`listing-filters.tsx`). URL 상태 = `searchParams`로 관리하여 SSR/SEO 유지.

#### /api/admin/listings (기존 수정)
POST에 신규 컬럼 수신 처리 추가. PATCH에 `is_active = false` + `domains.status = "sold"` 동시 업데이트 로직 추가 (판매 완료 처리 단일화).

---

## 5. 프론트엔드 컴포넌트 설계

### 목록 페이지 `/marketplace`

```
marketplace/page.tsx  [Server Component]
  ├── searchParams → 필터 값 읽기
  ├── Supabase 직접 쿼리 (필터 적용)
  │
  ├── <Hero />  [인라인, 변경 없음]
  │
  ├── <ListingFilters />  [Client Component — "use client"]
  │   ├── 가격대 슬라이더 or 선택 버튼 (예: ~$200 / $200~$500 / $500+)
  │   ├── TLD 선택 (체크박스 또는 드롭다운)
  │   └── 정렬 선택 (Age 내림차순 / 가격 오름차순 / 최신 등록순)
  │   → URL searchParams 업데이트 (router.push)
  │
  ├── <ListingGrid listings={listings} />  [Server Component]
  │   └── <ListingCard listing={listing} />  [Server Component]
  │       ├── 도메인명
  │       ├── DA / RD 뱃지 (PA 추가)
  │       ├── Niche / Age 표시
  │       ├── 가격 (asking_price)
  │       ├── "협의 가능" 뱃지 (is_negotiable)
  │       └── "상세 보기" → /marketplace/[domain]
  │           "구매 신청" → /marketplace/[domain]#purchase (앵커)
  │
  ├── <SEOContent />  [인라인, 변경 없음]
  └── <FAQ />  [인라인, 변경 없음]
```

### 상세 페이지 `/marketplace/[domain]`

```
marketplace/[domain]/page.tsx  [Server Component]
  ├── params.domain → marketplace_listings JOIN domains 조회
  │   (없거나 is_active=false면 notFound())
  │
  ├── <DetailHero />  [인라인]
  │   └── 도메인명, Niche, Age, Registrant
  │
  ├── <BacklinkStatsCard />  [Server Component]
  │   ├── 총 백링크 (ahrefs_backlinks 또는 moz_links)
  │   ├── DoFollow 백링크 (추정값 또는 별도 컬럼)
  │   ├── 참조 도메인 (rd)
  │   └── DA / PA 수치 카드
  │
  ├── <BacklinksFromList />  [Server Component]
  │   └── backlinks_from 배열 → 링크 목록 표시
  │
  ├── <PurchaseRequestForm listing_id={id} domain={name} asking_price={price} />
  │   [Client Component — "use client"]
  │   ├── 이메일 주소 (required)
  │   ├── 텔레그램 ID (optional)
  │   ├── 가격 표시 (읽기 전용)
  │   ├── 계좌이체 안내 텍스트
  │   └── POST /api/purchase-request
  │
  └── <ExternalAnalysisLink domain={name} />  [인라인]
      └── "상세 분석 보기" → /domain/[name] (새 탭)
```

### 어드민 페이지 `/admin`

기존 `Tabs` 구조에 탭 하나 추가.

```
admin/page.tsx  [Client Component — 기존 유지]
  └── <Tabs>
      ├── <ListingsTab />  [기존 + 신규 컬럼 표시]
      │   └── 테이블에 Niche / Age 컬럼 추가
      │       PATCH "판매 완료" 버튼 → is_active=false + status=sold 동시 처리
      │
      ├── <PurchaseRequestsTab />  [신규]
      │   ├── 상태별 뱃지 (신청접수 / 가용확인중 / 입금대기 / 입금완료 / 이전진행중 / 이전완료 / 확보실패)
      │   ├── 연락처 (이메일, 텔레그램)
      │   ├── 상태 변경 드롭다운
      │   └── 어드민 메모 입력
      │
      └── <InquiriesTab />  [기존 유지]
```

---

## 6. 데이터 흐름도

### 구매 신청 플로우
```
사용자 → /marketplace/[domain]
  → <PurchaseRequestForm> 제출
  → POST /api/purchase-request
      → purchase_requests INSERT (status=pending)
      → sendEmail(어드민 알림)
      → sendEmail(사용자 접수 확인)
  → 성공 화면

어드민 → /admin (PurchaseRequestsTab)
  → PATCH /api/admin/purchase-requests { status: "waiting_payment" }
  → 상태 업데이트

어드민 → status = "completed" 처리 시
  → purchase_requests.status = "completed"
  → marketplace_listings.is_active = false
  → domains.status = "sold"
  → 목록에서 자동 숨김
```

### CSV Import 플로우
```
Google Sheet → CSV 다운로드 (수동)
  → python crawler/import_marketplace.py --file domains.csv --margin 1.5
      → 각 행:
          domains UPSERT (name, tld)
          domain_metrics UPSERT (moz_da=DA, moz_pa=PA, ahrefs_ref_domains=RD)
          marketplace_listings INSERT
            asking_price = price_usd * margin
            cost_price_usd = price_usd  (원가 보관)
            pa, rd, niche, domain_age_years, registrant, backlinks_from
            source = 'csv_import'
            import_batch_id = 'YYYYMMDD_HHMMSS'
      → 완료 보고 (성공 N건 / 스킵 M건 / 실패 K건)
```

### 목록 필터 플로우
```
사용자 → 필터 변경 (Client Component)
  → router.push('/marketplace?tld=com&min_price=100&sort=age_desc')
  → URL 변경 → Server Component 재실행
  → searchParams 읽어 Supabase 쿼리 → 서버 렌더링
  (CSR fetch 없음, SSR 유지)
```

---

## 7. 기술 결정 사항

| 결정 | 선택 | 이유 |
|------|------|------|
| marketplace_listings 확장 vs 새 테이블 | 기존 테이블 확장 | 기존 코드 교체 최소화, 하위 호환 |
| 마진 적용 시점 | Import 시 asking_price에 반영 | 원가 프론트 노출 방지, 단순성 |
| 필터 상태 관리 | URL searchParams (서버 컴포넌트) | SSR/SEO 유지, 별도 상태 불필요 |
| 구매 신청 vs 기존 inquiries | 별도 purchase_requests 테이블 | 다단계 상태 플로우, 역할 분리 |
| DA/PA 저장 위치 | marketplace_listings + domain_metrics 동시 upsert | 목록 조인 쿼리 단순화 |
| 어드민 인증 | 기존 requireAdmin() 그대로 사용 | 기존 패턴 유지 |
| 판매 완료 처리 | PATCH /api/admin/purchase-requests에서 side effect 실행 | 단일 트랜잭션 포인트 |

---

## 8. 주의사항 / 제약

### 기존 파일 수정 시
- `marketplace/inquiry/page.tsx` — 기존 문의 폼(협의 가능 도메인용)과 신규 구매 신청 폼(`purchase_requests`)의 역할을 혼동하지 않는다. 상세 페이지(`/marketplace/[domain]`)에 구매 신청 폼을 넣고, 기존 `/marketplace/inquiry`는 협의 문의 전용으로 유지하거나 리다이렉트한다.
- `admin/page.tsx` — 파일이 이미 500줄 이상이므로, `PurchaseRequestsTab`은 별도 컴포넌트 파일(`src/components/admin/purchase-requests-tab.tsx`)로 분리하여 임포트하는 방식을 권장한다.

### 신규 컬럼
- `backlinks_from TEXT[]` — Supabase는 PostgreSQL 배열을 지원하나, CSV에서 콤마 구분 문자열로 올 경우 파싱 처리가 import 스크립트에 필요하다.
- `domain_age_years NUMERIC(5,1)` — CSV의 Age 컬럼 형식을 확인해야 한다 (예: "5.2" vs "5 years" vs 연도 숫자).

### 원가 보안
- `cost_price_usd`는 API 응답에서 반드시 제외한다. `/api/marketplace-listings` 공개 엔드포인트에서 `SELECT` 시 해당 컬럼을 명시적으로 제외한다. 현재 `marketplace/page.tsx`에서 Supabase 직접 호출 시에도 컬럼 명시 필수.

### 상태 전이 규칙
```
pending → availability_checking → waiting_payment → payment_received
       → transferring → completed
       → failed (어느 단계에서도 가능)
```
어드민이 임의로 상태를 건너뛸 수 있도록 드롭다운으로 자유 선택을 허용한다 (MVP 단순화).

### `is_active` vs `status` 혼재 주의
- `marketplace_listings.is_active` — 목록 노출 여부 (false = 숨김)
- `domains.status` — 도메인 전체 상태 ("sold" | "active" | "expired")
- `purchase_requests.status` — 구매 신청 진행 상태 (6단계)
세 가지를 혼동하지 않도록 API 내부에서 명확히 분리한다.

### motion/react 사용
- 필터 UI나 상세 페이지에 애니메이션이 필요하면 해당 컴포넌트에 `"use client"` 선언 필수.
- `listing-filters.tsx`는 이미 Client Component이므로 motion 사용 가능.
- `listing-card.tsx`는 Server Component로 유지하고, 호버 효과는 Tailwind CSS만 사용한다.

### 패키지 추가 없음
- 현재 의존성(TanStack Table, Recharts, shadcn/ui)으로 모든 UI 구현 가능.
- CSV 파싱은 Python 스크립트에서 처리하므로 프론트엔드에 CSV 파서 불필요.
