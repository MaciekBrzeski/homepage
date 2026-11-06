#!/usr/bin/env bash
# ONE-TIME, on the server:  sudo bash server-tls-http.sh maciejbrzeski.duckdns.org
# Removes the duckdns dns-01 tls block from ONE site block so Caddy uses the default
# HTTP-01/TLS-ALPN challenge (needs ports 80/443 reachable; no DuckDNS token involved).
set -euo pipefail
HOST="${1:?usage: sudo bash server-tls-http.sh <host>}"
CADDYFILE=/etc/caddy/Caddyfile
NEW="$(mktemp)"
awk -v host="$HOST" '
  $0 ~ "^"host" \\{" { inside=1 }
  inside && /^\ttls \{/ { skip=1; next }
  skip { if (/^\t\}/) skip=0; next }
  inside && /^\}/ { inside=0 }
  { print }
' "$CADDYFILE" > "$NEW"
diff -u "$CADDYFILE" "$NEW" || true
caddy validate --config "$NEW" --adapter caddyfile   # live file untouched if this fails
cp -a "$CADDYFILE" "$CADDYFILE.bak.$(date +%Y%m%d-%H%M%S)"
install -m 644 "$NEW" "$CADDYFILE"; rm -f "$NEW"
systemctl reload caddy
echo "ok: $HOST now uses HTTP-01; watch: journalctl -u caddy -f | grep $HOST"
