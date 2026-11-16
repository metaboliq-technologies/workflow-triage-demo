import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createDemoServer} from './serve.mjs';

test('local server serves only the lab assets with no data-upload endpoint',async(t)=>{
  const server=createDemoServer();
  server.listen(0,'127.0.0.1');
  await once(server,'listening');
  const base=`http://127.0.0.1:${server.address().port}`;
  try {
    for (const [path,type] of [['/','text/html'],['/app.mjs','text/javascript'],['/triage.mjs','text/javascript']]) {
      const response=await fetch(base+path);
      assert.equal(response.status,200);
      assert.ok(response.headers.get('content-type').includes(type));
      assert.match(response.headers.get('content-security-policy'),/connect-src 'none'/);
      assert.equal(response.headers.get('cache-control'),'no-store');
      assert.ok((await response.text()).length>0);
    }
    for (const path of ['/fixtures.json','/LICENSE','/.env','/../package.json','/triage.mjs?secret=1']) {
      assert.equal((await fetch(base+path)).status,404);
    }
    assert.equal((await fetch(base+'/',{method:'POST',body:'synthetic'})).status,404);
  } catch (error) {
    if (error.cause?.code==='EACCES') t.skip('This environment denies loopback connections; run this check in CI.');
    else throw error;
  } finally { await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve())); }
});
test('committed evaluation report matches executable results',async()=>{
  const expected=await readFile(new URL('./evaluation-report.json',import.meta.url),'utf8');
  const generated=spawnSync(process.execPath,[fileURLToPath(new URL('./evaluate.mjs',import.meta.url))],{encoding:'utf8'});
  assert.equal(generated.status,0);
  assert.deepEqual(JSON.parse(generated.stdout),JSON.parse(expected));
});
