# 도메인 경매 크롤러

GoDaddy / Namecheap 낙찰 완료 도메인(bids > 0)을 수집해 Supabase에 저장합니다.

## 설치

```bash
cd /path/to/domain_platfrom
python3 -m venv .venv
source .venv/bin/activate

pip install -r crawler/requirements.txt
playwright install chromium
```

## 실행

```bash
# 모두 실행 (GoDaddy + Namecheap, 각 5페이지)
python3 -m crawler.run

# 소스 지정
python3 -m crawler.run --source godaddy
python3 -m crawler.run --source namecheap

# 페이지 수 지정
python3 -m crawler.run --pages 20
```

## 환경변수

`web/.env.local` 파일에 아래 항목이 있으면 자동으로 읽습니다:

```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 수집 데이터 흐름

```
GoDaddy Auctions (closed, hasBids=true)   ─┐
                                            ├─▶ domains 테이블 upsert (status=sold)
Namecheap Expired Auctions (closedsales)  ─┘      └─▶ sales_history 테이블 insert
```

## 주의사항

- Namecheap 페이지 구조가 변경될 경우 `scrapers/namecheap.py`의 CSS 셀렉터 수정 필요
- 첫 실행 시 `/tmp/namecheap_page1.html` 저장됨 → 구조 확인용
- GoDaddy API 엔드포인트는 내부 API라 변경 가능성 있음
