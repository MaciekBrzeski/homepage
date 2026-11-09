#!/usr/bin/env node
// Serve out/ the way Caddy's file_server does in production, for e2e tests and local checks.
//   - /dir      -> 308 redirect to /dir/
//   - /dir/     -> /dir/index.html
//   - missing   -> /404.html with status 404 (Caddy's handle_errors)
// Everything is sent with Cache-Control: no-store, so a browser never tests a stale build.
// Usage: node scripts/serve.mjs [dir=out] [port=4300]
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] ?? 'out');
const port = Number(process.argv[3] ?? process.env.PORT ?? 4300);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.stl': 'model/stl',
  '.txt': 'text/plain; charset=utf-8',
};

if (!existsSync(join(root, 'index.html'))) {
  console.error(`serve: ${root}/index.html not found. Run "npm run build:site" first.`);
  process.exit(1);
}

function send(res, status, file) {
  res.writeHead(status, {
    'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(file).pipe(res);
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let path;
  try {
    path = decodeURIComponent(url.pathname);
  } catch {
    return send(res, 404, join(root, '404.html'));
  }
  const file = normalize(join(root, path));
  if (file !== root && !file.startsWith(root + sep)) return send(res, 404, join(root, '404.html'));

  const stat = existsSync(file) ? statSync(file) : null;
  if (stat?.isDirectory()) {
    if (!url.pathname.endsWith('/')) {
      res.writeHead(308, {
        Location: url.pathname + '/' + url.search,
        'Cache-Control': 'no-store',
      });
      return res.end();
    }
    const index = join(file, 'index.html');
    return existsSync(index) ? send(res, 200, index) : send(res, 404, join(root, '404.html'));
  }
  if (stat?.isFile()) return send(res, 200, file);
  send(res, 404, join(root, '404.html'));
}).listen(port, '127.0.0.1', () => console.log(`serve: ${root} on http://127.0.0.1:${port}`));
