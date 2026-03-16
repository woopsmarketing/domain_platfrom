# CURRENT_STATE.md

> 마지막 업데이트: 2026-03-15

---

## 프로젝트 컨셉

**무료 도메인 거래 데이터 분석 도구** — 도메인명만 입력하면 SEO 지수, Whois, 거래 이력을 즉시 분석. 회원가입 없이 누구나 무료 사용.

---

## 사이트 구조 (5개 페이지)

| 페이지 | 설명 |
|--------|------|
| `/` | 검색창 히어로 + 최근 검색 + 인기 검색 + 낙찰 하이라이트 |
| `/domain/[name]` | 도메인 상세 분석 (등급/스팸/나이/Whois/SEO/거래이력/Wayback) |
| `/market-history` | 낙찰 이력 테이블 (최근/고가/전체 탭) |
| `/tools` | 분석 도구 (벌크 분석 / 도메인 비교 / TLD 통계 — 탭 통합) |
| `/blog` + `/blog/[slug]` | SEO 콘텐츠 3편 |

---

## 크롤러 구조

### CSV 크롤러 (낙찰 이력 적재 — 기존)
- GoDaddy: 공개 CSV ZIP → `sales_history` 저장
- Namecheap: S3 공개 CSV → `sales_history` 저장
- 실행: `python3 -m crawler.run --mode csv`

### 실시간 스크래퍼 (활성 경매 — 신규)
- Playwright 기반, 내부 API 인터셉트
- GoDaddy + Namecheap 경매 페이지에서 JSON 자동 수집
- `active_auctions` 테이블에 upsert
- 실행: `python3 -m crawler.run --mode live`

### Watcher (상시 감시 — 신규, Railway 배포용)
- 10~15초 간격 핫 경매 폴링
- 낙찰 감지: Namecheap 스냅샷 diff (사라진 도메인 = 낙찰)
- 실행: `python3 -m crawler.watcher`

---

## DB 스키마 (5개 테이블)

| 테이블 | 용도 |
|--------|------|
| `domains` | 도메인 기본 정보 (status: sold/expired/active) |
| `domain_metrics` | SEO 지수, 7일 캐시 |
| `sales_history` | 낙찰 이력 (CSV 크롤러로 적재) |
| `wayback_summary` | Wayback 스냅샷 요약 |
| `active_auctions` | 현재 진행 중인 경매 (실시간 갱신, source 컬럼 없음) |

---

## 구현 완료 기능

- 도메인 검색 → 즉시 분석 (DB 자동 생성 + 7일 캐시)
- SEO 지수 (DA/DR/TF/CF/백링크/트래픽) + 등급 뱃지 A~F
- Whois 조회 + 도메인 나이 계산
- 스팸 점수 경고 (위험/주의)
- 거래 이력 + Wayback 히스토리
- 벌크 도메인 분석 (최대 10개)
- 도메인 비교 (2~3개, 승자 하이라이트)
- TLD별 거래 통계
- 최근 검색 / 인기 검색 TOP 10 / 낙찰 하이라이트
- OG/Twitter 메타태그 (소셜 공유)
- 블로그 SEO 콘텐츠 3편
- CSV 크롤러 (GoDaddy + Namecheap)
- **[신규]** Playwright 실시간 스크래퍼 (godaddy_live, namecheap_live)
- **[신규]** Watcher (상시 감시 + 낙찰 자동 감지)
- **[신규]** active_auctions 테이블 + API

---

## 미완료

- [ ] Supabase 프로젝트 생성 + migration.sql 실행 (active_auctions 테이블 포함)
- [ ] .env.local 환경변수 입력
- [ ] Playwright 첫 실행 테스트 (`playwright install chromium`)
- [ ] GoDaddy / Namecheap 내부 API URL 확인 (첫 실행 시 로그 확인)
- [ ] RapidAPI 키 발급
- [ ] Vercel 배포
- [ ] Railway 배포 (Watcher 상시 실행)
- [ ] 프론트엔드 "인기 경매 섹션" UI 구현 (active_auctions 데이터 활용)
