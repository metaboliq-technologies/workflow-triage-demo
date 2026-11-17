import {validateBatch} from './triage.mjs';
import {score} from './compare.mjs';
import {modelDecision,guardedModelDecision,ModelError} from './model-adapter.mjs';
import {transientFailure} from './reliable-adapter.mjs';
const pending=error=>({error,route:null,requiresHumanReview:true});
export function selectUntouchedClassifications(dataset,original,plan){
  if(plan.schemaVersion!==1||plan.originalRunId!==44038024039||plan.spacingMs!==30000||plan.maxClassifications!==29||plan.maxApiAttempts!==58||plan.maxCumulativeApiAttempts!==80||plan.singleAuthorizedContinuation!==true||original.status!=='stopped'||original.stopReason!=='provider_http_429'||original.invocations!==11||original.apiAttempts!==11||original.rows?.length!==20||dataset.cases?.length!==20)throw Error('Invalid continuation boundary');
  const selected=[];
  for(const [i,c]of dataset.cases.entries()){
    const old=original.rows[i];if(old.id!==c.input.id||JSON.stringify(old.expected)!==JSON.stringify(c.expected)||old.stratum!==c.stratum)throw Error('Frozen reference differs');
    for(const arm of i%2?['updated','previous']:['previous','updated'])if(old.providers[arm]===null){
      for(const a of [arm,arm+'First','guarded'+arm[0].toUpperCase()+arm.slice(1)])if(old[a]?.error!=='not_attempted_after_provider_http_429')throw Error('Uncertain or attempted output selected');
      selected.push({id:c.input.id,arm,input:c.input,expected:c.expected,stratum:c.stratum});
    }
  }
  if(selected.length!==29||JSON.stringify(selected.map(({id,arm})=>({id,arm})))!==JSON.stringify(plan.classifications)||new Set(selected.map(x=>x.id+'/'+x.arm)).size!==29)throw Error('Selection differs');
  validateBatch(dataset.cases.map(c=>c.input));return selected;
}
export async function continueClassifications(selected,original,{adapters,spacingMs=30000,sleep=ms=>new Promise(r=>setTimeout(r,ms)),checkpoint=async()=>{},progress=()=>{},quotaHints=()=>null}={}){
  if(selected.length!==29||spacingMs!==30000||original.apiAttempts!==11||new Set(selected.map(x=>x.id+'/'+x.arm)).size!==29)throw Error('Invalid limits');
  for(const c of selected){const old=original.rows.find(r=>r.id===c.id);if(!['previous','updated'].includes(c.arm)||!old||old.providers[c.arm]!==null||old[c.arm]?.error!=='not_attempted_after_provider_http_429')throw Error('Attempted call cannot be rerun');}
  const rows=selected.map(c=>({id:c.id,arm:c.arm,stratum:c.stratum,expected:c.expected,first:pending('not_attempted'),model:pending('not_attempted'),guarded:pending('not_attempted'),provider:null}));let invocations=0,apiAttempts=0,stopReason=null,consecutive=0;
  const snapshot=status=>({status,invocations,apiAttempts,maximumApiAttempts:58,originalAttempts:11,cumulativeApiAttempts:11+apiAttempts,maximumCumulativeApiAttempts:80,stopReason,spacingMs,actionsExecuted:0,rows,metrics:Object.fromEntries(['first','model','guarded'].map(a=>[a,score(rows,a)])),quotaHints:quotaHints()});await checkpoint(snapshot('running'));
  for(const [i,c]of selected.entries()){
    if(stopReason){for(const a of ['first','model','guarded'])rows[i][a]=pending('not_attempted_after_'+stopReason);continue;}
    if(invocations>=29||apiAttempts+2>58||11+apiAttempts+2>80)throw Error('Budget exhausted');if(invocations)await sleep(spacingMs);invocations++;
    let p;try{p=await adapters[c.arm].classify(c.input);}catch(e){if(!(e instanceof ModelError)||![1,2].includes(e.attempts)||!e.firstAttempt)throw Error('Unknown in-flight continuation call');p={error:e.code,attempts:e.attempts,diagnostics:e.diagnostics,attemptLog:e.attemptLog,firstAttempt:e.firstAttempt,reliability:e.reliability};}
    if(![1,2].includes(p.attempts)||p.attemptLog?.length!==p.attempts||!p.firstAttempt)throw Error('Unknown attempt accounting');apiAttempts+=p.attempts;rows[i].provider=p;
    rows[i].first=p.firstAttempt.error?pending(p.firstAttempt.error):modelDecision(c.input,p.firstAttempt.output);rows[i].model=p.error?pending(p.error):modelDecision(c.input,p.output);rows[i].guarded=p.error?pending(p.error):guardedModelDecision(c.input,p.output);
    const http=p.diagnostics?.httpStatus??Number(p.error?.match(/^provider_http_(\d+)$/)?.[1]);if([400,401,402,403,404,429].includes(http))stopReason='provider_http_'+http;
    if(!stopReason&&['retry_after_limit','invalid_retry_after'].includes(p.reliability?.retryDeferred))stopReason='unhandled_retry_advice_'+p.reliability.retryDeferred;
    consecutive=p.error&&transientFailure(p.error)?consecutive+1:0;if(!stopReason&&consecutive>=3)stopReason='three_consecutive_final_transient_failures';
    await checkpoint(snapshot('running'));progress({completedClassifications:invocations,apiAttempts,maximumApiAttempts:58,cumulativeApiAttempts:11+apiAttempts});
  }
  const result=snapshot(stopReason?'stopped':'complete');await checkpoint(result);return result;
}
export function combineContinuation(original,continuation,plan){
  const combined=structuredClone(original),seen=new Set();
  if(continuation.rows.length!==plan.classifications.length)throw Error('Incomplete continuation record');
  for(const [i,r]of continuation.rows.entries()){
    const key=r.id+'/'+r.arm,expected=plan.classifications[i],old=combined.rows.find(x=>x.id===r.id);if(!old||expected.id!==r.id||expected.arm!==r.arm||seen.has(key)||old.providers[r.arm]!==null||old[r.arm]?.error!=='not_attempted_after_provider_http_429')throw Error('Unsafe combination');seen.add(key);
    old[r.arm]=r.model;old[r.arm+'First']=r.first;old['guarded'+r.arm[0].toUpperCase()+r.arm.slice(1)]=r.guarded;old.providers[r.arm]=r.provider;
  }
  const arms=['baseline','previousFirst','previous','updatedFirst','updated','guardedPrevious','guardedUpdated'];combined.metrics=Object.fromEntries(arms.map(a=>[a,score(combined.rows,a)]));
  combined.originalStatus=original.status;combined.status=continuation.status==='complete'?'combined_coverage_complete':'combined_partial';combined.continuationStatus=continuation.status;combined.invocations=original.invocations+continuation.invocations;combined.apiAttempts=original.apiAttempts+continuation.apiAttempts;combined.completedAt=continuation.completedAt??null;return combined;
}
