# RUNBOOK.md

> 마지막 업데이트: 2026-03-13

---

## 사전 요구사항

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Python 3.10+

---

## 환경변수 설정

`web/.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RAPIDAPI_KEY=                    # rapidapi.com → domain-metrics-check
WHOIS_API_KEY=                   # whoisxmlapi.com (선택)
```

키 발급 위치:
- Supabase: 대시보드 → Settings → API
- RapidAPI: https://rapidapi.com (domain-metrics-check 검색)
- WhoisXML: https://whoisxmlapi.com (무료 플랜)

---

## Next.js 개발 서버

```bash
cd web
pnpm install
pnpm dev
# → http://localhost:3000
```

### 주요 페이지
| URL | 설명 |
|-----|------|
| `http://localhost:3000` | 메인 (도메인 목록·필터) |
| `http://localhost:3000/domain/theverge.com` | 도메인 상세 |
| `http://localhost:3000/marketplace` | 도메인 거래소 |
| `http://localhost:3000/mypage` | 마이페이지 |

---

## DB 세팅 (최초 1회)

```sql
-- Supabase SQL Editor에서 실행
-- 파일: web/supabase/migration.sql
```

---

## 크롤러 (Python)

```bash
# 가상환경 설정 (최초 1회)
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 실행 옵션
python3 -m crawler.run                         # GoDaddy + Namecheap 전체
python3 -m crawler.run --source godaddy        # GoDaddy만
python3 -m crawler.run --source namecheap      # Namecheap만
python3 -m crawler.run --files 1               # GoDaddy: 파일 1개만 (테스트용)
python3 -m crawler.run --rows 100              # Namecheap: 100행만 (테스트용)
```

### 크롤러 데이터 소스
| 소스 | URL | 갱신 주기 |
|------|-----|----------|
| GoDaddy | `inventory.auctions.godaddy.com/metadata.json` | 매일 07~08 PST |
| Namecheap | S3 공개 버킷 `Namecheap_Market_Sales.csv` | 수시간 단위 |

---

## 빌드 및 타입 검사

```bash
cd web
pnpm typecheck   # TypeScript 타입 오류 확인
pnpm lint        # ESLint
pnpm build       # 프로덕션 빌드
pnpm start       # 프로덕션 서버 로컬 확인
```

---

## 자주 나는 오류

### RapidAPI 429 Too Many Requests
- 원인: 월 15,000 요청 한도 초과
- 해결: `domain_metrics.updated_at` 확인 — 7일 이내면 DB 캐시에서 반환되어야 함

### Supabase 연결 오류
- 원인: `SUPABASE_SERVICE_ROLE_KEY` 미설정 또는 잘못된 URL
- 해결: Supabase 대시보드 → Settings → API → 키 재확인

### 크롤러 환경변수 오류
- 원인: `web/.env.local` 경로가 다름
- 해결: `crawler/run.py` 는 `web/.env.local` 을 자동으로 로드함. 파일 위치 확인

### Next.js 빌드 오류 (타입)
- 원인: API 응답 타입과 컴포넌트 props 불일치
- 해결: `pnpm typecheck` 출력 확인 후 `web/src/types/domain.ts` 수정

---

## 배포

### Frontend (Vercel)
```bash
cd web
npx vercel deploy
# 환경변수를 Vercel 대시보드 → Project Settings → Environment Variables 에 등록
```

### 크롤러 스케줄링 (Railway)
- Railway 프로젝트 생성
- `python3 -m crawler.run` 을 Cron Job으로 등록
- 권장 실행 시간: 매일 `09:00 UTC` (GoDaddy CSV 갱신 직후)

---

## 브랜치 구조

| 브랜치 | 용도 |
|--------|------|
| `master` | 안정 버전 |
| `claude/add-model-endpoint-XIKiu` | 현재 개발 브랜치 |
