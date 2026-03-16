# NEXT_TASK.md

> 마지막 업데이트: 2026-03-15

---

## 1순위 — Playwright 스크래퍼 초기화 및 테스트

### 1-1. 의존성 설치

```bash
cd /mnt/d/Documents/domain_platform
python3 -m venv .venv && source .venv/bin/activate
pip install -r crawler/requirements.txt
playwright install chromium
```

### 1-2. 첫 실행 (headless=False로 브라우저 직접 확인)

```bash
# GoDaddy 테스트
python3 -m crawler.run --mode live --source godaddy

# Namecheap 테스트
python3 -m crawler.run --mode live --source namecheap
```

**확인할 것**: 로그에서 "인터셉트 [URL] → N건" 메시지 확인
→ 인터셉트된 URL을 보고 `API_KEYWORDS` 수정 필요 여부 판단

### 1-3. API 인터셉트 실패 시 대응

로그에 "API 인터셉트 결과 없음" 뜨면:
1. 브라우저 DevTools → Network → XHR 탭으로 실제 API URL 확인
2. `crawler/scrapers/godaddy_live.py` 또는 `namecheap_live.py` 의 `API_KEYWORDS` 수정

---

## 2순위 — Supabase DB 세팅

### 2-1. 프로젝트 생성
1. https://supabase.com → New Project
2. 프로젝트 이름: `domain-platform`

### 2-2. 스키마 실행
Supabase SQL Editor에서 `web/supabase/migration.sql` 전체 실행
→ 5개 테이블 생성 확인: `domains`, `domain_metrics`, `sales_history`, `wayback_summary`, **`active_auctions`**

### 2-3. 환경변수 입력

```bash
# web/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RAPIDAPI_KEY=           # 일단 비워도 됨
WHOIS_API_KEY=          # 일단 비워도 됨
```

---

## 3순위 — Watcher 검증

```bash
# 단발 실행으로 동작 확인
python3 -m crawler.run --mode live

# 상시 감시 실행 (Ctrl+C로 중단)
python3 -m crawler.watcher --interval 15 --snapshot 120
```

Supabase → Table Editor → `active_auctions` 데이터 확인

---

## 4순위 — Next.js 로컬 실행

```bash
cd web && pnpm install && pnpm dev
```

확인: `localhost:3000` → 검색창에 도메인 입력 → 분석 결과 표시

---

## 5순위 — Railway 배포 (Watcher)

Watcher는 상시 실행이 필요하므로 Railway에 배포.

```bash
# Railway CLI
railway login
railway up
# Start command: python3 -m crawler.watcher
```

환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 설정

---

## 6순위 — 프론트엔드 인기 경매 섹션 (추후)

`active_auctions` 데이터가 쌓이면:
- `/api/active-auctions` 라우트 구현 (가격 높은 순 / 마감 임박 순)
- `/market-history` 또는 홈에 섹션 추가
- 도메인명 + 현재가 + 마감시간만 표시 (플랫폼명 비노출)
- 5~10초 간격 폴링으로 가격 변동 반영
