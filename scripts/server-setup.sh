#!/usr/bin/env bash
# ONE-TIME, run ON the server by the user (needs sudo):  sudo bash server-setup.sh <host>
# Creates the web root, appends a public static-site block to the Caddyfile, validates, reloads.
# Existing site blocks are not touched.
set -euo pipefail
HOST="${1:?usage: sudo bash server-setup.sh <host>}"
WEBROOT=/var/www/homepage
CADDYFILE=/etc/caddy/Caddyfile
OWNER="${SUDO_USER:-wruszbit}"

grep -q "^$HOST " "$CADDYFILE" && { echo "$HOST already in $CADDYFILE, nothing to do"; exit 0; }
install -d -o "$OWNER" -g "$OWNER" -m 755 "$WEBROOT"
NEW="$(mktemp)"; cp "$CADDYFILE" "$NEW"
cat >> "$NEW" <<CADDY

$HOST {
	tls {
		dns duckdns {env.DUCKDNS_TOKEN}
		resolvers 1.1.1.1
	}
	root * $WEBROOT
	encode zstd gzip
	header {
		X-Content-Type-Options nosniff
		Referrer-Policy strict-origin-when-cross-origin
		-Server
	}
	@hashed path /games/*/play/assets/*
	header @hashed Cache-Control "public, max-age=31536000, immutable"
	file_server
	handle_errors {
		@404 expression {err.status_code} == 404
		handle @404 {
			rewrite * /404.html
			file_server
		}
	}
}
CADDY
caddy validate --config "$NEW" --adapter caddyfile   # live file untouched if this fails
cp -a "$CADDYFILE" "$CADDYFILE.bak.$(date +%Y%m%d-%H%M%S)"
install -m 644 "$NEW" "$CADDYFILE"; rm -f "$NEW"
systemctl reload caddy
echo "ok: $HOST -> $WEBROOT (backup of the old Caddyfile next to it)"
