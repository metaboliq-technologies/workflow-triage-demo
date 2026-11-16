import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {compareCases} from './compare.mjs';
const digest=value=>createHash('sha256').update(value).digest('hex');
const load=async name=>JSON.parse(await readFile(new URL(name,import.meta.url),'utf8'));

test('external sample retains source intent, instruction hashes, license and predefined mapping',async()=>{
  const set=await load('./independent-evaluation.json');
  assert.equal(set.id,'bitext-independent-v3');assert.equal(set.cases.length,40);
  assert.equal(set.source.revision,'72ea2203180d14a416b579c657033ecd21e59a11');
  assert.equal(set.source.sha256,'6f81102b0100b97b8468eb04368033a23206bf1fde9d53500d5806ec1001a434');
  assert.equal(set.license,'CDLA-Sharing-1.0');assert.ok(set.modificationNotice.includes('Original instruction text is unchanged'));
  const counts={};const seen=new Set();
  for(const c of set.cases){
    assert.equal(c.input.subject,'Support request');assert.equal(digest(c.input.body),c.provenance.instructionSha256);
    assert.equal(c.provenance.originalIntent,c.stratum);assert.ok(Number.isInteger(c.provenance.csvLine));
    assert.equal(digest(set.sampling.seed+'|'+c.stratum+'|'+c.input.body),c.provenance.selectionRank);
    assert.equal(c.expected.route,set.sampling.intentMapping[c.stratum]);assert.equal(c.expected.requiresHumanReview,c.expected.route===null);
    counts[c.stratum]=(counts[c.stratum]??0)+1;assert.ok(!seen.has(c.input.body));seen.add(c.input.body);
  }
  assert.equal(Object.keys(counts).length,8);assert.ok(Object.values(counts).every(n=>n===5));
});
test('external instructions do not repeat prior inputs and source labels never enter model calls',async()=>{
  const set=await load('./independent-evaluation.json');
  const prior=[...(await load('./fixtures.json')).map(c=>c.input),...(await load('./fresh-evaluation.json')).cases.map(c=>c.input)];
  const normalize=s=>s.normalize('NFKC').trim().toLowerCase();
  const old=new Set(prior.map(c=>normalize(c.body)));
  assert.ok(set.cases.every(c=>!old.has(normalize(c.input.body))));
  let calls=0;const adapter={async classify(input){calls++;assert.deepEqual(Object.keys(input).sort(),['body','id','subject']);
    assert.ok(!('expected' in input));throw new Error('mock transport');}};
  const r=await compareCases(set,{adapter,delayMs:0,sleep:async()=>{}});
  assert.equal(calls,40);assert.equal(r.metrics.model.errors,40);assert.equal(r.metrics.model.correct,0);
});
