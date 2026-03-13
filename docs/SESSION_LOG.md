# 개발 세션 로그 — DomainPulse

> 최종 업데이트: 2026-03-13

---

## 프로젝트 한 줄 요약

도메인 투자자·SEO 전문가를 위한 **도메인 데이터 분석 플랫폼**.
경매·만료 도메인 목록에 SEO 지수(DA/DR/TF)를 붙여서 한눈에 탐색할 수 있게 해준다.

---

## 지금까지 한 작업 (커밋 순서)

### 1단계 — 기획 확정
- `PRD.md` 작성 (목표, 기능 목록, 기술 스택, DB 스키마)
- `CLAUDE.md` 작성 (Claude Code 에이전트 지침)
- 세션 연속성 문서 추가 (`CURRENT_STATE.md`, `NEXT_TASK.md`, `RUNBOOK.md`)

### 2단계 — Next.js 앱 스캐폴딩
파일 구조:
```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx                  ← 메인 (도메인 목록 + 필터)
│   │   ├── domain/[name]/page.tsx    ← 도메인 상세 (Whois/SEO/거래이력/Wayback)
│   │   ├── marketplace/page.tsx      ← 도메인 거래소
│   │   ├── mypage/                   ← 마이페이지 (찜목록/구매이력/카트)
│   │   ├── auth/login, register/     ← 로그인/회원가입
│   │   └── api/                      ← API 라우트들
│   ├── components/
│   │   ├── domain/domain-table.tsx   ← TanStack Table 기반 대용량 테이블
│   │   ├── domain/stats-overview.tsx ← 통계 카드
│   │   └── layout/header, footer
│   ├── lib/
│   │   ├── db/domains.ts             ← 도메인 DB 쿼리
│   │   ├── db/marketplace.ts         ← 마켓플레이스 DB 쿼리
│   │   ├── db/wishlist.ts            ← 찜목록 DB 쿼리
│   │   ├── external/rapidapi.ts      ← RapidAPI SEO 지수 (7일 캐시)
│   │   ├── external/wayback.ts       ← Wayback Machine CDX API
│   │   ├── external/whois.ts         ← WhoisXML API
│   │   └── supabase.ts               ← Supabase 클라이언트
│   └── types/domain.ts               ← TypeScript 타입 정의
└── supabase/migration.sql            ← DB 스키마 (8개 테이블 + 시드 데이터)
```

**구현된 API 라우트:**
| 라우트 | 기능 |
|--------|------|
| `GET /api/domains` | 도메인 목록 (필터: status, source, tld, search, 페이징) |
| `GET /api/domain/[name]` | 도메인 상세 (Whois + SEO + Wayback 통합) |
| `GET /api/marketplace` | 마켓플레이스 목록 |
| `POST /api/marketplace/[id]/inquiry` | 구매 문의 등록 |
| `GET/POST /api/wishlist` | 찜목록 조회·추가·삭제 |

**DB 테이블 (8개):**
```
domains            ← 도메인 기본 정보 (name, tld, status, source)
domain_metrics     ← SEO 지수 (mozDA, ahrefsDR, majesticTF 등, 7일 캐시)
sales_history      ← 낙찰 이력 (sold_at, price_usd, platform)
wayback_summary    ← Wayback 스냅샷 요약
auction_listings   ← 현재 경매 중인 도메인
marketplace_listings ← 내 도메인 판매 등록
inquiries          ← 구매 문의
wishlists          ← 찜목록
```

### 3단계 — 보안 강화
- API 라우트에 입력 검증 추가
- `web/src/proxy.ts` 미들웨어 추가 (CORS, rate limiting 대비)
- `.env.local.example` 추가 (실제 키 노출 방지)

### 4단계 — 크롤러 구현 (CSV 방식)

**핵심 발견: 굳이 Playwright가 필요 없다!**

두 주요 소스 모두 공개 CSV를 제공합니다:

| 소스 | CSV URL | 비고 |
|------|---------|------|
| **GoDaddy Auctions** | `https://inventory.auctions.godaddy.com/metadata.json` → `.csv.zip` | 매일 갱신, bids > 0 필터링 |
| **Namecheap Marketplace** | S3 공개 버킷 `Namecheap_Market_Sales.csv` | 종료된 경매 + 가격 > 0 필터링 |

```
crawler/
├── run.py              ← 오케스트레이터 (CLI: --source, --files, --rows)
├── db.py               ← DB upsert (upsert_sold_domain)
└── scrapers/
    ├── godaddy.py      ← metadata.json → CSV ZIP 다운로드 → DB 저장
    └── namecheap.py    ← S3 CSV 다운로드 → DB 저장
```

**크롤러 실행:**
```bash
python3 -m crawler.run                    # 전체
python3 -m crawler.run --source godaddy  # GoDaddy만
python3 -m crawler.run --source namecheap
python3 -m crawler.run --files 2 --rows 500  # 제한 모드
```

