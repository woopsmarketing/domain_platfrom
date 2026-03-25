# CURRENT_STATE.md

> 마지막 업데이트: 2026-03-25

---

## 프로젝트 컨셉

**무료 도메인 거래 데이터 분석 도구** — 도메인명만 입력하면 SEO 지수, Whois, 거래 이력을 즉시 분석. 회원가입 없이 누구나 무료 사용.

---

## 사이트 구조 (14개 페이지)

| 페이지 | 설명 |
|--------|------|
| `/` | 검색창 히어로 + 인기 검색 + 경매 섹션 + 낙찰 하이라이트 + SaaS 랜딩 8섹션 + FAQ JSON-LD |
| `/domain/[name]` | 도메인 상세 분석 (SEO 지수 + Whois + 거래이력 + Wayback, 동적 OG 메타, noindex) |
| `/market-history` | 낙찰 이력 테이블, On-Demand ISR, 더 보기 버튼, 24h blur 잠금 + Pro 안내 배너 |
| `/auctions` | 실시간 경매 전용 페이지, `AuctionPageClient`에 위임, 30초 폴링 |
| `/tools` | 벌크 분석 / 도메인 비교 / TLD 통계 탭 통합 + 도구 카드 5개 |
| `/tools/domain-availability` | 도메인 가용성 확인 (RDAP 병렬 조회), FAQ JSON-LD |
| `/tools/domain-generator` | AI 도메인 이름 생성기 (OpenAI fallback 로컬 단어조합) |
| `/tools/dns-checker` | DNS 레코드 조회 (Google DNS over HTTPS API, 7종 레코드 타입) |
| `/tools/whois-lookup` | Whois 조회 (RDAP 기반, 외부 API 키 불필요) |
| `/tools/domain-value` | 도메인 가치 평가 (기본 로컬 스코어링 + RapidAPI SEO 고도화) |
| `/blog` | 블로그 목록 정적 렌더링 |
| `/blog/what-is-da` | SEO 콘텐츠 1편 |
| `/blog/how-to-choose-domain` | SEO 콘텐츠 2편 |
| `/blog/domain-auction-guide` | SEO 콘텐츠 3편 |

---

## 인프라 상태

| 항목 | 상태 |
|------|------|
| Supabase 프로젝트 | ✅ 생성 완료 |
| DB 마이그레이션 (6개 테이블 실행됨) | ✅ 실행 완료 |
| sold_auctions 테이블 DDL | ✅ migration.sql에 포함 완료 |
| sold_auctions UNIQUE(domain, platform) 제약 | ✅ DB에 적용 완료 (Supabase MCP로 직접 적용, migration.sql 미반영) |
| Supabase 환경변수 (URL, ANON_KEY, SERVICE_ROLE_KEY) | ✅ 입력 완료 |
| RAPIDAPI_KEY (도메인 SEO 지수 + 가치 평가) | ✅ 구독 완료 |
| WHOIS_API_KEY | ❌ 미사용 — /api/whois-lookup이 RDAP 직접 사용, 불필요 |
| OPENAI_API_KEY (도메인 생성기) | ❌ 미설정 (fallback 로컬 단어조합으로 동작 중) |
| DATABASE_URL | ⚠️ 잔류 키 — 코드 미사용, 정리 권장 |
| REDIS_URL / REDIS_TOKEN | ⚠️ 잔류 키 — 코드 미사용, 정리 권장 |
| Supabase MCP | ✅ .mcp.json 생성 완료 (.gitignore 추가됨) |
| Vercel 배포 | ✅ 완료 (domainchecker.co.kr 연결됨) |
| Railway 배포 (Watcher) | ❌ 미배포 (코드 완성) |
| GitHub Actions CI | ❌ 삭제됨 (VPS 폴링 방식으로 대체) |
| Windows VPS 폴링 | ✅ 활성 (30초마다 PowerShell curl) |
| Google Ads | ✅ 캠페인 생성 완료 (검토 중) |
| Google Analytics (gtag) | ✅ 설치 완료 (G-N255DR94BE) |
| Google Search Console | ✅ 등록 완료 |
| Naver Search Advisor | ✅ 등록 완료 |

---

## 크롤러 구조

### CSV 크롤러 (낙찰 이력 적재)
- GoDaddy: 공개 CSV ZIP → `sales_history` 저장
- Namecheap: S3 공개 CSV → `sales_history` 저장
- 실행: `python3 -m crawler.run --mode csv`

### 실시간 스크래퍼 (활성 경매)
- Namecheap GraphQL API 직접 호출 (Playwright 불필요)
- `/api/active-auctions` (GET) — GraphQL 실시간 호출 + active_auctions 스냅샷 diff + 낙찰 감지 + sold_auctions 저장
- 실행: `python3 -m crawler.run --mode live`

### VPS 폴링 (상시 감시, GitHub Actions 대체)
- Windows VPS PowerShell — 30초마다 GET /api/active-auctions 호출
- 서버 사이드에서 스냅샷 diff → 낙찰 감지 → sold_auctions + sales_history upsert
- 명령어: `while ($true) { Invoke-WebRequest -Uri "https://domainchecker.co.kr/api/active-auctions" -UseBasicParsing | Out-Null; Start-Sleep -Seconds 30 }`

### Watcher (상시 감시, Railway 배포용 — 미배포)
- 2분 폴링 + 낙찰 감지 (Namecheap 스냅샷 diff)
- 실행: `python3 -m crawler.watcher`

---

## DB 스키마 (6개 테이블)

