import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {digest,verifyReviewedSet} from './paired-evaluation.mjs';
const bytes=path=>readFile(new URL(path,import.meta.url),'utf8');
const json=async path=>JSON.parse(await bytes(path));
test('review evidence binds the actual author and independently assigned labels to the final set',async()=>{
  const raw=await bytes('./reviewed-evaluation.json'),policy=await bytes('./ROUTING-POLICY-V4.md');
  const manifest=await json('./review-manifest.json');const dataset=verifyReviewedSet(JSON.parse(raw),manifest,{datasetBytes:raw,policyBytes:policy});
  for(const [name,key] of [['author-inputs.json','inputsOriginalSha256'],['author-labels.json','authorProposedLabelsSha256'],['reviewer-initial-labels.json','reviewerInitialLabelsSha256']]){
    assert.equal(digest(await bytes('./review-evidence/'+name)),manifest[key]);
  }
  const authors=(await json('./review-evidence/author-labels.json')).labels;
  const reviewers=(await json('./review-evidence/reviewer-initial-labels.json')).labels;
  assert.equal(authors.length,40);assert.equal(reviewers.length,40);
  const authorById=new Map(authors.map(x=>[x.id,x]));const reviewerById=new Map(reviewers.map(x=>[x.id,x]));
  const agreed=authors.filter(x=>{const r=reviewerById.get(x.id);return x.route===r?.route&&x.requiresHumanReview===r?.requiresHumanReview;}).length;
  assert.equal(agreed,manifest.initialAgreement.agreed);
  for(const c of dataset.cases){assert.deepEqual(c.expected,{route:authorById.get(c.input.id).route,requiresHumanReview:authorById.get(c.input.id).requiresHumanReview});
    assert.deepEqual(c.expected,{route:reviewerById.get(c.input.id).route,requiresHumanReview:reviewerById.get(c.input.id).requiresHumanReview});}
});
test('reviewed set has 40 new unique instructions with required strata and excludes old exact inputs',async()=>{
  const dataset=await json('./reviewed-evaluation.json');const normalize=x=>x.normalize('NFKC').trim().toLowerCase();
  const old=[...(await json('./fixtures.json')).map(c=>c.input),...(await json('./fresh-evaluation.json')).cases.map(c=>c.input),...(await json('./independent-evaluation.json')).cases.map(c=>c.input)];
  const oldBodies=new Set(old.map(c=>normalize(c.body)));const bodies=dataset.cases.map(c=>normalize(c.input.body));
  assert.equal(new Set(bodies).size,40);assert.ok(bodies.every(b=>!oldBodies.has(b)));
  assert.equal(dataset.cases.filter(c=>c.stratum==='technical').length,5);assert.equal(dataset.cases.filter(c=>c.stratum==='security').length,5);assert.equal(dataset.cases.filter(c=>c.stratum==='injection').length,5);
});
test('implementation freeze still matches the four core files',async()=>{
  const freeze=await json('./implementation-freeze.json');assert.equal(freeze.caseInspectionByImplementerBeforeFreeze,false);
  for(const [path,hash] of Object.entries(freeze.files))assert.equal(digest(await bytes('./'+path)),hash);
});
