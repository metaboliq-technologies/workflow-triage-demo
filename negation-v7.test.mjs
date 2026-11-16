import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createGeminiAdapter,VAGUE_REVIEW_POLICY,NEGATION_REVIEW_POLICY} from './model-adapter.mjs';
import {verifyNegationSet,digest} from './negation-evaluation.mjs';
const input={id:'development-only',subject:'Invoice copy',body:'Please send a fictional invoice copy.'};
test('v7 default and preserved v6 send only request data with unchanged quoted contract',async()=>{
  for(const [policyVersion,prompt]of [[undefined,NEGATION_REVIEW_POLICY],['intent-sufficiency-v6',VAGUE_REVIEW_POLICY]]){
    let sent;const a=createGeminiAdapter({apiKey:'mock',...(policyVersion?{policyVersion}:{}),fetchImpl:async(url,options)=>{
      sent=JSON.parse(options.body);return new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({category:'billing',evidence:'invoice'})}]}}]}));
    }});
    await a.classify(input);assert.equal(sent.systemInstruction.parts[0].text,prompt);assert.deepEqual(JSON.parse(sent.contents[0].parts[0].text),input);
    assert.deepEqual(sent.generationConfig.responseJsonSchema.required,['category','evidence']);assert.equal(a.evidenceMode,'quoted-v1');assert.equal(a.policyVersion,policyVersion??'closure-negation-v7');
  }
  const prior=JSON.parse(await readFile(new URL('./vague-review-comparison.json',import.meta.url),'utf8'));assert.equal(digest(VAGUE_REVIEW_POLICY),prior.promptSha256);
});
function fixture(){
  const strata=['negated_technical','negated_access','negated_billing','active_closure','ambiguous_closure','security_injection','vague_controls','contextual'];
  const cases=Array.from({length:40},(_,i)=>({input:{...input,id:'fixture-'+i},stratum:strata[Math.floor(i/5)],expected:{route:'billing',requiresHumanReview:false},labelReview:{rationale:'Fixture only',policyClause:'Ordinary routes'}}));
  const labels=cases.map(c=>({id:c.input.id,stratum:c.stratum,expected:c.expected}));
  const originals={'author-inputs.json':JSON.stringify(cases.map(c=>c.input)),'author-labels.json':JSON.stringify(labels),'reviewer-initial-labels.json':JSON.stringify(labels),'final-labels.json':JSON.stringify(labels),'review-resolutions.json':JSON.stringify({initialAgreement:{agreed:40,total:40},disagreements:[],unresolvedDisagreements:0})};
  const dataset={schemaVersion:1,id:'ai-reviewed-negation-v7',cases},datasetBytes=JSON.stringify(dataset),policyBytes='fixture';
  const review={schemaVersion:1,humanReviewed:false,caseCount:40,unresolvedDisagreements:0,initialAgreement:{agreed:40,total:40},datasetSha256:digest(datasetBytes),policySha256:digest(policyBytes),originalFiles:Object.fromEntries(Object.entries(originals).map(([n,b])=>[n,digest(b)]))};
  return {dataset,review,bytes:{datasetBytes,policyBytes,originals}};
}
test('v7 verifier refuses unreviewed, modified or unresolved originals',()=>{
  const {dataset,review,bytes}=fixture();assert.equal(verifyNegationSet(dataset,review,bytes),dataset);
  assert.throws(()=>verifyNegationSet(dataset,{...review,humanReviewed:true},bytes));
  assert.throws(()=>verifyNegationSet(dataset,{...review,unresolvedDisagreements:1},bytes));
  assert.throws(()=>verifyNegationSet(dataset,review,{...bytes,originals:{...bytes.originals,'author-inputs.json':'[]'}}));
});
test('v7 verifier rejects changed agreed labels even with recomputed file digests',()=>{
  const {dataset,review,bytes}=fixture();dataset.cases[0].expected={route:null,requiresHumanReview:true};
  const final=JSON.parse(bytes.originals['final-labels.json']);final[0].expected=dataset.cases[0].expected;bytes.originals['final-labels.json']=JSON.stringify(final);
  bytes.datasetBytes=JSON.stringify(dataset);review.datasetSha256=digest(bytes.datasetBytes);review.originalFiles['final-labels.json']=digest(bytes.originals['final-labels.json']);
  assert.throws(()=>verifyNegationSet(dataset,review,bytes),/Agreed label changed/);
});
