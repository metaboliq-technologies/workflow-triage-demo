import test from 'node:test';
import assert from 'node:assert/strict';
import {createReliableGeminiAdapter,retryAfterDelay} from './reliable-adapter.mjs';
import {reliabilityEvaluation} from './reliability-runner.mjs';
import {ModelError,NEGATION_REVIEW_POLICY} from './model-adapter.mjs';
const input={id:'dev-reliability',subject:'Invoice copy',body:'Please send the fictional invoice.'},output={category:'billing',evidence:'invoice'};
const good=()=>new Response(JSON.stringify({modelVersion:'gemini-3.5-flash-lite',usageMetadata:{promptTokenCount:10,candidatesTokenCount:5,totalTokenCount:15},candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(output)}]}}]}));
const options={apiKey:'SECRET_CANARY',random:()=>0,sleep:async()=>{}};
test('one transient retry preserves first failure, unchanged prompt, request boundary and all attempts',async()=>{
  let calls=0,wait=0;const a=createReliableGeminiAdapter({...options,sleep:async ms=>{wait=ms;},fetchImpl:async(url,opts)=>{
    assert.equal(opts.redirect,'error');const sent=JSON.parse(opts.body);assert.equal(sent.systemInstruction.parts[0].text,NEGATION_REVIEW_POLICY);assert.deepEqual(JSON.parse(sent.contents[0].parts[0].text),input);
    return ++calls===1?new Response('SECRET_CANARY',{status:503}):good();
  }});const r=await a.classify(input);assert.equal(calls,2);assert.equal(wait,4000);assert.equal(r.attempts,2);assert.equal(r.firstAttempt.error,'provider_http_503');assert.equal(r.reliability.recovered,true);
  assert.deepEqual(r.attemptLog.map(x=>[x.attempt,x.outcome]),[[1,'retry'],[2,'success']]);assert.equal(r.attemptLog[0].error,'provider_http_503');assert.ok(!JSON.stringify(r).includes('SECRET_CANARY'));
});
test('a timed-out attempt aborts before one retry; second success remains visible',async()=>{
  let calls=0,aborted=false;const a=createReliableGeminiAdapter({...options,timeoutMs:10,totalTimeoutMs:5000,fetchImpl:async(url,{signal})=>{
    if(++calls===2)return good();return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>{aborted=true;reject(Error('SECRET_CANARY'));},{once:true}));
  }});const r=await a.classify(input);assert.equal(calls,2);assert.equal(aborted,true);assert.equal(r.firstAttempt.error,'provider_timeout');assert.equal(r.attemptLog[0].timeoutMs,10);
});
test('quota/auth/configuration statuses are never retried and response bodies remain private',async()=>{
  for(const status of [400,401,402,403,404,429,500]){let calls=0;const a=createReliableGeminiAdapter({...options,fetchImpl:async()=>{calls++;return new Response('SECRET_CANARY',{status});}});
    await assert.rejects(a.classify(input),e=>e.code==='provider_http_'+status&&e.attempts===1&&e.firstAttempt.error===e.code&&!JSON.stringify(e).includes('SECRET_CANARY'));assert.equal(calls,1);}
});
test('contract, blocked output and generic transport errors never get retry credit',async()=>{
  for(const fetchImpl of [async()=>new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({category:'billing',evidence:'not in source'})}]}}]})),async()=>new Response(JSON.stringify({promptFeedback:{blockReason:'SAFETY'}})),async()=>{throw Error('SECRET_CANARY');}]){
    let calls=0;const a=createReliableGeminiAdapter({...options,fetchImpl:async(...args)=>{calls++;return fetchImpl(...args);}});await assert.rejects(a.classify(input),e=>e.attempts===1&&e.reliability.retryDeferred==='non_retryable'&&!JSON.stringify(e).includes('SECRET_CANARY'));assert.equal(calls,1);
  }
});
test('retry advice respects supported dates/deltas and declines excessive or malformed waits',async()=>{
  const wall=Date.parse('2026-11-17T00:00:00Z');assert.deepEqual(retryAfterDelay('7',wall),{kind:'accepted',ms:7000});assert.deepEqual(retryAfterDelay('Tue, 17 Nov 2026 00:00:07 GMT',wall),{kind:'accepted',ms:7000});
  assert.equal(retryAfterDelay('9',wall).kind,'too_long');assert.equal(retryAfterDelay('SECRET_CANARY',wall).kind,'invalid');assert.equal(retryAfterDelay(null,wall).kind,'absent');
  for(const [header,expectedCalls,expectedWait]of [['7',2,7000],['9',1,0],['SECRET_CANARY',1,0]]){let calls=0,wait=0;const a=createReliableGeminiAdapter({...options,wallNow:()=>wall,sleep:async ms=>{wait=ms;},fetchImpl:async()=>++calls===1?new Response('private',{status:503,headers:{'Retry-After':header}}):good()});
    try{await a.classify(input);}catch(e){assert.equal(e.attempts,1);assert.ok(!JSON.stringify(e).includes('SECRET_CANARY'));}assert.equal(calls,expectedCalls);assert.equal(wait,expectedWait);}
});
test('classification deadline includes backoff and clips the second attempt',async()=>{
  let t=0,calls=0;const a=createReliableGeminiAdapter({...options,now:()=>t,sleep:async ms=>{t+=ms;},fetchImpl:async()=>{if(++calls===1){t+=29000;return new Response('',{status:503,headers:{'Retry-After':'8'}});}t+=1000;return good();}});
  const r=await a.classify(input);assert.equal(r.attemptLog[0].retryDelayMs,8000);assert.equal(r.attemptLog[1].timeoutMs,28000);assert.equal(r.latencyMs,38000);
});
test('no new attempt starts after a backoff consumes the total budget',async()=>{
  let t=0,calls=0;const a=createReliableGeminiAdapter({...options,now:()=>t,sleep:async()=>{t=66000;},fetchImpl:async()=>{calls++;return new Response('',{status:503});}});
  await assert.rejects(a.classify(input),e=>e.code==='provider_deadline_exceeded'&&e.attempts===1&&e.firstAttempt.error==='provider_http_503');assert.equal(calls,1);
});
test('the last transient failure retains both attempts; invalid limits are rejected',async()=>{
  let calls=0;const a=createReliableGeminiAdapter({...options,fetchImpl:async()=>{calls++;return new Response('',{status:504});}});
  await assert.rejects(a.classify(input),e=>e.code==='provider_http_504'&&e.attempts===2&&e.attemptLog.length===2&&e.reliability.retryDeferred==='retry_limit');assert.equal(calls,2);
  for(const limits of [{maxAttempts:3},{timeoutMs:30001},{totalTimeoutMs:65001}])assert.throws(()=>createReliableGeminiAdapter({...options,...limits}),{code:'invalid_adapter_limits'});
});
const dataset=()=>({cases:Array.from({length:40},(_,i)=>({input:{...input,id:'fixture-'+i},stratum:'development',expected:{route:'billing',requiresHumanReview:false}}))});
const recovered=()=>({output,attempts:2,attemptLog:[{attempt:1,outcome:'retry',error:'provider_http_503'},{attempt:2,outcome:'success'}],firstAttempt:{error:'provider_http_503'},reliability:{recovered:true}});
test('40 classifications reserve at most 80 attempts; labels never enter calls and failures earn no credit',async()=>{
  let calls=0,waits=0;const r=await reliabilityEvaluation(dataset(),{adapter:{async classify(request){assert.deepEqual(Object.keys(request).sort(),['body','id','subject']);calls++;return recovered();}},delayMs:0,sleep:async()=>{waits++;}});
  assert.equal(calls,40);assert.equal(waits,39);assert.equal(r.status,'complete');assert.equal(r.apiAttempts,80);assert.equal(r.metrics.first.correct,0);assert.equal(r.metrics.first.errors,40);assert.equal(r.metrics.model.correct,40);
});
function error(code,attempts){const status=Number(code.match(/\d+$/)?.[0]);const e=new ModelError(code,attempts,Number.isFinite(status)?status:null);e.firstAttempt={error:code};e.attemptLog=Array.from({length:attempts},(_,i)=>({attempt:i+1,outcome:'failure',error:code}));return e;}
test('quota/auth rejection stops the batch without fallback review credit',async()=>{
  for(const status of [400,401,402,403,404,429]){let calls=0;const d=dataset();d.cases.forEach(c=>c.expected={route:null,requiresHumanReview:true});const r=await reliabilityEvaluation(d,{adapter:{async classify(){calls++;throw error('provider_http_'+status,1);}},delayMs:0});
    assert.equal(calls,1);assert.equal(r.status,'stopped');assert.equal(r.stopReason,'provider_http_'+status);assert.equal(r.metrics.model.correct,0);assert.equal(r.metrics.model.errors,40);}
});
test('three consecutive unrecovered transient classifications open the batch circuit',async()=>{
  let calls=0;const r=await reliabilityEvaluation(dataset(),{adapter:{async classify(){calls++;throw error('provider_http_503',2);}},delayMs:0,sleep:async()=>{}});
  assert.equal(calls,3);assert.equal(r.apiAttempts,6);assert.equal(r.status,'stopped');assert.equal(r.rows[3].model.error,'not_attempted_after_three_consecutive_final_transient_failures');
});
test('unknown attempt counts abort rather than fabricate a complete comparison',async()=>{
  await assert.rejects(reliabilityEvaluation(dataset(),{adapter:{async classify(){throw Error('SECRET_CANARY');}},delayMs:0}),/Unaccounted adapter failure/);
});
test('unhandled retry advice stops the batch rather than starting a new request too early',async()=>{
  let calls=0;const r=await reliabilityEvaluation(dataset(),{adapter:{async classify(){calls++;const e=error('provider_http_503',1);e.reliability={retryDeferred:'retry_after_limit'};throw e;}},delayMs:0});
  assert.equal(calls,1);assert.equal(r.stopReason,'unhandled_retry_advice_retry_after_limit');assert.equal(r.rows[1].model.error,'not_attempted_after_unhandled_retry_advice_retry_after_limit');
});
