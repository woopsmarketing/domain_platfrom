# PRD — 도메인 플랫폼 (Domain Platform)

> 벤치마크: [namebio.com](https://namebio.com) + [domcop.com](https://www.domcop.com)

---

## 1. 한 줄 정의

**"도메인 투자자와 SEO 전문가가 경매·만료 도메인의 지수, 거래 이력, 히스토리를 한 화면에서 확인하는 플랫폼"**

---

## 2. 타겟 사용자

| 유형 | 이 플랫폼으로 해결하는 문제 |
|---|---|
| 도메인 투자자 | 여러 경매 사이트를 따로 돌아다니지 않고 지수 좋은 도메인을 한 곳에서 필터링 |
| SEO 전문가 | DA/DR/TF 높은 만료 도메인을 빠르게 발굴, 백링크 프로필 확인 |
| 에이전시 | 클라이언트 도메인 품질 검증, 경쟁사 도메인 분석 |

---

## 3. MVP 핵심 기능 3가지

### ① 경매·만료 도메인 탐색 대시보드
- GoDaddy Auctions, NameJet, ExpiredDomains.net 등에서 수집한 도메인 목록
- 각 도메인마다 SEO 지수(DA, DR, TF) 함께 표시
- 필터: TLD, DA 범위, DR 범위, TF 범위, 만료일, 경매 마감일, 최소 트래픽
- 정렬: 지수 높은 순 / 마감 임박 순 / 트래픽 높은 순

### ② 도메인 상세 페이지 (`/domain/example.com`)
사용자가 도메인명을 직접 입력하거나 목록에서 클릭 시 4개 섹션을 한 페이지에 표시.

```
┌─────────────────────────────────────┐
│  ① Whois 정보                        │
│     등록일 / 만료일 / 레지스트라        │
├─────────────────────────────────────┤
│  ② SEO 지수                          │
│     Moz: DA, PA, Spam Score         │
│     Ahrefs: DR, Backlinks, Traffic  │
│     Majestic: TF, CF, Topical TF   │
├─────────────────────────────────────┤
│  ③ 과거 거래 이력                     │
│     낙찰일 / 낙찰가(USD) / 플랫폼     │
├─────────────────────────────────────┤
│  ④ Wayback 히스토리                  │
│     스냅샷 수 / 첫 크롤일 / 마지막일   │
└─────────────────────────────────────┘
```

### ③ 도메인 거래 이력 데이터베이스
- 수십만~수백만 건의 도메인 낙찰 기록
- 필드: 도메인명, 낙찰일, 낙찰가(USD), 낙찰 플랫폼, TLD
- 검색 + 필터 + 유사 도메인 거래가 비교

---

## 4. SEO 지수 API 명세

### RapidAPI — domain-metrics-check
```
GET https://domain-metrics-check.p.rapidapi.com/domain-metrics/{domain}
Headers:
  X-RapidAPI-Key: {RAPIDAPI_KEY}
  X-RapidAPI-Host: domain-metrics-check.p.rapidapi.com
```

### 표시할 주요 지수

| 지수 | API 필드 | 출처 | 중요도 |
|---|---|---|---|
| DA (Domain Authority) | `mozDA` | Moz | ★★★ |
| DR (Domain Rating) | `ahrefsDR` | Ahrefs | ★★★ |
| TF (Trust Flow) | `majesticTF` | Majestic | ★★★ |
| 유기 트래픽 | `ahrefsTraffic` | Ahrefs | ★★★ |
| CF (Citation Flow) | `majesticCF` | Majestic | ★★ |
| PA (Page Authority) | `mozPA` | Moz | ★★ |
| 트래픽 가치 | `ahrefsTrafficValue` | Ahrefs | ★★ |
| 백링크 수 | `ahrefsBacklinks` | Ahrefs | ★★ |
| 참조 도메인 수 | `ahrefsRefDomains` | Ahrefs | ★★ |
| Spam Score | `mozSpam` | Moz | ★★ |
| EDU 링크 | `majesticRefEdu` | Majestic | ★ |
| GOV 링크 | `majesticRefGov` | Majestic | ★ |
| Topical TF 카테고리 | `majesticTTF0Name/Value` | Majestic | ★ |

### API 한도 및 캐싱 전략
- 무료 플랜: **월 15,000 요청**
- 규칙: DB 우선 조회 → 데이터 없거나 갱신일 7일 초과 시에만 API 호출
- 배치 갱신: 매주 1회 (트래픽 상위 도메인 우선)

---

## 5. 기타 외부 API

| API | 용도 | 비용 |
|---|---|---|
| Wayback CDX API | 도메인 웹 히스토리 스냅샷 | 무료 |
| WhoisXML API | Whois 등록 정보 | 무료 플랜 있음 |
| GoDaddy Auctions | 현재 경매 목록 | API 있음 |

**Wayback CDX API:**
```
GET http://web.archive.org/cdx/search/cdx
  ?url={domain}&output=json&limit=10&fl=timestamp,statuscode,mimetype
```

---

## 6. 데이터 수집 소스

| 데이터 종류 | 소스 | 수집 방식 |
|---|---|---|
| 경매 도메인 | GoDaddy Auctions, NameJet, DropCatch | API or 크롤러 |
| 만료 도메인 | ExpiredDomains.net, DomCop | 크롤러 |
| 거래 이력 | NameBio, DN Journal, Sedo | 크롤러 or 데이터셋 |
| SEO 지수 | RapidAPI domain-metrics-check | REST API + DB 캐시 |
| Whois | WhoisXML API | REST API |
| 웹 히스토리 | Wayback Machine CDX | REST API (무료) |

---

## 7. 기술 스택

### Frontend
| 기술 | 역할 | 선택 이유 |
|---|---|---|
| **Next.js 14 App Router** | 메인 프레임워크 | SSR로 도메인 상세 페이지 SEO 인덱싱 필수 |
| **TypeScript** | 타입 안전성 | 지수 필드 수십 개 — 타입 없으면 실수 잦음 |
| **Tailwind CSS** | 스타일링 | 빠른 UI 개발 |
| **shadcn/ui** | UI 컴포넌트 | 테이블, 필터, 배지 등 즉시 사용 가능 |
| **TanStack Table v8** | 도메인 목록 테이블 | 수만 건 + 클라이언트 필터·정렬 최적화 |
| **Recharts** | 차트 | 거래가 추이, 트래픽 변화 그래프 |

### Backend & 인프라
| 기술 | 역할 | 선택 이유 |
|---|---|---|
| **Next.js API Routes** | 클라이언트 → DB 연결 | 별도 서버 없이 API 처리 |
| **PostgreSQL (Supabase)** | 메인 데이터베이스 | 복잡한 필터 쿼리, 도메인명 Full-text Search |
| **Redis (Upstash)** | API 캐싱 + 작업 큐 | RapidAPI 15,000 req 한도 보호 |
| **Python + Playwright** | 크롤러 | JS 렌더링 사이트(GoDaddy 등) 크롤링 |
| **Vercel** | Frontend 배포 | 자동 배포, Edge Network, Cron Jobs |
| **Railway** | 크롤러 서버 | 장시간 실행 프로세스 (Vercel에서 불가) |

### 패키지 매니저
- **pnpm** (빠른 설치, 디스크 효율)

---

## 8. 핵심 DB 스키마

```sql
-- 도메인 기본 정보
domains (
  id, name, tld, registrar, registered_at, expires_at,
  status ENUM('auction','expired','active'), created_at, updated_at
)

-- SEO 지수 캐시 (7일마다 갱신)
domain_metrics (
  id, domain_id, moz_da, moz_pa, moz_spam,
  ahrefs_dr, ahrefs_rank, ahrefs_backlinks, ahrefs_ref_domains,
  ahrefs_traffic, ahrefs_traffic_value, ahrefs_organic_keywords,
  majestic_tf, majestic_cf, majestic_ref_domains,
  majestic_ttf0_name, majestic_ttf0_value,
  updated_at
)

-- 거래 이력
sales_history (
  id, domain_id, sold_at, price_usd, platform, source_url
)

-- Wayback 히스토리 요약
wayback_summary (
  id, domain_id, first_snapshot_at, last_snapshot_at,
  total_snapshots, updated_at
)

-- 현재 경매 목록
auction_listings (
  id, domain_id, platform, auction_end_at,
  current_price_usd, buy_now_price_usd, bids_count, updated_at
)
```

---

## 9. 데이터 흐름

```
[크롤러 - Python/Railway]
  GoDaddy / NameJet / ExpiredDomains
        ↓ 수집 (매일)
[PostgreSQL - Supabase]
  domains + auction_listings
        ↓ 신규 도메인 감지 시
[RapidAPI 호출 - with Redis 캐시]
  domain_metrics 저장
        ↓ 사용자 요청 시
[Next.js API Routes]
  DB 조회 → JSON 응답
        ↓
[Next.js Frontend]
  TanStack Table 렌더링
```

---

## 10. Post-MVP 로드맵

| 우선순위 | 기능 |
|---|---|
| 높음 | 도메인 모니터링 알림 (조건 충족 시 이메일) |
| 높음 | 북마크 / 위시리스트 |
| 중간 | AI 도메인 가치 평가 (거래 이력 + 지수 기반 ML) |
| 중간 | SEO 페널티 감지 |
| 중간 | PBN Score 지표 |
| 중간 | 트래픽 히스토리 그래프 |
| 낮음 | 외부 개발자용 API 제공 |
| 낮음 | 프리미엄 멤버십 |

---

## 11. MVP 성공 지표

| 지표 | 목표 |
|---|---|
| 수집 도메인 수 | 10,000개 이상 |
| 거래 이력 레코드 | 100,000건 이상 |
| 일간 활성 사용자 | 100명 |
| 세션당 상세 페이지 조회 | 3+ 페이지 |
| RapidAPI 월 호출 수 | 15,000건 미만 유지 |
