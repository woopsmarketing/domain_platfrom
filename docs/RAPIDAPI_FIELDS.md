# RapidAPI domain-metrics-check 응답 필드 설명

> API: `GET https://domain-metrics-check.p.rapidapi.com/domain-metrics/{domain}/`

---

## 기본 정보

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | number | API 내부 ID |
| `domain` | string | 조회한 도메인명 |
| `last_updated` | string | API 데이터 마지막 갱신일 |
| `domainAsEntered` | string/null | 입력된 원본 도메인 (보통 null) |

---

## Moz 지표

| 필드 | 타입 | 설명 | 범위 | 중요도 |
|------|------|------|------|--------|
| `mozDA` | string | **Domain Authority** — 도메인의 검색 순위 영향력. 높을수록 SEO에 유리 | 0~100 | ★★★ |
| `mozPA` | string | **Page Authority** — 특정 페이지의 순위 영향력 | 0~100 | ★★ |
| `mozLinks` | number | Moz가 감지한 총 링크 수 | - | ★ |
| `mozRank` | string | **MozRank** — 링크 인기도 (PageRank 유사) | 0~10 | ★ |
| `mozTrust` | string | **MozTrust** — 신뢰할 수 있는 사이트로부터의 링크 품질 | 0~10 | ★★ |
| `mozSpam` | string | **Spam Score** — 스팸 사이트일 가능성. 높을수록 위험 | 0~17 | ★★★ |

---

## Majestic 지표

| 필드 | 타입 | 설명 | 범위 | 중요도 |
|------|------|------|------|--------|
| `majesticTF` | number | **Trust Flow** — 신뢰도 높은 사이트에서 오는 백링크 품질 | 0~100 | ★★★ |
| `majesticCF` | number | **Citation Flow** — 백링크의 양적 영향력 | 0~100 | ★★★ |
| `majesticLinks` | number | Majestic이 감지한 총 백링크 수 | - | ★★ |
| `majesticRefDomains` | number | 백링크를 보낸 고유 도메인 수 (많을수록 좋음) | - | ★★★ |
| `majesticRefEDU` | number | .edu 도메인에서 온 백링크 수 (교육기관 = 고품질) | - | ★★ |
| `majesticRefGov` | number | .gov 도메인에서 온 백링크 수 (정부기관 = 고품질) | - | ★★ |
| `majesticRefSubnets` | number | 백링크가 오는 고유 서브넷 수 (다양성 지표) | - | ★ |
| `majesticRefIPs` | number | 백링크가 오는 고유 IP 수 | - | ★ |
| `majesticIPs` | number/null | IP 관련 추가 데이터 | - | - |
| `majesticStatReturned` | string | 반환된 통계 유형 ("Default" 등) | - | - |
| `majesticTTF0Name` | string | **Topical Trust Flow** 1순위 주제 카테고리 | - | ★★ |
| `majesticTTF0Value` | number | 1순위 주제 신뢰도 점수 | 0~100 | ★★ |
| `majesticTTF1Name` | string | 2순위 주제 카테고리 | - | ★ |
| `majesticTTF1Value` | number | 2순위 주제 신뢰도 점수 | 0~100 | ★ |
| `majesticTTF2Name` | string | 3순위 주제 카테고리 | - | ★ |
| `majesticTTF2Value` | number | 3순위 주제 신뢰도 점수 | 0~100 | ★ |

---

## Ahrefs 지표

| 필드 | 타입 | 설명 | 범위 | 중요도 |
|------|------|------|------|--------|
| `ahrefsDR` | number | **Domain Rating** — 백링크 프로필 강도. DA와 함께 가장 널리 쓰이는 지표 | 0~100 | ★★★ |
| `ahrefsBacklinks` | number | Ahrefs가 감지한 총 백링크 수 | - | ★★ |
| `ahrefsRefDomains` | number | 백링크를 보낸 고유 도메인 수 | - | ★★★ |
| `ahrefsTraffic` | number | 추정 월간 오가닉 트래픽 (검색 유입) | - | ★★★ |
| `ahrefsTrafficValue` | number | 추정 트래픽의 광고 가치 (USD/월). 해당 트래픽을 광고로 사면 얼마인지 | - | ★★ |
| `ahrefsOrganicKeywords` | number | 검색 결과에 노출되는 키워드 수 | - | ★★ |
| `ahrefsRank` | number | Ahrefs 글로벌 순위 (낮을수록 좋음) | - | ★ |

---

## 소셜/기타 (대부분 비활성)

| 필드 | 타입 | 설명 | 상태 |
|------|------|------|------|
| `FB_comments` | number/null | Facebook 댓글 수 | 보통 null |
| `FB_shares` | number/null | Facebook 공유 수 | 보통 null |
| `stumbles` | number/null | StumbleUpon 수 | 서비스 종료, null |
| `pinterest_pins` | number/null | Pinterest 핀 수 | 보통 null |
| `prettyLinksIn` | number | 인바운드 링크 (Open PageRank) | 0이 많음 |
| `prettyLinksOut` | number | 아웃바운드 링크 | 0이 많음 |
| `prettyPageCount` | number | 색인된 페이지 수 | 0이 많음 |
| `prettyLinksEdu` | number | .edu 링크 수 | 0이 많음 |
| `prettyLinksGov` | number | .gov 링크 수 | 0이 많음 |
| `prettyLinksDofollow` | number | dofollow 링크 수 | 0이 많음 |

---

## 현재 사용 중인 필드 vs 추가 추천

### 현재 사용 중 (8개)
- `mozDA`, `mozSpam`, `ahrefsDR`, `ahrefsTraffic`, `ahrefsBacklinks`, `ahrefsTrafficValue`, `majesticTF`, `majesticCF`

### 추가하면 좋은 필드 (7개)
| 필드 | 이유 |
|------|------|
| `mozPA` | DA와 함께 보면 페이지 단위 분석 가능 |
| `ahrefsRefDomains` | 백링크 다양성 — 단순 수보다 중요한 지표 |
| `ahrefsOrganicKeywords` | SEO 키워드 노출 수 — 트래픽 잠재력 판단 |
| `majesticRefDomains` | 참조 도메인 수 — 링크 품질 판단 |
| `majesticRefEDU` | .edu 백링크 — 도메인 신뢰도 보너스 |
| `majesticRefGov` | .gov 백링크 — 도메인 신뢰도 보너스 |
| `majesticTTF0Name` | 도메인 주제 카테고리 — 어떤 분야인지 한눈에 파악 |
