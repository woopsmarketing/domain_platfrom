# RUNBOOK.md

> 현재 코드 없음. 프로젝트 세팅 완료 후 이 파일을 업데이트할 것.

---

## 설치

### 사전 요구사항
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Python 3.10+ (크롤러용)

### Frontend (Next.js)
```bash
cd web
pnpm install
cp .env.example .env.local
# .env.local에 아래 값 채우기:
#   RAPIDAPI_KEY=
#   DATABASE_URL=
#   REDIS_URL=
#   WHOIS_API_KEY=
```

### 크롤러 (Python)
```bash
cd crawler
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

---

## 실행

### 개발 서버
```bash
cd web
pnpm dev
# → http://localhost:3000
```

### 크롤러 단일 실행
```bash
cd crawler
python3 run.py --source godaddy    # GoDaddy 경매 수집
python3 run.py --source expired    # 만료 도메인 수집
```

### 크롤러 스케줄 실행
```bash
python3 scheduler.py               # 매일 자동 수집
```

---

## 테스트

```bash
cd web
pnpm typecheck      # TypeScript 타입 오류 확인
pnpm lint           # ESLint
pnpm test           # (추후 추가)
```

---

## 빌드

```bash
cd web
pnpm build
pnpm start          # 프로덕션 서버 로컬 확인
```

---

## 자주 나는 오류

### RapidAPI 429 Too Many Requests
- 원인: 월 15,000 요청 한도 초과
- 해결: Redis 캐시 확인 (`domain_metrics.updated_at` 갱신 주기 확인)

### Supabase 연결 오류
- 원인: `DATABASE_URL` 미설정 또는 IP 허용 안 됨
- 해결: Supabase 대시보드 → Settings → Database → Connection string 재확인

### Playwright 크롤러 실패
- 원인: 크롤링 대상 사이트 구조 변경
- 해결: `crawler/selectors.py` 셀렉터 업데이트 후 재실행

### Next.js 빌드 오류 (타입)
- 원인: API 응답 타입과 컴포넌트 props 불일치
- 해결: `pnpm typecheck` 출력 확인 후 `types/domain.ts` 수정

---

## 환경 변수 목록

| 변수 | 설명 | 필수 |
|---|---|---|
| `RAPIDAPI_KEY` | RapidAPI domain-metrics-check 키 | ✅ |
| `DATABASE_URL` | Supabase PostgreSQL 연결 문자열 | ✅ |
| `REDIS_URL` | Upstash Redis 연결 URL | ✅ |
| `WHOIS_API_KEY` | WhoisXML API 키 | 선택 |
