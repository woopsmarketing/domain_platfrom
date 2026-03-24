# NEXT_TASK.md

> 마지막 업데이트: 2026-03-24

---

## 현재 구현 완료 상태

| 기능 | 상태 |
|------|------|
| **핵심 기능** | |
| 메인 검색 + 인라인 요약 카드 (DA/DR/TF/Spam) | ✅ |
| 도메인 상세 (`/domain/[name]`) — SEO 3카드 16필드 | ✅ |
| Wayback Machine 히스토리 (10k+ 최적화) | ✅ |
| 7일 캐시 + DB 자동 저장 | ✅ |
| 낙찰 이력 목록 (`/market-history`) | ✅ (데이터 없음) |
| Supabase DB + RapidAPI 연동 | ✅ |
| URL 정규화 (https://, www. 자동 제거) | ✅ |
| **UI/브랜딩** | |
| SaaS 랜딩 페이지 (8개 섹션) | ✅ |
| 브랜드: 도메인체커 / domainchecker.co.kr | ✅ |
| 커스텀 로고 SVG (돋보기 아이콘) | ✅ |
| 파비콘 (icon.svg) | ✅ |
| **SEO / 메타데이터** | |
| sitemap.xml (정적 8페이지 — /domain/ 동적 제거) | ✅ |
| robots.txt (/domain/ disallow, AI 크롤러 허용) | ✅ |
| /domain/[name] noindex, nofollow 설정 | ✅ |
| JSON-LD (Organization + WebSite + FAQPage) | ✅ |
| metadataBase + canonical URL | ✅ |
| manifest.ts (PWA 홈 화면 추가) | ✅ |
| openGraph locale:ko_KR + twitter:summary | ✅ |
| OG 이미지 — 메인 + 도메인별 동적 생성 | ✅ (미커밋) |
| **성능/보안** | |
| next.config.ts (압축, poweredByHeader 제거) | ✅ |
| 폰트 display:swap | ✅ |
| CSP Cloudflare Insights 허용 | ✅ |
| PageSpeed 접근성 이슈 수정 (aria-label, 링크 텍스트) | ✅ |
| 브라우저 확장 404 스팸 제거 | ✅ |
| **경매 기능** | |
| 실시간 경매 페이지 (`/auctions`) — Namecheap GraphQL | ✅ |
| 경매 카운트다운 타이머 + 0초 "확인 중..." 표시 | ✅ |
| 낙찰 자동 감지 (30초 diff + POST /api/active-auctions) | ✅ |
| 홈 인기 경매 섹션 (Server Component GraphQL 직접 호출) | ✅ |
| **인프라** | |
| GitHub Actions CI (crawl-auctions.yml) | ❌ 삭제됨 |
| Windows VPS PowerShell 폴링 (30초마다 curl) | ✅ |
| Google Ads gtag 설치 (G-N255DR94BE) | ✅ |
| Google Ads 캠페인 (키워드 60개, 일 ₩3,300) | ✅ 검토 중 |
| 낙찰 이력 페이지 정렬 필터 (최근순/고가순/저가순) | ✅ |
| 아이콘 전면 통일 (돋보기, favicon/apple-icon/OG) | ✅ |
| Google Ads 전환 추적 태그 설치 | ✅ |
| sold_auctions DDL migration.sql 추가 | ✅ |
| sold_auctions upsert 중복 방지 (domain, platform 충돌 무시) | ✅ |
| sold-domains API limit(200) 제거 (전체 데이터 반환) | ✅ |
| .gitignore *.csv 패턴 추가 | ✅ |
| **도구 페이지** | |
| 도메인 가용성 확인 (`/tools/domain-availability`) — RDAP 병렬 조회 | ✅ |
| AI 도메인 이름 생성기 (`/tools/domain-generator`) — OpenAI fallback 단어조합 | ✅ |
| DNS 조회 (`/tools/dns-checker`) — Google Public DNS API, 7개 레코드 타입 | ✅ |
| **Claude Code 도구** | |
| 서브에이전트 25종 설정 | ✅ |
| 스킬 6종 (hook-creator, skill-creator, slash-command 등) | ✅ |

---

## 다음 할 일 (우선순위순)

### P0 — 즉시

- [x] **Google Search Console 등록** → sitemap.xml 제출
- [x] **Naver Search Advisor 등록** → sitemap.xml 제출
- [x] **sold_auctions DDL** — migration.sql에 추가 완료
- [x] **Namecheap_Market_Sales.csv .gitignore 추가** — *.csv 패턴으로 처리 완료
- [ ] **sold_auctions UNIQUE(domain, platform) 제약** — Supabase SQL Editor에서 ALTER TABLE 실행 필요
- [ ] **미커밋 변경사항 커밋** — active-auctions upsert, sold-domains limit 제거 포함
- [ ] **DATABASE_URL / REDIS_URL / REDIS_TOKEN 잔류 키 정리** — .env.local + Vercel 환경변수에서 제거

### P1 — 콘텐츠 확장 (SEO 트래픽)

- [ ] 블로그: "DR과 DA 차이점 완벽 정리"
- [ ] 블로그: "만료 도메인으로 돈 버는 5가지 방법"
- [ ] 블로그: "도메인 가치 평가하는 법 — 7가지 기준"
- [ ] 블로그: "백링크란? SEO에서 중요한 이유"
- [ ] 블로그: "도메인 스팸 점수란? 확인 방법과 대처법"

### P2 — 기능 확장

- [ ] **OPENAI_API_KEY 발급** — domain-generator가 항상 fallback으로만 동작 중, AI 기능 활성화 필요
- [ ] **Whois 섹션** — WHOIS_API_KEY 값 확인 후 활성화
- [ ] **godaddy_live.py 검증** — 실제 동작 확인
- [ ] **낙찰 이력 데이터 확인** — market-history 페이지 실제 데이터 노출 여부
- [ ] **24시간 이전 데이터 프리미엄 잠금 구현** — 예고 UI는 완료, 실제 접근 제어 필요

### P3 — 추후

- [ ] Railway Watcher 배포 (크롤러 상시 실행)
- [ ] 최근 검색 위젯
- [ ] 블로그 추가 콘텐츠 8편까지 확장

---

## 현재 환경 상태

| 항목 | 상태 |
|------|------|
| 로컬 pnpm dev | ✅ |
| Supabase DB (6개 테이블) | ✅ migration 완료 |
| sold_auctions DDL | ✅ migration.sql 포함 완료 |
| sold_auctions UNIQUE 제약 | ❌ DB 미적용 (P0) |
| RapidAPI | ✅ 구독 완료 |
| Vercel 배포 | ✅ 완료 |
| domainchecker.co.kr | ✅ 연결됨 |
| GitHub Actions CI | ❌ 삭제됨 (VPS 폴링으로 대체) |
| Windows VPS 폴링 | ✅ 활성 (30초마다 PowerShell curl) |
| Google Search Console | ✅ 등록 완료 |
| Naver Search Advisor | ✅ 등록 완료 |
| Google Analytics | ✅ G-N255DR94BE |
| Google Ads | ✅ 캠페인 검토 중 |
| Whois API | ⚠️ 값 확인 필요 (선택, graceful null) |
| OPENAI_API_KEY | ❌ 미설정 (fallback 동작) |
| Railway Watcher | ❌ 미배포 (코드 완성) |

---

## 최근 커밋 이력 (역순)

| 커밋 | 날짜 | 내용 |
|------|------|------|
| `922596b` | 2026-03-22 | 도구 페이지 콘텐츠 풍부화 + 도메인 생성기 개선 |
| `353950d` | 2026-03-22 | 도메인 가용성 확인 + AI 도메인 생성기 2개 도구 추가 |
| `709b763` | 2026-03-21 | 프로젝트 문서 4종 최신화 + sold_auctions DDL + .gitignore |
| `65ea881` | 2026-03-21 | Google Ads 전환 추적 태그 설치 |
| `af6a038` | 2026-03-21 | /domain/ noindex + sitemap/robots 정리 |
| `9b2b0f3` | 2026-03-21 | 서버 사이드 낙찰 감지 + sold_auctions 테이블 |
| `8214f50` | — | 낙찰 자동 감지 + 낙찰이력 페이지 리팩토링 |
| `35d2670` | — | 경매 타이머 0초 "확인 중..." + 30초 자동 판단 |
| `4ebd0c7` | — | 경매 갱신 주기 5분→30초 |
| `319b641` | — | Namecheap GraphQL 실시간 호출 전환 |
| `f1121df` | — | 경매 5분 자동 갱신 + active 도메인 낙찰이력 제외 |
