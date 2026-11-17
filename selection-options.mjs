import {validateRequest} from './triage.mjs';
import {ModelError,validateModelDecision} from './model-adapter.mjs';
const genericWords=new Set('a an the this that these those it here there please help need some something anything everything issue issues problem problems question questions request requests ticket update updates urgent asap important quick small big another one two three several both couple things thing task tasks jobs job favor assist assistance handle sort out fix check look at for me my us our can could would you your to and or with before after today tomorrow yesterday now soon again is are be not no yes do does just only still about regarding follow up followup fyi re fw'.split(' '));
export function genericSubject(subject){const words=subject.toLowerCase().match(/[a-z0-9]+/g)??[];return words.length>0&&words.every(w=>genericWords.has(w));}
export function selectionOptions(request){
  validateRequest(request);const spans=[];const add=(field,start,end)=>{const text=request[field];while(start<end&&/\s/u.test(text[start]))start++;while(end>start&&/\s/u.test(text[end-1]))end--;if(start>0&&/[\uDC00-\uDFFF]/u.test(text[start]))start++;if(end<text.length&&/[\uD800-\uDBFF]/u.test(text[end-1]))end--;if(end-start>=4&&end-start<=120&&!spans.some(s=>s.field===field&&s.start===start&&s.end===end))spans.push({field,start,end,text:text.slice(start,end)});};
  const collect=field=>{const text=request[field];if(text.length<=120)add(field,0,text.length);let start=0;for(const match of text.matchAll(/[.!?;](?=\s|$)/gu)){add(field,start,match.index+1);start=match.index+1;}add(field,start,text.length);
    for(let start=0;start<text.length;start+=48){let a=start;while(a>0&&!/\s/u.test(text[a-1]))a--;let end=Math.min(a+120,text.length);if(end<text.length){while(end>a&&!/\s/u.test(text[end]))end--;if(end<=a)end=Math.min(a+120,text.length);}add(field,a,end);}if(text.length>120){let a=text.length-120;while(a<text.length&&!/\s/u.test(text[a-1]??' '))a++;if(a>=text.length)a=Math.max(0,text.length-120);add(field,a,text.length);}};
  collect('body');if(!genericSubject(request.subject))collect('subject');
  // Bound token growth. Preserve body/subject endpoints and spread remaining spans.
  const kept=spans.length<=64?spans:Array.from({length:64},(_,i)=>spans[Math.round(i*(spans.length-1)/63)]);
  return kept.map((s,i)=>({id:'s'+i,...s}));
}
export function resolveSelectionReference(request,output){
  if(output===null||typeof output!=='object'||Array.isArray(output)||Object.keys(output).length!==2||!Object.hasOwn(output,'category')||!Object.hasOwn(output,'evidenceId'))throw new ModelError('invalid_model_decision',0,null,{stage:'decision',validationReason:'object_shape'});
  const chosen=typeof output.evidenceId==='string'&&selectionOptions(request).find(s=>s.id===output.evidenceId);if(!chosen)throw new ModelError('invalid_model_decision',0,null,{stage:'decision',validationReason:'invalid_evidence_reference'});
  return validateModelDecision(request,{category:output.category,evidence:chosen.text});
}
