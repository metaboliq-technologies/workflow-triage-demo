import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {triage,validateBatch} from './triage.mjs';
import {createGeminiAdapter,LEGACY_MODEL_POLICY,modelDecision,guardedModelDecision,ModelError} from './model-adapter.mjs';

const digest=text=>createHash('sha256').update(text).digest('hex');
export function score(rows,arm) {
  let correct=0,available=0,proposals=0,correctProposals=0,expectedReview=0,caughtReview=0,unnecessaryReview=0;
  for(const row of rows){
    const expected=row.expected;expectedReview+=Number(expected.requiresHumanReview);
    const result=row[arm];
    // Provider/schema failures are not credited as correct review decisions.
    if(!result||result.error)continue;
    available++;
    const matches=result.route===expected.route&&result.requiresHumanReview===expected.requiresHumanReview;
    correct+=Number(matches);
    if(!result.requiresHumanReview){proposals++;correctProposals+=Number(matches);}
    if(expected.requiresHumanReview)caughtReview+=Number(result.requiresHumanReview);
    else unnecessaryReview+=Number(result.requiresHumanReview);
  }
  return {total:rows.length,available,errors:rows.length-available,correct,exactMatchRate:correct/rows.length,
    proposals,correctProposals,proposalPrecision:proposals?correctProposals/proposals:null,
    expectedReview,caughtReview,reviewRecall:expectedReview?caughtReview/expectedReview:null,unnecessaryReview};
}

export async function compareCases(dataset,{adapter=null,delayMs=13000,sleep=ms=>new Promise(r=>setTimeout(r,ms))}={}){
  if(!Number.isInteger(delayMs)||delayMs<0||delayMs>60000)throw new Error('Invalid request spacing.');
  if(!dataset||dataset.schemaVersion!==1||!['synthetic-fresh-v2','bitext-independent-v3'].includes(dataset.id)||!Array.isArray(dataset.cases)||dataset.cases.length!==40)throw new Error('Invalid frozen evaluation dataset.');
  validateBatch(dataset.cases.map(c=>c.input));
  for(const c of dataset.cases){if(typeof c.expected?.requiresHumanReview!=='boolean'||
    (c.expected.requiresHumanReview?c.expected.route!==null:!['access','billing','technical'].includes(c.expected.route)))throw new Error('Invalid expected decision.');}
  const rows=[];let fatalProviderError=false;
  for(const [index,item] of dataset.cases.entries()){
    const row={id:item.input.id,stratum:item.stratum,expected:item.expected,baseline:triage(item.input)};
    if(adapter&&fatalProviderError){
      row.model={error:'not_attempted_after_authentication_failure',requiresHumanReview:true,route:null};
      row.guarded={...row.model};row.provider={attempts:0};
    } else if(adapter){
      try{
        // Only input is passed to the adapter; expected decisions never enter its prompt.
        const response=await adapter.classify(item.input);
        row.model=modelDecision(item.input,response.output);row.guarded=guardedModelDecision(item.input,response.output);
        row.provider=response;
      }catch(error){
        row.model={error:error instanceof ModelError?error.code:'model_run_error',requiresHumanReview:true,route:null};
        row.guarded={...row.model};row.provider=error instanceof ModelError?{
          attempts:error.attempts,diagnostics:error.diagnostics,attemptLog:error.attemptLog??[]
        }:{attempts:null};
        fatalProviderError=error instanceof ModelError&&[401,403].includes(error.httpStatus);
      }
      if(index<dataset.cases.length-1&&!fatalProviderError)await sleep(delayMs);
    }
    rows.push(row);
  }
  const arms=adapter?['baseline','model','guarded']:['baseline'];
  return {rows,metrics:Object.fromEntries(arms.map(arm=>[arm,score(rows,arm)]))};
}

async function main(){
  const mode=process.argv[2];
  if(!['--baseline','--live','--independent-baseline','--independent-live'].includes(mode)||process.argv.length!==3)throw new Error('Choose a documented baseline or live comparison mode.');
  const independent=mode.startsWith('--independent-');
  const bytes=await readFile(new URL(independent?'./independent-evaluation.json':'./fresh-evaluation.json',import.meta.url),'utf8');
  const live=mode.endsWith('live');
  if(live&&process.env.MBQ_ALLOW_SYNTHETIC_MODEL_RUN!=='yes')throw new Error('Live evaluation requires explicit synthetic-data run opt-in.');
  const adapter=live?createGeminiAdapter({apiKey:process.env.GEMINI_API_KEY,model:process.env.GEMINI_MODEL||'gemini-3.8-flash',policyVersion:'legacy-v3'}):null;
  const startedAt=live?new Date().toISOString():null;
  const result=await compareCases(JSON.parse(bytes),{adapter});
  const report={schemaVersion:2,diagnosticsVersion:1,dataset:JSON.parse(bytes).id,datasetSha256:digest(bytes),promptSha256:digest(LEGACY_MODEL_POLICY),
    mode:live?'live-gemini':'baseline-only',sourceCommit:/^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA||'')?process.env.GITHUB_SHA:null,
    startedAt,completedAt:live?new Date().toISOString():null,provider:live?'gemini-developer-api':null,requestedModel:adapter?.model??null,
    maximumApiCalls:live?80:0,actionsExecuted:0,...result};
  // stdout contains a compact summary, never the key or provider's raw error bodies.
  const output=independent?(live?'independent-comparison.local.json':'independent-baseline-report.json'):(live?'comparison.local.json':'fresh-baseline-report.json');
  await writeFile(new URL(`./${output}`,import.meta.url),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({output,mode:report.mode,metrics:report.metrics},null,2));
  if(live&&result.metrics.model.errors>0)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  main().catch(error=>{console.error(error instanceof ModelError?error.code:'Comparison could not complete. Check the documented configuration and dataset.');process.exitCode=1;});
}
