# NEXT_TASK.md

> 마지막 업데이트: 2026-03-13
> 코드는 완성된 상태. 아래는 **환경 설정 + 실제 동작 확인** 작업입니다.

---

## 1순위 — Supabase DB 세팅 (30분)

### 1-1. Supabase 프로젝트 생성
1. https://supabase.com → New Project
2. 프로젝트 이름: `domain-platform`
3. 비밀번호 메모해두기 (DB 접속용)

### 1-2. 스키마 실행
1. Supabase 대시보드 → SQL Editor
2. `web/supabase/migration.sql` 전체 복사 붙여넣기 → Run

### 1-3. 환경변수 입력
```bash
# web/.env.local 파일 생성
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RAPIDAPI_KEY=                    # 일단 비워도 됨 (나중에)
WHOIS_API_KEY=                   # 일단 비워도 됨 (나중에)
```
키 위치: Supabase 대시보드 → Settings → API

---

## 2순위 — 크롤러로 데이터 적재 (15분)

```bash
# 프로젝트 루트에서
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

python3 -m crawler.run           # GoDaddy + Namecheap 전체 수집
# 또는
python3 -m crawler.run --source godaddy --files 1   # 빠른 테스트
```

완료 후 Supabase 대시보드 → Table Editor → `domains`, `sales_history` 에 데이터 확인

---

## 3순위 — Next.js 로컬 실행 및 화면 확인 (10분)

```bash
cd web
pnpm install
pnpm dev
# → http://localhost:3000
```

확인 사항:
- [ ] 메인 페이지 (`/`) — 도메인 목록이 실제 DB 데이터로 표시
- [ ] 도메인 상세 (`/domain/theverge.com`) — 4섹션 렌더링

---

## 4순위 — RapidAPI SEO 지수 연동 (선택, 15분)

1. https://rapidapi.com → `domain-metrics-check` 검색 → 구독 (무료 플랜)
2. API 키 복사 → `web/.env.local`의 `RAPIDAPI_KEY` 입력
3. `/domain/theverge.com` 접속 → SEO 지수(DA/DR/TF) 로드 확인

---

## 5순위 — 배포 (선택)

```bash
# Vercel CLI
cd web
npx vercel deploy

# 환경변수를 Vercel 대시보드에도 등록
# vercel.com → Project Settings → Environment Variables
```

---

## 완료 기준

| 작업 | 완료 기준 |
|------|----------|
| Supabase 세팅 | `migration.sql` 실행 후 8개 테이블 생성 확인 |
| 크롤러 | `domains` 테이블에 100건 이상 데이터 확인 |
| 로컬 실행 | 메인 페이지에 실제 도메인 목록 표시 |
| SEO 지수 | `/domain/theverge.com` 에서 DA/DR 숫자 표시 |
