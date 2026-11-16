import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {validateBatch,triage} from './triage.mjs';
import {score} from './compare.mjs';
import {createGeminiAdapter,MODEL_POLICY,LEGACY_MODEL_POLICY,ModelError,modelDecision,guardedModelDecision} from './model-adapter.mjs';

export const digest=value=>createHash('sha256').update(value).digest('hex');
const ARMS=['baseline','legacyModel','model','guarded'];
const pending=code=>({error:code,route:null,requiresHumanReview:true});

export function verifyReviewedSet(dataset,manifest,{datasetBytes,policyBytes}){
  if(!dataset||dataset.schemaVersion!==1||dataset.id!=='ai-reviewed-unseen-v4'||!Array.isArray(dataset.cases)||dataset.cases.length!==40)throw new Error('Invalid reviewed dataset.');
  if(manifest?.schemaVersion!==1||manifest.reviewType!=='independent-ai-label-review'||manifest.humanReviewed!==false||manifest.caseCount!==40||
    manifest.unresolvedDisagreements!==0||manifest.initialAgreement?.total!==40||!Number.isInteger(manifest.initialAgreement.agreed)||
    manifest.initialAgreement.agreed<0||manifest.initialAgreement.agreed>40||!Number.isInteger(manifest.resolvedDisagreements)||manifest.resolvedDisagreements<0||
    manifest.datasetSha256!==digest(datasetBytes)||manifest.policySha256!==digest(policyBytes)||
    !['reviewerInitialLabelsSha256','authorProposedLabelsSha256','inputsOriginalSha256'].every(k=>/^[a-f0-9]{64}$/.test(manifest[k]??'')))throw new Error('Independent label review is incomplete or hashes differ.');
  validateBatch(dataset.cases.map(c=>c.input));
  const strata={};for(const c of dataset.cases){
    if(typeof c.expected?.requiresHumanReview!=='boolean'||(c.expected.requiresHumanReview?c.expected.route!==null:!['access','billing','technical'].includes(c.expected.route))||
      typeof c.labelReview?.rationale!=='string'||!c.labelReview.rationale||typeof c.labelReview.policyClause!=='string'||!c.labelReview.policyClause)throw new Error('Missing reviewed label evidence.');
    if(!['signup','account_closure','ordinary_access','billing','technical','security','injection','contextual'].includes(c.stratum))throw new Error('Unknown stratum.');
    strata[c.stratum]=(strata[c.stratum]??0)+1;
  }
  if(Object.keys(strata).length!==8||!Object.values(strata).every(n=>n===5))throw new Error('Incomplete case coverage.');
  return dataset;
}

export async function pairedEvaluation(dataset,{legacyAdapter,adapter,delayMs=6500,sleep=ms=>new Promise(r=>setTimeout(r,ms)),checkpoint=async()=>{},progress=()=>{}}={}){
  if(!Number.isInteger(delayMs)||delayMs<0||delayMs>60000)throw new Error('Invalid pacing.');
  const rows=dataset.cases.map(c=>({id:c.input.id,stratum:c.stratum,expected:c.expected,baseline:triage(c.input),
    legacyModel:pending('not_attempted'),model:pending('not_attempted'),guarded:pending('not_attempted'),providers:{}}));
  let invocations=0,fatal=false;
  const snapshot=status=>({status,invocations,maximumApiAttempts:80,actionsExecuted:0,rows,
    metrics:Object.fromEntries(ARMS.map(arm=>[arm,score(rows,arm)]))});
  await checkpoint(snapshot('running'));
  for(const [index,item] of dataset.cases.entries()){
    // Alternate arm order by case. Each call is isolated; labels never leave here.
    for(const arm of index%2?['model','legacyModel']:['legacyModel','model']){
      if(fatal){rows[index][arm]=pending('not_attempted_after_authentication_failure');if(arm==='model')rows[index].guarded={...rows[index][arm]};continue;}
      if(invocations>=80)throw new Error('Invocation budget exhausted.');
      if(invocations>0)await sleep(delayMs);
      invocations++;
      try{
        const result=await (arm==='legacyModel'?legacyAdapter:adapter).classify(item.input);
        rows[index][arm]=modelDecision(item.input,result.output);
        if(arm==='model')rows[index].guarded=guardedModelDecision(item.input,result.output);
        rows[index].providers[arm]=result;
      }catch(error){
        rows[index][arm]=pending(error instanceof ModelError?error.code:'model_run_error');
        if(arm==='model')rows[index].guarded={...rows[index][arm]};
        rows[index].providers[arm]=error instanceof ModelError?{attempts:error.attempts,diagnostics:error.diagnostics,attemptLog:error.attemptLog??[]}:{attempts:null};
        fatal=error instanceof ModelError&&[401,403].includes(error.httpStatus);
      }
      await checkpoint(snapshot('running'));progress({completedInvocations:invocations,maximumApiAttempts:80});
    }
  }
  const report=snapshot('complete');await checkpoint(report);return report;
}

