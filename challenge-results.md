# Focused evidence challenge v13 — unchanged v11 versus v12

17 November 2026. Twenty newly AI-authored fictional English support requests, separately blind AI label-reviewed and blind AI evidence-reviewed. **This is a new challenge set, not a new adapter release or human validation.** Historical data, source and scores remain unchanged.

On this main set, v12 has 20/20 joint routing/support/reference-coverage successes versus 17/20 for v11. The direct-quote arm uses unsupported count/topic headings on v13-003 and v13-016 and rejects a121-unit quote on v13-019. On19 common-valid pairs, routing is19/19 for both while sufficient support is17/19 versus19/19. These are small targeted observations, not causal or production reliability claims. The [separate six-case boundary follow-up](boundary-results.md) preserves this phase and tests a stronger span constraint; do not pool the two phases. That follow-up achieves4/6 joint successes for direct quotes versus2/6 for bounded selection, exposing a regression hidden by routing-only scores.

## Design and pre-run shortfalls

Eight generic-heading cases (four multiple-intent review, four ordinary controls), six intended length-boundary cases and six decisive-subject cases. Both adapters are unchanged: v11 direct source quotes versus v12 bounded span-ID selection. Public output stays category plus one unchanged single-field4–120 UTF-16-unit quote. The rules baseline is unchanged. No customer data or action execution.

Separate offline contract checks accept unchanged119/120-unit quotes, reject121-unit quotes without repair, and resolve a120-unit candidate ID while rejecting an unlisted121-unit reference. These checks make zero provider calls; they are not natural-language model outcomes.

The intended length challenge did not force evidence near the limit: all six cases admit shorter sufficient quotes,55–90 units after reconciliation. Long author exemplars are 115,115,118,119,120,120 units. Both the author and blind reviewer documented shorter alternatives before provider calls. Cases were preserved, not replaced or padded to inflate fact requirements. Initial reviewer and final shortest-search judgments may differ; neither proves mathematical minimality.

| Case | Long exemplar units | Final shortest observed | Initial reviewer shortest | Long exemplar in candidates | Shortest in candidates |
| --- | --- | --- | --- | --- | --- |
| v13-017 | 120 | 79 | 79 | true | true |
| v13-013 | 119 | 90 | 90 | true | true |
| v13-010 | 118 | 80 | 80 | true | true |
| v13-003 | 115 | 55 | 67 | true | true |
| v13-007 | 115 | 89 | 89 | true | true |
| v13-019 | 120 | 77 | 77 | false | true |

The120-unit exemplar for v13-019 is absent from the v12 candidate list, but its shorter sufficient witness is available. This is an exemplar gap, not demonstrated semantic inability. Every final shortest-observed sufficient witness is contained in at least one candidate. Candidate availability is not an evidence whitelist and does not prove availability of every equivalent span.

The generic-heading heuristic excludes only 1/8 headings, v13-011. The other headings remain selectable. Meaningful decisive subjects remain available. These limitations were measured before results; neither adapter was tuned to the new cases.

Against 416 earlier requests, 0 exact body duplicates and 1 reused heading were found. The heading “A couple of things” recurs, and some familiar invoice/access patterns resemble earlier fixtures. Newly authored text and word-set similarity do not establish semantic novelty or training-data exclusion.

## Freeze and independent review

Harness, policy, rubric and unchanged adapter/runtime files froze at `ea01783e0d0228661d0e0a62907246801be55916` before the fresh-context author started. Author saw only policy/rubric. A separate fresh-context label reviewer saw only policy/rubric and inputs, not author labels/groups, candidate code or historical results. Initial labels were saved and SHA-sealed before author-label exposure; originals sealed remotely at `596951259c27d220cfd05d2afe38c171859d703c`.

Initial routing agreement:20/20. All original decisions, spans, changes and primary pre-run suggestions are retained. Primary implementer knew historical outcomes and saw cases only after freeze. Reconciliation was exposed AI discussion, not another blind or human judgment. There are 12 review cases and 8 ordinary routes. Dataset SHA256:`171323393534b4f7243183b9fc5184aa05c2e969d4faa63c6ca256cfff34a863`. Execution source:`57caaccab87dc471096a9f7ae7354240e368e575`.

## Execution and routing

