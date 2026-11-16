import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateBatch} from './triage.mjs';
const bytes=p=>readFile(new URL('./'+p,import.meta.url),'utf8');
const json=async p=>JSON.parse(await bytes(p));
const hash=s=>createHash('sha256').update(s).digest('hex');
test('v5 freeze and original AI review files bind all 40 final decisions',async()=>{
  const freeze=await json('evidence-implementation-freeze.json');assert.equal(freeze.caseInspectionByImplementerBeforeFreeze,false);
  for(const [p,h]of Object.entries(freeze.files))assert.equal(hash(await bytes(p)),h,p);
  const manifest=await json('evidence-review-manifest.json'),raw=await bytes('evidence-evaluation.json'),dataset=JSON.parse(raw);
  assert.equal(hash(raw),manifest.datasetSha256);assert.equal(manifest.humanReviewed,false);assert.equal(manifest.unresolvedDisagreements,0);
  for(const [p,h]of Object.entries(manifest.originalFiles))assert.equal(hash(await bytes(p)),h,p);
  const author=await json('evidence-review/author-labels.json'),reviewer=await json('evidence-review/reviewer-initial-labels.json'),final=await json('evidence-review/final-labels.json'),inputs=await json('evidence-review/author-inputs.json');
  assert.equal(author.length,40);assert.equal(reviewer.length,40);assert.equal(final.length,40);
  assert.equal(reviewer.filter(l=>JSON.stringify(l.expected)===JSON.stringify(author.find(a=>a.id===l.id).expected)).length,manifest.initialAgreement.agreed);
  validateBatch(dataset.cases.map(c=>c.input));assert.equal(dataset.cases.length,40);
  for(const c of dataset.cases){assert.deepEqual(c.input,inputs.find(i=>i.id===c.input.id));assert.deepEqual(c.expected,final.find(l=>l.id===c.input.id).expected);}
});
test('v5 coverage is balanced and exact inputs are new against all four older sets',async()=>{
  const dataset=await json('evidence-evaluation.json'),normalize=s=>s.normalize('NFKC').trim().toLowerCase();
  const old=[...(await json('fixtures.json')).map(c=>c.input)];
  for(const p of ['fresh-evaluation.json','independent-evaluation.json','reviewed-evaluation.json'])old.push(...(await json(p)).cases.map(c=>c.input));
  const bodies=dataset.cases.map(c=>normalize(c.input.body));assert.equal(new Set(bodies).size,40);
  const oldBodies=new Set(old.map(c=>normalize(c.body)));assert.ok(bodies.every(b=>!oldBodies.has(b)));
  for(const stratum of ['signup','account_closure','ordinary_access','billing','technical','security','injection','contextual'])assert.equal(dataset.cases.filter(c=>c.stratum===stratum).length,5);
});
