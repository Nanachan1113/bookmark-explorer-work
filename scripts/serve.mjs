import {createServer} from 'node:http';
import {readFile, stat, realpath} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, extname, sep} from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const base = await realpath(root);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8'};
const server = createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    const full = await realpath(resolve(base, '.' + path));
    if (full !== base && !full.startsWith(base + sep)) {
      response.writeHead(403); response.end('Forbidden'); return;
    }
    const target = (await stat(full)).isDirectory() ? resolve(full, 'index.html') : full;
    response.writeHead(200, {'Content-Type':mime[extname(target)] ?? 'text/plain; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'});
    response.end(await readFile(target));
  } catch {
    response.writeHead(404); response.end('Not Found');
  }
});
server.on('error', error => {console.error(error.message); process.exitCode = 1;});
server.listen(4173, '127.0.0.1', () => console.log('画面: http://127.0.0.1:4173/explorer/popup.html'));
