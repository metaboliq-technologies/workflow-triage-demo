import test from 'node:test';
import assert from 'node:assert/strict';
import {createSensitiveGeminiAdapter,SENSITIVE_REVIEW_POLICY} from './sensitive-adapter.mjs';
import {createReliableGeminiAdapter} from './reliable-adapter.mjs';
import {NEGATION_REVIEW_POLICY} from './model-adapter.mjs';
const request={id:'dev-scope',subject:'Sample editor',body:'The fictional character\'s draft will not save. Do not change labels.'};
const good=output=>new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(output)}]}}]}));
test('sensitive entrypoint changes only the system instruction and preserves untrusted input/schema on retry',async()=>{
  const payloads=[],inits=[];let n=0;
  const adapter=createSensitiveGeminiAdapter({apiKey:'TEST_CANARY',sleep:async()=>{},random:()=>0,fetchImpl:async(url,init)=>{payloads.push(JSON.parse(init.body));inits.push(init);return ++n===1?new Response('',{status:503}):good({category:'technical',evidence:'draft will not save'});}});
  const result=await adapter.classify(request);assert.equal(adapter.policyVersion,'sensitive-context-v9');assert.equal(n,2);assert.equal(result.firstAttempt.error,'provider_http_503');assert.equal(result.reliability.recovered,true);
  let previous;
  await createReliableGeminiAdapter({apiKey:'TEST_CANARY',fetchImpl:async(url,init)=>{previous=JSON.parse(init.body);return good({category:'technical',evidence:'draft will not save'});}}).classify(request);
  assert.equal(previous.systemInstruction.parts[0].text,NEGATION_REVIEW_POLICY);
  for(const payload of payloads){assert.equal(payload.systemInstruction.parts[0].text,SENSITIVE_REVIEW_POLICY);const copy=structuredClone(payload);copy.systemInstruction=previous.systemInstruction;assert.deepEqual(copy,previous);assert.deepEqual(JSON.parse(payload.contents[0].parts[0].text),request);}
  assert.ok(inits.every(i=>i.redirect==='error'&&i.signal instanceof AbortSignal));assert.ok(!JSON.stringify(result).includes('TEST_CANARY'));
});
test('sensitive bridge preserves exact evidence rejection and never retries invalid output',async()=>{
  let n=0;const adapter=createSensitiveGeminiAdapter({apiKey:'TEST_CANARY',fetchImpl:async()=>{n++;return good({category:'review',evidence:'invented sensitive diagnosis'});}});
  await assert.rejects(adapter.classify(request),e=>e.code==='invalid_model_decision'&&e.diagnostics.validationReason==='evidence_not_in_request'&&e.attempts===1&&e.firstAttempt.error==='invalid_model_decision');assert.equal(n,1);
});
test('sensitive adapter does not treat mock route decisions as policy correctness and preserves review proposals',async()=>{
  const output={category:'review',evidence:'fictional character'};const r=await createSensitiveGeminiAdapter({apiKey:'TEST_CANARY',fetchImpl:async()=>good(output)}).classify(request);assert.deepEqual(r.output,output);assert.equal(r.attempts,1);
});
test('sensitive entrypoint refuses incompatible evidence or policy selection',()=>{
  for(const options of [{evidenceMode:'indexed-v1'},{policyVersion:'legacy-v3'}])assert.throws(()=>createSensitiveGeminiAdapter({apiKey:'TEST_CANARY',...options}),e=>e.code==='invalid_sensitive_adapter_options');
});
