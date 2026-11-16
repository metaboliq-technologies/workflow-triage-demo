import {validateBatch,triage} from './triage.mjs';
import {score} from './compare.mjs';
import {ModelError,modelDecision,guardedModelDecision} from './model-adapter.mjs';
import {transientFailure} from './reliable-adapter.mjs';
const pending=error=>({error,route:null,requiresHumanReview:true});
export async function reliabilityEvaluation(dataset,{adapter,delayMs=6500,sleep=ms=>new Promise(r=>setTimeout(r,ms)),checkpoint=async()=>{},progress=()=>{}}={}){
  if(!Array.isArray(dataset?.cases)||dataset.cases.length!==40||!Number.isInteger(delayMs)||delayMs<0||delayMs>60000)throw Error('Invalid evaluation configuration');
  validateBatch(dataset.cases.map(c=>c.input));
  const rows=dataset.cases.map(c=>({id:c.input.id,stratum:c.stratum,expected:c.expected,baseline:triage(c.input),first:pending('not_attempted'),model:pending('not_attempted'),guarded:pending('not_attempted'),provider:null}));
  let invocations=0,apiAttempts=0,stopReason=null,consecutiveTransientFailures=0;
  const snapshot=status=>({status,invocations,apiAttempts,maximumApiAttempts:80,stopReason,consecutiveTransientFailures,actionsExecuted:0,rows,metrics:Object.fromEntries(['baseline','first','model','guarded'].map(a=>[a,score(rows,a)]))});
  await checkpoint(snapshot('running'));
  for(const [i,item]of dataset.cases.entries()){
    if(stopReason){for(const a of ['first','model','guarded'])rows[i][a]=pending('not_attempted_after_'+stopReason);continue;}
    if(invocations>=40||apiAttempts+2>80)throw Error('Call budget exhausted');
    if(invocations)await sleep(delayMs);invocations++;
    let provider;
    try{provider=await adapter.classify(item.input);}
    catch(error){if(!(error instanceof ModelError)||!Number.isInteger(error.attempts)||error.attempts<1||error.attempts>2||!error.firstAttempt)throw Error('Unaccounted adapter failure; checkpoint excludes unknown in-flight call');
      provider={error:error.code,attempts:error.attempts,diagnostics:error.diagnostics,attemptLog:error.attemptLog,firstAttempt:error.firstAttempt,reliability:error.reliability};}
    if(!Number.isInteger(provider.attempts)||provider.attempts<1||provider.attempts>2||provider.attemptLog?.length!==provider.attempts||!provider.firstAttempt)throw Error('Unaccounted attempts');
    apiAttempts+=provider.attempts;rows[i].provider=provider;
    const first=provider.firstAttempt;rows[i].first=first.error?pending(first.error):modelDecision(item.input,first.output);
    rows[i].model=provider.error?pending(provider.error):modelDecision(item.input,provider.output);
    rows[i].guarded=provider.error?pending(provider.error):guardedModelDecision(item.input,provider.output);
    const http=provider.diagnostics?.httpStatus??Number(provider.error?.match(/^provider_http_(\d+)$/)?.[1]);
    if([400,401,402,403,404,429].includes(http))stopReason='provider_http_'+http;
    if(!stopReason&&['retry_after_limit','invalid_retry_after'].includes(provider.reliability?.retryDeferred))stopReason='unhandled_retry_advice_'+provider.reliability.retryDeferred;
    consecutiveTransientFailures=provider.error&&transientFailure(provider.error)?consecutiveTransientFailures+1:0;
    if(!stopReason&&consecutiveTransientFailures>=3)stopReason='three_consecutive_final_transient_failures';
    await checkpoint(snapshot('running'));progress({completedInvocations:invocations,apiAttempts,maximumApiAttempts:80});
  }
  const result=snapshot(stopReason?'stopped':'complete');await checkpoint(result);return result;
}
