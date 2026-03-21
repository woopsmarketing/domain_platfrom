# CURRENT_STATE.md

> 마지막 업데이트: 2026-03-21

---

## 프로젝트 컨셉

**무료 도메인 거래 데이터 분석 도구** — 도메인명만 입력하면 SEO 지수, Whois, 거래 이력을 즉시 분석. 회원가입 없이 누구나 무료 사용.

---

## 사이트 구조 (9개 페이지)

| 페이지 | 설명 |
|--------|------|
| `/` | 검색창 히어로 + 인기 검색 + 경매 섹션 + 낙찰 하이라이트 + SaaS 랜딩 8섹션 + FAQ JSON-LD |
| `/domain/[name]` | 도메인 상세 분석 (SEO 지수 + Whois + 거래이력 + Wayback, 동적 OG 메타) |
| `/market-history` | 낙찰 이력 테이블, `SoldAuctionsClient`에 위임 |
| `/auctions` | 실시간 경매 전용 페이지, `AuctionPageClient`에 위임 |
| `/tools` | 벌크 분석 / 도메인 비교 / TLD 통계 탭 통합 |
| `/blog` | 블로그 목록 정적 렌더링 |
| `/blog/what-is-da` | SEO 콘텐츠 1편 |
| `/blog/how-to-choose-domain` | SEO 콘텐츠 2편 |
| `/blog/domain-auction-guide` | SEO 콘텐츠 3편 |

---

## 인프라 상태

| 항목 | 상태 |
|------|------|
| Supabase 프로젝트 | ✅ 생성 완료 |
| DB 마이그레이션 (5개 테이블 실행됨) | ✅ 실행 완료 |
| sold_auctions 테이블 DDL | ⚠️ migration.sql에 추가 필요 (P0) |
| Supabase 환경변수 (URL, ANON_KEY, SERVICE_ROLE_KEY) | ✅ 입력 완료 |
| RAPIDAPI_KEY (도메인 SEO 지수) | ✅ 구독 완료 |
| WHOIS_API_KEY (Whois 조회) | ❌ 미발급 (키 없으면 null 반환) |
| DATABASE_URL | ⚠️ 잔류 키 — 코드 미사용, 정리 권장 |
| REDIS_URL / REDIS_TOKEN | ⚠️ 잔류 키 — 코드 미사용, 정리 권장 |
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
| `sold_auctions` | 낙찰 확정 도메인 저장 (⚠️ migration.sql DDL 추가 필요) |

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
- [x] /domain/[name] noindex + robots.ts disallow + sitemap 정적화
- [x] 낙찰 이력 페이지 정렬 필터 (최근순/고가순/저가순)
- [x] 아이콘 전면 통일 (시계 → 돋보기, favicon/apple-icon/OG/헤더/푸터)

---

## 미완료

- [ ] **sold_auctions DDL** → migration.sql에 추가 필요 (P0)
- [ ] WHOIS_API_KEY 발급 → .env.local에 입력
- [ ] DATABASE_URL / REDIS_URL / REDIS_TOKEN 잔류 키 정리 (코드 미사용)
- [ ] Railway 배포 (Watcher 상시 실행)
- [ ] 블로그 추가 콘텐츠 (4~8편)
- [ ] godaddy_live.py 검증
- [ ] Namecheap_Market_Sales.csv .gitignore 추가
