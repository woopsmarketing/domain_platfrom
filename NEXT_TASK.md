# NEXT_TASK.md

> 마지막 업데이트: 2026-03-18

---

## 현재 구현 완료 상태

| 기능 | 상태 |
|------|------|
| 메인 검색 페이지 (`/`) | ✅ |
| 검색 로딩 UI (모래시계 + "분석중입니다") | ✅ |
| 도메인 상세 (`/domain/[name]`) | ✅ |
| SEO 3카드 — Moz / Majestic / Ahrefs (16개 필드) | ✅ |
| Wayback Machine 히스토리 (첫/마지막/총 스냅샷) | ✅ |
| 7일 캐시 + DB 자동 저장 | ✅ |
| 낙찰 이력 목록 (`/market-history`) | ✅ (크롤러 데이터 없음) |
| Supabase DB 연결 + 환경변수 | ✅ |
| RapidAPI 구독 + 키 설정 | ✅ |
| DB 스키마 (domains, domain_metrics, sales_history, wayback_summary) | ✅ |
| pnpm WSL2 lightningcss 문제 해결 | ✅ |
| 브라우저 확장 404 스팸 제거 | ✅ |

---

## 다음 할 일 (우선순위순)

### P0 — Vercel 배포

Vercel 대시보드에서 아래 환경변수 확인/입력:

```
NEXT_PUBLIC_SUPABASE_URL      = (이미 로컬에 있는 값)
NEXT_PUBLIC_SUPABASE_ANON_KEY = (이미 로컬에 있는 값)
SUPABASE_SERVICE_ROLE_KEY     = (이미 로컬에 있는 값)
RAPIDAPI_KEY                  = (이미 로컬에 있는 값)
```

```bash
# GitHub push → Vercel 자동배포
git add -A && git commit -m "feat: 배포" && git push
```

---

### P1 — 크롤러 실행 (낙찰 이력 데이터 적재)

`/market-history` 테이블에 데이터를 채우려면 크롤러 필요:

```bash
cd /mnt/d/Documents/domain_platform
python3 -m venv .venv && source .venv/bin/activate
pip install -r crawler/requirements.txt
python3 -m crawler.run --mode csv
```

---

### P2 — Whois 섹션 활성화 (선택)

`whoisxmlapi.com` 무료 500회. `.env.local`에 키 추가:
```
WHOIS_API_KEY=발급받은키
```
`lib/external/whois.ts` + `page.tsx` 연동은 이미 구현 완료 — 키만 넣으면 바로 작동.

---

### P3 — 추후 확장 아이디어

- [ ] **인기 경매 섹션** — `active_auctions` 데이터 쌓이면 홈/market-history에 추가
- [ ] **Railway Watcher 배포** — 크롤러 상시 실행 자동화
- [ ] **OG 이미지 생성** — 도메인별 동적 OG 이미지 (`/api/og/[name]`)
- [ ] **최근 검색 위젯** — 홈 하단에 최근/인기 검색 도메인 목록
- [ ] **낙찰이력 섹션 복구** — 크롤러 데이터 쌓인 후 상세 페이지에 재추가
