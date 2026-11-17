import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {verifyContinuation} from './sensitive-continuation.mjs';
import {selectUntouchedCases,continueCases,safeQuotaHints,quotaObservingFetch} from './continuation-runner.mjs';
import {ModelError} from './model-adapter.mjs';
const read=n=>readFile(new URL('./'+n,import.meta.url),'utf8');
test('continuation verifies actual frozen source and selects exactly the twelve untouched cases',async()=>{
  const {cases,plan,original}=await verifyContinuation();assert.deepEqual(cases.map(c=>c.input.id),Array.from({length:12},(_,i)=>`v9-${String(i+29).padStart(3,'0')}`));assert.equal(original.apiAttempts,28);
  const dataset=JSON.parse(await read('sensitive-evaluation.json'));
  for(const change of [p=>p.ids[0]='v9-028',p=>p.spacingMs=6500,p=>p.maxApiAttempts=25]){const modified=structuredClone(plan);change(modified);assert.throws(()=>selectUntouchedCases(dataset,original,modified));}
  const altered=structuredClone(original);altered.rows[28].provider={attempts:1};assert.throws(()=>selectUntouchedCases(dataset,altered,plan));
});
test('continuation schedules only selected IDs, records prior budget and preserves original bytes',async()=>{
  const before=await read('sensitive-context-comparison.json'),{cases}=await verifyContinuation(),seen=[],waits=[];
  const r=await continueCases(cases,{sleep:async ms=>waits.push(ms),adapter:{async classify(input){seen.push(input.id);const output={category:'review',evidence:input.subject};return {output,attempts:1,attemptLog:[{attempt:1,outcome:'success'}],firstAttempt:{output}};}}});
  assert.deepEqual(seen,cases.map(c=>c.input.id));assert.equal(r.apiAttempts,12);assert.equal(r.cumulativeApiAttempts,40);assert.equal(r.status,'complete');assert.equal(waits.length,11);assert.ok(waits.every(x=>x===30000));assert.equal(await read('sensitive-context-comparison.json'),before);
});
test('a single 429 stops continuation and leaves eleven cases without correctness credit',async()=>{
  const {cases}=await verifyContinuation();let calls=0;const checkpoints=[];
  const r=await continueCases(cases,{checkpoint:async x=>checkpoints.push(structuredClone(x)),adapter:{async classify(){calls++;const e=new ModelError('provider_http_429',1,429,{stage:'http',httpStatus:429});e.firstAttempt={error:e.code};e.attemptLog=[{attempt:1,error:e.code}];throw e;}}});
  assert.equal(calls,1);assert.equal(r.apiAttempts,1);assert.equal(r.cumulativeApiAttempts,29);assert.equal(r.status,'stopped');assert.equal(r.stopReason,'provider_http_429');assert.equal(r.metrics.model.available,0);assert.equal(r.metrics.model.correct,0);assert.equal(r.rows[1].model.error,'not_attempted_after_provider_http_429');assert.equal(checkpoints.at(-1).status,'stopped');
});
test('quota observer retains bounded categories and delays while returning original response unchanged',async()=>{
  const payload={error:{message:'PRIVATE_CANARY',details:[{'@type':'type.googleapis.com/google.rpc.QuotaFailure',violations:[{quotaId:'GenerateRequestsPerDayPerProjectPerModel-FreeTier',quotaMetric:'generate_content_free_tier_requests',quotaDimensions:{project:'PRIVATE_CANARY'},quotaValue:'500'}]},{'@type':'type.googleapis.com/google.rpc.RetryInfo',retryDelay:'54.5s'}]}};
  assert.deepEqual(safeQuotaHints(payload,'60'),{categories:['requests_per_day'],retryAfterMs:60000,providerRetryDelayMs:54500});
  assert.deepEqual(safeQuotaHints({error:{details:[{'@type':'type.googleapis.com/google.rpc.RetryInfo',retryDelay:'999999s'}]}} ,'PRIVATE_CANARY'),{categories:[],retryAfterMs:null,providerRetryDelayMs:null});
  let hints;const response=await quotaObservingFetch(async()=>new Response(JSON.stringify(payload),{status:429,headers:{'retry-after':'60'}}),x=>hints=x)('https://example.invalid',{});assert.equal(response.status,429);assert.deepEqual(await response.json(),payload);assert.ok(!JSON.stringify(hints).includes('PRIVATE_CANARY'));
});
test('unaccounted adapter failures abort rather than fabricate safe continuation counts',async()=>{
  const {cases}=await verifyContinuation();await assert.rejects(continueCases(cases,{adapter:{async classify(){throw Error('unknown call');}}}),/Unaccounted in-flight/);
});
