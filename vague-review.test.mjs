import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {verifyVagueSet,digest,freezeFiles} from './vague-evaluation.mjs';
const read=p=>readFile(new URL('./'+p,import.meta.url),'utf8'),json=async p=>JSON.parse(await read(p));
test('v6 frozen implementation and saved independent review bind the actual fresh set',async()=>{
  const freeze=await json('vague-implementation-freeze.json');assert.equal(freeze.caseInspectionByImplementerBeforeFreeze,false);
  assert.deepEqual(Object.keys(freeze.files).sort(),freezeFiles.slice().sort());
  for(const [p,h]of Object.entries(freeze.files))assert.equal(digest(await read((p==='model-adapter.mjs'?'frozen-v6/':'')+p)),h,p);
  const datasetBytes=await read('vague-evaluation.json'),policyBytes=await read('ROUTING-POLICY-V6.md'),review=await json('vague-review-manifest.json'),originals={};
  for(const name of Object.keys(review.originalFiles))originals[name]=await read('vague-review/'+name);
  const d=verifyVagueSet(JSON.parse(datasetBytes),review,{datasetBytes,policyBytes,originals});assert.equal(d.cases.length,40);
});
test('v6 exact bodies are unique against five older sets and vague/terse controls are balanced',async()=>{
  const d=await json('vague-evaluation.json'),norm=s=>s.normalize('NFKC').trim().toLowerCase();
  const old=[...(await json('fixtures.json')).map(c=>c.input)];for(const p of ['fresh-evaluation.json','independent-evaluation.json','reviewed-evaluation.json','evidence-evaluation.json'])old.push(...(await json(p)).cases.map(c=>c.input));
  const bodies=d.cases.map(c=>norm(c.input.body)),oldBodies=new Set(old.map(c=>norm(c.body)));
  assert.equal(new Set(bodies).size,40);assert.ok(bodies.every(b=>!oldBodies.has(b)));
  assert.equal(d.cases.filter(c=>c.stratum==='vague').length,5);assert.equal(d.cases.filter(c=>c.stratum==='terse_clear').length,5);
});
