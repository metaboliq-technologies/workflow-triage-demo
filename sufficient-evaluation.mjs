import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createCompletenessAdapter,COMPLETENESS_POLICY} from './completeness-adapter.mjs';
import {createSufficientAdapter,SUFFICIENT_POLICY} from './sufficient-adapter.mjs';
import {pairedSufficient} from './sufficient-runner.mjs';
import {validateBatch} from './triage.mjs';
export const digest=x=>createHash('sha256').update(x).digest('hex');
export const freezeFiles=['model-adapter.mjs','reliable-adapter.mjs','sensitive-adapter.mjs','completeness-adapter.mjs','sufficient-adapter.mjs','sufficient-runner.mjs','sufficient-evaluation.mjs','triage.mjs','compare.mjs','ROUTING-POLICY-V11.md','OUTPUT-REVIEW-RUBRIC-V11.md'];
const read=n=>readFile(new URL('./'+n,import.meta.url),'utf8');
export function verifyDataset(dataset){
  if(dataset.id!=='ai-reviewed-sufficient-v11'||dataset.schemaVersion!==1||dataset.cases?.length!==20)throw Error('Invalid dataset');validateBatch(dataset.cases.map(c=>c.input));
  const groups={};for(const c of dataset.cases){groups[c.stratum]=(groups[c.stratum]??0)+1;const e=c.expected;if(typeof e?.requiresHumanReview!=='boolean'||(e.requiresHumanReview?e.route!==null:!['access','billing','technical'].includes(e.route)))throw Error('Invalid label');
    const bundles=c.evidenceCriteria?.sufficientBundles;if(!Array.isArray(bundles)||!bundles.length||!Array.isArray(c.evidenceCriteria.optionalContext))throw Error('Missing sufficient bundles');
    for(const b of bundles){if(typeof b.trigger!=='string'||!b.trigger.trim()||!Array.isArray(b.facts)||!b.facts.length||b.facts.some(f=>typeof f!=='string'||!f.trim())||typeof b.exampleQuote!=='string'||b.exampleQuote.length<4||b.exampleQuote.length>120||![c.input.subject,c.input.body].some(s=>s.includes(b.exampleQuote)))throw Error('Invalid bundle');}
  }if(Object.keys(groups).sort().join()!==['security_context','sensitive_scope','multi_intent_scope','ordinary_evidence','protective_scope'].sort().join()||Object.values(groups).some(n=>n!==4))throw Error('Invalid coverage');return dataset;
}
export async function runSufficient(){
  if(process.env.MBQ_ALLOW_SYNTHETIC_MODEL_RUN!=='yes')throw Error('Opt-in required');if(process.env.GITHUB_RUN_ATTEMPT&&process.env.GITHUB_RUN_ATTEMPT!=='1')throw Error('Replay forbidden; preserve original run');
  try{await read('sufficient-comparison.json');throw Error('Results already recorded; replay forbidden');}catch(e){if(e.code!=='ENOENT')throw e;}
  const freeze=JSON.parse(await read('sufficient-implementation-freeze.json'));if(freeze.caseInspectionByImplementerBeforeFreeze!==false||freeze.humanReviewed!==false||Object.keys(freeze.files).sort().join()!==freezeFiles.slice().sort().join())throw Error('Missing freeze');for(const[n,h]of Object.entries(freeze.files))if(digest(await read(n))!==h)throw Error('Frozen implementation differs');
  const datasetBytes=await read('sufficient-evaluation.json'),reviewBytes=await read('sufficient-review-manifest.json'),review=JSON.parse(reviewBytes),plan=JSON.parse(await read('sufficient-execution-plan.json'));
  if(review.datasetSha256!==digest(datasetBytes)||review.policySha256!==digest(await read('ROUTING-POLICY-V11.md'))||review.humanReviewed!==false||review.unresolvedDisagreements!==0||review.initialReviewerBlinded!==true||plan.datasetSha256!==digest(datasetBytes)||plan.freezeSha256!==digest(await read('sufficient-implementation-freeze.json'))||plan.maximumApiAttempts!==80)throw Error('Invalid reviewed plan');
  for(const[n,h]of Object.entries(review.originalFiles)){if(!/^[a-z-]+\.json$/.test(n)||digest(await read('sufficient-review/'+n))!==h)throw Error('Review records differ');}
  const dataset=verifyDataset(JSON.parse(datasetBytes));const options={apiKey:process.env.GEMINI_API_KEY,model:'gemini-3.5-flash-lite',evidenceMode:'quoted-v1',timeoutMs:30000,totalTimeoutMs:65000,maxAttempts:2};
  const metadata={schemaVersion:1,experiment:'paired-sufficient-evidence-v11',sourceCommit:process.env.GITHUB_SHA??null,githubRunId:process.env.GITHUB_RUN_ID??null,datasetSha256:digest(datasetBytes),policySha256:digest(await read('ROUTING-POLICY-V11.md')),reviewManifestSha256:digest(reviewBytes),implementationFreeze:freeze,promptHashes:{previous:digest(COMPLETENESS_POLICY),updated:digest(SUFFICIENT_POLICY)},policyVersions:{previous:'evidence-completeness-v10',updated:'sufficient-evidence-v11'},requestedModel:options.model,evidenceMode:'quoted-v1',attemptTimeoutMs:30000,totalTimeoutMs:65000,maxAttemptsPerCall:2,spacingMs:30000,armOrder:'Alternating first arm by shuffled case position',humanReviewed:false,startedAt:new Date().toISOString()};
  const result=await pairedSufficient(dataset,{adapters:{previous:createCompletenessAdapter(options),updated:createSufficientAdapter(options)},checkpoint:async state=>writeFile(new URL('./sufficient-comparison.local.json',import.meta.url),JSON.stringify({...metadata,...state,completedAt:state.status==='running'?null:new Date().toISOString()},null,2)+'\n'),progress:x=>console.log(JSON.stringify(x))});
  console.log(JSON.stringify({status:result.status,invocations:result.invocations,apiAttempts:result.apiAttempts,metrics:result.metrics}));if(result.status!=='complete'||['previousFirst','previous','updatedFirst','updated'].some(a=>result.metrics[a].errors))process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))runSufficient().catch(()=>{console.error('Sufficient-evidence evaluation failed; inspect checkpoint. Unknown in-flight calls are not zero or safely rerunnable.');process.exitCode=1;});