[Run 44078346737](https://github.com/metaboliq-technologies/workflow-triage-demo/actions/runs/44078346737), 2026-11-17T11:55:28.958Z to 2026-11-17T12:16:53.149Z. Experiment status:**complete**; workflow conclusion:**failure**. 40/40 classifications; 43/80 provider attempts; 39 valid final responses; 0 unattempted slots. Stop reason:none; in-flight state:null.

Both arms use Gemini 3.5 Flash Lite. Fixed shuffled cases, alternating first arm by position;30-second spacing,30-second attempt timeout,65-second total deadline, at most two attempts for inherited transient errors. No quota workaround, billing/key/project changes, extra probes, live-run replay or repair of rejected outputs. Zero business actions. The runner reports first/final failures even when retries recover; preserve the actual workflow conclusion rather than rerun to green.

| Routing metric /20 | Rules | v11 direct quote | v12 bounded selection |
| --- | --- | --- | --- |
| Available final outputs | 20 | 19 | 20 |
| Correct first-attempt decisions | — | 18 | 18 |
| Correct final decisions | 9 | 19 | 20 |
| Required review caught /12 | 5 | 11 | 12 |
| Unnecessary reviews | 4 | 0 | 0 |

| Group | Cases | Rules correct | v11 routing / support / joint | v12 routing / support / joint |
| --- | --- | --- | --- | --- |
| generic_heading | 8 | 4 | 8 / 7 / 7 | 8 / 8 / 8 |
| length_boundary | 6 | 0 | 5 / 4 / 4 | 6 / 6 / 6 |
| subject_decisive | 6 | 5 | 6 / 6 / 6 | 6 / 6 / 6 |

All-case denominators include unavailable/invalid outputs with no correctness credit. Common-valid pairs:19. A local fallback saying review is not an available correct model decision. Rules-only mismatches:v13-020, v13-009, v13-012, v13-017, v13-004, v13-013, v13-010, v13-003, v13-007, v13-011, v13-019. Guarded routing correctness:15/20 vs 16/20. Unnecessary guarded reviews:v11 v13-020, v13-009, v13-012, v13-004; v12 v13-020, v13-009, v13-012, v13-004. Every baseline/guard row is retained.

## Every failed attempt and recovery

| Case | Arm | Attempt | Failure | Latency ms | Retry delay ms | Deferral |
| --- | --- | --- | --- | --- | --- | --- |
| v13-017 | previous | 1 | provider_http_503 | 1445 | 4213 | — |
| v13-013 | updated | 1 | provider_http_503 | 1025 | 4250 | — |
| v13-011 | updated | 1 | provider_http_503 | 359 | 4314 | — |
| v13-019 | previous | 1 | invalid_model_decision | 2029 | 0 | non_retryable |

| Case | Arm | Initial failure | Recovered | Final category/error |
| --- | --- | --- | --- | --- |
| v13-017 | previous | provider_http_503 | true | review |
| v13-013 | updated | provider_http_503 | true | review |
| v13-011 | updated | provider_http_503 | true | review |
| v13-019 | previous | invalid_model_decision | false | invalid_model_decision |

Final failed classifications:[{"id":"v13-019","arm":"previous","error":"invalid_model_decision","reason":"evidence_too_long","attempts":1}]. Unknown or rejected output text is not reconstructed, shortened or credited. Format/length/reference errors are not repaired or retried. Valid-but-wrong decisions are reported separately below. There are no hidden replacement calls.

Known Gemini total tokens:81960 across 40 attempts; 3 attempts have unknown usage, not zero. Known totals by arm:v11 38344,v12 43616. These are classification API counters, not separate author/reviewer-agent usage. Candidate enumeration changes input tokens and output format. Timing/error differences in one interleaved run cannot establish causal cost, latency or reliability improvements.

## Sealed blind evidence grades

A third fresh-context AI reviewer received 39 shuffled valid final outputs, full requests, expected decisions, sufficient alternative bundles and optional facts. It received no author/shortest exemplar quotes, group labels, original IDs, arm/candidate IDs, options, run/order metadata, prompt implementation or aggregate outcomes. Repeated requests and extraction style may still permit guesses about pairing/arms; explicit metadata hiding is not inference-proof blinding. Grades were saved/hash-sealed before unblinding. SHA256:`78bc33eb520f3151ff2e2f4627afefe5f7293e9038c2065ca11853213d1a1468`.

| AI evidence metric | v11 all20 | v12 all20 | v11 common-valid | v12 common-valid |
| --- | --- | --- | --- | --- |
| routingCorrect | 19 | 20 | 19/19 | 19/19 |
| sourceExact | 19 | 20 | 19/19 | 19/19 |
| supportsReturnedDecision | 17 | 20 | 17/19 | 19/19 |
| coversSufficientReferenceBundle | 17 | 20 | 17/19 | 19/19 |
| jointRoutingSupportAndCoverage | 17 | 20 | 17/19 | 19/19 |
| criteriaAmbiguous | 0 | 0 | 0/19 | 0/19 |

At least one complete sufficient bundle earns reference coverage; not the union of all triggers. Support for a returned route, coverage of protective facts and routing correctness remain separate. Optional context is descriptive and excluded from the joint score. No criteria/grade edits after results.

### Every final failure, unsupported quote or ambiguity

- **v13-003 / previous**: Quote “Two requests for the map service”. Routing correct: true; support: false; sufficient-bundle coverage: false; criteria ambiguity: false. FAIL: Generic count heading conveys neither export-label restoration nor receipt delivery; full context requires review but quote supplies neither substantive intent.
- **v13-016 / previous**: Quote “Two items, thanks”. Routing correct: true; support: false; sufficient-bundle coverage: false; criteria ambiguity: false. FAIL: Generic item count conveys neither sign-in assistance nor receipt delivery; full context requires review but quote supplies neither substantive intent.
- **v13-019 / previous**: Unavailable: `invalid_model_decision`; evidence_too_long.

### Common-valid differences

- **v13-003** — v11 “Two requests for the map service”; v12 “Please restore the missing labels on my map exports, and send me a receipt for the annual cartography subscription.”. Routing true → true; support false → true; coverage false → true.
- **v13-016** — v11 “Two items, thanks”; v12 “Please help me sign in to the choir portal and send me the receipt for our subscription.”. Routing true → true; support false → true; coverage false → true.

### Target-specific observations

Subject-only selections within the generic_heading group:[{"id":"v13-016","arm":"previous","evidence":"Two items, thanks","subjectOnly":true,"support":false}]. The complete per-case record determines whether a selected heading actually supports the decision. Observed returned quote lengths by group:{"generic_heading":{"previous":{"valid":8,"min":17,"max":99,"at120":0},"updated":{"valid":8,"min":55,"max":99,"at120":0}},"length_boundary":{"previous":{"valid":5,"min":32,"max":120,"at120":1},"updated":{"valid":6,"min":115,"max":120,"at120":1}},"subject_decisive":{"previous":{"valid":6,"min":52,"max":64,"at120":0},"updated":{"valid":6,"min":52,"max":64,"at120":0}}}. The intended length group is not a test of mathematically necessary near-limit spans because every case has a shorter observed alternative. No original historical failed call was rerun, repaired or replaced to obtain these outcomes.

## Interpretation limits

This targeted20-case synthetic English set is not representative customer traffic and must not be pooled with earlier sets as one benchmark. A long example is not minimum required evidence. Missing that distinction would overstate the test; all six length-design shortfalls remain in the report. The lexical heading heuristic covers only1/8 intended headings here. Observed shortest quotes are search judgments with shared AI/policy biases and incomplete alternative search, not exact minima.

AI authorship, separate AI labels and blind AI grades are not human adjudication. Agreement does not establish exhaustive references or calibrated judgments. The implementer knew historical outcomes; exposed pre-run suggestions and any reviewer/criteria misses remain material. Candidate-ID output versus direct quote changes the model task and available evidence, so this is a pipeline comparison, not an isolated prompt change. Temperature zero is not determinism. One run cannot establish significance, stable failure rates, causal improvement, broad security/safety correctness or production readiness. No real customers, action outcomes, multilingual adversaries, discontiguous-only evidence or exhaustive long-input/option-cap behavior are measured.

## Reproduction and records

Live preflight passed 121 software tests. Audit without a key or new Gemini calls:`node verify-challenge-evaluation.mjs`. It verifies frozen source/data/review hashes, attempts, routing/baseline/guards, candidate resolution, blinded assembly and sealed grades. Saved results and run-attempt guards prevent accidental replay. Do not rerun the live workflow.

- [Raw checkpoint](challenge-comparison.json),[run record](challenge-run-record.json),[diagnostics](challenge-run-diagnostics.json),[semantic and group comparison](challenge-semantic-comparison.json)
- [Dataset](challenge-evaluation.json),[freeze](challenge-implementation-freeze.json),[review manifest](challenge-review-manifest.json),[execution plan](challenge-execution-plan.json),[candidate/span audit](challenge-candidate-audit.json),[novelty audit](challenge-novelty-audit.json)
- [Author inputs](challenge-review/author-inputs.json),[author labels](challenge-review/author-labels.json),[author process](challenge-review/author-process.json),[blind initial labels](challenge-review/reviewer-initial-labels.json),[initial process](challenge-review/reviewer-initial-process.json),[reconciliation/design shortfalls](challenge-review/review-resolutions.json),[final references](challenge-review/final-labels.json)
- [Blind output items](challenge-output-items.json),[sealed grades](challenge-output-grades.json),[blind review process](challenge-output-review-process.json),[assembly](challenge-output-assembly.json),[unblinding map](challenge-output-map.json)
