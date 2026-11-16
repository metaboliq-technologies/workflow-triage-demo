import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {createGeminiAdapter,MODEL_POLICY,LEGACY_MODEL_POLICY,ModelError} from './model-adapter.mjs';
import {pairedEvaluation,verifyReviewedSet,digest} from './paired-evaluation.mjs';
const input={id:'dev-policy',subject:'Example',body:'Please send an invoice for this fictional workspace.'};
const result={output:{category:'billing',evidence:'invoice'},attempts:1,attemptLog:[]};

test('explicit historical prompts cannot be replaced by arbitrary text',async()=>{
  for(const [policyVersion,expected] of [['clarified-v4',MODEL_POLICY],['legacy-v3',LEGACY_MODEL_POLICY]]){
    let body;const a=createGeminiAdapter({apiKey:'mock',policyVersion,fetchImpl:async(url,options)=>{
      body=JSON.parse(options.body);return new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(result.output)}]}}]}));}});
    await a.classify(input);assert.equal(body.systemInstruction.parts[0].text,expected);
  }
  assert.equal(createGeminiAdapter({apiKey:'mock'}).policyVersion,'intent-sufficiency-v6');
  assert.throws(()=>createGeminiAdapter({apiKey:'mock',policyVersion:'arbitrary instructions'}),{code:'invalid_policy_version'});
  assert.equal(createHash('sha256').update(LEGACY_MODEL_POLICY).digest('hex'),'b7aca8fbf81483f9a71d638bbfef60f8c8b2348f8a219b81f531f8d25ed919df');
});
test('paired runner isolates labels, alternates order, counts 80 invocations and checkpoints partial results',async()=>{
  const cases=Array.from({length:40},(_,i)=>({input:{...input,id:'dev-'+i},stratum:'development',expected:{route:'billing',requiresHumanReview:false}}));
  const calls=[];const checkpoint=[];let sleeps=0;
  const make=name=>({async classify(request){assert.deepEqual(Object.keys(request).sort(),['body','id','subject']);calls.push(name);return result;}});
  const report=await pairedEvaluation({cases},{legacyAdapter:make('legacy'),adapter:make('new'),delayMs:0,sleep:async()=>{sleeps++;},checkpoint:async r=>checkpoint.push({status:r.status,invocations:r.invocations,errors:r.metrics.model.errors})});
  assert.deepEqual(calls.slice(0,4),['legacy','new','new','legacy']);assert.equal(calls.length,80);assert.equal(sleeps,79);
  assert.equal(checkpoint.length,82);assert.equal(checkpoint[0].errors,40);assert.equal(checkpoint.at(-1).status,'complete');
  assert.equal(report.metrics.model.correct,40);assert.equal(report.invocations,80);
});
test('paired authentication failure stops both arms and never credits fallback review',async()=>{
  const cases=Array.from({length:40},(_,i)=>({input:{...input,id:'auth-'+i},expected:{route:null,requiresHumanReview:true}}));let calls=0;
  const adapter={async classify(){calls++;throw new ModelError('provider_http_403',1,403);}};
  const report=await pairedEvaluation({cases},{legacyAdapter:adapter,adapter,delayMs:0});
  assert.equal(calls,1);assert.equal(report.invocations,1);assert.equal(report.metrics.model.correct,0);assert.equal(report.metrics.model.errors,40);
});
test('review manifest must bind exact policy and dataset bytes with no unresolved disagreements',()=>{
  const strata=['signup','account_closure','ordinary_access','billing','technical','security','injection','contextual'];
  const dataset={schemaVersion:1,id:'ai-reviewed-unseen-v4',cases:strata.flatMap(stratum=>Array.from({length:5},(_,i)=>({input:{...input,id:stratum+'-'+i},stratum,expected:{route:'billing',requiresHumanReview:false},labelReview:{rationale:'Test fixture only',policyClause:'development'}})))};
  const bytes=JSON.stringify(dataset),policy='test policy only';const manifest={schemaVersion:1,reviewType:'independent-ai-label-review',humanReviewed:false,caseCount:40,
    initialAgreement:{agreed:40,total:40},resolvedDisagreements:0,unresolvedDisagreements:0,datasetSha256:digest(bytes),policySha256:digest(policy),
    reviewerInitialLabelsSha256:'a'.repeat(64),authorProposedLabelsSha256:'b'.repeat(64),inputsOriginalSha256:'c'.repeat(64)};
  assert.equal(verifyReviewedSet(dataset,manifest,{datasetBytes:bytes,policyBytes:policy}),dataset);
  for(const bad of [{...manifest,unresolvedDisagreements:1},{...manifest,humanReviewed:true},{...manifest,datasetSha256:'0'.repeat(64)}])assert.throws(()=>verifyReviewedSet(dataset,bad,{datasetBytes:bytes,policyBytes:policy}));
});
