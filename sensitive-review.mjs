import {createHash} from 'node:crypto';
import {validateBatch} from './triage.mjs';
export const digest=value=>createHash('sha256').update(value).digest('hex');
export function verifySensitiveSet(dataset,review,{datasetBytes,policyBytes,originals}){
  const strata=['real_medical','real_financial','fictional_medical','fictional_financial','mixed_or_ambiguous','ordinary_controls','security_injection','closure_vague_controls'];
  if(dataset?.id!=='ai-reviewed-sensitive-v9'||dataset.schemaVersion!==1||dataset.cases?.length!==40||review?.schemaVersion!==1||review.humanReviewed!==false||review.caseCount!==40||review.unresolvedDisagreements!==0||review.datasetSha256!==digest(datasetBytes)||review.policySha256!==digest(policyBytes))throw new Error('Unreviewed set or digest mismatch.');
  const names=['author-inputs.json','author-labels.json','reviewer-initial-labels.json','review-resolutions.json','final-labels.json'];
  if(Object.keys(review.originalFiles??{}).sort().join()!==names.sort().join()||Object.keys(originals??{}).sort().join()!==names.sort().join())throw new Error('Incomplete original review.');
  for(const name of names)if(digest(originals[name])!==review.originalFiles[name])throw new Error('Original review differs.');
  const [inputs,author,initial,final]=['author-inputs.json','author-labels.json','reviewer-initial-labels.json','final-labels.json'].map(n=>JSON.parse(originals[n]));
  for(const list of [inputs,author,initial,final])if(!Array.isArray(list)||list.length!==40||new Set(list.map(c=>c.id)).size!==40)throw new Error('Incomplete original cases.');
  if(initial.some(l=>Object.hasOwn(l,'stratum'))||review.initialReviewerLabelsExcludeStrata!==true)throw Error('Reviewer group blinding missing');
  const agreement=initial.filter(c=>{const a=author.find(a=>a.id===c.id);return a&&a.expected.route===c.expected.route&&a.expected.requiresHumanReview===c.expected.requiresHumanReview;}).length;
  const resolutions=JSON.parse(originals['review-resolutions.json']);
  if(review.initialAgreement?.agreed!==agreement||review.initialAgreement.total!==40||resolutions.initialAgreement?.agreed!==agreement||resolutions.unresolvedDisagreements!==0||!Array.isArray(resolutions.disagreements)||resolutions.disagreements.length!==40-agreement)throw new Error('Disagreements not accounted for.');
  validateBatch(dataset.cases.map(c=>c.input));
  const counts={};for(const c of dataset.cases){
    const original=inputs.find(i=>i.id===c.input.id),label=final.find(l=>l.id===c.input.id),a=author.find(l=>l.id===c.input.id),r=initial.find(l=>l.id===c.input.id);
    const same=(x,y)=>x?.route===y?.route&&x?.requiresHumanReview===y?.requiresHumanReview;
    if(!original||!label||!a||!r||c.input.subject!==original.subject||c.input.body!==original.body||!same(c.expected,label.expected)||c.stratum!==label.stratum||!c.labelReview?.rationale||!c.labelReview?.policyClause||typeof c.expected?.requiresHumanReview!=='boolean'||(c.expected.requiresHumanReview?c.expected.route!==null:!['access','billing','technical'].includes(c.expected.route)))throw new Error('Dataset differs from reviewed originals.');
    if(same(a.expected,r.expected)){if(!same(label.expected,r.expected))throw new Error('Agreed label changed.');}
    else {const resolution=resolutions.disagreements.find(d=>d.id===c.input.id);if(!resolution?.rationale||!same(resolution.finalDecision,label.expected))throw new Error('Unresolved final label.');}
    counts[c.stratum]=(counts[c.stratum]??0)+1;
  }
  if(Object.keys(counts).sort().join()!==strata.sort().join()||!Object.values(counts).every(n=>n===5))throw new Error('Invalid stratum coverage.');
  return dataset;
}