| 테이블 | 용도 |
|--------|------|
| `domains` | 도메인 기본 정보 (status: sold/expired/active) |
| `domain_metrics` | SEO 지수, 7일 캐시 |
| `sales_history` | 낙찰 이력 (CSV 크롤러로 적재) |
| `wayback_summary` | Wayback 스냅샷 요약 |
| `active_auctions` | 이전 경매 스냅샷 저장 (서버 사이드 diff 비교용) |
| `sold_auctions` | 낙찰 확정 도메인 저장 (UNIQUE(domain, platform) 제약 DB 적용 완료, migration.sql 미반영) |

---

## 구현 완료 기능

- [x] 도메인 검색 → DB 자동 생성 + 7일 캐시 + 즉시 분석
- [x] SEO 지수 (DA/PA/DR/TF/CF/백링크/트래픽) — RapidAPI 연동
- [x] Whois 조회 + 도메인 나이 계산 (키 없으면 graceful null)
- [x] 스팸 점수 경고 (위험/주의)
- [x] 거래 이력 + Wayback 히스토리 (CDX API, 10k 최적화)
- [x] 낙찰 이력 목록 (`/market-history`) — sold-domains API
- [x] 실시간 경매 페이지 (`/auctions`) — Namecheap GraphQL 직접 호출
- [x] 경매 카운트다운 타이머 — 0초 도달 시 "확인 중..." 표시
- [x] 낙찰 자동 감지 — 30초 간격 diff, POST /api/active-auctions 자동 전송
- [x] 홈 인기 경매 섹션 — Server Component에서 GraphQL 직접 호출
- [x] 벌크 분석 / 도메인 비교 / TLD 통계 (`/tools`)
- [x] 블로그 SEO 콘텐츠 3편 (`/blog`)
- [x] SaaS 랜딩 페이지 8개 섹션 + FAQ JSON-LD
- [x] sitemap.xml + robots.txt + manifest.json
- [x] JSON-LD 구조화 데이터 (Organization + WebSite + FAQPage)
- [x] metadataBase + canonical URL + 동적 OG 메타
- [x] CSP + PageSpeed 이슈 수정 + 404 스팸 제거
- [x] CSV 크롤러 (GoDaddy + Namecheap)
- [x] Namecheap GraphQL 실시간 크롤러 (namecheap_live.py)
- [x] Watcher (2분 폴링 + 낙찰 자동 감지, Railway 미배포)
- [x] VPS PowerShell 폴링 (30초마다 curl, GitHub Actions 대체)
- [x] Google Ads gtag 설치 (G-N255DR94BE)
- [x] Google Ads 전환 추적 태그 설치
- [x] /domain/[name] noindex + robots.ts disallow + sitemap 정적화
- [x] 낙찰 이력 페이지 정렬 필터 (최근순/고가순/저가순)
- [x] 아이콘 전면 통일 (시계 → 돋보기, favicon/apple-icon/OG/헤더/푸터)
- [x] 도메인 가용성 확인 도구 (`/tools/domain-availability`) — RDAP 병렬 조회
- [x] AI 도메인 이름 생성기 (`/tools/domain-generator`) — OpenAI fallback 로컬 단어조합
- [x] DNS 조회 도구 (`/tools/dns-checker`) — Google DNS over HTTPS, 7종 레코드 타입
- [x] Whois 조회 도구 (`/tools/whois-lookup`) — RDAP 기반, 외부 API 키 불필요
- [x] 도메인 가치 평가 도구 (`/tools/domain-value`) — 기본 스코어링 + RapidAPI 고도화
- [x] `/api/dns-lookup` — Google DNS over HTTPS 서버 사이드 프록시
- [x] `/api/whois-lookup` — RDAP 서버 사이드 프록시
- [x] sold_auctions upsert 중복 방지 (domain, platform 충돌 무시)
- [x] sold_auctions UNIQUE(domain, platform) 제약 — DB에 직접 적용 완료 (Supabase MCP)
- [x] detectAndSaveSold await 전환 (서버 사이드 낙찰 감지 안정화)
- [x] sold-domains API limit(200) 제거 (전체 데이터 반환)
- [x] .gitignore *.csv 패턴 추가
- [x] sold_auctions DDL migration.sql에 추가 완료
- [x] 낙찰 이력 페이지 On-Demand ISR + 더 보기 버튼 전환
- [x] 낙찰 이력 24h blur 잠금 + Pro 안내 배너
- [x] SEO 메타데이터 전면 최적화 (초보자 친화적 키워드, 서드파티 도구명 제거)
- [x] FAQ JSON-LD 35개+ (전 페이지 적용)
- [x] Supabase MCP 연결 (.mcp.json, .gitignore 추가)
- [x] SEO 키워드 리포트 (claudedocs/seo-keyword-report.md, 150개+ 메타 키워드)

---

## 미완료

- [ ] **migration.sql에 sold_auctions UNIQUE 제약 DDL 반영** — DB는 적용됨, 파일만 미반영 (P1)
- [ ] **DATABASE_URL / REDIS_URL / REDIS_TOKEN 잔류 키 정리** — .env.local + Vercel 환경변수에서 제거 (P1)
- [ ] **web/.npmrc + web/pnpm-lock.yaml 커밋** — 미커밋 상태 (P1)
- [ ] OPENAI_API_KEY 발급 → domain-generator가 항상 fallback으로만 동작 중
- [ ] 24시간 이전 낙찰 이력 서버 사이드 접근 제어 구현 (현재 CSS blur만, 실제 데이터 차단 미구현)
- [ ] Railway 배포 (Watcher 상시 실행)
- [ ] 블로그 추가 콘텐츠 (4~8편)
- [ ] godaddy_live.py 검증 (실제 동작 미확인)
