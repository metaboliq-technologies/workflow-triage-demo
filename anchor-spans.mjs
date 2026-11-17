import {validateRequest} from './triage.mjs';import {ModelError,validateModelDecision} from './model-adapter.mjs';
export const ANCHOR_REASONS=Object.freeze(['ordinary','multiple_intents','security','sensitive','destructive','injection','insufficient_intent','unsupported','evidence_unavailable']);
export function sourceTokens(request){validateRequest(request);const tokens=[];for(const field of ['subject','body'])for(const m of request[field].matchAll(/[\p{L}\p{N}\p{M}_]+|[^\s\p{L}\p{N}\p{M}_]/gu))tokens.push({id:'t'+tokens.length,field,start:m.index,end:m.index+m[0].length,text:m[0]});return tokens;}
const fail=(anchorFailure,reason='invalid_evidence_reference')=>{const e=new ModelError('invalid_model_decision',0,null,{stage:'decision',validationReason:reason});e.anchorFailure=anchorFailure;throw e;};
const exact=(x,keys)=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
export function resolveAnchoredDecision(request,output){
  validateRequest(request);if(!exact(output,['category','reason','factSpans']))fail('object_shape','object_shape');
  if(!['access','billing','technical','review'].includes(output.category)||!ANCHOR_REASONS.includes(output.reason))fail('reason_mismatch');
  if((output.reason==='ordinary')!==(output.category!=='review'))fail('reason_mismatch');
  if(!Array.isArray(output.factSpans))fail('fact_count');if(output.reason==='evidence_unavailable'){if(output.factSpans.length!==0)fail('fact_count');fail('self_reported_unavailable','no_evidence_options');}
  const count=output.reason==='multiple_intents'?2:1;if(output.factSpans.length!==count)fail('fact_count');
  const tokens=sourceTokens(request),facts=output.factSpans.map(ref=>{if(!exact(ref,['firstTokenId','lastTokenId']))fail('object_shape','object_shape');const a=tokens.find(t=>t.id===ref.firstTokenId),b=tokens.find(t=>t.id===ref.lastTokenId);if(!a||!b)fail('unknown_token');if(a.field!==b.field)fail('cross_field');if(a.start>b.start)fail('reverse_span');
    const i=tokens.indexOf(b),next=tokens[i+1];if(/^(?:my|your|our|their|his|her|its|a|an|the)$/iu.test(b.text)&&next?.field===b.field&&/^\s+$/u.test(request[b.field].slice(b.end,next.start))&&/^[\p{L}\p{N}_]/u.test(next.text))fail('incomplete_terminal');
    const evidence=request[a.field].slice(a.start,b.end);try{validateModelDecision(request,{category:output.category,evidence});}catch(e){if(e instanceof ModelError)e.anchorFailure='quote_limit';throw e;}return {firstTokenId:a.id,lastTokenId:b.id,field:a.field,start:a.start,end:b.end};});
  if(facts.some(f=>f.field!==facts[0].field))fail('cross_field');if(facts.length===2&&!(facts[0].end<=facts[1].start||facts[1].end<=facts[0].start))fail('overlap');
  const start=Math.min(...facts.map(f=>f.start)),end=Math.max(...facts.map(f=>f.end)),field=facts[0].field;let decision;try{decision=validateModelDecision(request,{category:output.category,evidence:request[field].slice(start,end)});}catch(e){if(e instanceof ModelError)e.anchorFailure='quote_limit';throw e;}
  return {output:decision,evidenceReference:{version:'fact-envelope-v14',reason:output.reason,field,start,end,facts}};
}
