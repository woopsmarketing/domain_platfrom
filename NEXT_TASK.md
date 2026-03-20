# NEXT_TASK.md

> 마지막 업데이트: 2026-03-20 (세션 2)

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
| 커스텀 로고 SVG (시계 아이콘) | ✅ |
| 파비콘 (icon.svg) | ✅ |
| **SEO / 메타데이터** | |
| sitemap.xml (정적 + 동적 도메인 5000개) | ✅ |
| robots.txt (AI 크롤러 허용) | ✅ |
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
| **Claude Code 도구** | |
| 서브에이전트 25종 설정 | ✅ |
| 스킬 6종 (hook-creator, skill-creator, slash-command 등) | ✅ |

---

## 다음 할 일 (우선순위순)

### P0 — 즉시 (미커밋 작업 정리)

- [ ] **미커밋 파일 커밋** — OG 이미지, 로고 SVG, 헤더 변경, Claude 설정
- [ ] **Google Search Console 등록** → sitemap.xml 제출
- [ ] **Naver Search Advisor 등록** → sitemap.xml 제출
- [ ] **Vercel 환경변수 확인** — 배포 환경에서 RapidAPI 작동 확인

### P1 — 콘텐츠 확장 (SEO 트래픽)

- [ ] 블로그 섹션 (`/blog`) 구조 생성 + MDX 지원
- [ ] 블로그: "DR과 DA 차이점 완벽 정리"
- [ ] 블로그: "만료 도메인으로 돈 버는 5가지 방법"
- [ ] 블로그: "도메인 가치 평가하는 법 — 7가지 기준"
- [ ] 블로그: "백링크란? SEO에서 중요한 이유"
- [ ] 블로그: "도메인 스팸 점수란? 확인 방법과 대처법"

### P2 — 기능 확장

- [ ] **Whois 섹션** — whoisxmlapi.com 키 발급 후 활성화
- [ ] **크롤러 실행** — 낙찰 이력 데이터 적재
- [ ] **Google Analytics** 설치

### P3 — 추후

- [ ] Railway Watcher 배포 (크롤러 상시 실행)
- [ ] 인기 경매 섹션 (active_auctions)
- [ ] 최근 검색 위젯
- [ ] 낙찰이력 섹션 상세 페이지 복구

---

## 현재 환경 상태

| 항목 | 상태 |
|------|------|
| 로컬 pnpm dev | ✅ |
| Supabase DB | ✅ |
| RapidAPI | ✅ 구독 완료 |
| Vercel 배포 | ✅ (환경변수 확인 필요) |
| domainchecker.co.kr | ✅ 연결됨 |
| Google Search Console | ⚠️ 미등록 |
| Naver Search Advisor | ⚠️ 미등록 |
| Whois API | ⚠️ 키 없음 (선택) |
| 크롤러 | ⚠️ 미실행 |

---

## 최근 커밋 이력 (역순)

| 커밋 | 내용 |
|------|------|
| `50bc557` | metadataBase + manifest.json + canonical URL + 불필요 파일 정리 |
| `65b23fb` | robots.txt AI 크롤러 차단 제거 — AI 검색 노출 허용 |
| `75896b2` | robots.txt 구체화 — 검색엔진별 규칙 + AI 크롤러 차단 |
| `78f7f99` | SEO 구조화 데이터 + 성능 최적화 + PageSpeed 이슈 수정 |
| `c37d49a` | 인기검색/낙찰 섹션 히어로 바로 아래로 이동 + FAQ RapidAPI 문구 제거 |
| `3fc6c53` | SaaS 스타일 랜딩 섹션 대폭 확장 |
| `a6d9e0d` | 브랜드 도메인체커 리네임 + SEO 최적화 + 홈 랜딩 개편 |
| `410e024` | Wayback 총 스냅샷 카운트 limit 최적화 |
| `a603447` | 홈 인라인 도메인 요약 카드 구현 |
| `933d7ce` | MVP 전체 구현 완료 |
