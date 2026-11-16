import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createGeminiAdapter,validateModelDecision,sanitizeDiagnostics,ModelError} from './model-adapter.mjs';
import {compareCases} from './compare.mjs';
const request={id:'diagnostic',subject:'Support request',body:'Please send the invoice.'};
const valid={category:'billing',evidence:'invoice'};
const payload=decision=>({modelVersion:'gemini-3.5-flash-lite',usageMetadata:{promptTokenCount:30,candidatesTokenCount:10,totalTokenCount:40},
  candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(decision)}]}}]});
const response=value=>new Response(JSON.stringify(value),{headers:{'content-type':'application/json'}});
const make=fetchImpl=>createGeminiAdapter({apiKey:'SECRET_CANARY',model:'gemini-3.5-flash-lite',fetchImpl,sleep:async()=>{}});

test('each output-contract failure has a distinct safe reason',()=>{
  const values=[['object_shape',{...valid,extra:'SECRET_CANARY'}],['object_shape',null],['unsupported_category',{...valid,category:'SECRET_CANARY'}],
    ['evidence_type',{...valid,evidence:42}],['evidence_too_short',{...valid,evidence:'a'}],['evidence_too_long',{...valid,evidence:'x'.repeat(121)}],
    ['evidence_not_in_request',{...valid,evidence:'SECRET_CANARY'}]];
  for(const [reason,value] of values)assert.throws(()=>validateModelDecision(request,value),error=>{
    assert.equal(error.code,'invalid_model_decision');assert.equal(error.diagnostics.validationReason,reason);
    assert.ok(!JSON.stringify(error).includes('SECRET_CANARY'));return true;
  });
});
test('rejected output retains usage and stage but no request, response text or key',async()=>{
  await assert.rejects(make(async()=>response(payload({...valid,evidence:'SECRET_CANARY'}))).classify(request),error=>{
    assert.equal(error.diagnostics.stage,'decision');assert.equal(error.diagnostics.validationReason,'evidence_not_in_request');
    assert.equal(error.diagnostics.usage.totalTokenCount,40);assert.equal(error.diagnostics.modelVersion,'gemini-3.5-flash-lite');
    assert.equal(error.attemptLog.length,1);assert.equal(error.attemptLog[0].outcome,'failure');assert.equal(error.attempts,1);
    assert.ok(Number.isInteger(error.diagnostics.latencyMs));
    for(const text of ['SECRET_CANARY',request.subject,request.body])assert.ok(!JSON.stringify(error).includes(text));return true;
  });
});
test('diagnostic allowlist rejects hostile metadata and unbounded values',()=>{
  const result=sanitizeDiagnostics({stage:'SECRET_CANARY',validationReason:'SECRET_CANARY',finishReason:'SECRET_CANARY',
    latencyMs:-1,candidateCount:Infinity,outputCharacters:1e12,evidenceCharacters:'SECRET_CANARY',
    modelVersion:'SECRET_CANARY',httpStatus:999,usage:{promptTokenCount:NaN,totalTokenCount:40,private:'SECRET_CANARY'},raw:'SECRET_CANARY'});
  assert.deepEqual(result,{usage:{promptTokenCount:null,candidatesTokenCount:null,thoughtsTokenCount:null,totalTokenCount:40}});
});
test('incomplete candidates and invalid JSON retain only bounded candidate metadata',async()=>{
  for(const [finishReason,expectedStage] of [['MAX_TOKENS','candidate'],['STOP','model_json']]){
    const value=payload(valid);value.candidates[0]={finishReason,content:{parts:[{text:'SECRET_CANARY'}]}};
    await assert.rejects(make(async()=>response(value)).classify(request),error=>{
      assert.equal(error.diagnostics.finishReason,finishReason);assert.equal(error.diagnostics.stage,expectedStage);
      assert.equal(error.diagnostics.usage.totalTokenCount,40);assert.ok(!JSON.stringify(error).includes('SECRET_CANARY'));return true;
    });
  }
});
test('retry history survives successful recovery and final HTTP failure',async()=>{
  for(const recover of [true,false]){
    let calls=0;const adapter=make(async()=>++calls===1?new Response('SECRET_CANARY',{status:503}):
      recover?response(payload(valid)):new Response('SECRET_CANARY',{status:429}));
    let result;try{result=await adapter.classify(request);}catch(error){result=error;}
    assert.equal(calls,2);assert.equal(result.attemptLog.length,2);assert.equal(result.attemptLog[0].outcome,'retry');
    assert.equal(result.attemptLog[0].httpStatus,503);assert.equal(result.attemptLog[1].outcome,recover?'success':'failure');
    assert.ok(!JSON.stringify(result).includes('SECRET_CANARY'));
  }
});
test('JSON null, tool-bearing parts and oversized bodies fail closed with diagnostics',async()=>{
  const tools=payload(valid);tools.candidates[0].content.parts[0].functionCall={name:'SECRET_CANARY'};
  for(const [value,code] of [[null,'invalid_provider_response'],[tools,'invalid_provider_content']]){
    await assert.rejects(make(async()=>response(value)).classify(request),error=>error.code===code&&Boolean(error.diagnostics.stage));
  }
  await assert.rejects(make(async()=>new Response('x'.repeat(65537))).classify(request),error=>error.code==='response_too_large'&&error.diagnostics.stage==='provider_json');
});
test('comparison report propagates error diagnostics without granting review credit',async()=>{
  const dataset=JSON.parse(await readFile(new URL('./fresh-evaluation.json',import.meta.url),'utf8'));
  const adapter={async classify(){throw new ModelError('invalid_model_decision',1,null,{stage:'decision',validationReason:'evidence_not_in_request',usage:{totalTokenCount:40}});}};
  const result=await compareCases(dataset,{adapter,delayMs:0,sleep:async()=>{}});
  assert.equal(result.metrics.model.correct,0);assert.equal(result.metrics.model.errors,40);
  assert.equal(result.rows[0].provider.diagnostics.validationReason,'evidence_not_in_request');
  assert.equal(result.rows[0].provider.diagnostics.usage.totalTokenCount,40);
});
