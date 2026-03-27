# 도메인체커 프로젝트 종합 보고서

> 작성일: 2026-03-27
> URL: https://domainchecker.co.kr
> 기술 스택: Next.js 16 + TypeScript + Tailwind CSS v4 + Supabase + LemonSqueezy + Brevo

---

## 1. 구현 완료 기능 (전체 목록)

### 핵심 기능
| 기능 | 상태 | 설명 |
|------|------|------|
| 도메인 분석 | ✅ | DA/PA/DR/TF/CF + 백링크/참조도메인 + Wayback 히스토리 |
| 7일 캐시 | ✅ | DB에 자동 저장, 7일 지나면 RapidAPI 재호출 |
| 낙찰 이력 | ✅ | sold_auctions 1056건, 24h 이전 Pro 잠금 |
| 실시간 경매 | ✅ | Namecheap GraphQL 30초 폴링 + 낙찰 자동 감지 |
| 낙찰 하이라이트 | ✅ | 메인 페이지 고가 낙찰 15건 표시 |

### 도구 (10개)
| 도구 | Free 제한 | 설명 |
|------|----------|------|
| 대량 분석 | 1회/일 (5개) | 여러 도메인 일괄 분석 |
| 도메인 비교 | 3회/일 | 2~3개 도메인 나란히 비교 |
| 가용성 확인 | 5회/일 | RDAP 병렬 조회 |
| AI 도메인 생성기 | 3회/일 | OpenAI + 로컬 fallback |
| 도메인 가치 평가 | 3회/일 | 기본 + SEO 데이터 기반 |
| DNS 조회 | 5회/일 | A/CNAME/MX/TXT/NS/SOA/AAAA |
| WHOIS 조회 | 5회/일 | RDAP 기반 |
| 도메인 만료일 | 5회/일 | 만료 예정일 + 나이 확인 |
| SSL 인증서 | 5회/일 | 유효성/만료일/발급기관 |
| HTTP 상태 | 5회/일 | 리다이렉트 체인 추적 |

### 인증/결제
| 기능 | 상태 | 설명 |
|------|------|------|
| Supabase Auth | ✅ | 이메일 + Google OAuth |
| 로그인/회원가입 | ✅ | /login, /signup |
| 비밀번호 재설정 | ✅ | /forgot-password + /account/change-password |
| LemonSqueezy 결제 | ✅ | 월간 ₩9,900 / 연간 ₩82,800 |
| 웹훅 처리 | ✅ | HMAC 검증 + 5개 이벤트 |
| Customer Portal | ✅ | 구독 관리 페이지 연동 |
| Google Ads 전환 추적 | ✅ | pricing?success=true 감지 |

### Free/Pro 제한 시스템
| 레이어 | 방식 | 설명 |
|--------|------|------|
| 클라이언트 | localStorage | 일일 사용량 + 업그레이드 모달 |
| 서버 | IP 기반 DB | api_usage 테이블, 시크릿탭 우회 방지 |
| 지표 잠금 | blur 미리보기 | Pro 지표를 흐리게 표시 |
| 초기화 | KST 자정 | 한국시간 기준 |

### 대시보드 (7개 섹션)
| 페이지 | 렌더링 | 설명 |
|--------|--------|------|
| /dashboard | 서버 | 통계 4카드 + 최근 분석 + 빠른 액션 |
| /dashboard/history | 하이브리드 | 분석 이력 (검색/페이지네이션) |
| /dashboard/favorites | 클라이언트 | 즐겨찾기 CRUD + 메모 |
| /dashboard/inquiries | 서버 | 경매 대행 + 구매 문의 목록 |
| /dashboard/purchases | 서버 | 구매 내역 + 상태 배지 |
| /dashboard/plan | 클라이언트 | 구독 정보 + Pro/Free 비교 |
| /dashboard/settings | 클라이언트 | 프로필 + 비밀번호 + 로그아웃 |

### 수익 모델
| 모델 | 상태 | 설명 |
|------|------|------|
| Pro 구독 | ✅ | LemonSqueezy 결제 |
| 프리미엄 도메인 판매 | ✅ | /marketplace + 어드민 관리 |
| 경매 대행 서비스 | ✅ | /inquiry + Brevo 이메일 알림 |

### SEO
| 항목 | 상태 | 설명 |
|------|------|------|
| sitemap.xml | ✅ | 31개 URL, 블로그 자동 등록 (lib/blog.ts) |
| robots.txt | ✅ | /domain/ disallow |
| JSON-LD | ✅ | Organization + WebSite + FAQPage + Article |
| 블로그 4편 | ✅ | 각 3000~5000자+ SEO 콘텐츠 |
| OG 이미지 | ✅ | 메인 + 도메인별 동적 |
| 도구 SEO | ✅ | 10개 도구 하단 콘텐츠 + FAQ |

