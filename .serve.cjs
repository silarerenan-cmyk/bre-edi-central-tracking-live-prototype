const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 8765;
const ROOT = __dirname;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

function send(res, code, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

function serveFile(res, filePath) {
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(filePath).pipe(res);
}

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) return send(res, 403, 'Forbidden');

  fs.stat(filePath, (err, stat) => {
    // Direct file hit
    if (!err && stat.isFile()) return serveFile(res, filePath);

    // Directory hit -> try index.html (with or without trailing slash)
    if (!err && stat.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      return fs.stat(indexPath, (e2, s2) => {
        if (!e2 && s2.isFile()) return serveFile(res, indexPath);
        return send(res, 404, 'Not found (no index.html in directory)');
      });
    }

    // Not found as a file: maybe the user typed "/foo" meaning the directory "/foo/"
    const indexPath = path.join(filePath, 'index.html');
    fs.stat(indexPath, (e2, s2) => {
      if (!e2 && s2.isFile()) return serveFile(res, indexPath);
      return send(res, 404, `Not found: ${urlPath}`);
    });
  });
}).listen(PORT, '127.0.0.1', () => console.log(`Serving ${ROOT} on http://127.0.0.1:${PORT}`));
