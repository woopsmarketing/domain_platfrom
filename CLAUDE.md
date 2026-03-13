# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 이 프로젝트가 만드는 것

**도메인 투자자·SEO 전문가용 도메인 데이터 분석 플랫폼.**

- 경매·만료 도메인 목록 + SEO 지수(DA/DR/TF 등) 통합 탐색
- 수십만 건의 도메인 거래 이력 데이터베이스
- 도메인명 입력 시 Whois, SEO 지수, 거래 이력, Wayback 히스토리를 한 페이지에 표시

상세 요구사항 → [`docs/PRD.md`](docs/PRD.md)

---

## 기술 스택

### Frontend
```
Next.js 14 (App Router) + TypeScript + Tailwind CSS
shadcn/ui       — UI 컴포넌트 (테이블, 배지, 필터 등)
TanStack Table  — 도메인 목록 대용량 테이블 (클라이언트 필터·정렬)
Recharts        — 거래가 추이, 트래픽 그래프
```

### Backend & 인프라
```
Next.js API Routes  — 클라이언트 ↔ DB 연결
PostgreSQL          — 메인 DB (Supabase 관리형)
Redis               — API 응답 캐시 + 작업 큐 (Upstash 서버리스)
Python + Playwright — 크롤러 (JS 렌더링 사이트 대응)
Vercel              — Frontend 배포
Railway             — 크롤러 서버 (장시간 실행 프로세스)
pnpm                — 패키지 매니저
```

---

## 핵심 외부 API

### 1. 도메인 SEO 지수 — RapidAPI domain-metrics-check
```
GET https://domain-metrics-check.p.rapidapi.com/domain-metrics/{domain}
Headers:
  X-RapidAPI-Key: {RAPIDAPI_KEY}        # .env에 보관
  X-RapidAPI-Host: domain-metrics-check.p.rapidapi.com
```

**주요 응답 필드:**
| 필드 | 지수 | 출처 |
|---|---|---|
| `mozDA` | Domain Authority | Moz |
| `ahrefsDR` | Domain Rating | Ahrefs |
| `majesticTF` | Trust Flow | Majestic |
| `majesticCF` | Citation Flow | Majestic |
| `ahrefsTraffic` | 월간 유기 트래픽 | Ahrefs |
| `ahrefsBacklinks` | 총 백링크 수 | Ahrefs |
| `ahrefsTrafficValue` | 트래픽 가치(USD) | Ahrefs |
| `mozSpam` | Spam Score | Moz |

**캐싱 규칙 (필수):**
- DB에 저장된 지수가 있고 `updated_at < 7일` → DB에서 반환 (API 호출 X)
- 없거나 7일 초과 → RapidAPI 호출 후 DB 저장
- 무료 플랜 한도: **월 15,000 요청**

### 2. Wayback Machine CDX API (무료)
```
GET http://web.archive.org/cdx/search/cdx
  ?url={domain}&output=json&limit=10&fl=timestamp,statuscode
```

### 3. Whois
- WhoisXML API (`whoisxmlapi.com`) — 무료 플랜 있음

---

## DB 스키마 (핵심 테이블)

```sql
domains           -- name, tld, registrar, expires_at, status(auction/expired/active)
domain_metrics    -- mozDA, ahrefsDR, majesticTF, ahrefsTraffic, ... , updated_at
sales_history     -- domain_id, sold_at, price_usd, platform
wayback_summary   -- domain_id, first_snapshot_at, last_snapshot_at, total_snapshots
auction_listings  -- domain_id, platform, auction_end_at, current_price_usd
```

---

## 도메인 상세 페이지 구조

라우트: `/domain/[name]` (e.g. `/domain/theverge.com`)

4개 섹션 순서:
1. **Whois** — 등록일, 만료일, 레지스트라, 네임서버
2. **SEO 지수** — Moz / Ahrefs / Majestic 섹션 분리
3. **거래 이력** — 낙찰일, 낙찰가(USD), 플랫폼 (테이블)
4. **Wayback 히스토리** — 스냅샷 수, 첫/마지막 크롤일, 링크

---

## 데이터 흐름

```
Python 크롤러 (Railway)
  └─ GoDaddy / NameJet / ExpiredDomains.net 수집 (매일)
       ↓
  PostgreSQL (Supabase)  ←──────────────────────────────┐
       ↓ 신규 도메인 감지                                  │
  RapidAPI 호출 (Redis 캐시 미스 시만)                      │
       ↓ DB 저장                                          │
  Next.js API Routes ───────────────────────────────────┘
       ↓
  Next.js Frontend (Vercel)
```

---

## 개발 명령어

```bash
# Next.js
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드
pnpm lint         # ESLint
pnpm typecheck    # TypeScript 타입 검사

# Python 크롤러
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python3 crawler/run.py
```

---

## 환경 변수 (.env.local)

```
RAPIDAPI_KEY=
DATABASE_URL=          # Supabase PostgreSQL connection string
REDIS_URL=             # Upstash Redis URL
WHOIS_API_KEY=
```

---

## Claude Code 에이전트 / 스킬

`.claude/` 디렉토리에 전문 서브에이전트와 스킬 포함.

- **에이전트** (`.claude/agents/`): architect, code-reviewer, api-designer, test-writer 등 23개
- **스킬** (`.claude/skills/`): skill-creator, hook-creator, subagent-creator 등

각 에이전트의 역할 → 해당 `.md` 파일 YAML frontmatter의 `description` 참조.
