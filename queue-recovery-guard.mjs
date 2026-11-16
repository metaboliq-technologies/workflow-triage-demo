import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export const originalRunId=43910453557;
export const expectedSource='796365feb74937f8a126ee7622de59f1b3261b36';
export function unusedCancelledRun(run,jobs,runNumber,runAttempt){
  return runNumber==='4'&&runAttempt==='1'&&run?.id===originalRunId&&run.head_sha===expectedSource&&run.run_attempt===1&&
    run.status==='completed'&&run.conclusion==='cancelled'&&jobs?.total_count===0&&Array.isArray(jobs.jobs)&&jobs.jobs.length===0;
}
export async function checkRecovery({fetchImpl=fetch,runNumber=process.env.GITHUB_RUN_NUMBER,runAttempt=process.env.GITHUB_RUN_ATTEMPT}={}){
  // Only this workflow's next run can recover. Future manual reruns fail closed.
  if(runNumber!=='4'||runAttempt!=='1')throw new Error('Recovery is restricted to workflow run number 4, attempt 1.');
  const prefix='https://api.github.com/repos/metaboliq-technologies/workflow-triage-demo/actions/runs/'+originalRunId;
  const get=async url=>{const response=await fetchImpl(url,{method:'GET',redirect:'error',headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('Could not verify original run.');return response.json();};
  const run=await get(prefix),jobs=await get(prefix+'/jobs?filter=all');
  return {originalRunId,originalSource:run.head_sha,originalAttempt:run.run_attempt,originalStatus:run.status,originalConclusion:run.conclusion,originalJobCount:jobs.total_count,currentWorkflowRunNumber:runNumber,currentWorkflowRunAttempt:runAttempt,eligible:unusedCancelledRun(run,jobs,runNumber,runAttempt),checkedAt:new Date().toISOString()};
}
async function main(){
  let observation;
  try{
    observation=await checkRecovery();await writeFile(new URL('./queue-recovery.local.json',import.meta.url),JSON.stringify(observation,null,2)+'\n');
    if(!observation.eligible)throw new Error('Original run was not confirmed cancelled before job allocation.');
    console.log('Recovery verified: original run cancelled with zero jobs; only this replacement may make the bounded model calls.');
  }catch{console.error('Recovery blocked. No model call is permitted unless original cancellation with zero allocated jobs is verified.');process.exitCode=1;}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
