# CURRENT_STATE.md

> 마지막 업데이트: 2026-03-13

---

## 완료된 작업

- [x] 프로젝트 기획 (PRD.md, CLAUDE.md)
- [x] GitHub 레포 연결 (`https://github.com/woopsmarketing/domain_platfrom`)
- [x] Next.js 14 앱 전체 구조 (`web/`)
- [x] DB 스키마 — 8개 테이블 (`web/supabase/migration.sql`)
- [x] Supabase 클라이언트 연결 (`web/src/lib/supabase.ts`)
- [x] API 라우트 5개 구현
  - `GET /api/domains` — 도메인 목록 (필터·페이징)
  - `GET /api/domain/[name]` — 도메인 상세 (Whois + SEO + Wayback 통합)
  - `GET /api/marketplace` — 마켓플레이스 목록
  - `POST /api/marketplace/[id]/inquiry` — 구매 문의
  - `GET/POST /api/wishlist` — 찜목록
- [x] 외부 API 연동 모듈
  - RapidAPI SEO 지수 (`web/src/lib/external/rapidapi.ts`) — 7일 캐시
  - Wayback Machine CDX (`web/src/lib/external/wayback.ts`)
  - WhoisXML (`web/src/lib/external/whois.ts`)
- [x] 페이지 구현 (6개)
  - `/` — 메인 (도메인 목록 + 필터)
  - `/domain/[name]` — 도메인 상세 (Whois/SEO/거래이력/Wayback 4섹션)
  - `/marketplace` — 도메인 거래소
  - `/mypage` — 마이페이지 (찜목록/구매이력/카트)
  - `/auth/login`, `/auth/register` — 로그인/회원가입
- [x] 컴포넌트 — TanStack Table 기반 대용량 테이블, shadcn/ui
- [x] 크롤러 구현 (Python, CSV 방식 — Playwright 불필요)
  - `crawler/scrapers/godaddy.py` — GoDaddy 인벤토리 CSV (매일 갱신)
  - `crawler/scrapers/namecheap.py` — Namecheap S3 공개 CSV
  - `crawler/run.py` — 오케스트레이터 (CLI)
  - `crawler/db.py` — DB upsert

---

## 현재 앱 상태

**코드 완성. 환경변수 미설정 상태 → 실제 DB 연동 전 단계.**

```
저장소 구조:
domain_platfrom/
├── web/                        ← Next.js 14 앱 (완성)
│   ├── src/app/                ← 페이지 + API 라우트
│   ├── src/components/         ← UI 컴포넌트
│   ├── src/lib/                ← DB·외부API 연동 모듈
│   ├── src/types/              ← TypeScript 타입
│   └── supabase/migration.sql  ← DB 스키마 (실행 전)
├── crawler/                    ← Python 크롤러 (완성)
│   ├── scrapers/godaddy.py
│   ├── scrapers/namecheap.py
│   ├── run.py
│   └── db.py
└── docs/
    ├── PRD.md
    └── SESSION_LOG.md          ← 전체 작업 이력
```

---

## 미완료 (환경 설정만 하면 됨)

- [ ] **Supabase 프로젝트 생성** + `migration.sql` 실행
- [ ] **`.env.local` 환경변수** 입력 (4개 키)
- [ ] **크롤러 첫 실행** → 실제 데이터 적재
- [ ] **RapidAPI 키** 발급 및 SEO 지수 테스트
- [ ] Vercel 배포
- [ ] Railway 크롤러 스케줄링 (매일 1회)

---

## 작업 브랜치

- `master` — 안정 버전
- `claude/add-model-endpoint-XIKiu` — 현재 개발 브랜치 (최신)
