# Separate boundary follow-up v13b — preserved original challenge, shared budget

17 November 2026. Six fresh crafted fictional English requests, separate AI author, blind initial difficulty/label reviewer, and blind evidence reviewer. **Not a new adapter, human validation or a representative workload.** Read the [original 20-case challenge](challenge-results.md) separately; results are not pooled as one benchmark.

The stronger follow-up exposes a regression: v12 routes 6/6 correctly but achieves only 2/6 joint routing/support/reference-coverage successes, versus v11 5/6 routing and4/6 joint success. Both route all 5 common-valid pairs correctly; support is4/5 for v11 versus2/5 for v12. Bounded extraction prevents accepted overlength text but does not guarantee complete evidence. Do not promote v12 as a general improvement.

## Why this follow-up exists

The first 20-case challenge's six supposed near-limit cases all had shorter sufficient quotes 55–90 units. That shortfall was identified before its provider outcomes. Original cases and results were preserved. A separate protocol/harness froze at `b2f88c720f7d9468025ed624c447386f4518f964` while that run was still active, before six follow-up cases were created. Neither v11 nor v12 was modified.

Fresh author and independent reviewer assessed positive ordinary intents placed near opposite ends of a single 110–120-unit source span. The visual middle description is optional context, not an extra required semantic fact; it occupies unavoidable intervening characters under the contiguous quote contract. Both substantive ordinary intents establish review; one intent or generic heading alone does not. All six references require review. This deliberately constructed prose is a contract stress test, not natural customer sampling.

Initial reviewer saved independent labels and shortest-observed witnesses before seeing author labels; initial records sealed remotely at `223b215d0a4934889901c0b138e5bc8da46d887b`. Agreement:6/6. All originals, canonical byte-identical aliases, spans and reconciliation are retained. One prospective authoring round was used. Shortest-observed judgments are AI searches, not proofs of global minima; reviewers may miss shorter alternatives.

Before provider calls, only 3/6 reviewed sufficient witnesses were available in v12's candidate list. Missing exact witnesses are not alone proof that no semantically equivalent option exists; blind output review assesses actual choices. Cases were not filtered or tuned to favor either pipeline. Witness gaps were identified before provider outcomes. b13-005 has a sufficient candidate available, yet v12 chooses a different span ending with the incomplete object “unlock my”; thus candidate generation is not the only failure. v12 also omits the refund action on b13-001, quotes only PIN reset on b13-006 and selects “Two app issues” on b13-002. All are source-exact and bounded yet insufficient.

| Case | Independent shortest observed units | Field | Witness in v12 candidates | v11 returned units | v12 returned units |
| --- | --- | --- | --- | --- | --- |
| b13-001 | 114 | body | false | 115 | 119 |
| b13-005 | 114 | subject | true | — | 117 |
| b13-003 | 112 | body | true | 113 | 113 |
| b13-004 | 120 | body | true | 120 | 120 |
| b13-006 | 110 | body | false | 111 | 13 |
| b13-002 | 115 | body | false | 14 | 14 |

## Execution, shared ceiling and metrics

