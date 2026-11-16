import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createGeminiAdapter,MODEL_POLICY,VAGUE_REVIEW_POLICY} from './model-adapter.mjs';
import {vaguePairedEvaluation} from './vague-runner.mjs';
import {validateBatch} from './triage.mjs';
export const digest=value=>createHash('sha256').update(value).digest('hex');
const read=p=>readFile(new URL('./'+p,import.meta.url),'utf8');
export const freezeFiles=['model-adapter.mjs','vague-runner.mjs','vague-evaluation.mjs','triage.mjs','compare.mjs','ROUTING-POLICY-V6.md'];
export function verifyVagueSet(dataset,review,{datasetBytes,policyBytes,originals}){
  const strata=['vague','terse_clear','access','billing','technical','account_closure','security_injection','contextual'];
  if(dataset?.id!=='ai-reviewed-vague-v6'||dataset.schemaVersion!==1||dataset.cases?.length!==40||review?.schemaVersion!==1||review.humanReviewed!==false||review.caseCount!==40||review.unresolvedDisagreements!==0||review.datasetSha256!==digest(datasetBytes)||review.policySha256!==digest(policyBytes))throw new Error('Unreviewed set or digest mismatch.');
  const names=['author-inputs.json','author-labels.json','reviewer-initial-labels.json','review-resolutions.json','final-labels.json'];
  if(Object.keys(review.originalFiles??{}).sort().join()!==names.sort().join()||Object.keys(originals??{}).sort().join()!==names.sort().join())throw new Error('Incomplete original review.');
  for(const name of names)if(digest(originals[name])!==review.originalFiles[name])throw new Error('Original review differs.');
  const [inputs,author,initial,final]=['author-inputs.json','author-labels.json','reviewer-initial-labels.json','final-labels.json'].map(n=>JSON.parse(originals[n]));
  for(const list of [inputs,author,initial,final])if(!Array.isArray(list)||list.length!==40||new Set(list.map(c=>c.id)).size!==40)throw new Error('Incomplete original cases.');
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
export async function runVagueEvaluation(){
  if(process.env.MBQ_ALLOW_SYNTHETIC_MODEL_RUN!=='yes')throw new Error('Synthetic-run opt-in required.');
  const freeze=JSON.parse(await read('vague-implementation-freeze.json'));
  if(freeze.caseInspectionByImplementerBeforeFreeze!==false||Object.keys(freeze.files??{}).sort().join()!==freezeFiles.slice().sort().join())throw new Error('Missing freeze.');
  for(const [file,hash]of Object.entries(freeze.files))if(digest(await read(file))!==hash)throw new Error('Implementation freeze differs.');
  const datasetBytes=await read('vague-evaluation.json'),policyBytes=await read('ROUTING-POLICY-V6.md'),reviewBytes=await read('vague-review-manifest.json');
  const review=JSON.parse(reviewBytes),originals={};for(const name of Object.keys(review.originalFiles??{})){
    if(!/^[a-z-]+\.json$/.test(name))throw new Error('Invalid original path');originals[name]=await read('vague-review/'+name);
  }
  const dataset=verifyVagueSet(JSON.parse(datasetBytes),review,{datasetBytes,policyBytes,originals});
  const metadata={schemaVersion:5,dataset:dataset.id,datasetSha256:digest(datasetBytes),reviewManifestSha256:digest(reviewBytes),policySha256:digest(policyBytes),review,implementationFreeze:freeze,
    previousPromptSha256:digest(MODEL_POLICY),promptSha256:digest(VAGUE_REVIEW_POLICY),requestedModel:'gemini-3.5-flash-lite',evidenceMode:'quoted-v1',
    armDefinitions:{baseline:'unchanged rules',legacyModel:'clarified-v4 / quoted-v1',model:'intent-sufficiency-v6 / quoted-v1',guarded:'rules guarded v6; no extra model calls'},
    sourceCommit:process.env.GITHUB_SHA??null,startedAt:new Date().toISOString(),spacingMs:6500,maxAttemptsPerCall:1,provider:'gemini-developer-api'};
  const common={apiKey:process.env.GEMINI_API_KEY,model:metadata.requestedModel,evidenceMode:'quoted-v1',maxAttempts:1};
  const result=await vaguePairedEvaluation(dataset,{legacyAdapter:createGeminiAdapter({...common,policyVersion:'clarified-v4'}),adapter:createGeminiAdapter({...common,policyVersion:'intent-sufficiency-v6'}),
    checkpoint:async state=>writeFile(new URL('./vague-comparison.local.json',import.meta.url),JSON.stringify({...metadata,...state,completedAt:state.status!=='running'?new Date().toISOString():null},null,2)+'\n'),
    progress:value=>console.log(JSON.stringify(value))});
  console.log(JSON.stringify({status:result.status,invocations:result.invocations,apiAttempts:result.apiAttempts,metrics:result.metrics}));
  if(result.status!=='complete'||result.metrics.model.errors||result.metrics.legacyModel.errors)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))runVagueEvaluation().catch(()=>{console.error('Vague evaluation could not complete; inspect retained checkpoint and frozen configuration.');process.exitCode=1;});
