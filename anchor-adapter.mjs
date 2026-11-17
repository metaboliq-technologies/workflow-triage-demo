import {createReliableAnchoredAdapter} from './anchor-reliable.mjs';
import {sourceTokens} from './anchor-spans.mjs';
import {ModelError} from './model-adapter.mjs';
export function createAnchoredAdapter(options={}){
  if(Object.hasOwn(options,'policyVersion')||(options.evidenceMode!==undefined&&options.evidenceMode!=='anchored-v14'))throw new ModelError('invalid_selection_options');
  const adapter=createReliableAnchoredAdapter({...options,policyVersion:'sufficient-evidence-v11',evidenceMode:'anchored-v14'});
  return {...adapter,policyVersion:'fact-envelope-v14',historicalPolicyVersion:'bounded-selection-v12',async classify(request){
    const tokens=sourceTokens(request);if(!tokens.some(a=>tokens.some(b=>b.field===a.field&&b.end-a.start>=4&&b.end-a.start<=120))){const e=new ModelError('invalid_model_decision',0,null,{stage:'decision',validationReason:'no_evidence_options'});e.firstAttempt={error:e.code,attempts:0,diagnostics:e.diagnostics};e.attemptLog=[];e.reliability={version:'bounded-v8',recovered:false,retryDeferred:'preflight_no_options'};throw e;}
    const snapshot={id:request.id,subject:request.subject,body:request.body};return adapter.classify(snapshot);
  }};
}
