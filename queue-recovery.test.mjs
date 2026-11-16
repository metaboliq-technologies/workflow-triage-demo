import test from 'node:test';
import assert from 'node:assert/strict';
import {unusedCancelledRun,checkRecovery,originalRunId,expectedSource} from './queue-recovery-guard.mjs';
const run={id:originalRunId,head_sha:expectedSource,run_attempt:1,status:'completed',conclusion:'cancelled'},jobs={total_count:0,jobs:[]};
test('replacement requires cancelled original, zero historical jobs, exact source and single allowed run number',()=>{
  assert.equal(unusedCancelledRun(run,jobs,'4','1'),true);
  for(const bad of [{...run,status:'queued'},{...run,status:'in_progress'},{...run,conclusion:'success'},{...run,run_attempt:2},{...run,head_sha:'other'},{...run,id:1}])assert.equal(unusedCancelledRun(bad,jobs,'4','1'),false);
  assert.equal(unusedCancelledRun(run,{total_count:1,jobs:[{id:1}]},'4','1'),false);
  assert.equal(unusedCancelledRun(run,jobs,'5','1'),false);
  assert.equal(unusedCancelledRun(run,jobs,'4','2'),false);
});
test('recovery guard only reads fixed public GitHub metadata and never receives provider credentials',async()=>{
  const urls=[];const result=await checkRecovery({runNumber:'4',runAttempt:'1',fetchImpl:async(url,options)=>{
    urls.push(url);assert.equal(options.method,'GET');assert.equal(options.redirect,'error');assert.deepEqual(Object.keys(options.headers),['Accept']);
    return new Response(JSON.stringify(url.includes('/jobs?')?jobs:run));
  }});
  assert.equal(result.eligible,true);assert.equal(urls.length,2);assert.ok(urls.every(u=>u.startsWith('https://api.github.com/repos/metaboliq-technologies/workflow-triage-demo/actions/runs/43910453557')));
});
test('failed metadata access or a later workflow run stops before recovery can pass',async()=>{
  let calls=0;await assert.rejects(checkRecovery({runNumber:'5',runAttempt:'1',fetchImpl:async()=>{calls++;}}));assert.equal(calls,0);
  await assert.rejects(checkRecovery({runNumber:'4',runAttempt:'2',fetchImpl:async()=>{calls++;}}));assert.equal(calls,0);
  await assert.rejects(checkRecovery({runNumber:'4',runAttempt:'1',fetchImpl:async()=>new Response('{}',{status:403})}));
});
