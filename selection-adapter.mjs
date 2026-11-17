import {createReliableSelectionAdapter} from './selection-reliable.mjs';
import {selectionOptions} from './selection-options.mjs';
import {ModelError} from './model-adapter.mjs';
export function createSelectionAdapter(options={}){
  if(Object.hasOwn(options,'policyVersion')||(options.evidenceMode!==undefined&&options.evidenceMode!=='selection-v12'))throw new ModelError('invalid_selection_options');
  const adapter=createReliableSelectionAdapter({...options,policyVersion:'sufficient-evidence-v11',evidenceMode:'selection-v12'});
  return {...adapter,policyVersion:'bounded-selection-v12',historicalPolicyVersion:'sufficient-evidence-v11',async classify(request){
    if(!selectionOptions(request).length){const e=new ModelError('invalid_model_decision',0,null,{stage:'decision',validationReason:'no_evidence_options'});e.firstAttempt={error:e.code,attempts:0,diagnostics:e.diagnostics};e.attemptLog=[];e.reliability={version:'bounded-v8',recovered:false,retryDeferred:'preflight_no_options'};throw e;}
    return adapter.classify(request);
  }};
}
