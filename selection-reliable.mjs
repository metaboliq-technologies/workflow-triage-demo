import {ModelError,sanitizeDiagnostics} from './model-adapter.mjs';
import {createSelectionModelAdapter as createGeminiAdapter} from './selection-core.mjs';
import {validateRequest} from './triage.mjs';

const SAFE_ERRORS=new Set(['provider_timeout','provider_transport_error','invalid_provider_json','invalid_provider_response','provider_blocked','provider_incomplete_or_blocked','invalid_provider_content','invalid_model_json','invalid_model_decision','response_too_large','provider_deadline_exceeded','reliability_internal_error']);
const safeCode=code=>SAFE_ERRORS.has(code)||/^provider_http_[1-5][0-9]{2}$/.test(code||'')?code:'reliability_internal_error';
export const transientFailure=code=>['provider_timeout','provider_http_503','provider_http_504'].includes(code);
export function retryAfterDelay(value,wallTime){
  if(value===null)return {kind:'absent',ms:0};
  if(typeof value!=='string'||value.length>128)return {kind:'invalid',ms:0};
  const text=value.trim();let ms;
  if(/^\d+$/.test(text))ms=Number(text)*1000;
  else if(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(text))ms=Math.max(0,Date.parse(text)-wallTime);
  else return {kind:'invalid',ms:0};
  if(!Number.isFinite(ms)||ms<0)return {kind:'invalid',ms:0};
  if(ms>8000)return {kind:'too_long',ms:0};
  return {kind:'accepted',ms:Math.ceil(ms)};
}

// Optional transport wrapper: the historical adapter, routing prompt and evidence
// validator remain unchanged. Never retry a quota/auth error or invalid output.
export function createReliableSelectionAdapter({apiKey,model='gemini-3.5-flash-lite',policyVersion='sufficient-evidence-v11',evidenceMode='selection-v12',timeoutMs=30000,totalTimeoutMs=65000,maxAttempts=2,
  fetchImpl=fetch,sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms)),now=()=>performance.now(),wallNow=()=>Date.now(),random=Math.random}={}){
  if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>30000||!Number.isInteger(totalTimeoutMs)||totalTimeoutMs<1||totalTimeoutMs>65000||![1,2].includes(maxAttempts))throw new ModelError('invalid_adapter_limits');
  const shared={apiKey,model,policyVersion,evidenceMode,now};
  createGeminiAdapter({...shared,fetchImpl,maxAttempts:1,timeoutMs:Math.min(timeoutMs,totalTimeoutMs)});
  return {model,policyVersion,evidenceMode,reliabilityVersion:'bounded-v8',async classify(request){
    validateRequest(request);const started=now();let firstAttempt=null,attempts=0;const attemptLog=[];
    const finishError=(failure,reason)=>{const diagnostics=sanitizeDiagnostics({...failure.diagnostics,latencyMs:Math.round(now()-started)});
      const status=Number.isInteger(failure.httpStatus)&&failure.httpStatus>=100&&failure.httpStatus<=599?failure.httpStatus:diagnostics.httpStatus??null;
      const out=new ModelError(safeCode(failure.code),attempts,status,diagnostics);
      out.attemptLog=attemptLog;out.firstAttempt=firstAttempt;out.reliability={version:'bounded-v8',timeoutMs,totalTimeoutMs,maxAttempts,recovered:false,retryDeferred:reason};return out;};
    for(let n=1;n<=maxAttempts;n++){
      const remaining=Math.floor(totalTimeoutMs-(now()-started));
      if(remaining<=0)throw finishError(new ModelError('provider_deadline_exceeded'),'deadline');
      const attemptTimeoutMs=Math.min(timeoutMs,remaining);let retryAfter={kind:'absent',ms:0};attempts=n;
      const transport=async(url,options)=>{const response=await fetchImpl(url,options);if([503,504].includes(response.status))retryAfter=retryAfterDelay(response.headers.get('retry-after'),wallNow());return response;};
      const adapter=createGeminiAdapter({...shared,fetchImpl:transport,maxAttempts:1,timeoutMs:attemptTimeoutMs});
      try{
        const result=await adapter.classify(request);
        if(now()-started>totalTimeoutMs)throw new ModelError('provider_deadline_exceeded',1,null,{stage:'transport'});
        const entry={attempt:n,outcome:'success',...sanitizeDiagnostics(result.attemptLog[0]),timeoutMs:attemptTimeoutMs};
        attemptLog.push(entry);if(!firstAttempt)firstAttempt={...result,attempts:1,attemptLog:[entry]};
        return {...result,attempts,latencyMs:Math.round(now()-started),attemptLog,firstAttempt,reliability:{version:'bounded-v8',timeoutMs,totalTimeoutMs,maxAttempts,recovered:n>1,retryDeferred:null}};
      }catch(error){
        const failure=error instanceof ModelError?error:new ModelError('reliability_internal_error');
        const code=safeCode(failure.code),diagnostics=sanitizeDiagnostics(failure.diagnostics);
        const entry={attempt:n,outcome:'failure',error:code,...diagnostics,timeoutMs:attemptTimeoutMs};
        if(!firstAttempt)firstAttempt={error:code,attempts:1,diagnostics,attemptLog:[{...entry}]};
        let reason=null,delay=0;
        if(!transientFailure(code))reason='non_retryable';
        else if(n>=maxAttempts)reason='retry_limit';
        else if(retryAfter.kind==='invalid')reason='invalid_retry_after';
        else if(retryAfter.kind==='too_long')reason='retry_after_limit';
        else {
          const sample=random();const jitter=Number.isFinite(sample)?Math.max(0,Math.min(1,sample)):0;
          delay=Math.max(Math.round(4000*(1+.2*jitter)),retryAfter.ms);
          if(totalTimeoutMs-(now()-started)<=delay)reason='deadline';
        }
        entry.retryDeferred=reason;entry.retryDelayMs=reason?0:delay;entry.retryAfterKind=retryAfter.kind;attemptLog.push(entry);
        if(reason)throw finishError(failure,reason);
        entry.outcome='retry';await sleep(delay);
        if(now()-started>=totalTimeoutMs){entry.outcome='failure';entry.retryDeferred='deadline';throw finishError(new ModelError('provider_deadline_exceeded',attempts,null,{stage:'transport'}),'deadline');}
      }
    }
  }};
}
