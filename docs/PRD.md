# PRD — 도메인 플랫폼 (Domain Platform)

## 1. 프로젝트 개요

**도메인 투자자 및 SEO 전문가를 위한 도메인 데이터 분석 플랫폼.**

NameBio(도메인 거래 이력 DB) + DomCop(만료/경매 도메인 탐색)의 핵심 기능을 하나로 합친 서비스.
경매·만료 도메인의 SEO 지수, 과거 낙찰 이력, Whois, Wayback 히스토리를 한 화면에서 제공한다.

벤치마크 사이트: [namebio.com](https://namebio.com) / [domcop.com](https://www.domcop.com)

---

## 2. 타겟 사용자

| 유형 | 핵심 니즈 |
|---|---|
| 도메인 투자자 | 저평가 경매/만료 도메인 발굴, 과거 낙찰가 비교 |
| SEO 전문가 | 높은 DA/DR/TF 도메인 탐색, 백링크 프로필 확인 |
| 에이전시 | 클라이언트 도메인 품질 검증, 대량 지수 조회 |

---

## 3. MVP 기능 (우선순위 순)

### 3-1. 도메인 검색 & 대시보드
경매/만료 도메인 목록을 SEO 지수와 함께 테이블로 표시.

- 필터: TLD, DA 범위, DR 범위, TF 범위, 만료일, 경매 마감일, 가격
- 정렬: 지수 높은 순, 마감 임박 순, 낙찰가 순
- 페이지네이션 + 무한 스크롤

### 3-2. 도메인 상세 페이지 (`/domain/[name]`)
사용자가 도메인명을 입력하거나 목록에서 클릭하면 한 페이지에 모든 정보를 표시.

**섹션 구성:**
```
① Whois 정보
   - 등록일 / 만료일 / 레지스트라 / 네임서버

② SEO 지수 (RapidAPI domain-metrics-check)
   - Moz: DA, PA, Spam Score
   - Ahrefs: DR, Backlinks, Ref Domains, Organic Traffic, Traffic Value
   - Majestic: TF, CF, Topical Trust Flow (카테고리)
   - 소셜: FB Shares, Pinterest Pins

③ 과거 낙찰 이력
   - 낙찰일 / 낙찰가(USD) / 낙찰 플랫폼

④ Wayback Machine 히스토리 요약
   - 스냅샷 횟수, 첫 크롤일, 마지막 크롤일, 대표 스냅샷 링크
```

### 3-3. 도메인 거래 이력 DB
수백만 건의 도메인 거래 기록을 검색·조회.

- 필드: 도메인명, 낙찰일, 낙찰가(USD), 낙찰 플랫폼(GoDaddy/NameJet/Sedo 등), TLD
- 유사 도메인 거래가 비교 기능 (키워드 기반)

---

## 4. SEO 지수 상세

### API 엔드포인트
```
GET https://domain-metrics-check.p.rapidapi.com/domain-metrics/{domain}
Headers:
  X-RapidAPI-Key: {RAPIDAPI_KEY}
  X-RapidAPI-Host: domain-metrics-check.p.rapidapi.com
```

### 표시 지수 목록
| 지수 | 출처 | 필드명 | 중요도 |
|---|---|---|---|
| DA (Domain Authority) | Moz | `mozDA` | ★★★ |
| DR (Domain Rating) | Ahrefs | `ahrefsDR` | ★★★ |
| TF (Trust Flow) | Majestic | `majesticTF` | ★★★ |
| CF (Citation Flow) | Majestic | `majesticCF` | ★★ |
| PA (Page Authority) | Moz | `mozPA` | ★★ |
| 유기 트래픽 | Ahrefs | `ahrefsTraffic` | ★★★ |
| 트래픽 가치 | Ahrefs | `ahrefsTrafficValue` | ★★ |
| 백링크 수 | Ahrefs | `ahrefsBacklinks` | ★★ |
| 참조 도메인 수 | Ahrefs | `ahrefsRefDomains` | ★★ |
| EDU 링크 | Majestic | `majesticRefEdu` | ★ |
| GOV 링크 | Majestic | `majesticRefGov` | ★ |
| Topical TF 카테고리 | Majestic | `majesticTTF0Name/Value` | ★ |

### API 사용 전략
- 무료 플랜: 월 15,000 요청
- DB 우선 조회 → 없거나 7일 경과 시 API 호출 후 저장
- 배치 갱신: 매주 1회 (인기 도메인 우선)

---

## 5. 데이터 소스

| 데이터 | 소스 | 수집 방식 |
|---|---|---|
| 경매 도메인 | GoDaddy Auctions, NameJet, DropCatch | API or 크롤러 |
| 만료 도메인 | ExpiredDomains.net, DomCop | 크롤러 |
| SEO 지수 | RapidAPI domain-metrics-check | REST API |
| Whois 정보 | whoisxmlapi.com or 공개 whois | API |
| 거래 이력 | NameBio, DN Journal | 크롤러 or 데이터 제공 |
| Wayback 히스토리 | Wayback Machine CDX API (무료) | REST API |

**Wayback CDX API:**
```
GET http://web.archive.org/cdx/search/cdx?url={domain}&output=json&limit=5&fl=timestamp,statuscode
```

---

## 6. 기술 스택

| 레이어 | 기술 | 선택 이유 |
|---|---|---|
| Frontend | Next.js App Router + TypeScript + Tailwind CSS | SSR/SSG로 SEO 대응, 빠른 개발 |
| 테이블/필터 UI | TanStack Table v8 | 수만 건 데이터 클라이언트 정렬·필터 |
| 차트 | Recharts | 거래가 추이, 트래픽 그래프 |
| DB | PostgreSQL (Supabase) | 구조화된 도메인 데이터, Full-text Search |
| 캐싱 / 큐 | Redis (Upstash) | API 응답 캐싱 + 크롤 작업 큐 |
| 크롤러/스케줄러 | Python + Scrapy or Playwright | JS 렌더링 대응, 배치 수집 |
| 작업 스케줄링 | Vercel Cron (간단) or BullMQ | 주기적 지수 갱신 |
| 배포 Frontend | Vercel | 자동 배포, Edge Network |
| 배포 크롤러 | Railway or Hetzner VPS | 장시간 실행 프로세스 |
| 패키지 매니저 | pnpm | 빠른 설치, 모노레포 대응 |

---

## 7. Post-MVP 확장 기능

- [ ] 도메인 모니터링 알림 (조건 충족 시 이메일)
- [ ] 북마크 / 위시리스트
- [ ] AI 도메인 가치 평가 (학습 데이터: 거래 이력 + SEO 지수)
- [ ] SEO 페널티 감지
- [ ] PBN Score 지표
- [ ] 트래픽 히스토리 그래프
- [ ] 외부 개발자용 API 제공
- [ ] 프리미엄 멤버십 (대량 조회, 알림, API)
- [ ] 영어 서비스 확장

---

## 8. 성공 지표 (MVP 기준)

| 지표 | 목표 |
|---|---|
| 수집 도메인 수 | 10,000개 이상 |
| 거래 이력 레코드 | 100,000건 이상 |
| 일간 활성 사용자 | 100명 |
| 도메인 상세 페이지 조회 | 세션당 3+ 페이지 |
| RapidAPI 오류율 | 1% 미만 |
