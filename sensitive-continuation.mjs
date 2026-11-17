import {readFile,writeFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';import {resolve} from 'node:path';
import {digest,verifySensitiveSet,freezeFiles} from './sensitive-evaluation.mjs';
import {SENSITIVE_REVIEW_POLICY,createSensitiveGeminiAdapter} from './sensitive-adapter.mjs';
import {selectUntouchedCases,continueCases,quotaObservingFetch} from './continuation-runner.mjs';
const read=n=>readFile(new URL('./'+n,import.meta.url),'utf8');
export async function verifyContinuation(){
  const originalBytes=await read('sensitive-context-comparison.json'),original=JSON.parse(originalBytes),plan=JSON.parse(await read('sensitive-continuation-plan.json')),freeze=JSON.parse(await read('sensitive-implementation-freeze.json'));
  if(digest(originalBytes)!==plan.originalReportSha256||original.sourceCommit!==plan.originalSourceCommit||original.datasetSha256!==plan.datasetSha256||original.promptSha256!==plan.promptSha256||digest(SENSITIVE_REVIEW_POLICY)!==plan.promptSha256||JSON.stringify(original.implementationFreeze)!==JSON.stringify(freeze)||Object.keys(freeze.files).sort().join()!==freezeFiles.slice().sort().join())throw Error('Original provenance differs');
  for(const [n,h]of Object.entries(freeze.files))if(digest(await read(n))!==h)throw Error('Frozen source differs');
  const datasetBytes=await read('sensitive-evaluation.json'),policyBytes=await read('ROUTING-POLICY-V9.md'),reviewBytes=await read('sensitive-review-manifest.json'),review=JSON.parse(reviewBytes),originals={};for(const n of Object.keys(review.originalFiles))originals[n]=await read('sensitive-review/'+n);
  const dataset=verifySensitiveSet(JSON.parse(datasetBytes),review,{datasetBytes,policyBytes,originals});if(digest(datasetBytes)!==plan.datasetSha256||digest(policyBytes)!==original.policySha256||digest(reviewBytes)!==original.reviewManifestSha256)throw Error('Dataset or review changed');
  return {original,plan,freeze,cases:selectUntouchedCases(dataset,original,plan)};
}
export async function runContinuation(){
  if(process.env.MBQ_ALLOW_SYNTHETIC_MODEL_RUN!=='yes')throw Error('Synthetic continuation opt-in required');
  const {original,plan,freeze,cases}=await verifyContinuation();let hints=null;
  const adapter=createSensitiveGeminiAdapter({apiKey:process.env.GEMINI_API_KEY,model:original.requestedModel,evidenceMode:'quoted-v1',timeoutMs:30000,totalTimeoutMs:65000,maxAttempts:2,fetchImpl:quotaObservingFetch(fetch,x=>{hints=x;})});
  const continuationFiles={};for(const n of ['continuation-runner.mjs','sensitive-continuation.mjs','sensitive-continuation-plan.json'])continuationFiles[n]=digest(await read(n));
  const metadata={schemaVersion:1,experiment:'sensitive-v9-12-case-continuation',sourceCommit:process.env.GITHUB_SHA??null,originalRunId:plan.originalRunId,originalReportSha256:plan.originalReportSha256,originalSourceCommit:original.sourceCommit,implementationFreeze:freeze,continuationFiles,datasetSha256:plan.datasetSha256,promptSha256:plan.promptSha256,policyVersion:original.policyVersion,evidenceMode:'quoted-v1',requestedModel:original.requestedModel,attemptTimeoutMs:30000,totalTimeoutMs:65000,maxAttemptsPerCall:2,selectedIds:plan.ids,startedAt:new Date().toISOString(),design:'Only originally unattempted cases; same frozen adapter/prompt/labels, later time and slower 30s spacing; not a new unseen evaluation or prior-prompt control'};
  const result=await continueCases(cases,{adapter,originalAttempts:original.apiAttempts,quotaHints:()=>hints,checkpoint:async state=>writeFile(new URL('./sensitive-continuation.local.json',import.meta.url),JSON.stringify({...metadata,...state,completedAt:state.status==='running'?null:new Date().toISOString()},null,2)+'\n'),progress:x=>console.log(JSON.stringify(x))});
  console.log(JSON.stringify({status:result.status,invocations:result.invocations,apiAttempts:result.apiAttempts,stopReason:result.stopReason,metrics:result.metrics}));if(result.status!=='complete'||result.metrics.first.errors||result.metrics.model.errors)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))runContinuation().catch(()=>{console.error('Continuation failed before a complete checkpoint; inspect saved record. Unknown in-flight calls are not zero or safely rerunnable.');process.exitCode=1;});
