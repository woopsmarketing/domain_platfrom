# 도메인 경매 크롤러

GoDaddy / Namecheap 낙찰 완료 도메인을 수집해 Supabase에 저장합니다.

## 데이터 소스

| 플랫폼 | 방식 | URL |
|---|---|---|
| **GoDaddy** | 공식 인벤토리 CSV.zip | `inventory.auctions.godaddy.com/metadata.json` |
| **Namecheap** | 공개 S3 CSV | `nc-aftermarket-www-production.s3.amazonaws.com/reports/Namecheap_Market_Sales.csv` |

- Playwright **불필요** — 순수 HTTP 요청으로 동작
- GoDaddy: `Bids > 0` 필터링
- Namecheap: `endDate < 오늘` + `price > 0` 필터링

## 설치

```bash
cd /path/to/domain_platfrom
python3 -m venv .venv
source .venv/bin/activate
pip install -r crawler/requirements.txt
```

## 실행

```bash
# 모두 실행 (GoDaddy + Namecheap)
python3 -m crawler.run

# 소스 지정
python3 -m crawler.run --source godaddy
python3 -m crawler.run --source namecheap

# GoDaddy 파일 수 제한, Namecheap 행 수 제한
python3 -m crawler.run --files 2 --rows 1000
```

## 환경변수

`web/.env.local` 파일에 아래 항목이 있으면 자동으로 읽습니다:

```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 저장 테이블

- `domains` — 도메인 기본 정보 (status='sold')
- `sales_history` — 낙찰가, 날짜, 플랫폼

## GoDaddy CSV 컬럼 확인

첫 실행 시 로그에 실제 컬럼명이 출력됩니다:
```
[INFO] 컬럼 목록: ['Domain', 'Bids', 'Price', 'EndTime', ...]
```
컬럼명이 다르면 `scrapers/godaddy.py`의 `COLUMN_MAP`에 추가하세요.
