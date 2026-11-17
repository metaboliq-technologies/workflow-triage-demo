import {readFile,writeFile} from 'node:fs/promises';import {score} from './compare.mjs';
const json=async n=>JSON.parse(await readFile(new URL('./'+n,import.meta.url),'utf8'));
const raw=await json('challenge-comparison.json'),sem=await json('challenge-semantic-comparison.json'),diag=await json('challenge-run-diagnostics.json'),proc=await json('challenge-output-review-process.json'),audit=await json('challenge-candidate-audit.json'),novelty=await json('challenge-novelty-audit.json'),run=await json('challenge-run-record.json'),review=await json('challenge-review/review-resolutions.json'),dataset=await json('challenge-evaluation.json');
const esc=x=>String(x??'—').replaceAll('|','\\|').replaceAll('\n',' '),table=(head,rows)=>'| '+head.join(' | ')+' |\n| '+head.map(()=> '---').join(' | ')+' |\n'+rows.map(xs=>'| '+xs.map(esc).join(' | ')+' |').join('\n');
const arms=['previous','updated'],groupNames=['generic_heading','length_boundary','subject_decisive'];
const routeTable=table(['Routing metric /20','Rules','v11 direct quote','v12 bounded selection'],[['Available final outputs',raw.metrics.baseline.available,raw.metrics.previous.available,raw.metrics.updated.available],['Correct first-attempt decisions','—',raw.metrics.previousFirst.correct,raw.metrics.updatedFirst.correct],['Correct final decisions',raw.metrics.baseline.correct,raw.metrics.previous.correct,raw.metrics.updated.correct],['Required review caught /'+raw.metrics.baseline.expectedReview,raw.metrics.baseline.caughtReview,raw.metrics.previous.caughtReview,raw.metrics.updated.caughtReview],['Unnecessary reviews',raw.metrics.baseline.unnecessaryReview,raw.metrics.previous.unnecessaryReview,raw.metrics.updated.unnecessaryReview]]);
const groupTable=table(['Group','Cases','Rules correct','v11 routing / support / joint','v12 routing / support / joint'],groupNames.map(g=>{const rs=raw.rows.filter(r=>r.stratum===g),s=sem.byGroup[g].allCases;return [g,rs.length,score(rs,'baseline').correct,[s.previous.routingCorrect,s.previous.supportsReturnedDecision,s.previous.jointRoutingSupportAndCoverage].join(' / '),[s.updated.routingCorrect,s.updated.supportsReturnedDecision,s.updated.jointRoutingSupportAndCoverage].join(' / ')];}));
const semanticTable=table(['AI evidence metric','v11 all20','v12 all20','v11 common-valid','v12 common-valid'],['routingCorrect','sourceExact','supportsReturnedDecision','coversSufficientReferenceBundle','jointRoutingSupportAndCoverage','criteriaAmbiguous'].map(k=>[k,sem.allCases.previous[k],sem.allCases.updated[k],sem.commonValid.metrics.previous[k]+'/'+sem.commonValid.metrics.previous.total,sem.commonValid.metrics.updated[k]+'/'+sem.commonValid.metrics.updated.total]));
const attemptTable=table(['Case','Arm','Attempt','Failure','Latency ms','Retry delay ms','Deferral'],diag.failedAttempts.map(a=>[a.id,a.arm,a.attempt,a.error,a.attemptLatencyMs,a.retryDelayMs,a.retryDeferred]));
const recoveryTable=table(['Case','Arm','Initial failure','Recovered','Final category/error'],diag.firstFailures.map(a=>[a.id,a.arm,a.firstError,a.recovered,a.finalError??a.finalOutput?.category]));
const failures=sem.failures.map(f=>{const row=sem.rows.find(r=>r.id===f.id),p=row.providers[f.arm];return '- **'+f.id+' / '+f.arm+'**: '+(f.result.error?'Unavailable: `'+f.result.error+'`; '+(p?.diagnostics?.validationReason??'provider failure')+'.':'Quote “'+p.output.evidence+'”. Routing correct: '+f.grade.routingCorrect+'; support: '+f.grade.supportsReturnedDecision+'; sufficient-bundle coverage: '+f.grade.coversSufficientReferenceBundle+'; criteria ambiguity: '+f.grade.criteriaAmbiguous+'. '+f.grade.rationale);}).join('\n');
const changes=sem.rows.filter(r=>r.semantic.previous&&r.semantic.updated&&['routingCorrect','supportsReturnedDecision','coversSufficientReferenceBundle'].some(k=>r.semantic.previous[k]!==r.semantic.updated[k])).map(r=>'- **'+r.id+'** — v11 “'+r.providers.previous.output.evidence+'”; v12 “'+r.providers.updated.output.evidence+'”. Routing '+r.semantic.previous.routingCorrect+' → '+r.semantic.updated.routingCorrect+'; support '+r.semantic.previous.supportsReturnedDecision+' → '+r.semantic.updated.supportsReturnedDecision+'; coverage '+r.semantic.previous.coversSufficientReferenceBundle+' → '+r.semantic.updated.coversSufficientReferenceBundle+'.').join('\n');
const boundaryTable=table(['Case','Long exemplar units','Final shortest observed','Initial reviewer shortest','Long exemplar in candidates','Shortest in candidates'],audit.rows.filter(r=>r.stratum==='length_boundary').map(r=>{const init=review.spanReview.find(s=>s.id===r.id).initialSpan;return [r.id,r.witnesses[0].exampleQuote.length,r.spanAssessment.utf16Units,init.utf16Units,r.witnesses[0].containedInCandidateIds.length>0,r.shortestObservedContainedInCandidateIds.length>0];}));
const knownByArm=Object.fromEntries(arms.map(arm=>[arm,raw.rows.reduce((n,r)=>n+(r.providers[arm]?.attemptLog??[]).reduce((s,a)=>s+(Number.isSafeInteger(a.usage?.totalTokenCount)?a.usage.totalTokenCount:0),0),0)]));
const headingSelections=raw.rows.filter(r=>r.stratum==='generic_heading').flatMap(r=>arms.filter(a=>r.providers[a]?.output).map(arm=>{const input=dataset.cases.find(c=>c.input.id===r.id).input,e=r.providers[arm].output.evidence;return {id:r.id,arm,evidence:e,subjectOnly:input.subject.includes(e)&&!input.body.includes(e),support:r.semantic?.[arm]?.supportsReturnedDecision??sem.rows.find(s=>s.id===r.id).semantic[arm]?.supportsReturnedDecision};}));
const quoteStats=Object.fromEntries(groupNames.map(g=>[g,Object.fromEntries(arms.map(a=>{const lengths=raw.rows.filter(r=>r.stratum===g&&r.providers[a]?.output).map(r=>r.providers[a].output.evidence.length);return [a,{valid:lengths.length,min:lengths.length?Math.min(...lengths):null,max:lengths.length?Math.max(...lengths):null,at120:lengths.filter(n=>n===120).length}];}))]));
const finalErrors=raw.rows.flatMap(r=>arms.filter(a=>r.providers[a]?.error).map(arm=>({id:r.id,arm,error:r.providers[arm].error,reason:r.providers[arm].diagnostics?.validationReason??null,attempts:r.providers[arm].attempts})));
const text=`# Focused evidence challenge v13 — unchanged v11 versus v12

17 November 2026. Twenty newly AI-authored fictional English support requests, separately blind AI label-reviewed and blind AI evidence-reviewed. **This is a new challenge set, not a new adapter release or human validation.** Historical data, source and scores remain unchanged.

On this main set, v12 has 20/20 joint routing/support/reference-coverage successes versus 17/20 for v11. The direct-quote arm uses unsupported count/topic headings on v13-003 and v13-016 and rejects a121-unit quote on v13-019. On19 common-valid pairs, routing is19/19 for both while sufficient support is17/19 versus19/19. These are small targeted observations, not causal or production reliability claims. The [separate six-case boundary follow-up](boundary-results.md) preserves this phase and tests a stronger span constraint; do not pool the two phases. That follow-up achieves4/6 joint successes for direct quotes versus2/6 for bounded selection, exposing a regression hidden by routing-only scores.

## Design and pre-run shortfalls

Eight generic-heading cases (four multiple-intent review, four ordinary controls), six intended length-boundary cases and six decisive-subject cases. Both adapters are unchanged: v11 direct source quotes versus v12 bounded span-ID selection. Public output stays category plus one unchanged single-field4–120 UTF-16-unit quote. The rules baseline is unchanged. No customer data or action execution.

Separate offline contract checks accept unchanged119/120-unit quotes, reject121-unit quotes without repair, and resolve a120-unit candidate ID while rejecting an unlisted121-unit reference. These checks make zero provider calls; they are not natural-language model outcomes.

The intended length challenge did not force evidence near the limit: all six cases admit shorter sufficient quotes,55–90 units after reconciliation. Long author exemplars are 115,115,118,119,120,120 units. Both the author and blind reviewer documented shorter alternatives before provider calls. Cases were preserved, not replaced or padded to inflate fact requirements. Initial reviewer and final shortest-search judgments may differ; neither proves mathematical minimality.

${boundaryTable}

The120-unit exemplar for v13-019 is absent from the v12 candidate list, but its shorter sufficient witness is available. This is an exemplar gap, not demonstrated semantic inability. Every final shortest-observed sufficient witness is contained in at least one candidate. Candidate availability is not an evidence whitelist and does not prove availability of every equivalent span.

The generic-heading heuristic excludes only ${audit.rows.filter(r=>r.stratum==='generic_heading'&&r.genericSubjectExcluded).length}/8 headings, ${audit.rows.filter(r=>r.stratum==='generic_heading'&&r.genericSubjectExcluded).map(r=>r.id).join(', ')||'none'}. The other headings remain selectable. Meaningful decisive subjects remain available. These limitations were measured before results; neither adapter was tuned to the new cases.

Against ${novelty.priorRequests} earlier requests, ${novelty.exactBodyDuplicateCases} exact body duplicates and ${novelty.reusedSubjectCases} reused heading were found. The heading “A couple of things” recurs, and some familiar invoice/access patterns resemble earlier fixtures. Newly authored text and word-set similarity do not establish semantic novelty or training-data exclusion.

## Freeze and independent review

Harness, policy, rubric and unchanged adapter/runtime files froze at \`ea01783e0d0228661d0e0a62907246801be55916\` before the fresh-context author started. Author saw only policy/rubric. A separate fresh-context label reviewer saw only policy/rubric and inputs, not author labels/groups, candidate code or historical results. Initial labels were saved and SHA-sealed before author-label exposure; originals sealed remotely at \`596951259c27d220cfd05d2afe38c171859d703c\`.

Initial routing agreement:${review.initialAgreement.agreed}/${review.initialAgreement.total}. All original decisions, spans, changes and primary pre-run suggestions are retained. Primary implementer knew historical outcomes and saw cases only after freeze. Reconciliation was exposed AI discussion, not another blind or human judgment. There are ${raw.metrics.baseline.expectedReview} review cases and ${20-raw.metrics.baseline.expectedReview} ordinary routes. Dataset SHA256:\`${raw.datasetSha256}\`. Execution source:\`${raw.sourceCommit}\`.

## Execution and routing

[Run ${run.runId}](https://github.com/metaboliq-technologies/workflow-triage-demo/actions/runs/${run.runId}), ${raw.startedAt} to ${raw.completedAt}. Experiment status:**${raw.status}**; workflow conclusion:**${run.workflowConclusion}**. ${raw.invocations}/40 classifications; ${raw.apiAttempts}/80 provider attempts; ${diag.validFinal} valid final responses; ${diag.unattempted.length} unattempted slots. Stop reason:${raw.stopReason??'none'}; in-flight state:${JSON.stringify(raw.inFlight)}.

Both arms use Gemini 3.5 Flash Lite. Fixed shuffled cases, alternating first arm by position;30-second spacing,30-second attempt timeout,65-second total deadline, at most two attempts for inherited transient errors. No quota workaround, billing/key/project changes, extra probes, live-run replay or repair of rejected outputs. Zero business actions. The runner reports first/final failures even when retries recover; preserve the actual workflow conclusion rather than rerun to green.

${routeTable}

${groupTable}

All-case denominators include unavailable/invalid outputs with no correctness credit. Common-valid pairs:${sem.commonValid.caseIds.length}. A local fallback saying review is not an available correct model decision. Rules-only mismatches:${diag.baselineMisses.map(r=>r.id).join(', ')||'none'}. Guarded routing correctness:${raw.metrics.guardedPrevious.correct}/20 vs ${raw.metrics.guardedUpdated.correct}/20. Unnecessary guarded reviews:v11 ${diag.guardUnnecessary.previous.join(', ')||'none'}; v12 ${diag.guardUnnecessary.updated.join(', ')||'none'}. Every baseline/guard row is retained.

## Every failed attempt and recovery

${attemptTable}

${recoveryTable}

Final failed classifications:${JSON.stringify(finalErrors)}. Unknown or rejected output text is not reconstructed, shortened or credited. Format/length/reference errors are not repaired or retried. Valid-but-wrong decisions are reported separately below. There are no hidden replacement calls.

Known Gemini total tokens:${diag.knownUsage.totalTokenCount} across ${diag.knownUsage.attemptsWithUsage} attempts; ${diag.knownUsage.attemptsWithoutUsage} attempts have unknown usage, not zero. Known totals by arm:v11 ${knownByArm.previous},v12 ${knownByArm.updated}. These are classification API counters, not separate author/reviewer-agent usage. Candidate enumeration changes input tokens and output format. Timing/error differences in one interleaved run cannot establish causal cost, latency or reliability improvements.

## Sealed blind evidence grades

A third fresh-context AI reviewer received ${diag.validFinal} shuffled valid final outputs, full requests, expected decisions, sufficient alternative bundles and optional facts. It received no author/shortest exemplar quotes, group labels, original IDs, arm/candidate IDs, options, run/order metadata, prompt implementation or aggregate outcomes. Repeated requests and extraction style may still permit guesses about pairing/arms; explicit metadata hiding is not inference-proof blinding. Grades were saved/hash-sealed before unblinding. SHA256:\`${proc.gradesSha256??proc.gradeSHA256??proc.gradeSha256}\`.

${semanticTable}

At least one complete sufficient bundle earns reference coverage; not the union of all triggers. Support for a returned route, coverage of protective facts and routing correctness remain separate. Optional context is descriptive and excluded from the joint score. No criteria/grade edits after results.

### Every final failure, unsupported quote or ambiguity

${failures||'None observed by the blind AI reviewer among valid final outputs. This is not proof that none were missed.'}

### Common-valid differences

${changes||'No routing/support/reference-coverage differences on common-valid pairs.'}

### Target-specific observations

Subject-only selections within the generic_heading group:${JSON.stringify(headingSelections.filter(r=>r.subjectOnly))}. The complete per-case record determines whether a selected heading actually supports the decision. Observed returned quote lengths by group:${JSON.stringify(quoteStats)}. The intended length group is not a test of mathematically necessary near-limit spans because every case has a shorter observed alternative. No original historical failed call was rerun, repaired or replaced to obtain these outcomes.

## Interpretation limits

This targeted20-case synthetic English set is not representative customer traffic and must not be pooled with earlier sets as one benchmark. A long example is not minimum required evidence. Missing that distinction would overstate the test; all six length-design shortfalls remain in the report. The lexical heading heuristic covers only1/8 intended headings here. Observed shortest quotes are search judgments with shared AI/policy biases and incomplete alternative search, not exact minima.

AI authorship, separate AI labels and blind AI grades are not human adjudication. Agreement does not establish exhaustive references or calibrated judgments. The implementer knew historical outcomes; exposed pre-run suggestions and any reviewer/criteria misses remain material. Candidate-ID output versus direct quote changes the model task and available evidence, so this is a pipeline comparison, not an isolated prompt change. Temperature zero is not determinism. One run cannot establish significance, stable failure rates, causal improvement, broad security/safety correctness or production readiness. No real customers, action outcomes, multilingual adversaries, discontiguous-only evidence or exhaustive long-input/option-cap behavior are measured.

## Reproduction and records

Live preflight passed ${run.preflightTests??'see logs'} software tests. Audit without a key or new Gemini calls:\`node verify-challenge-evaluation.mjs\`. It verifies frozen source/data/review hashes, attempts, routing/baseline/guards, candidate resolution, blinded assembly and sealed grades. Saved results and run-attempt guards prevent accidental replay. Do not rerun the live workflow.

- [Raw checkpoint](challenge-comparison.json),[run record](challenge-run-record.json),[diagnostics](challenge-run-diagnostics.json),[semantic and group comparison](challenge-semantic-comparison.json)
- [Dataset](challenge-evaluation.json),[freeze](challenge-implementation-freeze.json),[review manifest](challenge-review-manifest.json),[execution plan](challenge-execution-plan.json),[candidate/span audit](challenge-candidate-audit.json),[novelty audit](challenge-novelty-audit.json)
- [Author inputs](challenge-review/author-inputs.json),[author labels](challenge-review/author-labels.json),[author process](challenge-review/author-process.json),[blind initial labels](challenge-review/reviewer-initial-labels.json),[initial process](challenge-review/reviewer-initial-process.json),[reconciliation/design shortfalls](challenge-review/review-resolutions.json),[final references](challenge-review/final-labels.json)
- [Blind output items](challenge-output-items.json),[sealed grades](challenge-output-grades.json),[blind review process](challenge-output-review-process.json),[assembly](challenge-output-assembly.json),[unblinding map](challenge-output-map.json)
`;
await writeFile(new URL('./challenge-results.md',import.meta.url),text);console.log(JSON.stringify({written:'challenge-results.md',characters:text.length}));
