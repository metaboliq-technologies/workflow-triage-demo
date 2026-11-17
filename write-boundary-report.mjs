import {readFile,writeFile} from 'node:fs/promises';
const json=async n=>JSON.parse(await readFile(new URL('./'+n,import.meta.url),'utf8'));
const raw=await json('boundary-comparison.json'),sem=await json('boundary-semantic-comparison.json'),diag=await json('boundary-run-diagnostics.json'),proc=await json('boundary-output-review-process.json'),audit=await json('boundary-candidate-audit.json'),run=await json('boundary-run-record.json'),original=await json('challenge-comparison.json'),review=await json('boundary-review/review-resolutions.json'),novelty=await json('boundary-novelty-audit.json');
const esc=x=>String(x??'—').replaceAll('|','\\|').replaceAll('\n',' '),table=(head,rows)=>'| '+head.join(' | ')+' |\n| '+head.map(()=> '---').join(' | ')+' |\n'+rows.map(xs=>'| '+xs.map(esc).join(' | ')+' |').join('\n');
const metricTable=table(['Metric /6','Rules','v11 direct quote','v12 bounded selection'],[['Correct first attempts','—',raw.metrics.previousFirst.correct,raw.metrics.updatedFirst.correct],['Available final outputs',raw.metrics.baseline.available,raw.metrics.previous.available,raw.metrics.updated.available],['Correct final routing',raw.metrics.baseline.correct,raw.metrics.previous.correct,raw.metrics.updated.correct],['AI-rated decision support','—',sem.allCases.previous.supportsReturnedDecision,sem.allCases.updated.supportsReturnedDecision],['AI-rated sufficient-bundle coverage','—',sem.allCases.previous.coversSufficientReferenceBundle,sem.allCases.updated.coversSufficientReferenceBundle],['Correct route + support + coverage','—',sem.allCases.previous.jointRoutingSupportAndCoverage,sem.allCases.updated.jointRoutingSupportAndCoverage],['Criteria ambiguity flagged','—',sem.allCases.previous.criteriaAmbiguous,sem.allCases.updated.criteriaAmbiguous]]);
const spanTable=table(['Case','Independent shortest observed units','Field','Witness in v12 candidates','v11 returned units','v12 returned units'],audit.rows.map(a=>{const r=raw.rows.find(r=>r.id===a.id);return [a.id,a.spanAssessment.utf16Units,a.spanAssessment.sourceField,a.shortestObservedContainedInCandidateIds.length>0,r.providers.previous?.output?.evidence.length,r.providers.updated?.output?.evidence.length];}));
const attemptTable=table(['Case','Arm','Attempt','Failure','Latency ms','Retry delay ms'],diag.failedAttempts.map(a=>[a.id,a.arm,a.attempt,a.error,a.attemptLatencyMs,a.retryDelayMs]));
const failures=sem.failures.map(f=>{const r=sem.rows.find(r=>r.id===f.id),p=r.providers[f.arm];return '- **'+f.id+' / '+f.arm+'**: '+(f.result.error?'Unavailable: `'+f.result.error+'` ('+(p?.diagnostics?.validationReason??'provider failure')+').':'Quote “'+p.output.evidence+'”. Route correct:'+f.grade.routingCorrect+'; support:'+f.grade.supportsReturnedDecision+'; reference coverage:'+f.grade.coversSufficientReferenceBundle+'; criteria ambiguity:'+f.grade.criteriaAmbiguous+'. '+f.grade.rationale);}).join('\n');
const recoveries=diag.firstFailures.map(f=>'- '+f.id+' / '+f.arm+': '+f.firstError+'; recovered:'+f.recovered+'; final:'+(f.finalError??f.finalOutput?.category??'unknown')+'.').join('\n');
const known=Object.fromEntries(['previous','updated'].map(arm=>[arm,raw.rows.reduce((n,r)=>n+(r.providers[arm]?.attemptLog??[]).reduce((s,a)=>s+(Number.isSafeInteger(a.usage?.totalTokenCount)?a.usage.totalTokenCount:0),0),0)]));
const text=`# Separate boundary follow-up v13b — preserved original challenge, shared budget

17 November 2026. Six fresh crafted fictional English requests, separate AI author, blind initial difficulty/label reviewer, and blind evidence reviewer. **Not a new adapter, human validation or a representative workload.** Read the [original 20-case challenge](challenge-results.md) separately; results are not pooled as one benchmark.

The stronger follow-up exposes a regression: v12 routes 6/6 correctly but achieves only 2/6 joint routing/support/reference-coverage successes, versus v11 5/6 routing and4/6 joint success. Both route all 5 common-valid pairs correctly; support is4/5 for v11 versus2/5 for v12. Bounded extraction prevents accepted overlength text but does not guarantee complete evidence. Do not promote v12 as a general improvement.

## Why this follow-up exists

The first 20-case challenge's six supposed near-limit cases all had shorter sufficient quotes 55–90 units. That shortfall was identified before its provider outcomes. Original cases and results were preserved. A separate protocol/harness froze at \`b2f88c720f7d9468025ed624c447386f4518f964\` while that run was still active, before six follow-up cases were created. Neither v11 nor v12 was modified.

Fresh author and independent reviewer assessed positive ordinary intents placed near opposite ends of a single 110–120-unit source span. The visual middle description is optional context, not an extra required semantic fact; it occupies unavoidable intervening characters under the contiguous quote contract. Both substantive ordinary intents establish review; one intent or generic heading alone does not. All six references require review. This deliberately constructed prose is a contract stress test, not natural customer sampling.

Initial reviewer saved independent labels and shortest-observed witnesses before seeing author labels; initial records sealed remotely at \`223b215d0a4934889901c0b138e5bc8da46d887b\`. Agreement:${review.initialAgreement.agreed}/${review.initialAgreement.total}. All originals, canonical byte-identical aliases, spans and reconciliation are retained. One prospective authoring round was used. Shortest-observed judgments are AI searches, not proofs of global minima; reviewers may miss shorter alternatives.

Before provider calls, only ${audit.rows.filter(a=>a.shortestObservedContainedInCandidateIds.length).length}/6 reviewed sufficient witnesses were available in v12's candidate list. Missing exact witnesses are not alone proof that no semantically equivalent option exists; blind output review assesses actual choices. Cases were not filtered or tuned to favor either pipeline. Witness gaps were identified before provider outcomes. b13-005 has a sufficient candidate available, yet v12 chooses a different span ending with the incomplete object “unlock my”; thus candidate generation is not the only failure. v12 also omits the refund action on b13-001, quotes only PIN reset on b13-006 and selects “Two app issues” on b13-002. All are source-exact and bounded yet insufficient.

${spanTable}

## Execution, shared ceiling and metrics

[Follow-up run ${run.runId}](https://github.com/metaboliq-technologies/workflow-triage-demo/actions/runs/${run.runId}), source \`${raw.sourceCommit}\`, ${raw.startedAt} to ${raw.completedAt}. Dataset SHA256:\`${raw.datasetSha256}\`. Experiment status:**${raw.status}**; workflow conclusion:**${run.workflowConclusion}**. Follow-up ${raw.invocations}/12 classifications, ${raw.apiAttempts}/24 provider attempts, ${diag.validFinal} valid final outputs, ${diag.unattempted.length} unattempted. Original run:${original.apiAttempts} attempts. **Combined:${original.apiAttempts+raw.apiAttempts}/80 attempts**. Original checkpoint SHA256:\`${raw.originalSha256}\`.

The follow-up gate required original coverage complete with 40 classifications, no unresolved in-flight work and at most 56 original attempts; at most 24 follow-up attempts can therefore fit the unchanged80 total ceiling. Neither original failed nor valid calls are replayed. Same Gemini 3.5 Flash Lite,30-second spacing,30-second attempt timeout,65-second total deadline, at most two inherited transient attempts, alternating first arm. No quota/billing/key/project workaround, extra probes or output repair. No business actions.

${metricTable}

Common-valid pairs:${sem.commonValid.caseIds.length}; support ${sem.commonValid.metrics.previous.supportsReturnedDecision}/${sem.commonValid.metrics.previous.total} vs ${sem.commonValid.metrics.updated.supportsReturnedDecision}/${sem.commonValid.metrics.updated.total}; joint ${sem.commonValid.metrics.previous.jointRoutingSupportAndCoverage}/${sem.commonValid.metrics.previous.total} vs ${sem.commonValid.metrics.updated.jointRoutingSupportAndCoverage}/${sem.commonValid.metrics.updated.total}. Unavailable/invalid outputs receive no all-case correctness credit. A correct review route does not establish evidence sufficiency.

## Every failed attempt and final evidence failure

${attemptTable}

${recoveries||'No first-attempt failures recorded.'}

${failures||'No final routing/support/coverage failures or criteria ambiguities were observed by the blind AI reviewer.'}

The actual workflow conclusion is retained, including recovered first-attempt failures. Rejected raw response text is not stored by the adapter; diagnostic reasons/lengths and unknown usage are preserved without reconstructing or repairing it. Format errors do not trigger a repair retry. Do not rerun the workflow to improve scores or its status.

Known Gemini total tokens:${diag.knownUsage.totalTokenCount}; known attempts:${diag.knownUsage.attemptsWithUsage}; unknown failed-attempt usage:${diag.knownUsage.attemptsWithoutUsage}, not zero. Known tokens by arm:v11 ${known.previous},v12 ${known.updated}. These counters exclude separate author/reviewer agents. Candidate generation and ID format change the inference task and token cost; timing/recovery differences are not causal performance estimates.

## Blind grading and limits

A new fresh-context evidence-review AI saw shuffled valid outputs, full requests, expected decisions, sufficient fact bundles and optional context. No exemplar/shortest-witness quotes, original IDs, arm/candidate IDs, candidate options, code, order/run metadata, original-phase results or aggregate scores were supplied. Repeated requests and extraction style may allow guesses despite metadata blinding. All ${diag.validFinal} grades were saved and SHA-sealed before unblinding:\`${proc.gradesSha256??proc.gradeSHA256??proc.gradeSha256}\`.

Reference facts contain only the two ordinary substantive intents; middle visual context is optional and scored separately. A generic subject, one action, a topic or cut-off object does not express both. The reviewer must still flag any overly strict reference, alternative support or missed shorter quote. No post-result criteria changes or hidden rescoring.

Against ${novelty.priorRequests} earlier requests, ${novelty.exactBodyDuplicateCases} exact body duplicates and ${novelty.reusedSubjectCases} reused heading were found; “Support request” is a common earlier heading. Crafted contexts deliberately target a span-availability weakness, not an estimate of its customer prevalence. All six cases require review, so this phase cannot measure ordinary-route precision or unnecessary review. Small English-only synthetic data, shared AI/policy bias, uncalibrated semantic review, possible reference/shortest-span omissions, output-style leakage, stochastic model behavior and provider-time confounds remain. No human adjudication, global-minimality, causal improvement, significance, stable failure-rate, broad security or production-readiness claim. Keep this phase distinct from the preserved20-case results and older studies.

## Reproduction and records

Live preflight:${run.preflightTests??'see logs'} tests passed. Offline audit:\`node verify-boundary-evaluation.mjs\`; original audit:\`node verify-challenge-evaluation.mjs\`. No key or extra provider calls. Frozen hashes, exact references, budgets, raw routing/guards/baseline, blinded assembly and sealed grades are verified. Saved result and run-attempt guards prevent replay.

- [Raw follow-up](boundary-comparison.json),[run record](boundary-run-record.json),[all diagnostics](boundary-run-diagnostics.json),[semantic grades/comparison](boundary-semantic-comparison.json)
- [Dataset](boundary-evaluation.json),[freeze](boundary-implementation-freeze.json),[protocol](BOUNDARY-PROTOCOL-V13B.md),[review manifest](boundary-review-manifest.json),[execution plan](boundary-execution-plan.json),[candidate audit](boundary-candidate-audit.json),[novelty audit](boundary-novelty-audit.json)
- [Round-one inputs](boundary-review/round-one-inputs.json),[round-one author labels](boundary-review/round-one-labels.json),[author process](boundary-review/round-one-process.json),[blind initial labels](boundary-review/reviewer-initial-labels.json),[initial review process](boundary-review/reviewer-initial-process.json),[final labels](boundary-review/final-labels.json),[all reconciliations](boundary-review/review-resolutions.json)
- [Blind outputs](boundary-output-items.json),[sealed grades](boundary-output-grades.json),[review process](boundary-output-review-process.json),[assembly](boundary-output-assembly.json),[unblinding map](boundary-output-map.json)
`;
await writeFile(new URL('./boundary-results.md',import.meta.url),text);console.log(JSON.stringify({written:'boundary-results.md',characters:text.length}));
