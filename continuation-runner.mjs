import {triage,validateBatch} from './triage.mjs';
import {score} from './compare.mjs';
import {modelDecision,guardedModelDecision,ModelError} from './model-adapter.mjs';
import {transientFailure} from './reliable-adapter.mjs';
const pending=error=>({error,route:null,requiresHumanReview:true});

export function selectUntouchedCases(dataset,original,plan){
  if(plan.schemaVersion!==1||plan.originalRunId!==43951438030||plan.spacingMs!==30000||plan.maxClassifications!==12||plan.maxApiAttempts!==24||plan.maxCumulativeApiAttempts!==80||plan.singleAuthorizedContinuation!==true||original.status!=='stopped'||original.stopReason!=='provider_http_429'||original.invocations!==28||original.apiAttempts!==28||original.rows?.length!==40||dataset.cases?.length!==40)throw Error('Invalid continuation boundary');
  const ids=original.rows.filter(r=>!r.provider&&r.model.error==='not_attempted_after_provider_http_429').map(r=>r.id);
  if(ids.length!==12||JSON.stringify(ids)!==JSON.stringify(plan.ids)||new Set(ids).size!==12||ids.some((id,i)=>id!==`v9-${String(i+29).padStart(3,'0')}`))throw Error('Continuation IDs differ');
  if(original.rows.filter(r=>r.provider).some(r=>plan.ids.includes(r.id)))throw Error('Attempted case selected');
  const selected=ids.map(id=>{const c=dataset.cases.find(c=>c.input.id===id);if(!c)throw Error('Missing case');const old=original.rows.find(r=>r.id===id);if(JSON.stringify(c.expected)!==JSON.stringify(old.expected)||c.stratum!==old.stratum)throw Error('Reference differs');return c;});
  validateBatch(selected.map(c=>c.input));return selected;
}

// Only bounded quota categories and numeric advice survive; never provider error
// messages, URLs, project/key identifiers, arbitrary quota dimensions or text.
export function safeQuotaHints(payload,header=null){
  const categories=new Set();let retryAfterMs=null,providerRetryDelayMs=null;
  if(typeof header==='string'&&/^\d{1,6}$/.test(header)&&Number(header)<=86400)retryAfterMs=Number(header)*1000;
  for(const d of Array.isArray(payload?.error?.details)?payload.error.details:[]){
    if(d?.['@type']==='type.googleapis.com/google.rpc.QuotaFailure')for(const v of Array.isArray(d.violations)?d.violations:[]){
      const text=[v.quotaMetric,v.quotaId].filter(x=>typeof x==='string'&&x.length<=300).join(' ').toLowerCase();
      if(/requests.*per.?day|requestsperday|per_day.*requests/.test(text))categories.add('requests_per_day');
      else if(/requests.*per.?minute|requestsperminute|per_minute.*requests/.test(text))categories.add('requests_per_minute');
      else if(/tokens.*per.?minute|tokensperminute|per_minute.*tokens/.test(text))categories.add('tokens_per_minute');
      else categories.add('unclassified_quota_violation');
    }
    if(d?.['@type']==='type.googleapis.com/google.rpc.RetryInfo'&&typeof d.retryDelay==='string'&&/^\d{1,6}(?:\.\d{1,9})?s$/.test(d.retryDelay)){const ms=Math.ceil(parseFloat(d.retryDelay)*1000);if(ms<=86400000)providerRetryDelayMs=ms;}
  }
  return {categories:[...categories].sort(),retryAfterMs,providerRetryDelayMs};
}

export function quotaObservingFetch(fetchImpl,observe){return async(url,init)=>{
  const response=await fetchImpl(url,init);
  if(response.status===429){let payload=null;
    try{const reader=response.clone().body.getReader();const chunks=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>16384){await reader.cancel();throw Error('Quota payload too large');}chunks.push(value);}const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}payload=JSON.parse(new TextDecoder().decode(bytes));}catch{}
    observe(safeQuotaHints(payload,response.headers.get('retry-after')));
  }
  return response;
};}

export async function continueCases(cases,{adapter,originalAttempts=28,spacingMs=30000,sleep=ms=>new Promise(r=>setTimeout(r,ms)),checkpoint=async()=>{},progress=()=>{},quotaHints=()=>null}={}){
  if(cases?.length!==12||spacingMs!==30000||originalAttempts!==28||new Set(cases.map(c=>c.input.id)).size!==12)throw Error('Invalid continuation limits');validateBatch(cases.map(c=>c.input));
  const rows=cases.map(c=>({id:c.input.id,stratum:c.stratum,expected:c.expected,baseline:triage(c.input),first:pending('not_attempted'),model:pending('not_attempted'),guarded:pending('not_attempted'),provider:null}));
  let invocations=0,apiAttempts=0,stopReason=null,consecutive=0;
  const snapshot=status=>({status,invocations,apiAttempts,maximumApiAttempts:24,originalAttempts,cumulativeApiAttempts:originalAttempts+apiAttempts,stopReason,actionsExecuted:0,spacingMs,rows,metrics:Object.fromEntries(['baseline','first','model','guarded'].map(a=>[a,score(rows,a)])),quotaHints:quotaHints()});
  await checkpoint(snapshot('running'));
  for(const [i,c]of cases.entries()){
    if(stopReason){for(const a of ['first','model','guarded'])rows[i][a]=pending('not_attempted_after_'+stopReason);continue;}
    if(invocations>=12||apiAttempts+2>24||originalAttempts+apiAttempts+2>80)throw Error('Attempt budget exhausted');
    if(invocations)await sleep(spacingMs);invocations++;
    let provider;try{provider=await adapter.classify(c.input);}catch(e){if(!(e instanceof ModelError)||![1,2].includes(e.attempts)||!e.firstAttempt)throw Error('Unaccounted in-flight continuation call');provider={error:e.code,attempts:e.attempts,diagnostics:e.diagnostics,attemptLog:e.attemptLog,firstAttempt:e.firstAttempt,reliability:e.reliability};}
    if(![1,2].includes(provider.attempts)||provider.attemptLog?.length!==provider.attempts||!provider.firstAttempt)throw Error('Unaccounted continuation attempts');apiAttempts+=provider.attempts;rows[i].provider=provider;
    rows[i].first=provider.firstAttempt.error?pending(provider.firstAttempt.error):modelDecision(c.input,provider.firstAttempt.output);
    rows[i].model=provider.error?pending(provider.error):modelDecision(c.input,provider.output);rows[i].guarded=provider.error?pending(provider.error):guardedModelDecision(c.input,provider.output);
    const http=provider.diagnostics?.httpStatus??Number(provider.error?.match(/^provider_http_(\d+)$/)?.[1]);
    if([400,401,402,403,404,429].includes(http))stopReason='provider_http_'+http;
    if(!stopReason&&['retry_after_limit','invalid_retry_after'].includes(provider.reliability?.retryDeferred))stopReason='unhandled_retry_advice_'+provider.reliability.retryDeferred;
    consecutive=provider.error&&transientFailure(provider.error)?consecutive+1:0;if(!stopReason&&consecutive>=3)stopReason='three_consecutive_final_transient_failures';
    await checkpoint(snapshot('running'));progress({completedInvocations:invocations,apiAttempts,maximumApiAttempts:24,cumulativeApiAttempts:originalAttempts+apiAttempts});
  }
  const result=snapshot(stopReason?'stopped':'complete');await checkpoint(result);return result;
}
