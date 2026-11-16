import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {verifyNegationSet,digest,freezeFiles} from './negation-evaluation.mjs';
const read=p=>readFile(new URL('./'+p,import.meta.url),'utf8'),json=async p=>JSON.parse(await read(p));
test('v7 frozen implementation and independent review bind all actual cases',async()=>{
  const freeze=await json('negation-implementation-freeze.json');assert.equal(freeze.caseInspectionByImplementerBeforeFreeze,false);
  assert.deepEqual(Object.keys(freeze.files).sort(),freezeFiles.slice().sort());
  for(const [p,h]of Object.entries(freeze.files))assert.equal(digest(await read(p)),h,p);
  const datasetBytes=await read('negation-evaluation.json'),policyBytes=await read('ROUTING-POLICY-V7.md'),review=await json('negation-review-manifest.json'),originals={};
  for(const name of Object.keys(review.originalFiles))originals[name]=await read('negation-review/'+name);
  assert.equal(verifyNegationSet(JSON.parse(datasetBytes),review,{datasetBytes,policyBytes,originals}).cases.length,40);
});
test('v7 exact bodies are unique against all six older sets',async()=>{
  const dataset=await json('negation-evaluation.json'),norm=s=>s.normalize('NFKC').trim().toLowerCase();
  const old=[...(await json('fixtures.json')).map(c=>c.input)];
  for(const p of ['fresh-evaluation.json','independent-evaluation.json','reviewed-evaluation.json','evidence-evaluation.json','vague-evaluation.json'])old.push(...(await json(p)).cases.map(c=>c.input));
  const bodies=dataset.cases.map(c=>norm(c.input.body)),prior=new Set(old.map(c=>norm(c.body)));
  assert.equal(new Set(bodies).size,40);assert.ok(bodies.every(b=>!prior.has(b)));
});
