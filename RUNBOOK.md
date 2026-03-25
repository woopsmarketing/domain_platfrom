# RUNBOOK.md

> 마지막 업데이트: 2026-03-25

---

## 사전 요구사항

- Node.js 18+, pnpm, Python 3.10+

---

## 환경변수 (`web/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RAPIDAPI_KEY=                    # ✅ 구독 완료 — SEO 지수 조회 + domain-value 고도화
OPENAI_API_KEY=                  # 선택 — 없으면 domain-generator가 로컬 단어조합 fallback으로 동작
# WHOIS_API_KEY                  # 미사용 — /api/whois-lookup은 RDAP 직접 사용, 불필요
# DATABASE_URL                   # 잔류 키 — 코드 미사용, 제거 권장
# REDIS_URL / REDIS_TOKEN        # 잔류 키 — 코드 미사용, 제거 권장
```

---

## Next.js 개발 서버

```bash
cd web && pnpm install && pnpm dev
# → http://localhost:3000
```

| URL | 설명 |
|-----|------|
| `/` | 메인 — 검색창 + 인기 경매 섹션 + 낙찰 하이라이트 + SaaS 랜딩 |
| `/domain/example.com` | 도메인 상세 분석 (SEO 지수/Whois/거래이력/Wayback) |
| `/market-history` | 낙찰 이력 목록 |
| `/auctions` | 실시간 경매 전용 페이지 (Namecheap GraphQL) |
| `/tools` | 벌크 분석 / 도메인 비교 / TLD 통계 |
| `/tools/domain-availability` | 도메인 가용성 확인 (RDAP 병렬 조회) |
| `/tools/domain-generator` | AI 도메인 이름 생성기 (OpenAI fallback 로컬 단어조합) |
| `/tools/dns-checker` | DNS 레코드 조회 (Google DNS over HTTPS, 7종 레코드 타입) |
| `/tools/whois-lookup` | Whois 조회 (RDAP 기반, 외부 API 키 불필요) |
| `/tools/domain-value` | 도메인 가치 평가 (기본 스코어링 + RapidAPI 고도화) |
| `/blog` | 블로그 목록 |
| `/blog/what-is-da` | SEO 콘텐츠 1편 |
| `/blog/how-to-choose-domain` | SEO 콘텐츠 2편 |
| `/blog/domain-auction-guide` | SEO 콘텐츠 3편 |

---

## DB 세팅 (최초 1회)

Supabase SQL Editor에서 `web/supabase/migration.sql` 실행.
6개 테이블: `domains`, `domain_metrics`, `sales_history`, `wayback_summary`, `active_auctions`, `sold_auctions`

> **sold_auctions UNIQUE 제약**: Supabase MCP를 통해 DB에 직접 적용 완료.
> `migration.sql`에는 아직 미반영 상태이므로, 새 환경에서 migration.sql만으로 세팅 시 아래 SQL을 추가로 실행해야 함.
> ```sql
> ALTER TABLE sold_auctions
>   ADD CONSTRAINT sold_auctions_domain_platform_key UNIQUE (domain, platform);
> ```

---

## 크롤러 Python 환경

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r crawler/requirements.txt
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
python3 -m crawler.run --mode live               # Namecheap GraphQL 직접 호출
python3 -m crawler.run --mode live --source namecheap
```

결과: Namecheap GraphQL API에서 실시간 경매 목록 조회

---

## VPS 폴링 — 상시 낙찰 감지 (GitHub Actions 대체)

Windows VPS PowerShell에서 30초마다 실행:

```powershell
while ($true) {
    Invoke-WebRequest -Uri "https://domainchecker.co.kr/api/active-auctions" -UseBasicParsing | Out-Null
    Start-Sleep -Seconds 30
}
```

**동작 원리**: GET `/api/active-auctions` 호출 시 서버 사이드에서 자동으로:
1. Namecheap GraphQL API 실시간 호출
2. `active_auctions` 스냅샷과 diff 비교
3. 사라진 도메인 = 낙찰 확정 → `sold_auctions` + `sales_history` upsert
4. 스냅샷 갱신

> GitHub Actions `.github/workflows/crawl-auctions.yml` 은 삭제됨.

---

## Watcher — 상시 감시 (Railway 배포용, 선택)

```bash
python3 -m crawler.watcher                        # 기본값 (2분 폴링)
```

**Railway 배포 시 Start command**: `python3 -m crawler.watcher`
**환경변수**: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

> VPS 폴링이 활성 상태이면 Railway Watcher는 중복 배포 불필요.

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
