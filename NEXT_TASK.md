# NEXT_TASK.md

## 1순위 — Next.js 프로젝트 초기 세팅

```bash
pnpm create next-app@latest web --typescript --tailwind --app --src-dir
cd web
pnpm add @tanstack/react-table recharts
pnpm dlx shadcn@latest init
```

- `web/` 폴더에 Next.js 앱 생성
- shadcn/ui 초기화
- 기본 레이아웃 (헤더, 사이드바) 구성
- `/domain/[name]` 라우트 빈 페이지 생성

## 2순위 — Supabase DB 세팅 + API Route 연결

- Supabase 프로젝트 생성
- PRD 기반 5개 테이블 마이그레이션 실행
  - `domains`, `domain_metrics`, `sales_history`, `wayback_summary`, `auction_listings`
- `.env.local`에 `DATABASE_URL` 설정
- `/api/domain/[name]` API Route 작성 (DB 조회)

## 3순위 — 도메인 상세 페이지 MVP

- `/domain/[name]` 페이지에 4개 섹션 구현
  1. Whois 정보 (WhoisXML API 연동)
  2. SEO 지수 (RapidAPI domain-metrics-check 연동 + Redis 캐시)
  3. 거래 이력 테이블
  4. Wayback 히스토리 요약
- 도메인 검색 인풋 (헤더에 배치)

---

## 완료 기준

| 작업 | 완료 기준 |
|---|---|
| 1순위 | `pnpm dev` 실행 후 `/domain/theverge.com` 접속 시 빈 페이지라도 렌더링 됨 |
| 2순위 | Supabase에 테이블 생성, API Route에서 JSON 응답 반환 확인 |
| 3순위 | `theverge.com` 입력 시 DA/DR/TF 수치가 실제로 화면에 표시됨 |
