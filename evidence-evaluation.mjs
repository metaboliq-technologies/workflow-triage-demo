import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {pairedEvaluation} from './paired-evaluation.mjs';
import {createGeminiAdapter,MODEL_POLICY,INDEXED_EVIDENCE_INSTRUCTION} from './model-adapter.mjs';
import {validateBatch} from './triage.mjs';
const hash=value=>createHash('sha256').update(value).digest('hex');
const read=path=>readFile(new URL('./'+path,import.meta.url),'utf8');
export async function runEvidenceEvaluation(){
  if(process.env.MBQ_ALLOW_SYNTHETIC_MODEL_RUN!=='yes')throw new Error('Synthetic run opt-in required.');
  const freeze=JSON.parse(await read('evidence-implementation-freeze.json'));
  const required=['model-adapter.mjs','evidence-evaluation.mjs','paired-evaluation.mjs','triage.mjs','compare.mjs','ROUTING-POLICY-V4.md'];
  if(freeze.caseInspectionByImplementerBeforeFreeze!==false||Object.keys(freeze.files??{}).sort().join()!==required.sort().join())throw new Error('Missing freeze.');
  for(const [file,digest]of Object.entries(freeze.files))if(hash(await read(file))!==digest)throw new Error('Freeze differs.');
  const bytes=await read('evidence-evaluation.json'),manifestBytes=await read('evidence-review-manifest.json');
  const dataset=JSON.parse(bytes),review=JSON.parse(manifestBytes);
  if(dataset.id!=='ai-reviewed-evidence-v5'||dataset.cases?.length!==40||review.datasetSha256!==hash(bytes)||review.policySha256!==hash(await read('ROUTING-POLICY-V4.md'))||review.humanReviewed!==false||review.unresolvedDisagreements!==0||review.caseCount!==40)throw new Error('Unreviewed set.');
  for(const [file,digest]of Object.entries(review.originalFiles??{})){
    if(!/^evidence-review\/[a-z-]+\.json$/.test(file)||hash(await read(file))!==digest)throw new Error('Review originals differ.');
  }
  if(Object.keys(review.originalFiles??{}).length!==5)throw new Error('Missing review originals.');
  const finalLabels=JSON.parse(await read('evidence-review/final-labels.json'));
  const originals=JSON.parse(await read('evidence-review/author-inputs.json'));
  if(finalLabels.length!==40||originals.length!==40||new Set(finalLabels.map(c=>c.id)).size!==40)throw new Error('Incomplete final review.');
  for(const c of dataset.cases){
    const label=finalLabels.find(l=>l.id===c.input.id),original=originals.find(i=>i.id===c.input.id);
    if(!label||!original||JSON.stringify(c.expected)!==JSON.stringify(label.expected)||c.stratum!==label.stratum||
      c.input.subject!==original.subject||c.input.body!==original.body)throw new Error('Dataset differs from original reviewed cases.');
  }
  validateBatch(dataset.cases.map(c=>c.input));
  const strata={};for(const c of dataset.cases){
    if(typeof c.expected?.requiresHumanReview!=='boolean'||(c.expected.requiresHumanReview?c.expected.route!==null:!['access','billing','technical'].includes(c.expected.route))||!c.labelReview?.rationale)throw new Error('Invalid labels.');
    strata[c.stratum]=(strata[c.stratum]??0)+1;
  }
  if(Object.keys(strata).sort().join()!==['signup','account_closure','ordinary_access','billing','technical','security','injection','contextual'].sort().join()||!Object.values(strata).every(n=>n===5))throw new Error('Invalid strata.');
  const metadata={schemaVersion:4,dataset:dataset.id,datasetSha256:hash(bytes),reviewManifestSha256:hash(manifestBytes),review,implementationFreeze:freeze,
    policySha256:hash(MODEL_POLICY),indexedInstructionSha256:hash(INDEXED_EVIDENCE_INSTRUCTION),requestedModel:'gemini-3.5-flash-lite',
    armDefinitions:{baseline:'unchanged rules',legacyModel:'clarified-v4 / quoted-v1',model:'clarified-v4 / indexed-v1',guarded:'rules guarded indexed'},
    sourceCommit:process.env.GITHUB_SHA??null,startedAt:new Date().toISOString(),spacingMs:6500,maxAttemptsPerCall:1,provider:'gemini-developer-api'};
  const common={apiKey:process.env.GEMINI_API_KEY,model:metadata.requestedModel,policyVersion:'clarified-v4',maxAttempts:1};
  const result=await pairedEvaluation(dataset,{legacyAdapter:createGeminiAdapter({...common,evidenceMode:'quoted-v1'}),adapter:createGeminiAdapter({...common,evidenceMode:'indexed-v1'}),
    checkpoint:async state=>writeFile(new URL('./evidence-comparison.local.json',import.meta.url),JSON.stringify({...metadata,...state,completedAt:state.status==='complete'?new Date().toISOString():null},null,2)+'\n'),
    progress:value=>console.log(JSON.stringify(value))});
  console.log(JSON.stringify({status:result.status,invocations:result.invocations,metrics:result.metrics}));
  if(result.metrics.model.errors||result.metrics.legacyModel.errors)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))runEvidenceEvaluation().catch(()=>{console.error('Evidence evaluation could not complete; inspect retained checkpoint and configuration.');process.exitCode=1;});
