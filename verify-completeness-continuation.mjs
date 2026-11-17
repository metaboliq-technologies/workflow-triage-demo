import fs from 'node:fs';import assert from 'node:assert/strict';
import {verifyContinuation} from './completeness-continuation.mjs';import {combineContinuation} from './completeness-continuation-runner.mjs';import {validateModelDecision,modelDecision,guardedModelDecision} from './model-adapter.mjs';import {digest} from './completeness-review.mjs';
const read=n=>fs.readFileSync(new URL(n,import.meta.url),'utf8');
const {original,plan,selected}=await verifyContinuation(),continuation=JSON.parse(read('completeness-continuation-comparison.json')),dataset=JSON.parse(read('completeness-evaluation.json'));
assert.equal(continuation.sourceCommit,'e989d5d5edf1e207c9397d03cd128651dbdf8410');assert.equal(continuation.originalReportSha256,plan.originalReportSha256);assert.deepEqual(continuation.selectedClassifications,plan.classifications);assert.equal(continuation.rows.length,29);assert.equal(continuation.status,'complete');assert.equal(continuation.invocations,29);assert.equal(continuation.apiAttempts,31);assert.equal(continuation.cumulativeApiAttempts,42);assert.equal(continuation.stopReason,null);
for(const[n,h]of Object.entries(continuation.continuationFiles))assert.equal(digest(read(n)),h,n);
let attempts=0,failedAttempts=0;for(const [i,r]of continuation.rows.entries()){
  const c=selected[i],input=dataset.cases.find(c=>c.input.id===r.id).input;assert.equal(r.id,c.id);assert.equal(r.arm,c.arm);assert.deepEqual(r.expected,c.expected);assert.equal(r.provider.error,undefined);assert.equal(r.provider.attempts,r.provider.attemptLog.length);attempts+=r.provider.attempts;failedAttempts+=r.provider.attemptLog.filter(a=>a.error).length;
  validateModelDecision(input,r.provider.output);assert.deepEqual(r.model,modelDecision(input,r.provider.output));assert.deepEqual(r.guarded,guardedModelDecision(input,r.provider.output));
  if(!r.provider.firstAttempt.error){validateModelDecision(input,r.provider.firstAttempt.output);assert.deepEqual(r.first,modelDecision(input,r.provider.firstAttempt.output));}else assert.equal(r.first.error,r.provider.firstAttempt.error);
}
assert.equal(attempts,31);assert.equal(failedAttempts,2);
const joined=combineContinuation(original,continuation,plan);assert.deepEqual(JSON.parse(read('completeness-combined-comparison.json')),joined);
for(const r of original.rows)for(const arm of ['previous','updated'])if(r.providers[arm]!==null){const j=joined.rows.find(x=>x.id===r.id);assert.deepEqual(j.providers[arm],r.providers[arm]);for(const a of [arm,arm+'First','guarded'+arm[0].toUpperCase()+arm.slice(1)])assert.deepEqual(j[a],r[a]);}
assert.equal(joined.rows[5].providers.updated.error,'provider_http_429');
console.log(JSON.stringify({verified:true,selectedClassifications:29,newAttempts:31,cumulativeAttempts:42,newFailedAttempts:2,originalFailedCallPreserved:true,allOriginalOutputsPreserved:true,allQuotesMechanicallyValid:true,semanticQuality:'separate AI judgment; not established by this verifier'}));
