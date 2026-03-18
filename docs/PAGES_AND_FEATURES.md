# DomainPulse 페이지 & 기능 명세

## 사이트 개요

무료 도메인 분석 도구. 도메인명 입력 → DA/DR/TF/Whois/거래이력/Wayback 즉시 분석.
회원가입 없이 완전 무료. MVP 단계.

---

## 1. 메인 페이지 (`/`)

파일: `web/src/app/page.tsx`
렌더링: Server-side (force-dynamic)

### 섹션별 상세

#### 1-1. Hero 섹션

- **제공 서비스**: 도메인 검색 입력창 (핵심 CTA)
- **표시 내용**: 타이틀, 서브카피, 검색창, 예시 도메인 링크 (theverge.com, github.com, shopify.com)
- **데이터**: 없음 (정적 UI)
- **개인화**: 없음

#### 1-2. Feature Highlights (3 카드)

- **제공 서비스**: 서비스 주요 기능 소개
- **표시 내용**: SEO 지표 분석 / 스팸 점수 경고 / 즉시 분석 결과
- **데이터**: 없음 (정적)
- **개인화**: 없음

#### 1-3. 최근 검색 도메인

- **제공 서비스**: 사이트에서 최근 분석된 도메인 목록
- **표시 내용**: 도메인명 + DA/DR 뱃지 (최대 10개)
- **데이터**: `getRecentlySearched(10)` — `domains` 테이블에서 `last_searched_at` DESC
- **개인화**: 없음 (전체 사용자 합산) — 모든 방문자에게 동일한 결과 노출
- **문제점**: "최근 검색"이라는 이름이 개인 검색 기록을 암시하지만, 실제로는 전체 사이트의 최근 검색을 보여줌

#### 1-4. 인기 검색 도메인 TOP 10

- **제공 서비스**: 가장 많이 검색된 도메인 순위
- **표시 내용**: 순위 번호 + 도메인명 + 검색 횟수 + DA 뱃지
- **데이터**: `getPopularDomains(10)` — `search_count` DESC
- **개인화**: 없음 (전체 집계) — 이 섹션은 전체 데이터가 맞음

#### 1-5. 낙찰 하이라이트

- **제공 서비스**: 최근 7일간 고가 낙찰 도메인
- **표시 내용**: 도메인명 + 낙찰가 + 플랫폼 + 날짜 (최대 5개)
- **데이터**: `getTodayHighlights(5)` — `sales_history`에서 최근 7일, 가격 DESC
- **개인화**: 없음 (전체 데이터가 맞음)

#### 1-6. CTA 섹션

- **제공 서비스**: 다른 페이지로 유도
- **표시 내용**: 벌크 분석 도구 / 낙찰 이력 검색 / 도메인 투자 가이드 링크
- **데이터**: 없음 (정적)

---

## 2. 도메인 상세 페이지 (`/domain/[name]`)

파일: `web/src/app/domain/[name]/page.tsx`
렌더링: Server-side (force-dynamic)

### 데이터 흐름

1. DB에 도메인 없으면 자동 생성 (`ensureDomainInDb`)
2. 기존 데이터 조회 (`getDomainByName`)
3. SEO 지수 7일 캐시 만료 시 → RapidAPI 호출 → DB 저장
4. Wayback 데이터 없으면 → CDX API 호출 → DB 저장
5. Whois → 항상 실시간 호출
6. 검색 횟수 증가 (`incrementSearchCount`)

### 섹션별 상세

#### 2-1. 헤더 (도메인명 + 상태)

- **표시 내용**: 도메인명, 상태 뱃지 (sold/expired/active), 최초 거래가, 출처
- **데이터**: `getDomainByName()` + `sales_history[0]`

#### 2-2. 스팸 점수 경고 (조건부)

- **표시 내용**: Moz 스팸 점수가 높을 때 경고 알림
- **데이터**: `metrics.mozSpam` → `checkSpamScore()` 유틸

#### 2-3. 도메인 등급 뱃지

- **표시 내용**: A~F 등급 + 점수 (모든 SEO 지표 종합)
- **데이터**: `calculateDomainGrade()` 유틸

#### 2-4. Whois 정보 (좌측)

- **표시 내용**: 등록기관, 생성일, 만료일, 갱신일, 네임서버, 상태, 도메인 나이
- **데이터**: `fetchWhois(name)` — 실시간 호출 (캐시 없음)

#### 2-5. SEO 지표 (우측)

- **표시 내용**:
  - Moz: DA, Spam Score
  - Ahrefs: DR, Traffic, Backlinks, Traffic Value
  - Majestic: TF, CF
  - 마지막 업데이트 시각
- **데이터**: `domain_metrics` 테이블 (7일 캐시) / 만료 시 RapidAPI 갱신

#### 2-6. 거래 이력 테이블

- **표시 내용**: 날짜, 가격, 플랫폼 테이블
- **데이터**: `sales_history` 테이블 (`sold_at` DESC)

#### 2-7. Wayback Machine 히스토리

- **표시 내용**: 총 스냅샷 수, 최초/최종 스냅샷 날짜, Wayback 링크
- **데이터**: `wayback_summary` 테이블 / 없으면 CDX API 호출

---

## 3. 낙찰 이력 페이지 (`/market-history`)

파일: `web/src/app/market-history/page.tsx`
렌더링: Server-side (force-dynamic)

