# NEXT_TASK.md

> 마지막 업데이트: 2026-03-27

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
| 다크모드 (next-themes + 헤더 토글) | ✅ |
| 헤더 "프리미엄 도메인" 메뉴 추가 | ✅ |
| 2컬럼 CTA 섹션 (프리미엄 도메인 + 경매 대행) | ✅ |
| **모바일 UX 최적화** | ✅ |
| 모바일 터치 타겟 44px 통일 (헤더/로그인/계정/문의/마켓) | ✅ |
| 모바일 가독성 (도메인 break-all, 테이블 truncate, CTA 여백) | ✅ |
| 모바일 여백 최적화 (pricing/blog py-10 sm:py-16) | ✅ |
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
| next.config.ts (압축, poweredByHeader 제거, AVIF/WebP, optimizeCss) | ✅ |
| 폰트 display:swap | ✅ |
| CSP Cloudflare Insights 허용 | ✅ |
| PageSpeed 접근성 이슈 수정 (aria-label, 링크 텍스트) | ✅ |
| 브라우저 확장 404 스팸 제거 | ✅ |
| /tools 페이지 Server Component 전환 | ✅ |
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
| **사용자 계정** | |
| 사용자 대시보드 (`/account`) — 프로필/구독/사용량/히스토리 | ✅ |
| 비밀번호 변경 (`/account/change-password`) | ✅ |
| 비밀번호 찾기 (`/forgot-password`) | ✅ |
| LemonSqueezy Customer Portal 연동 (`/api/customer-portal`) | ✅ |
| 최근 검색 API (`/api/recent-searches`) | ✅ |
| 로그인 리다이렉트 지원 (`?redirect=` 파라미터) | ✅ |
| 헤더 프로필 드롭다운에 "내 계정" 링크 | ✅ |
| **Free/Pro 제한** | |
| useRateLimit 훅 + UpgradeModal 통일 | ✅ |
| 10개 도구 일일 사용 제한 적용 (클라이언트) | ✅ |
| 남은 횟수 표시 (비Pro 사용자) | ✅ |
| **IP 기반 서버 Rate Limit (api_usage 테이블)** | ✅ |
| 7개 API route에 서버 사이드 IP rate limit 적용 | ✅ |
| Pro 사용자 rate limit 바이패스 | ✅ |
| 대량 분석 5개 초과 경고 메시지 + Pro 100개 | ✅ |
| **Free/Pro 제한 수치 통일 + KST 자정 리셋** | ✅ |
| 클라이언트/서버 제한 수치 일치 (3/5/10) | ✅ |
| 한국시간(KST, UTC+9) 자정 기준 일일 초기화 | ✅ |
| **블로그** | |
| 블로그 목록 페이지 개선 (카테고리 배지/날짜/읽는시간/NEW) | ✅ |
| 스팸 점수 블로그 콘텐츠 대폭 보강 (5,000자+, TOC, 관련글) | ✅ |
| **SEO 콘텐츠** | |
| "벌크" → "대량" 전체 교체 (8개 파일) | ✅ |
| /tools 메인 페이지 SEO 가이드 콘텐츠 (6개 섹션 카드) | ✅ |
| /tools/bulk-analysis SEO 콘텐츠 + FAQ (4개) | ✅ |
| /tools/domain-compare SEO 콘텐츠 + FAQ (3개) | ✅ |
| **이메일** | |
| Brevo 이메일 헬퍼 (`src/lib/email.ts`) | ✅ |
| 경매 대행 문의 접수 확인 이메일 | ✅ |
| 마켓플레이스 구매 문의 접수 확인 이메일 | ✅ |
| 어드민 알림 이메일 (문의 접수 시) | ✅ |
| Pro 지표 blur 미리보기 (Free 사용자) | ✅ |
| 도메인 상세 공유 버튼 (ShareButton) | ✅ |
| Google Ads Pro 전환 추적 (useEffect + env) | ✅ |
| gtag 타입 선언 (gtag.d.ts) | ✅ |
| **사용자 대시보드 전체** | |
| 대시보드 레이아웃 (사이드바 + 모바일 탭) | ✅ |
| 대시보드 메인 (통계 4카드 + 최근 분석 + 빠른 액션) | ✅ |
| 분석 이력 (`/dashboard/history`) — 검색/페이지네이션 | ✅ |
| 즐겨찾기 (`/dashboard/favorites`) — 추가/삭제/메모 편집 | ✅ |
| 내 문의 (`/dashboard/inquiries`) — broker+inquiry 통합 | ✅ |
| 구매 내역 (`/dashboard/purchases`) — 상태별 배지 | ✅ |
| 알림 (`/dashboard/notifications`) — 읽음 처리/전체 읽음 | ✅ |
| 내 플랜 (`/dashboard/plan`) — 구독 정보 + 기능 목록 | ✅ |
| 프로필 설정 (`/dashboard/settings`) — 프로필/비번/로그아웃 | ✅ |
| 7개 대시보드 API Routes | ✅ |
| 도메인 분석 시 user_searches 자동 기록 | ✅ |
| 도메인 상세 즐겨찾기 버튼 (FavoriteButton) | ✅ |
| 헤더 알림 아이콘 (안읽은 수 배지) + 대시보드 링크 | ✅ |
| **코드 리뷰 이슈 수정 (HIGH 4 + MEDIUM 7)** | ✅ |
| email null 방어 (inquiries/stats API) | ✅ |
| link/URL 검증 (notifications/plan) | ✅ |
| useEffect 의존 배열 수정 (favorites/notifications) | ✅ |
| 즐겨찾기 단건 체크 API + confirm 다이얼로그 | ✅ |
| parseInt NaN 방어 (history API) | ✅ |
| signOut 에러 처리 (settings) | ✅ |
| alert → 인라인 에러 (plan portalError) | ✅ |

