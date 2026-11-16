import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createGeminiAdapter,MODEL_POLICY,LEGACY_MODEL_POLICY,ModelError,modelDecision,guardedModelDecision} from './model-adapter.mjs';
import {compareCases,score} from './compare.mjs';

const input={id:'adapter-test',subject:'Invoice copy',body:'Please share the fictional invoice.'};
const output={category:'billing',evidence:'invoice'};
const payload=(value=output,extra={})=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(value)}]}}],modelVersion:'gemini-3.8-flash',usageMetadata:{promptTokenCount:20,candidatesTokenCount:8,totalTokenCount:28},...extra});
const response=value=>new Response(JSON.stringify(value),{headers:{'content-type':'application/json'}});
const make=fetchImpl=>createGeminiAdapter({apiKey:'test-key-not-a-real-credential',fetchImpl,sleep:async()=>{}});

test('real REST request has fixed HTTPS destination, header authentication and no labels',async()=>{
  let sent;
  const adapter=make(async(url,options)=>{sent={url,options};return response(payload());});
  const result=await adapter.classify(input);
  assert.equal(sent.url,'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent');
  assert.equal(sent.options.headers['x-goog-api-key'],'test-key-not-a-real-credential');
  assert.equal(sent.options.redirect,'error');
  assert.ok(!sent.url.includes('test-key'));
  const body=JSON.parse(sent.options.body);
  assert.equal(body.systemInstruction.parts[0].text,MODEL_POLICY);
  assert.deepEqual(JSON.parse(body.contents[0].parts[0].text),input);
  assert.equal(body.generationConfig.responseMimeType,'application/json');
  assert.equal(body.generationConfig.maxOutputTokens,1024);
  assert.deepEqual(result.output,output);
  assert.equal(result.attempts,1);
  assert.equal(result.modelVersion,'gemini-3.8-flash');
  assert.equal(result.usage.totalTokenCount,28);
});
test('credentials, model paths and resource limits are validated before any call',()=>{
  for(const options of [{},{apiKey:'x\r\ny'},{apiKey:'x',model:'../../evil'},{apiKey:'x',model:'https://evil.example'},
    {apiKey:'x',timeoutMs:0},{apiKey:'x',maxAttempts:10}])assert.throws(()=>createGeminiAdapter(options),ModelError);
});
test('model may request review; guarded arm preserves baseline abstention and rejects disagreement',()=>{
  assert.equal(modelDecision(input,{category:'review',evidence:'invoice'}).requiresHumanReview,true);
  const unknown={...input,subject:'New topic',body:'How do I recover my sign-in passphrase?'};
  assert.equal(modelDecision(unknown,{category:'access',evidence:'passphrase'}).route,'access');
  assert.equal(guardedModelDecision(unknown,{category:'access',evidence:'passphrase'}).route,null);
  assert.equal(guardedModelDecision(input,{category:'technical',evidence:'invoice'}).reason,'model_baseline_disagreement');
  assert.equal(guardedModelDecision({...input,body:'The patient invoice is ready.'},output).reason,'sensitive_context');
});
test('fabricated evidence, extra fields and unknown categories do not become decisions',async()=>{
  for(const value of [{category:'billing',evidence:'made up quote'}, {category:'other',evidence:'invoice'},
    {...output,action:'send'}, {category:'billing',evidence:'i'},null,[]]){
    await assert.rejects(make(async()=>response(payload(value))).classify(input),{code:'invalid_model_decision'});
  }
});
test('blocked, truncated, missing and non-JSON provider outputs fail closed',async()=>{
  const bad=[{promptFeedback:{blockReason:'SAFETY'}},payload(output,{candidates:[]}),
    payload(output,{candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'{}'}]}}]}),
    payload(output,{candidates:[{finishReason:'STOP',content:{parts:[{functionCall:{name:'execute'}}]}}]}),
    payload(output,{candidates:[{finishReason:'STOP',content:{parts:[{text:'not JSON'}]}}]})];
  for(const value of bad)await assert.rejects(make(async()=>response(value)).classify(input),ModelError);
  await assert.rejects(make(async()=>new Response('not JSON')).classify(input),{code:'invalid_provider_json'});
});
test('bounded responses reject excessive declared and streamed bodies',async()=>{
  await assert.rejects(make(async()=>new Response('{}',{headers:{'content-length':'999999'}})).classify(input),{code:'response_too_large'});
  await assert.rejects(make(async()=>new Response(' '.repeat(65537))).classify(input),{code:'response_too_large'});
});
test('429 and 503 retry once; authentication and network errors do not retry or expose bodies',async()=>{
  for(const status of [429,503]){
    let count=0;
    const result=await make(async()=>++count===1?new Response('private-provider-detail',{status}):response(payload())).classify(input);
    assert.equal(count,2);assert.equal(result.attempts,2);
  }
  let count=0;
  await assert.rejects(make(async()=>{count++;return new Response('DO_NOT_ECHO_SECRET',{status:401});}).classify(input),error=>error.code==='provider_http_401'&&!error.message.includes('DO_NOT_ECHO'));
  assert.equal(count,1);
  count=0;
  await assert.rejects(make(async()=>{count++;throw new Error('DO_NOT_ECHO_KEY');}).classify(input),{code:'provider_transport_error'});
  assert.equal(count,1);
  count=0;
  await assert.rejects(make(async()=>{count++;return new Response('rate-limited',{status:429});}).classify(input),{code:'provider_http_429',attempts:2});
  assert.equal(count,2);
});
test('request timeout aborts a hung transport without an unbounded retry',async()=>{
  let count=0;
  const adapter=createGeminiAdapter({apiKey:'test',timeoutMs:10,fetchImpl:async(url,{signal})=>{
    count++;return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));
  }});
  await assert.rejects(adapter.classify(input),{code:'provider_timeout'});assert.equal(count,1);
});
test('provider failures are not counted as correct review classifications',()=>{
  const rows=[{expected:{route:null,requiresHumanReview:true},model:{error:'provider_timeout',route:null,requiresHumanReview:true}}];
  assert.deepEqual({...score(rows,'model')},{total:1,available:0,errors:1,correct:0,exactMatchRate:0,proposals:0,correctProposals:0,proposalPrecision:null,expectedReview:1,caughtReview:0,reviewRecall:0,unnecessaryReview:0});
});
test('authentication failure stops further provider calls while keeping baseline rows',async()=>{
  const dataset=JSON.parse(await readFile(new URL('./fresh-evaluation.json',import.meta.url),'utf8'));
  let calls=0;
  const adapter={async classify(){calls++;throw new ModelError('provider_http_401',1,401);}};
  const report=await compareCases(dataset,{adapter,sleep:async()=>{},delayMs:0});
  assert.equal(calls,1);assert.equal(report.rows.length,40);
  assert.equal(report.metrics.model.errors,40);assert.equal(report.metrics.baseline.available,40);
  assert.equal(report.rows[1].provider.attempts,0);
});
test('fresh set has 40 unique new inputs; labels never enter adapter calls',async()=>{
  const bytes=await readFile(new URL('./fresh-evaluation.json',import.meta.url),'utf8');
  const dataset=JSON.parse(bytes);
  const old=JSON.parse(await readFile(new URL('./fixtures.json',import.meta.url),'utf8'));
  const normalize=input=>`${input.subject}\n${input.body}`.normalize('NFKC').toLowerCase();
  const oldInputs=new Set(old.map(c=>normalize(c.input)));
  assert.equal(dataset.cases.length,40);
  assert.equal(new Set(dataset.cases.map(c=>normalize(c.input))).size,40);
  assert.ok(dataset.cases.every(c=>!oldInputs.has(normalize(c.input))));
  let calls=0;
  const mockedAdapter={async classify(request){
    assert.deepEqual(Object.keys(request).sort(),['body','id','subject']);calls++;
    throw new ModelError('mock-only',1);
  }};
  const result=await compareCases(dataset,{adapter:mockedAdapter,sleep:async()=>{},delayMs:0});
  assert.equal(calls,40);assert.equal(result.metrics.model.correct,0);assert.equal(result.metrics.model.errors,40);
  const report=JSON.parse(await readFile(new URL('./fresh-baseline-report.json',import.meta.url),'utf8'));
  assert.equal(report.datasetSha256,createHash('sha256').update(bytes).digest('hex'));
  assert.equal(report.promptSha256,createHash('sha256').update(LEGACY_MODEL_POLICY).digest('hex'));
  assert.deepEqual(result.metrics.baseline,report.metrics.baseline);
});