### UI/UX
| 항목 | 상태 | 설명 |
|------|------|------|
| 다크모드 | ✅ | next-themes |
| 모바일 최적화 | ✅ | 44px 터치 타겟, 반응형 |
| 헤더 드롭다운 | ✅ | 분석 도구 8개 hover 메뉴 |
| 블로그 CSS | ✅ | blog.css 전용 파일 |
| 성능 최적화 | ✅ | avif/webp + optimizeCss + SWR 캐싱 |

### 인프라
| 항목 | 상태 | 설명 |
|------|------|------|
| Vercel 배포 | ✅ | GitHub 자동 배포 |
| Supabase DB | ✅ | 14개 테이블 |
| Brevo 이메일 | ✅ | 문의 확인 + 어드민 알림 |
| Google Analytics | ✅ | G-N255DR94BE |
| VPS 폴링 | ✅ | 30초마다 경매 데이터 수집 |
| pg_cron | ✅ | api_usage 7일 자동 정리 |
| Vitest 테스트 | ✅ | 13개 단위 테스트 |

---

## 2. DB 테이블 현황 (14개)

| 테이블 | 행 수 | 용도 |
|--------|-------|------|
| domains | 197 | 도메인 기본 정보 |
| domain_metrics | 121 | SEO 지표 (7일 캐시) |
| sales_history | 0 | 미사용 (sold_auctions로 대체) |
| wayback_summary | 187 | Wayback 스냅샷 요약 |
| active_auctions | 136 | 실시간 경매 스냅샷 |
| sold_auctions | 1056 | 낙찰 확정 도메인 |
| subscriptions | 1 | 구독 정보 (LemonSqueezy 연동) |
| api_usage | - | IP 기반 일일 사용량 |
| user_searches | - | 사용자별 분석 이력 |
| wishlists | - | 즐겨찾기 |
| user_purchases | - | 구매 내역 |
| user_notifications | - | 알림 (기능 제거됨, 테이블 잔존) |
| marketplace_listings | - | 프리미엄 도메인 판매 목록 |
| broker_inquiries | - | 경매 대행 문의 |
| inquiries | - | 도메인 구매 문의 |

---

## 3. 코드 품질 현황

### 리팩토링 완료 항목
- ✅ API 공통 헬퍼 (requireAuth/requireAdmin/getServiceClient)
- ✅ formatDateKR/getTodayKST 유틸 통합
- ✅ PRO_FEATURES/FREE_LIMITS 상수 중앙화
- ✅ Dashboard API 4개 → 서버 컴포넌트 직접 조회로 전환
- ✅ 코드 리뷰 HIGH 4개 + MEDIUM 7개 수정

### 남아있는 기술 부채
| 항목 | 심각도 | 설명 |
|------|--------|------|
| subscription.ts localStorage 레거시 | MEDIUM | AuthProvider가 동기화하지만 직접 참조 코드 존재 |
| sales_history 빈 테이블 | LOW | sold_auctions로 대체됨, 정리 가능 |
| user_notifications 테이블 잔존 | LOW | 기능 제거됨, DROP 가능 |
| DATABASE_URL/REDIS_URL 잔류 | LOW | .env.local에서 제거 권장 |

---

## 4. 앞으로 구현하면 좋은 기능

### P0 — 매출 직결 (즉시)
| # | 기능 | 설명 | 난이도 |
|---|------|------|--------|
| 1 | **LemonSqueezy 라이브 전환** | Identity verification 완료 후 실제 결제 활성화 | 설정 |
| 2 | **테스트 구독 데이터 정리** | subscriptions 테이블 테스트 데이터 삭제 | SQL |
| 3 | **프리미엄 도메인 등록** | /admin에서 실제 판매 도메인 5~10개 등록 | 수동 |

### P1 — 성장 (1~2주 내)
| # | 기능 | 설명 | 난이도 |
|---|------|------|--------|
| 4 | **블로그 4편 추가** | DR vs DA, 만료 도메인 투자, 가치 평가법, 백링크란 | 중 |
| 5 | **Google Search Console 재제출** | 새 sitemap 31개 URL 반영 | 설정 |
| 6 | **SNS 공유 메타 최적화** | 카카오톡/트위터 미리보기 이미지 | 쉬움 |
| 7 | **이메일 뉴스레터** | Brevo로 주간 도메인 트렌드 발송 | 중 |
| 8 | **domainchecker.co.kr 도메인 이메일 인증** | Brevo sender를 @domainchecker.co.kr로 | 설정 |

### P2 — 사용자 경험 (1~2개월)
| # | 기능 | 설명 | 난이도 |
|---|------|------|--------|
| 9 | **도메인 모니터링** | 관심 도메인 DA/DR 변화 추적 (주간 체크) | 높음 |
| 10 | **도메인 비교 리포트** | PDF 내보내기 (Pro 전용) | 중 |
| 11 | **경쟁사 분석** | 여러 도메인의 SEO 트렌드 비교 차트 | 높음 |
| 12 | **만료 도메인 알림** | 즐겨찾기 도메인 만료 7일 전 이메일 알림 | 중 |
| 13 | **API 키 발급** | 개발자용 유료 API 서비스 | 높음 |
| 14 | **다국어 지원** | 영어 버전 추가 (글로벌 확장) | 높음 |

