# 개발 세션 로그 — DomainPulse

> 최종 업데이트: 2026-03-15

---

## 프로젝트 한 줄 요약

도메인 투자자·SEO 전문가를 위한 **도메인 거래 데이터 분석 플랫폼**.
회원가입 없이 도메인명만 입력하면 SEO 지수, Whois, 거래 이력을 즉시 무료 분석.

---

## 지금까지 한 작업

### 1단계 — 기획 확정
- `PRD.md`, `CLAUDE.md`, 세션 문서 작성

### 2단계 — Next.js 앱 구현
```
web/src/
├── app/
│   ├── page.tsx                  ← 메인 (검색창 히어로 + 최근 낙찰 목록)
│   ├── domain/[name]/page.tsx    ← 도메인 상세 (Whois/SEO/거래이력/Wayback)
│   └── api/
│       ├── domains/route.ts      ← 낙찰 도메인 목록 API
│       └── domain/[name]/route.ts ← 도메인 상세 API
├── components/
│   ├── domain/domain-search-box.tsx ← 검색 박스 (클라이언트)
│   ├── domain/domain-table.tsx      ← 낙찰 도메인 테이블
│   ├── domain/stats-overview.tsx    ← 통계 카드
│   └── layout/header, footer
├── lib/
│   ├── db/domains.ts             ← 도메인 DB 쿼리
│   ├── external/rapidapi.ts      ← RapidAPI SEO 지수 (7일 캐시)
│   ├── external/wayback.ts       ← Wayback Machine CDX
│   ├── external/whois.ts         ← WhoisXML API
│   └── supabase.ts
└── types/domain.ts
```

**DB 테이블 (4개 → 5개):**
- `domains` — status: sold/expired/active
- `domain_metrics` — SEO 지수 (7일 캐시)
- `sales_history` — 낙찰 이력
- `wayback_summary` — Wayback 스냅샷
- `active_auctions` — 현재 진행 중인 경매 (신규)

### 3단계 — 크롤러 구현 (CSV 방식)
- GoDaddy: 공개 CSV ZIP → 낙찰 도메인 (bids > 0)
- Namecheap: S3 공개 CSV → 낙찰 도메인 (종료 + price > 0)

### 4단계 — 컨셉 리팩토링
- "경매 중개" → "거래 데이터 분석 플랫폼"으로 전환
- 마켓플레이스/구매문의/장바구니 제거

### 5단계 — MVP 경량화 + SEO 최적화
- 회원가입/로그인/마이페이지/위시리스트 제거
- 메인 페이지를 **검색창 중심 히어로**로 리디자인
- SEO 메타태그 최적화
- 도메인 상세 페이지 동적 메타태그

### 6단계 — 실시간 크롤러 구현 (2026-03-15)

**배경**: Namecheap CSV는 진행 중인 경매만 제공 (낙찰 완료 이력 없음). 실시간 경매 데이터와 낙찰 감지가 필요.

**구현 내용:**
```
crawler/
├── scrapers/
│   ├── godaddy_live.py      ← GoDaddy 실시간 스크래퍼 (Playwright + API 인터셉트)
│   └── namecheap_live.py    ← Namecheap 실시간 스크래퍼 (Playwright + API 인터셉트)
└── watcher.py               ← 상시 감시자 (낙찰 자동 감지, Railway 배포용)
```

**크롤링 전략:**
- Playwright로 경매 페이지 로드 → 내부 JSON API 자동 인터셉트
- 낙찰 감지: Namecheap 스냅샷 diff (이전에 있다가 사라진 도메인 = 낙찰)
- `active_auctions` 테이블에 플랫폼명 없이 저장 (UI에 플랫폼 비노출)

**DB 추가:**
- `active_auctions` 테이블: domain(PK), tld, current_price, bid_count, end_time_raw, crawled_at

---

## 현재 상태

| 항목 | 상태 |
|------|------|
| Next.js 앱 코드 | ✅ 완성 |
| SEO 메타태그 | ✅ 완성 |
| CSV 크롤러 | ✅ 완성 |
| 실시간 스크래퍼 | ✅ 코드 완성 (테스트 필요) |
| Watcher | ✅ 코드 완성 (테스트 필요) |
| Supabase 연결 | ⚠️ 환경변수 필요 |
| RapidAPI | ⚠️ RAPIDAPI_KEY 필요 |
| Playwright 초기화 | ⚠️ `playwright install chromium` 필요 |
| 배포 | ❌ 미완 |
| 인기 경매 UI 섹션 | ❌ 미구현 (active_auctions 데이터 필요) |

---

## MVP 전략

1. **회원가입 없음** → 방문자 부담 제거, 즉시 사용
2. **완전 무료** → 트래픽 확보에만 집중
3. **SEO 키워드 타겟**: "무료 도메인 DA 체크", "도메인 품질 검사", "도메인 지수 확인"
4. **킬러 기능**: 도메인명 입력 → 즉시 분석 결과
5. **추후 확장**: 트래픽 확보 후 대행 구매/판매, 프리미엄 기능, 인기 경매 섹션
