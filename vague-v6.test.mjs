import test from 'node:test';
import assert from 'node:assert/strict';
import {createGeminiAdapter,MODEL_POLICY,VAGUE_REVIEW_POLICY,ModelError} from './model-adapter.mjs';
import {vaguePairedEvaluation} from './vague-runner.mjs';
import {verifyVagueSet,digest} from './vague-evaluation.mjs';
const input={id:'dev-vague',subject:'Invoice copy',body:'Please send a fictional invoice copy.'};
const result={output:{category:'billing',evidence:'invoice'},attempts:1,attemptLog:[]};
const makeCases=()=>({cases:Array.from({length:40},(_,i)=>({input:{...input,id:'dev-'+i},stratum:'development',expected:{route:'billing',requiresHumanReview:false}}))});
test('v6 remains an explicit historical prompt with quoted evidence; historical v4 remains explicit and label-blind',async()=>{
  for(const [policyVersion,prompt]of [['intent-sufficiency-v6',VAGUE_REVIEW_POLICY],['clarified-v4',MODEL_POLICY]]){
    let sent;const a=createGeminiAdapter({apiKey:'mock',...(policyVersion?{policyVersion}:{}),fetchImpl:async(url,options)=>{
      sent=JSON.parse(options.body);return new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(result.output)}]}}]}));
    }});
    await a.classify(input);assert.equal(sent.systemInstruction.parts[0].text,prompt);
    assert.deepEqual(JSON.parse(sent.contents[0].parts[0].text),input);
    assert.deepEqual(sent.generationConfig.responseJsonSchema.required,['category','evidence']);
    assert.equal(a.evidenceMode,'quoted-v1');assert.equal(a.policyVersion,policyVersion??'intent-sufficiency-v6');
  }
  assert.equal(digest(MODEL_POLICY),'1f93fa63bf3eda557a758154998e1e175c8cd2f57dabdcfb61dd64c549495fc2');
});
test('v6 paired evaluation isolates labels, alternates order and retains all 80 one-attempt results',async()=>{
  const calls=[],states=[];let pauses=0;
  const mock=name=>({async classify(request){assert.deepEqual(Object.keys(request).sort(),['body','id','subject']);calls.push(name);return result;}});
  const r=await vaguePairedEvaluation(makeCases(),{legacyAdapter:mock('old'),adapter:mock('new'),delayMs:0,sleep:async()=>{pauses++;},checkpoint:async s=>states.push({status:s.status,invocations:s.invocations})});
  assert.equal(r.status,'complete');assert.equal(r.apiAttempts,80);assert.equal(r.invocations,80);assert.equal(pauses,79);
  assert.deepEqual(calls.slice(0,4),['old','new','new','old']);assert.equal(states.length,82);assert.equal(r.metrics.model.correct,40);
});
test('authentication or rate/quota rejection stops both arms and never credits fallback review',async()=>{
  for(const status of [401,403,429]){
    let calls=0;const mock={async classify(){calls++;throw new ModelError('provider_http_'+status,1,status);}};
    const d=makeCases();d.cases.forEach(c=>c.expected={route:null,requiresHumanReview:true});
    const r=await vaguePairedEvaluation(d,{legacyAdapter:mock,adapter:mock,delayMs:0});
    assert.equal(calls,1);assert.equal(r.status,'stopped');assert.equal(r.apiAttempts,1);assert.equal(r.stopReason,'provider_http_'+status);
    assert.equal(r.metrics.model.correct,0);assert.equal(r.metrics.model.errors,40);assert.equal(r.metrics.baseline.available,40);
    assert.equal(r.rows[0].model.error,'not_attempted_after_provider_http_'+status);
  }
});
test('503 is recorded without retry while later predeclared cases proceed',async()=>{
  let calls=0;const old={async classify(){calls++;if(calls===1)throw new ModelError('provider_http_503',1,503);return result;}};
  const r=await vaguePairedEvaluation(makeCases(),{legacyAdapter:old,adapter:{async classify(){return result;}},delayMs:0,sleep:async()=>{}});
  assert.equal(calls,40);assert.equal(r.status,'complete');assert.equal(r.apiAttempts,80);assert.equal(r.metrics.legacyModel.errors,1);assert.equal(r.metrics.model.correct,40);
});
test('v6 review verifier binds final decisions, original inputs and every disagreement',()=>{
  const strata=['vague','terse_clear','access','billing','technical','account_closure','security_injection','contextual'];
  const cases=makeCases().cases.map((c,i)=>({...c,stratum:strata[Math.floor(i/5)],labelReview:{rationale:'Development fixture only',policyClause:'Ordinary routes'}}));
  const labels=cases.map(c=>({id:c.input.id,stratum:c.stratum,expected:c.expected,rationale:'Development fixture',policyClause:'Ordinary routes'}));
  const originals={'author-inputs.json':JSON.stringify(cases.map(c=>c.input)),'author-labels.json':JSON.stringify(labels),'reviewer-initial-labels.json':JSON.stringify(labels),'final-labels.json':JSON.stringify(labels),'review-resolutions.json':JSON.stringify({initialAgreement:{agreed:40,total:40},disagreements:[],unresolvedDisagreements:0})};
  const dataset={schemaVersion:1,id:'ai-reviewed-vague-v6',cases},datasetBytes=JSON.stringify(dataset),policyBytes='fixture';
  const review={schemaVersion:1,humanReviewed:false,caseCount:40,unresolvedDisagreements:0,initialAgreement:{agreed:40,total:40},datasetSha256:digest(datasetBytes),policySha256:digest(policyBytes),originalFiles:Object.fromEntries(Object.entries(originals).map(([n,b])=>[n,digest(b)]))};
  assert.equal(verifyVagueSet(dataset,review,{datasetBytes,policyBytes,originals}),dataset);
  assert.throws(()=>verifyVagueSet(dataset,{...review,humanReviewed:true},{datasetBytes,policyBytes,originals}));
  assert.throws(()=>verifyVagueSet(dataset,review,{datasetBytes,policyBytes,originals:{...originals,'final-labels.json':'[]'}}));
});