---

## 현재 상태

| 항목 | 상태 |
|------|------|
| DB 스키마 | ✅ 완성 (migration.sql) |
| Next.js 앱 구조 | ✅ 완성 (모든 페이지·컴포넌트) |
| API 라우트 | ✅ 완성 (5개) |
| 크롤러 (GoDaddy) | ✅ 완성 (CSV 방식) |
| 크롤러 (Namecheap) | ✅ 완성 (CSV 방식) |
| Supabase 연결 | ⚠️ 환경변수 필요 (설정만 하면 됨) |
| RapidAPI SEO 지수 | ⚠️ RAPIDAPI_KEY 필요 |
| WhoisXML | ⚠️ WHOIS_API_KEY 필요 |
| 배포 (Vercel) | ❌ 미완 |
| 크롤러 스케줄링 (Railway) | ❌ 미완 |

---

## 앞으로 해야 할 작업 (우선순위 순)

### Phase 1 — 로컬에서 실제 동작 확인 (1~2일)

1. **Supabase 프로젝트 생성 + migration.sql 실행**
   - [Supabase 대시보드](https://supabase.com) → New Project
   - SQL Editor에 `web/supabase/migration.sql` 붙여넣기 실행
   - `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 입력

2. **크롤러 첫 실행으로 데이터 적재**
   ```bash
   pip install -r requirements.txt
   python3 -m crawler.run
   ```
   → `sales_history` + `domains` 테이블에 실제 데이터가 들어와야 함

3. **Next.js 개발 서버 실행 및 화면 확인**
   ```bash
   cd web && pnpm dev
   ```
   → `localhost:3000` 에서 실제 DB 데이터가 보이는지 확인

4. **RapidAPI 키 발급 후 SEO 지수 테스트**
   - `RAPIDAPI_KEY` 입력
   - `/domain/theverge.com` 접속 → SEO 지수 로드 확인

### Phase 2 — 기능 보완 (3~5일)

5. **도메인 상세 페이지 완성도 향상**
   - Wayback 타임라인 차트 (Recharts)
   - 거래 가격 추이 그래프
   - 모바일 반응형 확인

6. **메인 페이지 필터 UX 개선**
   - DA/DR/TF 범위 슬라이더 추가
   - 가격 범위 필터
   - 정렬 기능 (가격순, DA순 등)

7. **Dynadot 데이터 소스 추가**
   - [Dynadot Auctions](https://www.dynadot.com/auctions/) — CSV 제공 여부 확인 필요
   - 없으면 API 또는 경량 크롤링

8. **인증 시스템 연결**
   - Supabase Auth 실제 연결 (현재 UI만 있음)
   - 로그인 후 찜목록 DB 저장

### Phase 3 — 배포 (1~2일)

9. **Vercel 배포**
   ```bash
   cd web && vercel deploy
   ```
   - 환경변수 Vercel 대시보드에 등록

10. **크롤러 스케줄링 (Railway)**
    - Railway 프로젝트 생성
    - Cron: 매일 08:00 UTC `python3 -m crawler.run` 실행

### Phase 4 — 고도화 (선택)

- **Redis 캐시** (Upstash) — RapidAPI 호출 횟수 절약
- **알림 기능** — 찜한 도메인 가격 변동 시 이메일/슬랙 알림
- **대량 도메인 분석** — CSV 업로드 → 일괄 SEO 지수 조회
- **거래 가격 통계** — 카테고리별 평균가, 히트맵

---

## 환경 변수 체크리스트

```
# web/.env.local
NEXT_PUBLIC_SUPABASE_URL=         ← Supabase > Settings > API > URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    ← Supabase > Settings > API > anon key
SUPABASE_SERVICE_ROLE_KEY=        ← Supabase > Settings > API > service_role key
RAPIDAPI_KEY=                     ← https://rapidapi.com/hub (domain-metrics-check)
WHOIS_API_KEY=                    ← https://whoisxmlapi.com (무료 플랜 OK)
```

---

## 기술적 결정 사항 메모

### 왜 Playwright 안 씀?
GoDaddy와 Namecheap 모두 공개 CSV/S3를 제공하기 때문에 JS 렌더링 크롤러가 불필요.
`requests` + `csv` 모듈만으로 충분 → 가볍고 안정적.

### RapidAPI 캐싱 전략
- DB에 저장된 지수가 `updated_at < 7일` → DB에서 반환 (API 호출 X)
- 없거나 7일 초과 → RapidAPI 호출 후 DB 저장
- 무료 플랜: 월 15,000 요청 → 일 500 도메인 조회 가능

### 브랜치 전략
- `master` — 안정 버전
- `claude/add-model-endpoint-XIKiu` — 현재 개발 브랜치