[Follow-up run 44082098848](https://github.com/metaboliq-technologies/workflow-triage-demo/actions/runs/44082098848), source `e9527bd03fe608baf76f7ddd2053422bddee6710`, 2026-11-17T12:19:52.021Z to 2026-11-17T12:26:24.291Z. Dataset SHA256:`f8cb42444008707b07054dbda4ae79cbeccbd5780465ca77b94a0ec25d70e522`. Experiment status:**complete**; workflow conclusion:**failure**. Follow-up 12/12 classifications, 13/24 provider attempts, 11 valid final outputs, 0 unattempted. Original run:43 attempts. **Combined:56/80 attempts**. Original checkpoint SHA256:`6ce791c127fe9533e21d073bcd70a13b05d8f8e8e4323be54b84a733af40c02f`.

The follow-up gate required original coverage complete with 40 classifications, no unresolved in-flight work and at most 56 original attempts; at most 24 follow-up attempts can therefore fit the unchanged80 total ceiling. Neither original failed nor valid calls are replayed. Same Gemini 3.5 Flash Lite,30-second spacing,30-second attempt timeout,65-second total deadline, at most two inherited transient attempts, alternating first arm. No quota/billing/key/project workaround, extra probes or output repair. No business actions.

| Metric /6 | Rules | v11 direct quote | v12 bounded selection |
| --- | --- | --- | --- |
| Correct first attempts | — | 5 | 5 |
| Available final outputs | 6 | 5 | 6 |
| Correct final routing | 3 | 5 | 6 |
| AI-rated decision support | — | 4 | 2 |
| AI-rated sufficient-bundle coverage | — | 4 | 2 |
| Correct route + support + coverage | — | 4 | 2 |
| Criteria ambiguity flagged | — | 0 | 0 |

Common-valid pairs:5; support 4/5 vs 2/5; joint 4/5 vs 2/5. Unavailable/invalid outputs receive no all-case correctness credit. A correct review route does not establish evidence sufficiency.

## Every failed attempt and final evidence failure

| Case | Arm | Attempt | Failure | Latency ms | Retry delay ms |
| --- | --- | --- | --- | --- | --- |
| b13-005 | previous | 1 | invalid_model_decision | 10429 | 0 |
| b13-006 | updated | 1 | provider_http_503 | 1875 | 4554 |

- b13-005 / previous: invalid_model_decision; recovered:false; final:invalid_model_decision.
- b13-006 / updated: provider_http_503; recovered:true; final:review.

- **b13-001 / updated**: Quote “my renewal; for reference, the screen uses a plain gray theme with a small logo in its corner; reset my PIN. Thank you.”. Route correct:true; support:false; reference coverage:false; criteria ambiguity:false. The quote is exact, but 'my renewal' supplies a topic without the refund action. It conveys only the PIN-reset positive intent. The full request warrants review, but this evidence does not cover the conjunctive bundle. Context cannot restore the omitted substantive action.
- **b13-005 / previous**: Unavailable: `invalid_model_decision` (evidence_too_long).
- **b13-005 / updated**: Quote “Web app: Send my invoice; the desktop view has a pale gray background and a blue title above a white panel; unlock my”. Route correct:true; support:false; reference coverage:false; criteria ambiguity:false. The quote is exact and conveys sending an invoice, but 'unlock my' truncates the object before identifying login access. The full request warrants review, but this quote does not convey the second complete substantive intent. Context cannot restore the omitted object.
- **b13-006 / updated**: Quote “reset my PIN.”. Route correct:true; support:false; reference coverage:false; criteria ambiguity:false. The full request warrants review for search freezing plus PIN reset. The exact quote conveys only PIN reset, so it does not substantiate multi-intent review. No alternative protective trigger is apparent.
- **b13-002 / previous**: Quote “Two app issues”. Route correct:true; support:false; reference coverage:false; criteria ambiguity:false. The subject is exact but only counts unnamed issues. Although the full body warrants review for login recovery and frozen export, the quote conveys neither substantive positive intent. No alternative protective trigger is apparent.
- **b13-002 / updated**: Quote “Two app issues”. Route correct:true; support:false; reference coverage:false; criteria ambiguity:false. The subject is exact but only counts unnamed issues. Although the full body warrants review for login recovery and frozen export, the quote conveys neither substantive positive intent. No alternative protective trigger is apparent.

The actual workflow conclusion is retained, including recovered first-attempt failures. Rejected raw response text is not stored by the adapter; diagnostic reasons/lengths and unknown usage are preserved without reconstructing or repairing it. Format errors do not trigger a repair retry. Do not rerun the workflow to improve scores or its status.

Known Gemini total tokens:25753; known attempts:12; unknown failed-attempt usage:1, not zero. Known tokens by arm:v11 11622,v12 14131. These counters exclude separate author/reviewer agents. Candidate generation and ID format change the inference task and token cost; timing/recovery differences are not causal performance estimates.

## Blind grading and limits

A new fresh-context evidence-review AI saw shuffled valid outputs, full requests, expected decisions, sufficient fact bundles and optional context. No exemplar/shortest-witness quotes, original IDs, arm/candidate IDs, candidate options, code, order/run metadata, original-phase results or aggregate scores were supplied. Repeated requests and extraction style may allow guesses despite metadata blinding. All 11 grades were saved and SHA-sealed before unblinding:`5b5ce6d9e8994d3e1f908762fba5c7871fade243e08300842cf5843b5efb7cfc`.

Reference facts contain only the two ordinary substantive intents; middle visual context is optional and scored separately. A generic subject, one action, a topic or cut-off object does not express both. The reviewer must still flag any overly strict reference, alternative support or missed shorter quote. No post-result criteria changes or hidden rescoring.

Against 436 earlier requests, 0 exact body duplicates and 1 reused heading were found; “Support request” is a common earlier heading. Crafted contexts deliberately target a span-availability weakness, not an estimate of its customer prevalence. All six cases require review, so this phase cannot measure ordinary-route precision or unnecessary review. Small English-only synthetic data, shared AI/policy bias, uncalibrated semantic review, possible reference/shortest-span omissions, output-style leakage, stochastic model behavior and provider-time confounds remain. No human adjudication, global-minimality, causal improvement, significance, stable failure-rate, broad security or production-readiness claim. Keep this phase distinct from the preserved20-case results and older studies.

## Reproduction and records

Live preflight:125 tests passed. Offline audit:`node verify-boundary-evaluation.mjs`; original audit:`node verify-challenge-evaluation.mjs`. No key or extra provider calls. Frozen hashes, exact references, budgets, raw routing/guards/baseline, blinded assembly and sealed grades are verified. Saved result and run-attempt guards prevent replay.

- [Raw follow-up](boundary-comparison.json),[run record](boundary-run-record.json),[all diagnostics](boundary-run-diagnostics.json),[semantic grades/comparison](boundary-semantic-comparison.json)
- [Dataset](boundary-evaluation.json),[freeze](boundary-implementation-freeze.json),[protocol](BOUNDARY-PROTOCOL-V13B.md),[review manifest](boundary-review-manifest.json),[execution plan](boundary-execution-plan.json),[candidate audit](boundary-candidate-audit.json),[novelty audit](boundary-novelty-audit.json)
- [Round-one inputs](boundary-review/round-one-inputs.json),[round-one author labels](boundary-review/round-one-labels.json),[author process](boundary-review/round-one-process.json),[blind initial labels](boundary-review/reviewer-initial-labels.json),[initial review process](boundary-review/reviewer-initial-process.json),[final labels](boundary-review/final-labels.json),[all reconciliations](boundary-review/review-resolutions.json)
- [Blind outputs](boundary-output-items.json),[sealed grades](boundary-output-grades.json),[review process](boundary-output-review-process.json),[assembly](boundary-output-assembly.json),[unblinding map](boundary-output-map.json)
