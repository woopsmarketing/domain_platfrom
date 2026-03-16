# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 이 프로젝트가 만드는 것

**무료 도메인 거래 데이터 분석 도구.**

- 도메인명만 입력하면 DA, DR, TF, Whois, 거래 이력, Wayback 히스토리를 즉시 분석
- 경매 낙찰 완료된 도메인의 거래 이력 데이터베이스
- 검색할 때마다 분석 결과가 DB에 자동 저장 (7일 캐시 → 자동 갱신)

> MVP: **회원가입 없이 완전 무료** — 수익화 없이 트래픽 확보에 집중.
> SEO 키워드: "무료 도메인 DA 체크", "도메인 품질 검사", "도메인 지수 확인" 등.
> 추후 트래픽 확보 후 대행 구매/판매, 프리미엄 기능 확장 예정.

---

## 사이트 구조

```
/                    → 검색창 히어로 (킬러 기능: 도메인 입력 → 즉시 분석)
/market-history      → 낙찰 이력 목록 (GoDaddy, Namecheap 크롤링 데이터)
/domain/[name]       → 도메인 상세 분석 (Whois/SEO/거래이력/Wayback 4섹션)
```

---

## 기술 스택

### Frontend
```
Next.js 14 (App Router) + TypeScript + Tailwind CSS
shadcn/ui       — UI 컴포넌트
TanStack Table  — 대용량 테이블
```

### Backend & 인프라
```
Next.js API Routes  — 클라이언트 ↔ DB 연결
PostgreSQL          — Supabase 관리형
Python + requests   — 크롤러 (CSV 다운로드)
Vercel              — Frontend 배포
Railway             — 크롤러 스케줄링
pnpm                — 패키지 매니저
```

---

## 핵심 외부 API

### 1. 도메인 SEO 지수 — RapidAPI domain-metrics-check
```
GET https://domain-metrics-check.p.rapidapi.com/domain-metrics/{domain}
```
**7일 캐시**: DB에 있고 7일 이내 → DB 반환 / 없거나 7일 초과 → API 호출 후 DB 저장

### 2. Wayback Machine CDX API (무료)
```
GET http://web.archive.org/cdx/search/cdx?url={domain}&output=json&limit=10
```
DB에 없으면 호출 → wayback_summary에 저장

### 3. Whois — WhoisXML API
실시간 호출 (경량, 캐시 불필요)

---

## DB 스키마 (4개 테이블)

```sql
domains           -- name, tld, status(sold/expired/active), source
domain_metrics    -- SEO 지수, 7일 캐시 (updated_at 기준)
sales_history     -- 낙찰 이력 (sold_at, price_usd, platform)
wayback_summary   -- Wayback 스냅샷 요약
```

**검색 시 자동 생성**: DB에 없는 도메인을 검색하면 `domains` 테이블에 자동 생성 (status=active, source=other)

---

## 데이터 흐름

```
[검색] 사용자 → /domain/example.com
  └─ DB에 없으면 자동 생성
  └─ SEO 지수 7일 지남? → RapidAPI 호출 → DB upsert
  └─ Wayback 없음? → CDX API 호출 → DB upsert
  └─ Whois → 실시간 호출
  └─ 결과 렌더링

[크롤러] Python (매일)
  └─ GoDaddy/Namecheap CSV → domains + sales_history upsert
```

---

## 개발 명령어

```bash
cd web && pnpm dev          # 개발 서버
cd web && pnpm build        # 빌드
python3 -m crawler.run      # 크롤러
```

---

## 환경 변수 (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=       # Supabase > Settings > API > URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase > Settings > API > anon key
SUPABASE_SERVICE_ROLE_KEY=      # Supabase > Settings > API > service_role key
RAPIDAPI_KEY=                   # rapidapi.com → domain-metrics-check
WHOIS_API_KEY=                  # whoisxmlapi.com (선택)
```

---

## 작업 보고서 출력 규칙

**모든 작업 완료 후, 아래 형식으로 작업 과정 보고서를 출력할 것.**

```
## 작업 보고서

### 호출된 에이전트
- [에이전트명] — 수행한 작업 요약

### 작업 흐름
1. 메인 에이전트: (첫 번째 수행한 작업)
2. → [서브에이전트명]: (위임받은 작업)
3. 메인 에이전트: (서브에이전트 결과를 받아 수행한 작업)
...

### 변경된 파일
- `경로/파일명` — 변경 내용 요약

### 결과 요약
(최종 결과 1~10줄)
```

**규칙:**
- 서브에이전트를 사용하지 않고 메인 에이전트만 작업한 경우에도 보고서를 출력
- 어떤 도구(Read, Edit, Write, Bash, Grep 등)를 왜 사용했는지 흐름을 보여줄 것
- 병렬로 호출한 작업이 있으면 `[병렬]` 표시
- 에이전트 간 데이터 전달이 있었으면 어떤 정보가 전달됐는지 명시
