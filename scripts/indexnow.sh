#!/usr/bin/env bash
# IndexNow ping for AllVerse — run AFTER `git push` so Bing/Yandex/others
# pick up changed pages immediately.
#
# Usage:
#   ./scripts/indexnow.sh              # submit URLs changed in last commit
#   ./scripts/indexnow.sh file1.html file2.html   # submit specific files
#   ./scripts/indexnow.sh --all        # submit every URL in sitemap.xml
#
# No GitHub Actions needed (repo token lacks `workflow` scope).

set -euo pipefail
cd "$(dirname "$0")/.."

HOST="allversetools.github.io"
BASE="https://allversetools.github.io/allverse"
KEY_FILE="3faa8c62de6e70679bd59210dcd67507.txt"
KEY="$(tr -d ' \t\r\n' < "$KEY_FILE")"
KEY_LOCATION="$BASE/$KEY_FILE"

collect_changed() {
  git diff --name-only HEAD~1 HEAD 2>/dev/null | grep '\.html$' || true
}

collect_all() {
  grep -o '<loc>[^<]*</loc>' sitemap.xml | sed 's|<loc>||; s|</loc>||'
}

URLS=()
if [ "${1:-}" = "--all" ]; then
  while IFS= read -r u; do URLS+=("$u"); done < <(collect_all)
elif [ $# -gt 0 ]; then
  for f in "$@"; do
    f="${f#./}"
    URLS+=("$BASE/$f")
  done
else
  while IFS= read -r f; do
    [ -n "$f" ] && URLS+=("$BASE/$f")
  done < <(collect_changed)
fi

if [ "${#URLS[@]}" -eq 0 ]; then
  echo "indexnow: no URLs to submit."
  exit 0
fi

JSON_URLS=$(printf '"%s",' "${URLS[@]}")
JSON_URLS="[${JSON_URLS%,}]"

PAYLOAD=$(cat <<EOF
{"host":"$HOST","key":"$KEY","keyLocation":"$KEY_LOCATION","urlList":$JSON_URLS}
EOF
)

echo "indexnow: submitting ${#URLS[@]} URL(s)..."
CODE=$(curl -s -o /tmp/indexnow_resp.txt -w "%{http_code}" \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$PAYLOAD")
echo "indexnow: HTTP $CODE"
cat /tmp/indexnow_resp.txt; echo
if [ "$CODE" = "200" ] || [ "$CODE" = "202" ]; then
  echo "indexnow: OK"
else
  echo "indexnow: FAILED (see above)" >&2
  exit 1
fi
