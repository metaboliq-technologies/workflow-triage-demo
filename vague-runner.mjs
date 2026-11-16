import {validateBatch,triage} from './triage.mjs';
import {score} from './compare.mjs';
import {ModelError,modelDecision,guardedModelDecision} from './model-adapter.mjs';
const arms=['baseline','legacyModel','model','guarded'];
const pending=error=>({error,route:null,requiresHumanReview:true});
export async function vaguePairedEvaluation(dataset,{legacyAdapter,adapter,delayMs=6500,sleep=ms=>new Promise(r=>setTimeout(r,ms)),checkpoint=async()=>{},progress=()=>{}}={}){
  if(!Array.isArray(dataset?.cases)||dataset.cases.length!==40||!Number.isInteger(delayMs)||delayMs<0||delayMs>60000)throw new Error('Invalid evaluation configuration.');
  validateBatch(dataset.cases.map(c=>c.input));
  const rows=dataset.cases.map(c=>({id:c.input.id,stratum:c.stratum,expected:c.expected,baseline:triage(c.input),legacyModel:pending('not_attempted'),model:pending('not_attempted'),guarded:pending('not_attempted'),providers:{}}));
  let invocations=0,apiAttempts=0,stopReason=null;
  const snapshot=status=>({status,invocations,apiAttempts,maximumApiAttempts:80,stopReason,actionsExecuted:0,rows,metrics:Object.fromEntries(arms.map(a=>[a,score(rows,a)]))});
  await checkpoint(snapshot('running'));
  for(const [index,item]of dataset.cases.entries())for(const arm of index%2?['model','legacyModel']:['legacyModel','model']){
    if(stopReason){rows[index][arm]=pending('not_attempted_after_'+stopReason);if(arm==='model')rows[index].guarded={...rows[index][arm]};continue;}
    if(invocations>=80||apiAttempts>=80)throw new Error('Call budget exhausted.');
    if(invocations>0)await sleep(delayMs);
    invocations++;
    try{
      // No expected decision, stratum or review rationale leaves this runner.
      const result=await (arm==='legacyModel'?legacyAdapter:adapter).classify(item.input);
      apiAttempts+=result.attempts??0;
      rows[index][arm]=modelDecision(item.input,result.output);
      if(arm==='model')rows[index].guarded=guardedModelDecision(item.input,result.output);
      rows[index].providers[arm]=result;
    }catch(error){
      const known=error instanceof ModelError;
      apiAttempts+=known?error.attempts:0;
      rows[index][arm]=pending(known?error.code:'model_run_error');
      if(arm==='model')rows[index].guarded={...rows[index][arm]};
      rows[index].providers[arm]=known?{attempts:error.attempts,diagnostics:error.diagnostics,attemptLog:error.attemptLog??[]}:{attempts:null};
      if(known&&[401,403,429].includes(error.httpStatus))stopReason=`provider_http_${error.httpStatus}`;
    }
    await checkpoint(snapshot('running'));progress({completedInvocations:invocations,apiAttempts,maximumApiAttempts:80});
  }
  const report=snapshot(stopReason?'stopped':'complete');await checkpoint(report);return report;
}
