import {readFile,writeFile} from 'node:fs/promises';
const json=async n=>JSON.parse(await readFile(new URL('./'+n,import.meta.url),'utf8'));
const raw=await json('selection-comparison.json'),semantic=await json('selection-semantic-comparison.json'),diag=await json('selection-run-diagnostics.json'),review=await json('selection-output-review-process.json'),audit=await json('selection-candidate-audit.json'),novelty=await json('selection-novelty-audit.json'),run=await json('selection-run-record.json'),labels=await json('selection-review/review-resolutions.json'),dataset=await json('selection-evaluation.json');
const esc=x=>String(x??'—').replaceAll('|','\\|').replaceAll('\n',' '),table=(head,rows)=>'| '+head.join(' | ')+' |\n| '+head.map(()=> '---').join(' | ')+' |\n'+rows.map(xs=>'| '+xs.map(esc).join(' | ')+' |').join('\n');
const common=semantic.commonValid.metrics,quote=x=>'“'+x+'”';
const routeTable=table(['Routing metric (all 20 cases)','Rules','Previous v11','Updated v12'],[
['Available final decisions',raw.metrics.baseline.available,raw.metrics.previous.available,raw.metrics.updated.available],['Correct first-attempt decisions','—',raw.metrics.previousFirst.correct,raw.metrics.updatedFirst.correct],['Correct final decisions',raw.metrics.baseline.correct,raw.metrics.previous.correct,raw.metrics.updated.correct],['Required reviews caught (13)',raw.metrics.baseline.caughtReview,raw.metrics.previous.caughtReview,raw.metrics.updated.caughtReview],['Unnecessary reviews',raw.metrics.baseline.unnecessaryReview,raw.metrics.previous.unnecessaryReview,raw.metrics.updated.unnecessaryReview],['Correct ordinary proposals',raw.metrics.baseline.correctProposals,raw.metrics.previous.correctProposals,raw.metrics.updated.correctProposals]]);
const semanticTable=table(['AI evidence metric','Previous /20','Updated /20','Previous common-valid','Updated common-valid'],['routingCorrect','sourceExact','supportsReturnedDecision','coversSufficientReferenceBundle','jointRoutingSupportAndCoverage','criteriaAmbiguous'].map(k=>[k,semantic.allCases.previous[k],semantic.allCases.updated[k],common.previous[k]+'/'+common.previous.total,common.updated[k]+'/'+common.updated.total]));
const attemptTable=table(['Case','Arm','Attempt','Error','Latency ms','Retry delay ms','Deferral'],diag.failedAttempts.map(a=>[a.id,a.arm,a.attempt,a.error,a.attemptLatencyMs,a.retryDelayMs,a.retryDeferred]));
const recoveryTable=table(['Case','Arm','First error','Recovered','Final error or category'],diag.firstFailures.map(a=>[a.id,a.arm,a.firstError,a.recovered,a.finalError??a.finalOutput?.category]));
const failures=semantic.failures.map(f=>{const r=semantic.rows.find(r=>r.id===f.id),p=r.providers[f.arm];return '- **'+f.id+' / '+f.arm+'**: '+(f.result.error?'Unavailable: `'+f.result.error+'`; '+(p?.diagnostics?.validationReason??'provider failure')+'.':'Evidence '+quote(p.output.evidence)+'. Decision support: '+f.grade.supportsReturnedDecision+'; sufficient-bundle coverage: '+f.grade.coversSufficientReferenceBundle+'; criteria ambiguity: '+f.grade.criteriaAmbiguous+'. '+f.grade.rationale);}).join('\n');
const changes=semantic.rows.filter(r=>r.semantic.previous&&r.semantic.updated&&['routingCorrect','supportsReturnedDecision','coversSufficientReferenceBundle'].some(k=>r.semantic.previous[k]!==r.semantic.updated[k])).map(r=>'- **'+r.id+'** — previous '+quote(r.providers.previous.output.evidence)+'; updated '+quote(r.providers.updated.output.evidence)+'. Support '+r.semantic.previous.supportsReturnedDecision+' → '+r.semantic.updated.supportsReturnedDecision+'; coverage '+r.semantic.previous.coversSufficientReferenceBundle+' → '+r.semantic.updated.coversSufficientReferenceBundle+'.').join('\n');
const finalErrors=raw.rows.flatMap(r=>['previous','updated'].filter(a=>r.providers[a]?.error).map(arm=>({id:r.id,arm,error:r.providers[arm].error,reason:r.providers[arm].diagnostics?.validationReason??null,attempts:r.providers[arm].attempts})));
const failedQuotes=finalErrors.filter(e=>e.reason==='evidence_too_long'||e.reason==='invalid_evidence_reference'||e.reason==='object_shape');
const text=`# Bounded evidence selection v12: paired evaluation

17 November 2026. Twenty fictional English requests, newly AI-authored and separately AI-reviewed. This is not human adjudication. Historical records and scores remain unchanged.

On all 20 common-valid pairs, updated v12 has 20/20 correct routes and AI-rated sufficient decision support, versus 19/20 for current v11 and 9/20 routing for rules. The observed difference is one classifier-injection review miss. Both arms have no generic-heading or quote-length failure in this fresh run, so a reduction of those original target failures is not demonstrated. Five first-attempt HTTP 503 failures recover; all 40 classifications finish. This small AI-reviewed pipeline comparison does not establish a causal or production-reliability gain.

## Frozen implementation and review

Runtime/rubric froze at \`69d82af981e8969ab7e07a3137d15be6281ff345\` before the author task. A fresh-context author saw only the written policy/rubric. A separate blind label reviewer saved initial judgments before author-label exposure; originals were remotely sealed at \`380e47fc91085f1cc93f4804461bae75a5f61d19\`. Initial routing agreement: ${labels.initialAgreement.agreed}/${labels.initialAgreement.total}; all reconciliation and primary pre-run input are preserved. Final set has 13 review cases and seven ordinary routes, four cases in each of five groups. Dataset SHA256: \`${raw.datasetSha256}\`. Live source: \`${raw.sourceCommit}\`.

Current v11 returns a free-form source quote. Updated v12 asks the model to select a supplied span ID; deterministic resolution returns the same public category/evidence schema. All candidate spans are unchanged single-field substrings of 4–120 UTF-16 units. Recognized generic headings are excluded while meaningful subjects remain available. Candidate construction is deterministic and label-blind, capped at 64 options, with body sentences/clauses and overlapping bounded windows. No rejected quote is trimmed, repaired or reissued. Invalid references still fail closed without a formatting retry. Routing policy and inherited bounded transport retry controls remain fixed.

This changes candidate availability, prompt contents and internal response format together, so it is a pipeline comparison, not an isolated prompt effect. Semantic relevance is not structurally guaranteed. Before the run, every one of ${audit.rows.reduce((n,r)=>n+r.witnesses.length,0)} reference exemplar spans was contained in at least one candidate. That is a mechanical feasibility witness, not a quote whitelist or proof that all equivalent evidence is available.

All 20 bodies exceed 120 units (169–289 in this set), with 8–13 candidate options. Meaningful subject evidence includes recovery-phone compromise, expired MFA and empty waveform cases. Of four targeted vague multi-intent headings, the lexical filter excludes v12-014 and v12-020; it leaves v12-003 and v12-008 available. That limitation was identified before model results and not tuned away.

## Routing and call results

[Run ${run.runId}](https://github.com/metaboliq-technologies/workflow-triage-demo/actions/runs/${run.runId}), ${raw.startedAt} to ${raw.completedAt}. Experiment status: **${raw.status}**; workflow conclusion: **${run.workflowConclusion}**. ${raw.invocations}/40 classifications, ${raw.apiAttempts}/80 provider attempts, ${diag.validFinal} valid final outputs, ${diag.unattempted.length} unattempted slots. In-flight state: ${JSON.stringify(raw.inFlight)}. Stop reason: ${raw.stopReason??'none'}.

Both arms request Gemini 3.5 Flash Lite; first arm alternates by deterministic shuffled case position. Thirty-second spacing, 30-second attempt timeout, 65-second total classification deadline, at most two attempts only for inherited transient failures. No quota workaround, extra probes, billing upgrade or key/project changes. Zero business actions. The workflow deliberately reports failure when a first-attempt error occurred, even after recovery; its failure status is preserved rather than rerun to green. Coverage is complete.

${routeTable}

On ${semantic.commonValid.caseIds.length} common-valid pairs, previous routing is ${common.previous.routingCorrect}/${common.previous.total} and updated routing ${common.updated.routingCorrect}/${common.updated.total}. Invalid/unavailable responses earn no correctness credit, even when local fallback indicates review. Rules-guard correctness is ${raw.metrics.guardedPrevious.correct}/20 and ${raw.metrics.guardedUpdated.correct}/20; unnecessary guarded reviews: previous ${diag.guardUnnecessary.previous.join(', ')||'none'}, updated ${diag.guardUnnecessary.updated.join(', ')||'none'}.

Rules-only mismatches: ${diag.baselineMisses.map(x=>x.id).join(', ')||'none'}. See diagnostics for each expected decision and actual result. The complete raw record retains every row and guard outcome.

The previous adapter misses review on v12-016: it returns technical with the preview malfunction while overlooking a classifier-directed override claiming pretend-exercise authority. Updated returns review and quotes the override. This is one observed routing difference, not proof that extraction changes caused it.

Neither arm returns a generic heading on the four targeted multi-intent cases, and neither has an overlength or invalid-reference failure in this fresh run. Thus this set does not demonstrate a reduction of the two original target failures, despite the candidate pipeline structurally bounding resolved quotes and excluding two recognized headings.

## Every failed attempt, recovery and final failure

${attemptTable}

${recoveryTable}

Final failed classifications: ${JSON.stringify(finalErrors)}. Contract/reference failures: ${JSON.stringify(failedQuotes)}. A failed or rejected response is never retrospectively credited. The adapter retains bounded diagnostic reasons and lengths but not rejected raw response text; its category/content cannot be reconstructed or repaired. Unknown in-flight work would prevent safe replay. No classifications were rerun to improve the result or workflow status. Saved results and run-attempt guards prevent accidental replay.

Known Gemini usage: ${diag.knownUsage.totalTokenCount} tokens across ${diag.knownUsage.attemptsWithUsage} attempts. Usage for ${diag.knownUsage.attemptsWithoutUsage} attempts is unknown, not zero. These counters cover the Gemini classification API, not the separate author/reviewer agents. No additional Gemini calls were used for reviewing or reporting. Known total tokens on successful attempts are 38,790 for previous and 48,172 for updated: the candidate pipeline uses more measured tokens in this run. Timing and provider-error differences are observational, not causal latency or reliability estimates.

## Sealed blind AI evidence review

A third fresh-context AI reviewer received shuffled valid final outputs with complete requests, expected decisions, sufficient alternative bundles and optional facts. No exemplar quotes, original IDs, arm identities, candidate IDs, call order, run metadata, prompt implementation or aggregate results were supplied. Repeated requests remained recognizable; explicit arm metadata, not pairing itself, was hidden. Extraction style could still permit guesses about the arm, so blinding is not guaranteed against inference. ${diag.validFinal} outputs were reviewed and grades saved before unblinding. Grades SHA256: \`${review.gradesSha256??review.gradeSHA256??review.gradeSha256}\`.

${semanticTable}

Unavailable results receive no all-case credit. Sufficient-bundle coverage means at least one complete alternative, not the union of all triggers. Optional coverage is descriptive and outside the primary joint score; all per-output grades and rationales remain in the record.

### Every final failure, unsupported/incomplete output or ambiguity

${failures||'None observed among valid final responses; this is not proof of reliability outside these cases.'}

### Changed common-valid evidence outcomes

${changes||'No routing, support or sufficient-coverage differences on common-valid outputs.'}

## Limitations and interpretation

AI authorship, separate AI label review and blind AI evidence grading are not human validation. Initial agreement does not establish correct or exhaustive labels. The primary implementer had seen historical failures and supplied disclosed pre-run sufficiency suggestions. Shared model/policy bias, uncalibrated semantic judgments, criteria ambiguity and reviewer omissions remain possible. Preserve every grade and flag; no post-result reference edits or hidden rescoring.

Against ${novelty.priorRequests} earlier requests, the mechanical audit found ${novelty.exactBodyDuplicateCases} duplicate bodies and ${novelty.reusedSubjectCases} reused subjects. Word-set similarity is not semantic novelty or training-data exclusion. The set remains targeted synthetic English with familiar policy families; no real customer distribution, longer/discontiguous-only evidence, multilingual adversaries, live business actions or production outcomes. Reference feasibility does not prove coverage of all valid alternative spans. The 64-option cap and generic-word heuristic were not exhaustively exercised by this short set; meaningful words can be missed or generic headings retained. Wrong-route and irrelevant-span selections remain possible despite valid exact extraction.

Candidate enumeration and ID output change token cost and the model's task; provider timing, interleaving and stochastic behavior confound causal interpretations. Temperature zero is not deterministic execution. One small run cannot establish stable failure rates, significance, production readiness or a causal improvement. First-attempt, final, all-case and common-valid results must be read together, with every provider/contract failure included.

## Reproduction and retained records

Before freeze, development tests exposed empty span generation for long unbroken text and a missing usage-sanitization helper in the isolated selection core. Both were fixed before any v12 case was authored; they are not live provider failures. Pre-run software validation: ${run.preflightTests??'see job logs'} tests passed. \`node verify-selection-evaluation.mjs\` rechecks frozen source/data/review hashes, raw attempts, baseline/guard metrics, candidate resolution, blinded items/maps and sealed grades without a provider key or additional calls. Do not rerun the live workflow.

- [Raw checkpoint](selection-comparison.json), [run record](selection-run-record.json), [all diagnostics](selection-run-diagnostics.json), [semantic comparison](selection-semantic-comparison.json)
- [Dataset](selection-evaluation.json), [runtime freeze](selection-implementation-freeze.json), [review manifest](selection-review-manifest.json), [execution plan](selection-execution-plan.json), [candidate audit](selection-candidate-audit.json), [novelty audit](selection-novelty-audit.json)
- [Author inputs](selection-review/author-inputs.json), [author labels](selection-review/author-labels.json), [author process](selection-review/author-process.json), [blind initial labels](selection-review/reviewer-initial-labels.json), [initial review process](selection-review/reviewer-initial-process.json), [reconciliation](selection-review/review-resolutions.json), [final labels](selection-review/final-labels.json)
- [Blinded items](selection-output-items.json), [sealed grades](selection-output-grades.json), [blind process](selection-output-review-process.json), [assembly](selection-output-assembly.json), [unblinding map](selection-output-map.json)
`;
await writeFile(new URL('./selection-results.md',import.meta.url),text);console.log(JSON.stringify({written:'selection-results.md',characters:text.length}));
