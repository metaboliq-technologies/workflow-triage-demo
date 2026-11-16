import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {SENSITIVE_REVIEW_POLICY,createSensitiveGeminiAdapter} from './sensitive-adapter.mjs';
import {reliabilityEvaluation} from './reliability-runner.mjs';
import {digest,verifySensitiveSet} from './sensitive-review.mjs';
export {digest,verifySensitiveSet};
export const freezeFiles=['model-adapter.mjs','reliable-adapter.mjs','sensitive-adapter.mjs','reliability-runner.mjs','sensitive-review.mjs','sensitive-evaluation.mjs','triage.mjs','compare.mjs','ROUTING-POLICY-V9.md'];
const read=p=>readFile(new URL('./'+p,import.meta.url),'utf8');
export async function runSensitiveEvaluation(){
  if(process.env.MBQ_ALLOW_SYNTHETIC_MODEL_RUN!=='yes')throw Error('Synthetic-run opt-in required');
  const freeze=JSON.parse(await read('sensitive-implementation-freeze.json'));
  if(freeze.caseInspectionByImplementerBeforeFreeze!==false||Object.keys(freeze.files).sort().join()!==freezeFiles.slice().sort().join())throw Error('Missing freeze');
  for(const [p,h]of Object.entries(freeze.files))if(digest(await read(p))!==h)throw Error('Implementation freeze differs');
  const datasetBytes=await read('sensitive-evaluation.json'),policyBytes=await read('ROUTING-POLICY-V9.md'),reviewBytes=await read('sensitive-review-manifest.json'),review=JSON.parse(reviewBytes),originals={};
  for(const n of Object.keys(review.originalFiles??{})){if(!/^[a-z-]+\.json$/.test(n))throw Error('Invalid original path');originals[n]=await read('sensitive-review/'+n);}
  const dataset=verifySensitiveSet(JSON.parse(datasetBytes),review,{datasetBytes,policyBytes,originals});
  const metadata={schemaVersion:8,dataset:dataset.id,datasetSha256:digest(datasetBytes),reviewManifestSha256:digest(reviewBytes),policySha256:digest(policyBytes),review,implementationFreeze:freeze,
    promptSha256:digest(SENSITIVE_REVIEW_POLICY),requestedModel:'gemini-3.5-flash-lite',policyVersion:'sensitive-context-v9',evidenceMode:'quoted-v1',reliabilityVersion:'bounded-v8',
    attemptTimeoutMs:30000,totalTimeoutMs:65000,maxAttemptsPerCall:2,spacingMs:6500,
    armDefinitions:{baseline:'unchanged rules',first:'observed first attempt at new deadline, not legacy control',model:'final bounded reliability result',guarded:'rules guarded final; no extra model calls'},
    sourceCommit:process.env.GITHUB_SHA??null,startedAt:new Date().toISOString(),provider:'gemini-developer-api'};
  const adapter=createSensitiveGeminiAdapter({apiKey:process.env.GEMINI_API_KEY,model:metadata.requestedModel,evidenceMode:'quoted-v1',timeoutMs:30000,totalTimeoutMs:65000,maxAttempts:2});
  const result=await reliabilityEvaluation(dataset,{adapter,checkpoint:async state=>writeFile(new URL('./sensitive-comparison.local.json',import.meta.url),JSON.stringify({...metadata,...state,completedAt:state.status==='running'?null:new Date().toISOString()},null,2)+'\n'),progress:x=>console.log(JSON.stringify(x))});
  console.log(JSON.stringify({status:result.status,invocations:result.invocations,apiAttempts:result.apiAttempts,metrics:result.metrics}));
  if(result.status!=='complete'||result.metrics.first.errors||result.metrics.model.errors)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))runSensitiveEvaluation().catch(()=>{console.error('Sensitive-context evaluation could not complete; inspect retained checkpoint. Unknown in-flight attempts must not be treated as zero or safely rerun.');process.exitCode=1;});
