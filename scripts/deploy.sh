#!/usr/bin/env bash
# Build, assemble and push the site. Usage: scripts/deploy.sh [--skip-games]
# The target lives in .env.deploy (gitignored), e.g.:
#   DEPLOY_TARGET=user@server.example:/var/www/homepage
set -euo pipefail
cd "$(dirname "$0")/.."
[[ -f .env.deploy ]] && source .env.deploy
: "${DEPLOY_TARGET:?set DEPLOY_TARGET in .env.deploy}"
HOST="$(node -p 'require("./src/content/site.json").host')"

npx ng build
node scripts/assemble.mjs --strict "$@"
rsync -az --delete --chmod=D755,F644 out/ "$DEPLOY_TARGET/"

code() { curl -s -o /dev/null --max-time 15 -w '%{http_code}' "$1" || true; }
fail=0
for p in / /projects/ /games/ $(node -p 'require("./src/content/site.json").games.map(g => `/games/${g.slug}/ /games/${g.slug}/play/`).join(" ")'); do
  c="$(code "https://$HOST$p")"; echo "$c  https://$HOST$p"; [[ "$c" == 200 ]] || fail=1
done
c="$(code "https://$HOST/no-such-page")"; echo "$c  /no-such-page (want 404)"; [[ "$c" == 404 ]] || fail=1
c="$(code "http://$HOST/")"; echo "$c  http:// (want 308 redirect to https)"; [[ "$c" == 308 ]] || echo "  warn: port 80 is not reaching Caddy"
exit "$fail"
