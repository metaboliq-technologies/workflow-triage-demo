import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createSufficientAdapter,SUFFICIENT_POLICY} from './sufficient-adapter.mjs';
import {createSelectionAdapter} from './selection-adapter.mjs';
import {SELECTION_INSTRUCTION} from './selection-core.mjs';
import {pairedBoundary} from './boundary-runner.mjs';
import {validateBatch} from './triage.mjs';
export const digest=x=>createHash('sha256').update(x).digest('hex');
export const freezeFiles=['model-adapter.mjs','reliable-adapter.mjs','sensitive-adapter.mjs','completeness-adapter.mjs','sufficient-adapter.mjs','selection-options.mjs','selection-core.mjs','selection-reliable.mjs','selection-adapter.mjs','boundary-runner.mjs','boundary-evaluation.mjs','triage.mjs','compare.mjs','BOUNDARY-POLICY-V13B.md','BOUNDARY-PROTOCOL-V13B.md'];
const read=n=>readFile(new URL('./'+n,import.meta.url),'utf8');
export function verifyOriginalBudget(original,plan,bytes){if(original.status!=='complete'||original.inFlight!==null||original.invocations!==40||!Number.isInteger(original.apiAttempts)||original.apiAttempts<0||original.apiAttempts>56||plan.originalSha256!==digest(bytes)||plan.combinedMaximumApiAttempts!==80)throw Error('Combined attempt budget or original coverage unresolved');return 80-original.apiAttempts;}
export function verifyDataset(dataset){
  if(dataset.id!=='ai-reviewed-boundary-v13b'||dataset.schemaVersion!==1||dataset.cases?.length!==6)throw Error('Invalid dataset');validateBatch(dataset.cases.map(c=>c.input));
  const groups={};for(const c of dataset.cases){groups[c.stratum]=(groups[c.stratum]??0)+1;const e=c.expected;if(typeof e?.requiresHumanReview!=='boolean'||(e.requiresHumanReview?e.route!==null:!['access','billing','technical'].includes(e.route)))throw Error('Invalid label');
    const bundles=c.evidenceCriteria?.sufficientBundles;if(!Array.isArray(bundles)||!bundles.length||!Array.isArray(c.evidenceCriteria.optionalContext))throw Error('Missing sufficient bundles');
    for(const b of bundles){if(typeof b.trigger!=='string'||!b.trigger.trim()||!Array.isArray(b.facts)||!b.facts.length||b.facts.some(f=>typeof f!=='string'||!f.trim())||typeof b.exampleQuote!=='string'||b.exampleQuote.length<4||b.exampleQuote.length>120||![c.input.subject,c.input.body].some(s=>s.includes(b.exampleQuote)))throw Error('Invalid bundle');}
  }if(Object.keys(groups).join()!=='forced_boundary'||groups.forced_boundary!==6)throw Error('Invalid coverage');for(const c of dataset.cases)if(!c.spanAssessment||c.spanAssessment.utf16Units<110||c.spanAssessment.utf16Units>120)throw Error('Boundary difficulty not confirmed');return dataset;
}
export async function runBoundary(){
  if(process.env.MBQ_ALLOW_SYNTHETIC_MODEL_RUN!=='yes')throw Error('Opt-in required');if(process.env.GITHUB_RUN_ATTEMPT&&process.env.GITHUB_RUN_ATTEMPT!=='1')throw Error('Replay forbidden; preserve original run');
  try{await read('boundary-comparison.json');throw Error('Results already recorded; replay forbidden');}catch(e){if(e.code!=='ENOENT')throw e;}
  const freeze=JSON.parse(await read('boundary-implementation-freeze.json'));if(freeze.caseInspectionByImplementerBeforeFreeze!==false||freeze.humanReviewed!==false||Object.keys(freeze.files).sort().join()!==freezeFiles.slice().sort().join())throw Error('Missing freeze');for(const[n,h]of Object.entries(freeze.files))if(digest(await read(n))!==h)throw Error('Frozen implementation differs');
  const datasetBytes=await read('boundary-evaluation.json'),reviewBytes=await read('boundary-review-manifest.json'),review=JSON.parse(reviewBytes),plan=JSON.parse(await read('boundary-execution-plan.json'));
  if(review.datasetSha256!==digest(datasetBytes)||review.policySha256!==digest(await read('BOUNDARY-POLICY-V13B.md'))||review.humanReviewed!==false||review.unresolvedDisagreements!==0||review.initialReviewerBlinded!==true||plan.datasetSha256!==digest(datasetBytes)||plan.freezeSha256!==digest(await read('boundary-implementation-freeze.json'))||plan.maximumApiAttempts!==24)throw Error('Invalid reviewed plan');
  for(const[n,h]of Object.entries(review.originalFiles)){if(!/^[a-z-]+\.json$/.test(n)||digest(await read('boundary-review/'+n))!==h)throw Error('Review records differ');}
  const originalBytes=await read('challenge-comparison.json'),original=JSON.parse(originalBytes);verifyOriginalBudget(original,plan,originalBytes);const dataset=verifyDataset(JSON.parse(datasetBytes));const options={apiKey:process.env.GEMINI_API_KEY,model:'gemini-3.5-flash-lite',timeoutMs:30000,totalTimeoutMs:65000,maxAttempts:2};
  const metadata={schemaVersion:1,experiment:'paired-boundary-followup-v13b',originalRunId:original.githubRunId,originalSha256:digest(originalBytes),originalApiAttempts:original.apiAttempts,combinedMaximumApiAttempts:80,sourceCommit:process.env.GITHUB_SHA??null,githubRunId:process.env.GITHUB_RUN_ID??null,datasetSha256:digest(datasetBytes),policySha256:digest(await read('BOUNDARY-POLICY-V13B.md')),reviewManifestSha256:digest(reviewBytes),implementationFreeze:freeze,promptHashes:{previous:digest(SUFFICIENT_POLICY),updated:digest(SUFFICIENT_POLICY+'\n'+SELECTION_INSTRUCTION)},policyVersions:{previous:'sufficient-evidence-v11',updated:'bounded-selection-v12'},requestedModel:options.model,evidenceModes:{previous:'quoted-v1',updated:'selection-v12'},attemptTimeoutMs:30000,totalTimeoutMs:65000,maxAttemptsPerCall:2,spacingMs:30000,armOrder:'Alternating first arm by shuffled case position',humanReviewed:false,startedAt:new Date().toISOString()};
  const result=await pairedBoundary(dataset,{adapters:{previous:createSufficientAdapter({...options,evidenceMode:'quoted-v1'}),updated:createSelectionAdapter(options)},checkpoint:async state=>writeFile(new URL('./boundary-comparison.local.json',import.meta.url),JSON.stringify({...metadata,...state,completedAt:state.status==='running'?null:new Date().toISOString()},null,2)+'\n'),progress:x=>console.log(JSON.stringify(x))});
  console.log(JSON.stringify({status:result.status,invocations:result.invocations,apiAttempts:result.apiAttempts,metrics:result.metrics}));if(result.status!=='complete'||['previousFirst','previous','updatedFirst','updated'].some(a=>result.metrics[a].errors))process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))runBoundary().catch(()=>{console.error('Focused evidence challenge failed; inspect checkpoint. Unknown in-flight calls are not zero or safely rerunnable.');process.exitCode=1;});