async function main(){
  if(process.argv.length!==2||process.env.MBQ_ALLOW_SYNTHETIC_MODEL_RUN!=='yes')throw new Error('Explicit synthetic-run opt-in is required.');
  const datasetBytes=await readFile(new URL('./reviewed-evaluation.json',import.meta.url),'utf8');
  const policyBytes=await readFile(new URL('./ROUTING-POLICY-V4.md',import.meta.url),'utf8');
  const manifestBytes=await readFile(new URL('./review-manifest.json',import.meta.url),'utf8');
  const dataset=verifyReviewedSet(JSON.parse(datasetBytes),JSON.parse(manifestBytes),{datasetBytes,policyBytes});
  // Fail before any provider request if the implementation freeze changed.
  const freeze=JSON.parse(await readFile(new URL('./implementation-freeze.json',import.meta.url),'utf8'));
  for(const [path,hash] of Object.entries(freeze.files??{})){
    if(!['model-adapter.mjs','paired-evaluation.mjs','ROUTING-POLICY-V4.md','triage.mjs'].includes(path)||digest(await readFile(new URL('./'+path,import.meta.url)))!==hash)throw new Error('Implementation freeze differs.');
  }
  if(Object.keys(freeze.files??{}).length!==4||freeze.caseInspectionByImplementerBeforeFreeze!==false)throw new Error('Missing implementation freeze.');
  const metadata={schemaVersion:3,dataset:dataset.id,datasetSha256:digest(datasetBytes),policySha256:digest(policyBytes),reviewManifestSha256:digest(manifestBytes),
    implementationFreeze:freeze,review:JSON.parse(manifestBytes),promptSha256:digest(MODEL_POLICY),legacyPromptSha256:digest(LEGACY_MODEL_POLICY),
    sourceCommit:/^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA??'')?process.env.GITHUB_SHA:null,requestedModel:'gemini-3.5-flash-lite',
    provider:'gemini-developer-api',startedAt:new Date().toISOString(),spacingMs:6500,maxAttemptsPerCall:1};
  const common={apiKey:process.env.GEMINI_API_KEY,model:metadata.requestedModel,maxAttempts:1};
  const result=await pairedEvaluation(dataset,{legacyAdapter:createGeminiAdapter({...common,policyVersion:'legacy-v3'}),adapter:createGeminiAdapter({...common,policyVersion:'clarified-v4'}),
    checkpoint:async state=>writeFile(new URL('./paired-comparison.local.json',import.meta.url),JSON.stringify({...metadata,...state,completedAt:state.status==='complete'?new Date().toISOString():null},null,2)+'\n'),
    progress:value=>console.log(JSON.stringify(value))});
  console.log(JSON.stringify({metrics:result.metrics,invocations:result.invocations,status:result.status},null,2));
  if(result.metrics.model.errors||result.metrics.legacyModel.errors)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{console.error('Paired evaluation could not complete; inspect the retained checkpoint and documented configuration.');process.exitCode=1;});
