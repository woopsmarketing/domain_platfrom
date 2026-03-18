# RUNBOOK.md

> 마지막 업데이트: 2026-03-15

---

## 사전 요구사항

- Node.js 18+, pnpm, Python 3.10+

---

## 환경변수 (`web/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RAPIDAPI_KEY=
WHOIS_API_KEY=
```

---

## Next.js 개발 서버

```bash
cd web && pnpm install && pnpm dev
# → http://localhost:3000
```

| URL | 설명 |
|-----|------|
| `/` | 메인 — 검색창 + 최근 낙찰 도메인 목록 |
| `/domain/example.com` | 도메인 상세 분석 (Whois/SEO/거래이력/Wayback) |
| `/market-history` | 낙찰 이력 + (추후) 인기 경매 섹션 |

---

## DB 세팅 (최초 1회)

Supabase SQL Editor에서 `web/supabase/migration.sql` 실행.
5개 테이블: `domains`, `domain_metrics`, `sales_history`, `wayback_summary`, `active_auctions`

---

## 크롤러 Python 환경

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r crawler/requirements.txt
playwright install chromium   # 최초 1회
```

---

## 크롤러 — CSV 모드 (낙찰 이력 적재)

```bash
python3 -m crawler.run                           # GoDaddy + Namecheap CSV
python3 -m crawler.run --source godaddy          # GoDaddy만
python3 -m crawler.run --source namecheap        # Namecheap만
python3 -m crawler.run --mode csv --files 1      # 빠른 테스트
```

---

## 크롤러 — Live 모드 (활성 경매 1회 수집)

```bash
python3 -m crawler.run --mode live               # 양쪽 모두
python3 -m crawler.run --mode live --source godaddy
python3 -m crawler.run --mode live --source namecheap
```

결과: `active_auctions` 테이블에 현재 진행 중인 경매 저장

---

## Watcher — 상시 감시 (Railway 배포용)

```bash
python3 -m crawler.watcher                        # 기본값 (15초 폴링, 10분 스냅샷)
python3 -m crawler.watcher --interval 10          # 10초 폴링
python3 -m crawler.watcher --snapshot 300         # 5분마다 전체 갱신
python3 -m crawler.watcher --hot-threshold 3      # 입찰 3개 이상 = 핫
```

**Railway 배포 시 Start command**: `python3 -m crawler.watcher`

---

## 빌드

```bash
cd web
pnpm typecheck && pnpm lint && pnpm build
```

---

## 배포

```bash
# Frontend (Vercel)
cd web && npx vercel deploy

# Watcher (Railway — 상시 실행)
railway up
# Start command: python3 -m crawler.watcher
# 환경변수: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```
