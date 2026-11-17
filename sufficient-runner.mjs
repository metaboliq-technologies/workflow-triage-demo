import {triage,validateBatch} from './triage.mjs';import {score} from './compare.mjs';import {modelDecision,guardedModelDecision,ModelError} from './model-adapter.mjs';import {transientFailure} from './reliable-adapter.mjs';
const pending=error=>({error,route:null,requiresHumanReview:true});
export const resultArms=['baseline','previousFirst','previous','updatedFirst','updated','guardedPrevious','guardedUpdated'];
export async function pairedSufficient(dataset,{adapters,delayMs=30000,sleep=ms=>new Promise(r=>setTimeout(r,ms)),checkpoint=async()=>{},progress=()=>{}}={}){
  if(dataset.cases?.length!==20||delayMs!==30000||!adapters?.previous||!adapters?.updated)throw Error('Invalid paired configuration');validateBatch(dataset.cases.map(c=>c.input));
  const rows=dataset.cases.map(c=>({id:c.input.id,stratum:c.stratum,expected:c.expected,baseline:triage(c.input),previousFirst:pending('not_attempted'),previous:pending('not_attempted'),updatedFirst:pending('not_attempted'),updated:pending('not_attempted'),guardedPrevious:pending('not_attempted'),guardedUpdated:pending('not_attempted'),providers:{previous:null,updated:null}}));
  let invocations=0,apiAttempts=0,stopReason=null,consecutive=0,inFlight=null;
  const snapshot=status=>({status,invocations,apiAttempts,maximumApiAttempts:80,stopReason,inFlight,actionsExecuted:0,rows,metrics:Object.fromEntries(resultArms.map(a=>[a,score(rows,a)]))});await checkpoint(snapshot('running'));
  for(const [i,c]of dataset.cases.entries())for(const arm of (i%2?['updated','previous']:['previous','updated'])){
    const first=arm+'First',guard='guarded'+arm[0].toUpperCase()+arm.slice(1);
    if(stopReason){for(const a of [arm,first,guard])rows[i][a]=pending('not_attempted_after_'+stopReason);continue;}
    if(invocations>=40||apiAttempts+2>80)throw Error('Attempt budget exhausted');if(invocations)await sleep(delayMs);invocations++;inFlight={id:c.input.id,arm,classification:invocations,maximumUnknownAttempts:2};await checkpoint(snapshot('running'));
    let p;try{p=await adapters[arm].classify(c.input);}catch(e){if(!(e instanceof ModelError)||![1,2].includes(e.attempts)||!e.firstAttempt)throw Error('Unaccounted paired call; inspect checkpoint');p={error:e.code,attempts:e.attempts,diagnostics:e.diagnostics,attemptLog:e.attemptLog,firstAttempt:e.firstAttempt,reliability:e.reliability};}
    if(![1,2].includes(p.attempts)||p.attemptLog?.length!==p.attempts||!p.firstAttempt)throw Error('Unaccounted attempts');apiAttempts+=p.attempts;inFlight=null;rows[i].providers[arm]=p;
    rows[i][first]=p.firstAttempt.error?pending(p.firstAttempt.error):modelDecision(c.input,p.firstAttempt.output);rows[i][arm]=p.error?pending(p.error):modelDecision(c.input,p.output);rows[i][guard]=p.error?pending(p.error):guardedModelDecision(c.input,p.output);
    const http=p.diagnostics?.httpStatus??Number(p.error?.match(/^provider_http_(\d+)$/)?.[1]);if([400,401,402,403,404,429].includes(http))stopReason='provider_http_'+http;
    if(!stopReason&&['retry_after_limit','invalid_retry_after'].includes(p.reliability?.retryDeferred))stopReason='unhandled_retry_advice_'+p.reliability.retryDeferred;
    consecutive=p.error&&transientFailure(p.error)?consecutive+1:0;if(!stopReason&&consecutive>=3)stopReason='three_consecutive_final_transient_failures';
    await checkpoint(snapshot('running'));progress({completedClassifications:invocations,apiAttempts,maximumApiAttempts:80});
  }
  const result=snapshot(stopReason?'stopped':'complete');await checkpoint(result);return result;
}
