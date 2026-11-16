import test from 'node:test';
import assert from 'node:assert/strict';
import {evidenceOptions,resolveEvidenceReference,validateModelDecision,createGeminiAdapter} from './model-adapter.mjs';
const input={id:'dev-evidence',subject:'Dashboard issue',body:'The signed-in dashboard shows the wrong chart. '+ 'Unicode: café “quoted” 😀. '.repeat(25)};
test('bounded spans reconstruct each eligible field without Unicode damage or invented text',()=>{
  const options=evidenceOptions(input);
  assert.ok(options.length<30);
  for(const field of ['subject','body'])assert.equal(options.filter(o=>o.field===field).map(o=>o.text).join(''),input[field]);
  for(const o of options){assert.ok(o.text.length>=4&&o.text.length<=120);assert.equal(input[o.field].slice(o.start,o.end),o.text);assert.ok(!/[\uD800-\uDBFF]$/u.test(o.text));assert.ok(!/^[\uDC00-\uDFFF]/u.test(o.text));}
});
test('reference mode resolves only current request IDs and preserves strict quote validation',()=>{
  assert.deepEqual(resolveEvidenceReference(input,{category:'technical',evidenceId:'e0'}),{category:'technical',evidence:input.subject});
  for(const value of [{category:'billing',evidenceId:'e999'},{category:'review',evidenceId:0},{category:'review',evidenceId:'__proto__'},{category:'review',evidenceId:'e0',evidence:'repaired'},null])assert.throws(()=>resolveEvidenceReference(input,value),{code:'invalid_model_decision'});
  assert.throws(()=>validateModelDecision({id:'dev-cross',subject:'abcd',body:'efgh'},{category:'review',evidence:'cd\nef'}),{code:'invalid_model_decision'});
});
test('short input cannot manufacture evidence and never causes a provider call',async()=>{
  let calls=0;
  const adapter=createGeminiAdapter({apiKey:'mock',evidenceMode:'indexed-v1',fetchImpl:async()=>{calls++;}});
  await assert.rejects(adapter.classify({id:'short',subject:'a',body:'b'}),error=>error.attempts===0&&error.diagnostics.validationReason==='no_evidence_options');
  assert.equal(calls,0);
});
test('indexed transport carries no labels, enforces local enum membership and sanitizes rejected output',async()=>{
  let sent;
  const adapter=createGeminiAdapter({apiKey:'mock',evidenceMode:'indexed-v1',maxAttempts:1,fetchImpl:async(url,options)=>{
    sent=JSON.parse(options.body);return new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({category:'technical',evidenceId:'e1'})}]}}]}));
  }});
  const result=await adapter.classify(input);
  const request=JSON.parse(sent.contents[0].parts[0].text);
  assert.deepEqual(Object.keys(request).sort(),['body','evidenceOptions','id','subject']);
  assert.deepEqual(sent.generationConfig.responseJsonSchema.properties.evidenceId.enum,evidenceOptions(input).map(o=>o.id));
  assert.equal(result.output.evidence,input.body.slice(0,96));assert.equal(result.evidenceReference.start,0);
  const bad=createGeminiAdapter({apiKey:'mock',evidenceMode:'indexed-v1',fetchImpl:async()=>new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:'{"category":"billing","evidenceId":"PRIVATE_REJECTED_TEXT"}'}]}}]}))});
  await assert.rejects(bad.classify(input),error=>error.diagnostics.validationReason==='invalid_evidence_reference'&&!JSON.stringify(error).includes('PRIVATE_REJECTED_TEXT'));
});