### 섹션별 상세

#### 3-1. 헤더

- **표시 내용**: 페이지 타이틀 + 설명
- **데이터**: 정적

#### 3-2. 통계 카드 (4개)

- **표시 내용**: 전체 건수, 평균 가격, 오늘 신규, 플랫폼 수
- **데이터**: 현재 하드코딩된 정적 값 — 실제 DB 집계 아님
- **개선 필요**: DB에서 실시간 통계 집계해야 함

#### 3-3. 탭 + 도메인 테이블

- **탭 구성**: 최근 낙찰 / 고가 도메인 ($500+) / 전체
- **테이블 컬럼**: 도메인, 상태, 출처, DA, DR, TF, Traffic, 가격
- **데이터**: `getDomains({ tab, limit: 100 })` — `domains` + `sales_history` + `domain_metrics` JOIN
- **개인화**: 없음 (전체 데이터)

---

## 4. 분석 도구 페이지 (`/tools`)

파일: `web/src/app/tools/page.tsx`
렌더링: Client-side ("use client")

### 섹션별 상세

#### 4-1. 벌크 분석 (Tab 1)

- **제공 서비스**: 여러 도메인 한꺼번에 분석 (최대 10개)
- **표시 내용**: 텍스트영역 입력 → 결과 테이블 (등급, DA, DR, TF, Backlinks, Traffic)
- **데이터**: 클라이언트에서 `/api/domain/[name]` 순차 호출
- **개인화**: 클라이언트 상태 (DB 미저장)

#### 4-2. 도메인 비교 (Tab 2)

- **제공 서비스**: 2~3개 도메인 지표 비교
- **표시 내용**: 등급 카드 + 비교 테이블 (DA, DR, TF, Traffic, Backlinks, Age, Spam)
- **데이터**: 클라이언트에서 `/api/domain/[name]` 호출
- **승자 하이라이팅**: 각 지표별 최고값 초록색 강조
- **개인화**: 클라이언트 상태 (DB 미저장)

#### 4-3. TLD 통계 (Tab 3)

- **제공 서비스**: TLD별 도메인/거래 통계
- **표시 내용**: TLD, 도메인 수, 거래 건수, 평균 가격, 최고 가격 테이블
- **데이터**: `/api/tld-stats` → `getTldStats()`
- **개인화**: 없음 (전체 집계)

---

## 5. 블로그 (`/blog`)

### 5-1. 블로그 인덱스 (`/blog`)

- **표시 내용**: 3개 아티클 카드 (타이틀, 설명, 링크)
- **데이터**: 정적 배열

### 5-2. DA란? (`/blog/what-is-da`)

- **내용**: Domain Authority 설명, 측정 방법, 활용법
- **데이터**: 정적 콘텐츠

### 5-3. 도메인 선택법 (`/blog/how-to-choose-domain`)

- **내용**: 좋은 도메인 고르는 기준
- **데이터**: 정적 콘텐츠

### 5-4. 경매 가이드 (`/blog/domain-auction-guide`)

- **내용**: GoDaddy/Namecheap 경매 참여 방법
- **데이터**: 정적 콘텐츠

---

## API 엔드포인트 요약

| 엔드포인트 | 메서드 | 용도 | 주요 파라미터 |
|-----------|--------|------|-------------|
| `/api/domain/[name]` | GET | 단일 도메인 상세 분석 | name (URL) |
| `/api/domains` | GET | 도메인 목록 (페이징) | tab, source, page, limit |
| `/api/tld-stats` | GET | TLD별 통계 | 없음 |

---

## 외부 API 연동

| API | 용도 | 캐싱 | 호출 위치 |
|-----|------|------|----------|
| RapidAPI domain-metrics-check | SEO 지수 (DA/DR/TF 등) | 7일 TTL | `/api/domain/[name]` |
| Wayback CDX API | 스냅샷 히스토리 | 최초 1회 | `/api/domain/[name]` |
| WhoisXML API | Whois 정보 | 없음 (실시간) | `/api/domain/[name]` |

---

## 개인화 현황 요약

| 섹션 | 현재 상태 | 올바른 상태 | 조치 필요 |
|------|----------|-----------|----------|
| 최근 검색 도메인 | 전체 합산 | 개인별 or 리네이밍 | 필요 |
| 인기 검색 TOP 10 | 전체 합산 | 전체 합산 | 정상 |
| 낙찰 하이라이트 | 전체 데이터 | 전체 데이터 | 정상 |
| 통계 카드 | 하드코딩 | DB 실시간 집계 | 필요 |
| 벌크 분석 결과 | 클라이언트 상태 | 클라이언트 상태 | 정상 |
| 도메인 비교 결과 | 클라이언트 상태 | 클라이언트 상태 | 정상 |

---

## DB 테이블 (4개)

| 테이블 | 용도 | 주요 컬럼 |
|--------|------|----------|
| `domains` | 도메인 기본 정보 | name, tld, status, source, search_count, last_searched_at |
| `domain_metrics` | SEO 지수 (7일 캐시) | moz_da, ahrefs_dr, majestic_tf, updated_at |
| `sales_history` | 낙찰 이력 | price_usd, platform, sold_at |
| `wayback_summary` | Wayback 스냅샷 요약 | total_snapshots, first_snapshot, last_snapshot |
