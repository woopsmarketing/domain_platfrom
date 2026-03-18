# NEXT_TASK.md

> 마지막 업데이트: 2026-03-18

---

## 내일 시작할 때 (순서대로)

### Step 1: API 키 발급 (10분)

| 키 | 발급처 | 무료 | 비고 |
|---|---|---|---|
| **RAPIDAPI_KEY** | [rapidapi.com](https://rapidapi.com) → "domain-metrics-check" 검색 → Subscribe (Free) | 월 500회 | SEO 지수 (DA/DR/TF) |
| **WHOIS_API_KEY** | [whoisxmlapi.com](https://whoisxmlapi.com) → 가입 → API Key 복사 | 500회 | Whois 조회 |

발급 후 `web/.env.local`에 입력:
```
RAPIDAPI_KEY=발급받은키
WHOIS_API_KEY=발급받은키
```

### Step 2: 로컬 실행 확인 (5분)

```bash
cd web && pnpm install && pnpm dev
```

확인 사항:
- `localhost:3000` 접속 → 메인 페이지 정상 렌더링
- 검색창에 `google.com` 입력 → SEO 지수/Whois/Wayback 결과 표시
- `/market-history` → 테이블 렌더링 (데이터 없으면 빈 상태 OK)

### Step 3: 크롤러 테스트 (15분)

```bash
# Python 환경 세팅
cd /mnt/d/Documents/domain_platform
python3 -m venv .venv && source .venv/bin/activate
pip install -r crawler/requirements.txt

# CSV 크롤러 (낙찰 이력 적재)
python3 -m crawler.run --mode csv

# Playwright 실시간 스크래퍼 (선택)
playwright install chromium
python3 -m crawler.run --mode live --source godaddy
python3 -m crawler.run --mode live --source namecheap
```

Supabase Table Editor에서 `sales_history` 데이터 확인

### Step 4: Vercel 배포 (10분)

```bash
# Vercel CLI
npm i -g vercel
cd web && vercel
```

환경변수 5개 Vercel 대시보드에서 설정:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RAPIDAPI_KEY`
- `WHOIS_API_KEY`

### Step 5: Railway 배포 — Watcher (추후)

Watcher는 상시 실행이 필요하므로 Railway에 배포.

```bash
railway login && railway up
# Start command: python3 -m crawler.watcher
```

### Step 6: 인기 경매 섹션 UI (추후)

`active_auctions` 데이터가 쌓이면:
- `/api/active-auctions` 라우트 구현
- 홈 또는 `/market-history`에 섹션 추가
- 도메인명 + 현재가 + 마감시간 표시
