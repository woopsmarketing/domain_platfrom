# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**도메인 투자자 및 SEO 전문가를 위한 도메인 데이터 분석 플랫폼.**
NameBio(거래 이력) + DomCop(만료/경매 탐색) 핵심 기능을 하나로 합친 서비스.

> 상세 요구사항 → [`docs/PRD.md`](docs/PRD.md)

---

## 기술 스택

| 레이어 | 기술 |
|---|---|
| Frontend | Next.js App Router + TypeScript + Tailwind CSS |
| 테이블 UI | TanStack Table v8 |
| 차트 | Recharts |
| DB | PostgreSQL (Supabase) |
| 캐싱 / 큐 | Redis (Upstash) |
| 크롤러 | Python + Scrapy or Playwright |
| 배포 | Vercel (Frontend), Railway or VPS (크롤러) |
| Package manager | pnpm |

---

## 핵심 외부 API

### 1. 도메인 SEO 지수 (RapidAPI)
```
GET https://domain-metrics-check.p.rapidapi.com/domain-metrics/{domain}
Headers:
  X-RapidAPI-Key: {RAPIDAPI_KEY}     # .env에 보관
  X-RapidAPI-Host: domain-metrics-check.p.rapidapi.com
```
반환 필드: `mozDA`, `mozPA`, `ahrefsDR`, `majesticTF`, `majesticCF`, `ahrefsTraffic`, `ahrefsBacklinks` 등
- **DB 캐싱 필수**: DB 우선 조회 → 없거나 7일 경과 시 API 호출
- 무료 플랜 한도: 15,000 req/월

### 2. Wayback Machine (무료)
```
GET http://web.archive.org/cdx/search/cdx?url={domain}&output=json&limit=5&fl=timestamp,statuscode
```

### 3. Whois
- whoisxmlapi.com 또는 공개 whois API 사용

---

## 도메인 상세 페이지 구조

`/domain/[name]` 라우트에서 아래 4개 섹션을 순서대로 표시:

1. **Whois** — 등록일, 만료일, 레지스트라, 네임서버
2. **SEO 지수** — Moz / Ahrefs / Majestic 섹션 분리 표시
3. **거래 이력** — 낙찰일, 낙찰가(USD), 플랫폼
4. **Wayback 히스토리** — 스냅샷 횟수, 첫/마지막 크롤일, 링크

---

## 데이터 흐름

```
크롤러 (Python)
  └─ GoDaddy Auctions / NameJet / ExpiredDomains.net
       ↓ 수집
  PostgreSQL (domains, sales_history, metrics)
       ↓ API Routes
  Next.js Frontend
       ↓ 사용자 요청 시
  RapidAPI (캐시 미스 시만 호출)
```

---

## 개발 명령어

```bash
pnpm dev          # 개발 서버 실행
pnpm build        # 프로덕션 빌드
pnpm lint         # ESLint
pnpm typecheck    # TypeScript 타입 검사
```

크롤러 (Python):
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 crawler/run.py
```

---

## 주요 DB 테이블 (설계 기준)

```sql
domains          -- 도메인 기본 정보 (name, tld, registrar, expires_at, status)
domain_metrics   -- SEO 지수 캐시 (domain_id, mozDA, ahrefsDR, majesticTF, ..., updated_at)
sales_history    -- 거래 이력 (domain_id, sold_at, price_usd, platform)
wayback_summary  -- Wayback 요약 (domain_id, first_snapshot, last_snapshot, total_snapshots)
```

---

## Claude Code 에이전트 / 스킬

이 프로젝트는 `.claude/` 디렉토리에 전문화된 서브에이전트와 스킬을 포함한다.

- **에이전트** (`.claude/agents/`): 23개 전문 에이전트 (architect, code-reviewer, api-designer 등)
- **스킬** (`.claude/skills/`): 재사용 가능한 지식 패키지 (skill-creator, hook-creator 등)
- 에이전트 상세 → `.claude/agents/*.md` 각 파일의 YAML frontmatter 참조