### P3 — 인프라 (필요 시)
| # | 기능 | 설명 | 난이도 |
|---|------|------|--------|
| 15 | **RLS 활성화** | Supabase Row Level Security 전면 적용 | 중 |
| 16 | **에러 모니터링** | Sentry 또는 Vercel Analytics | 쉬움 |
| 17 | **Redis 캐시** | Vercel KV로 API 응답 캐싱 (사용자 1000명+) | 중 |
| 18 | **CI/CD 파이프라인** | GitHub Actions + 자동 테스트 | 중 |
| 19 | **E2E 테스트** | Playwright로 전체 플로우 테스트 | 높음 |
| 20 | **Railway 크롤러 배포** | Python 크롤러 상시 운영 | 중 |

---

## 5. 환경변수 체크리스트

### 필수 (현재 설정됨)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RAPIDAPI_KEY
LEMONSQUEEZY_API_KEY
LEMONSQUEEZY_WEBHOOK_SECRET
LEMONSQUEEZY_STORE_ID
LEMON_MONTHLY_VARIANT_ID
LEMON_YEARLY_VARIANT_ID
NEXT_PUBLIC_ADMIN_USER_ID
BREVO_API_KEY
```

### 선택 (설정 권장)
```
OPENAI_API_KEY                          # AI 도메인 생성기 (미설정 시 로컬 fallback)
BREVO_SENDER_EMAIL                      # 발신 이메일 (기본: vnfm0580@gmail.com)
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID    # Google Ads 전환 추적
NEXT_PUBLIC_SITE_URL                    # 사이트 URL (기본: domainchecker.co.kr)
```

### 정리 대상
```
DATABASE_URL    # 미사용
REDIS_URL       # 미사용
REDIS_TOKEN     # 미사용
WHOIS_API_KEY   # 미사용 (RDAP 직접 사용)
```

---

## 6. 페이지/라우트 총 정리 (47개)

### 공개 페이지 (16개)
```
/                           메인 (히어로 + 경매 + 랜딩)
/domain/[name]              도메인 상세 분석
/auctions                   실시간 경매
/market-history             낙찰 이력
/tools                      도구 목록
/tools/bulk-analysis        대량 분석
/tools/domain-compare       도메인 비교
/tools/domain-availability  가용성 확인
/tools/domain-generator     AI 이름 생성
/tools/domain-value         가치 평가
/tools/dns-checker          DNS 조회
/tools/whois-lookup         WHOIS 조회
/tools/domain-expiry        만료일 확인
/tools/ssl-checker          SSL 확인
/tools/http-status          HTTP 상태
/marketplace                프리미엄 도메인 판매
```

### 블로그 (5개)
```
/blog                               목록
/blog/what-is-da                    DA란?
/blog/how-to-choose-domain          도메인 고르는 법
/blog/domain-auction-guide          경매 가이드
/blog/domain-spam-score-check       스팸 점수 확인
```

### 인증 (3개)
```
/login              로그인
/signup             회원가입
/forgot-password    비밀번호 찾기
```

### 사용자 전용 (10개)
```
/account                    내 계정
/account/change-password    비밀번호 변경
/inquiry                    경매 대행 문의
/marketplace/inquiry        도메인 구매 문의
/pricing                    요금제
/dashboard                  대시보드
/dashboard/history          분석 이력
/dashboard/favorites        즐겨찾기
/dashboard/inquiries        내 문의
/dashboard/purchases        구매 내역
/dashboard/plan             내 플랜
/dashboard/settings         프로필 설정
```

### 어드민 (1개)
```
/admin                      관리자 대시보드
```

### API (22개)
```
/api/domain/[name]              도메인 분석
/api/domains                    도메인 목록
/api/sold-domains               낙찰 이력
/api/active-auctions            실시간 경매
/api/tld-stats                  TLD 통계
/api/domain-availability        가용성 확인
/api/domain-generator           AI 생성기
/api/dns-lookup                 DNS 조회
/api/whois-lookup               WHOIS 조회
/api/ssl-check                  SSL 확인
/api/http-status                HTTP 상태
/api/checkout                   LemonSqueezy 체크아웃
/api/webhooks/lemonsqueezy      결제 웹훅
/api/customer-portal            구독 관리 포탈
/api/broker-inquiry             경매 대행 문의
/api/marketplace-inquiry        도메인 구매 문의
/api/admin/listings             판매 도메인 관리
/api/admin/inquiries            문의 관리
/api/dashboard/history          분석 이력 (더보기)
/api/dashboard/favorites        즐겨찾기 CRUD
/api/submissions/public         브라우저 확장 스팸 방지
/auth/callback                  OAuth 콜백
```
