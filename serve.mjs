import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const files = new Map([
  ['/', ['index.html','text/html; charset=utf-8']],
  ['/app.mjs', ['app.mjs','text/javascript; charset=utf-8']],
  ['/triage.mjs', ['triage.mjs','text/javascript; charset=utf-8']],
]);
export const createDemoServer=()=>createServer(async(req,res)=>{
  const entry=files.get(req.url);
  if (req.method!=='GET' || !entry) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const bytes=await readFile(new URL(entry[0],import.meta.url));
    res.writeHead(200, {'Content-Type':entry[1], 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff',
      'Content-Security-Policy':"default-src 'self'; style-src 'unsafe-inline'; script-src 'self'; connect-src 'none'; img-src 'none'; base-uri 'none'; frame-ancestors 'none'"});
    res.end(bytes);
  } catch { res.writeHead(500); res.end('Could not load demo asset'); }
});
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const server=createDemoServer();
  server.on('error',()=>{console.error('Could not start the local demo on port 8787.');process.exitCode=1;});
  server.listen(8787,'127.0.0.1',()=>console.log('Open http://127.0.0.1:8787 — local demo, no external services.'));
}
