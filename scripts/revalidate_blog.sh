#!/usr/bin/env bash
# 배포 후 on-demand revalidate를 일괄 호출.
# 사용법: bash scripts/revalidate_blog.sh
#
# 인증: SUPABASE_SERVICE_ROLE_KEY를 web/.env.local에서 자동 로드.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE_URL="${BASE_URL:-https://www.domainchecker.co.kr}"

KEY="$(python3 -c "
import sys
with open('${ROOT}/web/.env.local', encoding='utf-8') as f:
    for line in f:
        line = line.strip().rstrip('\r')
        if line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
            print(line.split('=', 1)[1].strip().strip('\"').strip(\"'\"))
            break
")"

if [ -z "${KEY}" ]; then
  echo "ERROR: SUPABASE_SERVICE_ROLE_KEY not found in web/.env.local"
  exit 1
fi

SLUGS=(
  "ecommerce-domain-seo-issues"
  "godaddy-vs-namecheap-auction-korea"
  "premium-domain-pricing-factors"
  "domain-flipping-guide"
  "how-to-find-domain-owner"
  "tf-cf-difference"
)

# 리스트 페이지 1회 + 각 글
for slug in "${SLUGS[@]}"; do
  echo "→ revalidating /blog/${slug}"
  curl -sS -X POST "${BASE_URL}/api/revalidate-blog" \
    -H "Authorization: Bearer ${KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"slug\":\"${slug}\"}"
  echo
done

echo "✓ done"
