import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {SUFFICIENT_POLICY} from './sufficient-adapter.mjs';
import {createSelectionAdapter} from './selection-adapter.mjs';
import {createAnchoredAdapter} from './anchor-adapter.mjs';
import {ANCHOR_INSTRUCTION} from './anchor-core.mjs';
import {SELECTION_INSTRUCTION} from './selection-core.mjs';
import {pairedSelection} from './selection-runner.mjs';
import {validateBatch} from './triage.mjs';
export const digest=x=>createHash('sha256').update(x).digest('hex');
export const freezeFiles=['model-adapter.mjs','reliable-adapter.mjs','sensitive-adapter.mjs','completeness-adapter.mjs','sufficient-adapter.mjs','selection-options.mjs','selection-core.mjs','selection-reliable.mjs','selection-adapter.mjs','selection-runner.mjs','anchor-diagnostics.mjs','anchor-spans.mjs','anchor-core.mjs','anchor-reliable.mjs','anchor-adapter.mjs','anchor-evaluation.mjs','triage.mjs','compare.mjs','ROUTING-POLICY-V14.md','OUTPUT-REVIEW-RUBRIC-V14.md'];
const read=n=>readFile(new URL('./'+n,import.meta.url),'utf8');
export function verifyDataset(dataset){
  if(dataset.id!=='ai-reviewed-anchor-v14'||dataset.schemaVersion!==1||dataset.cases?.length!==20)throw Error('Invalid dataset');validateBatch(dataset.cases.map(c=>c.input));
  const groups={};for(const c of dataset.cases){groups[c.stratum]=(groups[c.stratum]??0)+1;const e=c.expected;if(typeof e?.requiresHumanReview!=='boolean'||(e.requiresHumanReview?e.route!==null:!['access','billing','technical'].includes(e.route)))throw Error('Invalid label');
    const bundles=c.evidenceCriteria?.sufficientBundles;if(!Array.isArray(bundles)||!bundles.length||!Array.isArray(c.evidenceCriteria.optionalContext))throw Error('Missing sufficient bundles');
    for(const b of bundles){if(typeof b.trigger!=='string'||!b.trigger.trim()||!Array.isArray(b.facts)||!b.facts.length||b.facts.some(f=>typeof f!=='string'||!f.trim())||typeof b.exampleQuote!=='string'||b.exampleQuote.length<4||b.exampleQuote.length>120||![c.input.subject,c.input.body].some(s=>s.includes(b.exampleQuote)))throw Error('Invalid bundle');}
  }if(Object.keys(groups).sort().join()!==['multi_intent','boundary_span','subject_context','protective_controls'].sort().join()||groups.multi_intent!==6||groups.boundary_span!==6||groups.subject_context!==4||groups.protective_controls!==4)throw Error('Invalid coverage');for(const c of dataset.cases)if(c.stratum==='boundary_span'&&(!c.spanAssessment||c.spanAssessment.utf16Units<110||c.spanAssessment.utf16Units>120))throw Error('Missing near-boundary witness');return dataset;
}
export async function runAnchoredEvaluation(){
  if(process.env.MBQ_ALLOW_SYNTHETIC_MODEL_RUN!=='yes')throw Error('Opt-in required');if(process.env.GITHUB_RUN_ATTEMPT&&process.env.GITHUB_RUN_ATTEMPT!=='1')throw Error('Replay forbidden; preserve original run');
  try{await read('anchor-comparison.json');throw Error('Results already recorded; replay forbidden');}catch(e){if(e.code!=='ENOENT')throw e;}
  const freeze=JSON.parse(await read('anchor-implementation-freeze.json'));if(freeze.caseInspectionByImplementerBeforeFreeze!==false||freeze.humanReviewed!==false||Object.keys(freeze.files).sort().join()!==freezeFiles.slice().sort().join())throw Error('Missing freeze');for(const[n,h]of Object.entries(freeze.files))if(digest(await read(n))!==h)throw Error('Frozen implementation differs');
  const datasetBytes=await read('anchor-evaluation.json'),reviewBytes=await read('anchor-review-manifest.json'),review=JSON.parse(reviewBytes),plan=JSON.parse(await read('anchor-execution-plan.json'));
  if(review.datasetSha256!==digest(datasetBytes)||review.policySha256!==digest(await read('ROUTING-POLICY-V14.md'))||review.humanReviewed!==false||review.unresolvedDisagreements!==0||review.initialReviewerBlinded!==true||plan.datasetSha256!==digest(datasetBytes)||plan.freezeSha256!==digest(await read('anchor-implementation-freeze.json'))||plan.maximumApiAttempts!==80)throw Error('Invalid reviewed plan');
  for(const[n,h]of Object.entries(review.originalFiles)){if(!/^[a-z-]+\.json$/.test(n)||digest(await read('anchor-review/'+n))!==h)throw Error('Review records differ');}
  const dataset=verifyDataset(JSON.parse(datasetBytes));const options={apiKey:process.env.GEMINI_API_KEY,model:'gemini-3.5-flash-lite',timeoutMs:30000,totalTimeoutMs:65000,maxAttempts:2};
  const metadata={schemaVersion:1,experiment:'paired-fact-envelope-v14',sourceCommit:process.env.GITHUB_SHA??null,githubRunId:process.env.GITHUB_RUN_ID??null,datasetSha256:digest(datasetBytes),policySha256:digest(await read('ROUTING-POLICY-V14.md')),reviewManifestSha256:digest(reviewBytes),implementationFreeze:freeze,promptHashes:{previous:digest(SUFFICIENT_POLICY+'\n'+SELECTION_INSTRUCTION),updated:digest(SUFFICIENT_POLICY+'\n'+ANCHOR_INSTRUCTION)},policyVersions:{previous:'bounded-selection-v12',updated:'fact-envelope-v14'},requestedModel:options.model,evidenceModes:{previous:'selection-v12',updated:'anchored-v14'},attemptTimeoutMs:30000,totalTimeoutMs:65000,maxAttemptsPerCall:2,spacingMs:30000,armOrder:'Alternating first arm by shuffled case position',humanReviewed:false,startedAt:new Date().toISOString()};
  const result=await pairedSelection(dataset,{adapters:{previous:createSelectionAdapter(options),updated:createAnchoredAdapter(options)},checkpoint:async state=>writeFile(new URL('./anchor-comparison.local.json',import.meta.url),JSON.stringify({...metadata,...state,completedAt:state.status==='running'?null:new Date().toISOString()},null,2)+'\n'),progress:x=>console.log(JSON.stringify(x))});
  console.log(JSON.stringify({status:result.status,invocations:result.invocations,apiAttempts:result.apiAttempts,metrics:result.metrics}));if(result.status!=='complete'||['previousFirst','previous','updatedFirst','updated'].some(a=>result.metrics[a].errors))process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))runAnchoredEvaluation().catch(()=>{console.error('Focused evidence challenge failed; inspect checkpoint. Unknown in-flight calls are not zero or safely rerunnable.');process.exitCode=1;});
