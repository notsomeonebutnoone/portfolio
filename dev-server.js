import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { loadEnvFile } from 'node:process';
import socials from './api/socials.js';
import xArticles from './api/x-articles.js';

if (existsSync('.env.local')) loadEnvFile('.env.local');

const root = resolve('.');
const port = Number.parseInt(process.env.PORT || '4173', 10);
const host = process.env.HOST || '127.0.0.1';

const rewrites = new Map([
  ['/hardware', '/index.html'],
  ['/software', '/index.html'],
  ['/analyst', '/index.html'],
  ['/socials', '/index.html'],
  ['/socials.html', '/index.html'],
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

createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || host}`);
  const api = { '/api/socials': socials, '/api/x-articles': xArticles }[url.pathname];
  if (api) {
    response.status = code => { response.statusCode = code; return response; };
    response.json = value => { response.setHeader('Content-Type', 'application/json; charset=utf-8'); response.end(JSON.stringify(value)); };
    try { await api(request, response); }
    catch { response.status(500).json({ error: 'Request could not be completed' }); }
    return;
  }
  let pathname = rewrites.get(url.pathname) || url.pathname;

  if (pathname === '/') pathname = '/index.html';

  let filePath;
  try {
    filePath = resolve(root, `.${decodeURIComponent(pathname)}`);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  // Never serve credentials, source-only server code, or repository metadata.
  const relative = filePath.slice(root.length + 1).split(sep);
  if (relative.some(part => part.startsWith('.')) || ['api', 'node_modules', 'tests', 'scripts'].includes(relative[0]) || relative[0] === 'dev-server.js') {
    response.writeHead(404).end('Not found');
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