---

## 다음 할 일 (우선순위순)

### P0 — 즉시

- [x] **LemonSqueezy DB migration 실행** — `002_lemonsqueezy_fields.sql`을 Supabase Dashboard SQL Editor에서 실행
- [ ] **LemonSqueezy 환경변수 설정** — Vercel + .env.local에 LEMONSQUEEZY_API_KEY, WEBHOOK_SECRET, STORE_ID, VARIANT_ID 설정
- [ ] **LemonSqueezy 웹훅 등록** — LemonSqueezy Dashboard에서 `https://domainchecker.co.kr/api/webhooks/lemonsqueezy` 등록
- [ ] **LemonSqueezy 제품/Variant 생성** — 월간(₩9,900), 연간(₩82,800) 2개 Variant 생성
- [ ] **Brevo 환경변수 설정** — Vercel + .env.local에 BREVO_API_KEY 설정
- [ ] **Brevo 발신 이메일 인증** — Brevo에서 noreply@domainchecker.co.kr 도메인/이메일 인증 필요
- [ ] **다크모드 색상 검수** — 모든 페이지에서 다크모드 색상 대비 확인 (특히 bg-muted, bg-card, border 계열)
- [ ] **Google Ads 전환 ID 설정** — Vercel 환경변수에 NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID 설정 (Google Ads 콘솔에서 발급)

### P1 — 정리 및 안정화

- [ ] **migration.sql에 sold_auctions UNIQUE 제약 DDL 반영** — DB는 적용됨, 파일 동기화 필요
- [ ] **DATABASE_URL / REDIS_URL / REDIS_TOKEN 잔류 키 정리** — .env.local + Vercel 환경변수에서 제거
- [ ] **web/.npmrc + web/pnpm-lock.yaml 커밋** — 미커밋 상태
- [ ] **godaddy_live.py 검증** — 실제 동작 확인 필요
- [ ] **24시간 이전 낙찰 데이터 서버 사이드 접근 제어** — 현재 CSS blur만 적용, 실제 API 레벨 차단 구현 필요
- [ ] **결제 플로우 E2E 테스트** — LemonSqueezy 테스트 모드에서 전체 플로우 확인
- [ ] **최근 검색 API 사용자별 필터링** — 현재 전체 도메인 최근 검색 반환, 추후 user_id 기반 개인화 필요
- [ ] **api_usage 테이블 정리 크론** — 30일 이상 된 레코드 자동 삭제 (Supabase pg_cron 또는 외부 스케줄러)
- [x] **기존 블로그 3편 CSS/가독성 통일** — what-is-da, how-to-choose-domain, domain-auction-guide에 blog-prose/TOC/날짜/읽는시간/관련글/FAQ JSON-LD/콘텐츠 3000자+ 보강 완료
- [x] **나머지 도구 페이지 SEO 콘텐츠 추가** — 7개 페이지 모두 SEO 가이드+FAQ+JSON-LD 확인, SSL·HTTP 페이지 보강 완료
- [ ] **대시보드 알림 시스템 활성화** — 어드민이 문의 답변 시 user_notifications에 자동 insert하는 트리거/로직 구현
- [ ] **대시보드 user_searches 중복 방지** — 같은 사용자가 동일 도메인을 연속 분석할 때 짧은 시간 내 중복 기록 방지 (예: 5분 디바운스)
- [ ] **plan 페이지 구독 데이터 서버 사이드 이전** — 현재 클라이언트 직접 조회 (RLS 미적용, 보안 위험 낮지만 개선 권장)

### P2 — 콘텐츠 확장 (SEO 트래픽)

- [x] ~~블로그: "도메인 스팸 점수란? 확인 방법과 대처법"~~ → domain-spam-score-check 보강 완료
- [ ] 블로그: "DR과 DA 차이점 완벽 정리"
- [ ] 블로그: "만료 도메인으로 돈 버는 5가지 방법"
- [ ] 블로그: "도메인 가치 평가하는 법 — 7가지 기준"
- [ ] 블로그: "백링크란? SEO에서 중요한 이유"
- [ ] **OPENAI_API_KEY 발급** — domain-generator가 항상 fallback으로만 동작 중
- [ ] **낙찰 이력 데이터 확인** — market-history 페이지 실제 데이터 노출 여부

### P3 — 추후

- [ ] Railway Watcher 배포 (크롤러 상시 실행)
- [x] ~~최근 검색 위젯~~ → `/account` 대시보드에 포함
- [ ] 블로그 추가 콘텐츠 8편까지 확장
- [x] ~~구독 관리 페이지 (해지/플랜 변경 UI)~~ → `/account` + Customer Portal 연동 완료
- [x] ~~LemonSqueezy Customer Portal 연동~~ → `/api/customer-portal` 완료
- [ ] 어드민 대시보드 — 문의 관리/답변/알림 발송 통합 UI

---

## 현재 환경 상태

| 항목 | 상태 |
|------|------|
| 로컬 pnpm dev | ✅ |
| Supabase DB (6개 테이블 + subscriptions + api_usage + user_searches + user_purchases + user_notifications + wishlists) | ✅ migration 완료 |
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
| BREVO_API_KEY | ❌ 미설정 (이메일 미발송) |
