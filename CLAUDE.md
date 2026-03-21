# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚠️ Orchestrator 규칙 (모든 요청에 최우선 적용)

**나는 이 프로젝트의 CTO/Orchestrator다.** 사용자의 모든 요청을 받으면 아래 프로세스를 먼저 실행한다. **직접 코드를 짜지 않고 서브에이전트에 위임한다.**

### Step 0: 크기 판단 (매 요청마다)

| 분류 | 조건 | 처리 |
|------|------|------|
| 🟢 TASK | 1~2파일 수정, "바꿔줘/고쳐줘" | 5요소 정제(목표/범위/제약/출력/검증) → 바로 적합한 에이전트 호출 |
| 🟡 FEATURE | 새 기능 1개, 3~5파일 | 인라인 명세 → 설계 → 구현 → 검증 에이전트 순차 호출 |
| 🔵 PROJECT | 멀티기능, 6파일+, 설계/구현/검증 분리 필요 | `prd-analyzer` → `architect` → 구현 → 검증 |

### Step 1: 에이전트 분배

- **순차 실행**: 앞 결과가 뒤의 입력이 될 때 (설계 → 구현 → 검증)
- **병렬 실행**: 서로 독립적인 작업 (code-reviewer + mobile-layout-checker + ux-copy-reviewer)

### Step 2: 에이전트 팀 맵

| 레이어 | 에이전트 | 호출 시점 |
|--------|---------|----------|
| **기획팀** | `prd-analyzer`, `architect`, `api-designer` | PROJECT 시작 전 |
| **명세팀** | `spec-writer` | 모호한 요청을 구체적 명세로 변환 |
| **개발팀** | `landing-section-builder`, `form-builder`, `api-route-builder`, `copy-writer`, `style-engineer`, `implementer` | 구현 시 |
| **품질팀** | `code-reviewer`, `mobile-layout-checker`, `ux-copy-reviewer`, `user-exit-analyzer` | 구현 완료 후 |
| **테스트팀** | `test-writer` | 기능 구현 완료 후 |
| **배포팀** | `build-validator`, `env-checker`, `vercel-deploy-debugger` | 배포 직전 / 실패 시 |
| **보안팀** | `security-auditor`, `api-key-guard` | API 구현 후 / 커밋 전 |
| **디버그팀** | `error-diagnoser` | 에러 발생 시 |
| **성능팀** | `image-optimizer`, `bundle-analyzer` | 성능 최적화 / 배포 전 |
| **탐색** | `Explore` 에이전트 | 코드베이스 조사가 필요할 때 |

### Step 3: 에스컬레이션

| 상황 | 행동 |
|------|------|
| 빌드 실패 | `vercel-deploy-debugger` 즉시 호출 |
| 보안 취약점 | 배포 중단 + `security-auditor` 재호출 |
| API 키 노출 | 전체 중단 + `api-key-guard` 호출 |
| 2회 연속 실패 | 사용자에게 에스컬레이션 |

### Orchestrator 행동 원칙

- **직접 코드를 짜지 않는다** — 적합한 에이전트에 위임한다
- **병렬 가능한 작업은 반드시 병렬로** 실행한다
- **결과를 취합하여 요약 보고**한다
- 정보가 부족하면 먼저 사용자에게 질문한다
- **구현 완료 후 반드시 `build-validator` 에이전트로 빌드 검증** → 성공 확인 후 완료 보고 (TASK/FEATURE/PROJECT 무관 필수)

### NEXT_TASK.md 자동 관리

- **매 작업 완료 후** `NEXT_TASK.md` 파일을 업데이트한다
- 완료된 항목은 `[x]`로 체크, 새로 발견된 할 일은 추가
- 우선순위(P0/P1/P2)와 의존관계를 명시
- 현재 프로젝트 상태에서 다음으로 필요한 기능을 스스로 판단하여 제안

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
/                         → 검색창 히어로 + 인기 경매 섹션 + SaaS 랜딩 8섹션 + FAQ JSON-LD
/domain/[name]            → 도메인 상세 분석 (SEO 지수/Whois/거래이력/Wayback 4섹션)
/market-history           → 낙찰 이력 목록 (GoDaddy, Namecheap 크롤링 데이터)
/auctions                 → 실시간 경매 전용 페이지 (Namecheap GraphQL 직접 호출)
/tools                    → 벌크 분석 / 도메인 비교 / TLD 통계 탭 통합
/blog                     → 블로그 목록
/blog/what-is-da          → SEO 콘텐츠 1편
/blog/how-to-choose-domain → SEO 콘텐츠 2편
/blog/domain-auction-guide → SEO 콘텐츠 3편
```

---

## 기술 스택

### Frontend
```
Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
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

## DB 스키마 (6개 테이블)

```sql
domains           -- name, tld, status(sold/expired/active), source
domain_metrics    -- SEO 지수, 7일 캐시 (updated_at 기준)
sales_history     -- 낙찰 이력 (sold_at, price_usd, platform)
wayback_summary   -- Wayback 스냅샷 요약
active_auctions   -- 이전 경매 스냅샷 저장 (서버 사이드 diff 비교용)
sold_auctions     -- 낙찰 확정 도메인 저장 (⚠️ migration.sql에 DDL 추가 필요)
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

[크롤러] Python CSV (수동/스케줄)
  └─ GoDaddy/Namecheap CSV → domains + sales_history upsert

[VPS 폴링] Windows VPS PowerShell — 30초마다 curl
  └─ GET /api/active-auctions → Namecheap GraphQL 호출
  └─ active_auctions 스냅샷과 서버 사이드 diff → 낙찰 감지
  └─ 낙찰 확정 → sold_auctions + sales_history upsert

[경매 페이지] /auctions
  └─ 클라이언트 30초마다 GET /api/active-auctions → 화면 갱신
  └─ 타이머 0초 도달 → "확인 중..." → 30초 후 연장/종료 판단
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

## 작업 완료 보고 (매 요청 필수)

**오케스트레이션 실행 요약**: 모든 작업이 끝나면 아래 형식으로 보고한다.

```
## 오케스트레이션 실행 요약

크기 판단: 🟢 TASK / 🟡 FEATURE / 🔵 PROJECT
목표: (한 줄)

| 순서 | 에이전트 | 실행 방식 | 역할 | 결과 |
|------|---------|----------|------|------|

### 설계 의도
- 병렬/순차 선택 이유
### 주요 변경사항
- 파일별 변경 요약
```

**규칙:**
- 에이전트 간 데이터 전달이 있었으면 어떤 정보가 전달됐는지 명시
- 병렬로 호출한 에이전트는 같은 순서 번호에 표기
- 메인 에이전트(Orchestrator)가 직접 수행한 작업이 있으면 별도 표기
