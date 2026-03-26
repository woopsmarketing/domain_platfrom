# NEXT_TASK.md

> 마지막 업데이트: 2026-03-26

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
| Windows VPS PowerShell 폴링 (30초마다 curl) | ✅ |
| Google Ads gtag 설치 (G-N255DR94BE) | ✅ |
| 낙찰 이력 페이지 정렬 필터 (최근순/고가순/저가순) | ✅ |
| 아이콘 전면 통일 (돋보기, favicon/apple-icon/OG) | ✅ |
| Google Ads 전환 추적 태그 설치 | ✅ |
| sold_auctions DDL migration.sql 추가 | ✅ |
| sold_auctions upsert 중복 방지 (domain, platform 충돌 무시) | ✅ |
| sold-domains API limit(200) 제거 (전체 데이터 반환) | ✅ |
| **도구 페이지** | |
| 도메인 가용성 확인 (`/tools/domain-availability`) | ✅ |
| AI 도메인 이름 생성기 (`/tools/domain-generator`) | ✅ |
| DNS 조회 (`/tools/dns-checker`) | ✅ |
| Whois 조회 (`/tools/whois-lookup`) | ✅ |
| 도메인 가치 평가 (`/tools/domain-value`) | ✅ |
| **인증 / 결제** | |
| Supabase Auth (1단계) — 로그인/회원가입/AuthProvider | ✅ |
| LemonSqueezy 결제 연동 (2단계) — 체크아웃/웹훅/tier 동기화 | ✅ |

---

## 다음 할 일 (우선순위순)

### P0 — 즉시

- [x] **LemonSqueezy DB migration 실행** — `002_lemonsqueezy_fields.sql`을 Supabase Dashboard SQL Editor에서 실행
- [ ] **LemonSqueezy 환경변수 설정** — Vercel + .env.local에 LEMONSQUEEZY_API_KEY, WEBHOOK_SECRET, STORE_ID, VARIANT_ID 설정
- [ ] **LemonSqueezy 웹훅 등록** — LemonSqueezy Dashboard에서 `https://domainchecker.co.kr/api/webhooks/lemonsqueezy` 등록
- [ ] **LemonSqueezy 제품/Variant 생성** — 월간(₩9,900), 연간(₩82,800) 2개 Variant 생성

### P1 — 정리 및 안정화

- [ ] **migration.sql에 sold_auctions UNIQUE 제약 DDL 반영** — DB는 적용됨, 파일 동기화 필요
- [ ] **DATABASE_URL / REDIS_URL / REDIS_TOKEN 잔류 키 정리** — .env.local + Vercel 환경변수에서 제거
- [ ] **web/.npmrc + web/pnpm-lock.yaml 커밋** — 미커밋 상태
- [ ] **godaddy_live.py 검증** — 실제 동작 확인 필요
- [ ] **24시간 이전 낙찰 데이터 서버 사이드 접근 제어** — 현재 CSS blur만 적용, 실제 API 레벨 차단 구현 필요
- [ ] **결제 플로우 E2E 테스트** — LemonSqueezy 테스트 모드에서 전체 플로우 확인

### P2 — 콘텐츠 확장 (SEO 트래픽)

- [ ] 블로그: "DR과 DA 차이점 완벽 정리"
- [ ] 블로그: "만료 도메인으로 돈 버는 5가지 방법"
- [ ] 블로그: "도메인 가치 평가하는 법 — 7가지 기준"
- [ ] 블로그: "백링크란? SEO에서 중요한 이유"
- [ ] 블로그: "도메인 스팸 점수란? 확인 방법과 대처법"
- [ ] **OPENAI_API_KEY 발급** — domain-generator가 항상 fallback으로만 동작 중
- [ ] **낙찰 이력 데이터 확인** — market-history 페이지 실제 데이터 노출 여부

### P3 — 추후

- [ ] Railway Watcher 배포 (크롤러 상시 실행)
- [ ] 최근 검색 위젯
- [ ] 블로그 추가 콘텐츠 8편까지 확장
- [ ] 구독 관리 페이지 (해지/플랜 변경 UI)
- [ ] LemonSqueezy Customer Portal 연동

---

## 현재 환경 상태

| 항목 | 상태 |
|------|------|
| 로컬 pnpm dev | ✅ |
| Supabase DB (6개 테이블 + subscriptions) | ✅ migration 완료 |
| RapidAPI | ✅ 구독 완료 |
| Vercel 배포 | ✅ 완료 |
| domainchecker.co.kr | ✅ 연결됨 |
| Windows VPS 폴링 | ✅ 활성 (30초마다 PowerShell curl) |
| Google Search Console | ✅ 등록 완료 |
| Naver Search Advisor | ✅ 등록 완료 |
| Google Analytics | ✅ G-N255DR94BE |
| Supabase Auth | ✅ 1단계 완료 |
| LemonSqueezy 코드 | ✅ 구현 완료 |
| LemonSqueezy 환경변수 | ❌ 미설정 |
| LemonSqueezy 웹훅 등록 | ❌ 미등록 |
| OPENAI_API_KEY | ❌ 미설정 (fallback 동작) |
