import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {digest,verifyReliabilitySet,freezeFiles} from './reliability-evaluation.mjs';
const read=p=>readFile(new URL('./'+p,import.meta.url),'utf8'),json=async p=>JSON.parse(await read(p));
test('v8 freeze and blind independent review bind every actual case',async()=>{
  const freeze=await json('reliability-implementation-freeze.json');assert.equal(freeze.caseInspectionByImplementerBeforeFreeze,false);assert.deepEqual(Object.keys(freeze.files).sort(),freezeFiles.slice().sort());
  for(const [p,h]of Object.entries(freeze.files))assert.equal(digest(await read(p)),h,p);
  const datasetBytes=await read('reliability-evaluation.json'),policyBytes=await read('ROUTING-POLICY-V8.md'),review=await json('reliability-review-manifest.json'),originals={};for(const n of Object.keys(review.originalFiles))originals[n]=await read('reliability-review/'+n);
  assert.equal(verifyReliabilitySet(JSON.parse(datasetBytes),review,{datasetBytes,policyBytes,originals}).cases.length,40);
  assert.equal(review.initialReviewerLabelsExcludeStrata,true);assert.ok(JSON.parse(originals['reviewer-initial-labels.json']).every(l=>!Object.hasOwn(l,'stratum')));
});
test('v8 exact bodies are unique against all seven older sets',async()=>{
  const d=await json('reliability-evaluation.json'),norm=s=>s.normalize('NFKC').trim().toLowerCase(),old=(await json('fixtures.json')).map(c=>c.input);
  for(const n of ['fresh-evaluation.json','independent-evaluation.json','reviewed-evaluation.json','evidence-evaluation.json','vague-evaluation.json','negation-evaluation.json'])old.push(...(await json(n)).cases.map(c=>c.input));
  const prior=new Set(old.map(c=>norm(c.body))),bodies=d.cases.map(c=>norm(c.input.body));assert.equal(new Set(bodies).size,40);assert.ok(bodies.every(b=>!prior.has(b)));
});
