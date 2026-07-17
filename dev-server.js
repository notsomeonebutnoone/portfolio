import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = resolve('.');
const port = Number.parseInt(process.env.PORT || '4173', 10);
const host = process.env.HOST || '127.0.0.1';

const rewrites = new Map([
  ['/hardware', '/track.html'],
  ['/software', '/track.html'],
  ['/analyst', '/track.html'],
]);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

createServer((request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || host}`);
  let pathname = rewrites.get(url.pathname) || url.pathname;

  if (pathname === '/') pathname = '/index.html';

  let filePath;
  try {
    filePath = resolve(root, `.${decodeURIComponent(pathname)}`);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  if (!filePath.startsWith(`${root}${sep}`) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': contentTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(filePath).pipe(response);
}).listen(port, host, () => {
  console.log(`Portfolio running at http://${host}:${port}`);
});
