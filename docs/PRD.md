# PRD — 도메인 플랫폼 (Domain Platform)

## 1. 프로젝트 개요

도메인 투자자 및 SEO 전문가를 위한 **도메인 정보 집약 플랫폼**.
GoDaddy, Namecheap 등 주요 도메인 기관의 경매 도메인 및 만료 도메인 정보를 수집·제공하고,
각 도메인의 SEO 지수, 과거 낙찰 이력, 히스토리를 한 곳에서 조회할 수 있게 한다.

---

## 2. 핵심 타겟 사용자

| 사용자 유형 | 니즈 |
|---|---|
| 도메인 투자자 | 저평가된 경매/만료 도메인 발굴, 과거 낙찰가 비교 |
| SEO 전문가 | 높은 DA/DR/TF를 가진 도메인 탐색, 백링크 프로필 확인 |
| 에이전시/SaaS 개발자 | 도메인 품질 검증, 대량 도메인 지수 조회 |

---

## 3. 핵심 기능 (MVP)

### 3-1. 도메인 목록 & 검색
- 경매 도메인 / 만료 도메인 목록 표시
- 필터: TLD, DA 범위, DR 범위, TF 범위, 만료일, 경매 마감일
- 정렬: 지수 높은 순, 마감 임박 순, 가격 순

### 3-2. 도메인 SEO 지수 (Domain Metrics)
RapidAPI `domain-metrics-check` 를 통해 아래 지수를 수집·표시한다.

**핵심 표시 지수 (우선순위 순)**
| 지수 | 출처 | 설명 |
|---|---|---|
| DA (Domain Authority) | Moz | 도메인 권위 점수 0–100 |
| PA (Page Authority) | Moz | 페이지 권위 점수 0–100 |
| DR (Domain Rating) | Ahrefs | 백링크 기반 도메인 등급 0–100 |
| TF (Trust Flow) | Majestic | 신뢰 링크 흐름 0–100 |
| CF (Citation Flow) | Majestic | 인용 링크 흐름 0–100 |
| 유기 트래픽 | Ahrefs | 월간 예상 방문자 |
| 트래픽 가치 | Ahrefs | 유기 트래픽 달러 환산 가치 |
| 백링크 수 | Ahrefs | 총 백링크 수 |
| 참조 도메인 수 | Ahrefs | 유니크 참조 도메인 수 |
| EDU/GOV 링크 | Majestic | 교육/정부 기관 링크 수 |

**API 엔드포인트**
```
GET https://domain-metrics-check.p.rapidapi.com/domain-metrics/{domain}
Headers:
  X-RapidAPI-Key: {API_KEY}
  X-RapidAPI-Host: domain-metrics-check.p.rapidapi.com
```

### 3-3. 도메인 상세 페이지
- 전체 SEO 지수 표시 (Moz / Ahrefs / Majestic 섹션별 분리)
- 과거 낙찰 가격 이력 (날짜, 낙찰가, 낙찰 기관)
- 도메인 등록 히스토리 (Whois 기반)
- 소셜 시그널 (FB 공유, Pinterest 저장 수 등)
- Topical Trust Flow (카테고리 기반 신뢰 점수)

### 3-4. 과거 낙찰 이력 데이터베이스
- 경매 사이트별 낙찰 결과 수집 (GoDaddy Auctions, NameJet, Sedo 등)
- 필드: 도메인명, 낙찰일, 낙찰가(USD), 낙찰 기관, TLD
- 검색 및 필터 기능

---

## 4. 데이터 소스

| 데이터 종류 | 소스 | 수집 방식 |
|---|---|---|
| 경매/만료 도메인 목록 | GoDaddy, Namecheap, DropCatch 등 | API or 크롤링 |
| SEO 지수 | RapidAPI domain-metrics-check | REST API |
| Whois / 등록 이력 | Whois API 또는 공개 DB | API |
| 과거 낙찰 이력 | NameBio, DN Journal 등 | 크롤링 or 데이터 제공 |

---

## 5. 기술 스택 (예정)

| 레이어 | 기술 |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS |
| Backend / API | Next.js API Routes 또는 별도 서버 |
| DB | PostgreSQL (도메인 정보, 지수, 이력 저장) |
| 캐싱 | Redis (API 응답 캐싱 — RapidAPI 요청 비용 절감) |
| 배포 | Vercel (Frontend) + 별도 서버 (크롤러/스케줄러) |
| 외부 API | RapidAPI domain-metrics-check (15,000 req/월 기준) |

---

## 6. API 사용 전략

- RapidAPI 무료 플랜: 월 15,000 요청
- 신규 도메인 추가 시 지수 1회 조회 후 DB 저장 (캐싱 우선)
- 지수 갱신 주기: 7일 또는 14일 (배치 처리)
- 대량 처리 필요 시 유료 플랜 또는 커스텀 한도 협의

---

## 7. 향후 확장 기능 (Post-MVP)

- [ ] 도메인 알림 설정 (특정 조건 충족 시 이메일/알림)
- [ ] 북마크 / 위시리스트
- [ ] 도메인 평가 계산기 (사용자 직접 입력)
- [ ] 유사 도메인 추천
- [ ] API 제공 (외부 개발자용)
- [ ] 프리미엄 멤버십 (대량 조회, 알림 기능)
- [ ] 다국어 지원 (한국어 우선 → 영어 확장)

---

## 8. 성공 지표 (KPI)

| 지표 | MVP 목표 |
|---|---|
| 수집 도메인 수 | 1,000개 이상 |
| 일간 활성 사용자 | 100명 |
| 도메인 상세 페이지 조회 | 세션당 3페이지 이상 |
| API 오류율 | 1% 미만 |
