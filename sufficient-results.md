# Sufficient evidence v11: no routing or decision-support gain

17 November 2026. AI-authored, separately AI-reviewed synthetic support requests; not human adjudication. All 40 planned classifications were attempted once under the frozen bounded-retry procedure. No calls were repeated or repaired after results.

The revised adapter did not improve routing or AI-rated decision support on the 17 cases with valid responses from both arms. Frozen reference coverage changed from 15/17 to 16/17, but one favorable difference depends on a reference-criteria miss identified by the blind evidence reviewer. One unsupported generic-subject quote improved while another regressed. This is not evidence of a robust correctness gain.

## What was frozen and compared

- Implementation and rubric were committed at `3aaacbdeb8c16e1704a4d8e9ed1b9470e4f49ef5` before the fresh-context case-author agent started. The primary implementer had seen historical results and the exposed AI criteria review; no v11 cases existed at freeze.
- Previous arm: evidence-completeness v10. Updated arm: sufficient-evidence v11, adding a prompt clarification to choose one sufficient protective trigger rather than maximizing optional context. Routing semantics, JSON schema, source-exact single-field 4–120 UTF-16-unit quote contract, model and retry mechanism stayed fixed. The rules baseline was unchanged.
- Twenty newly AI-authored fictional English requests: four in each of five groups (security, sensitive scope, multiple intents, ordinary evidence, protective scope); 13 require review and seven ordinary routes.
- A separate fresh-context label reviewer saw only the policy/rubric and inputs, saved independent judgments before author-label exposure, and agreed with all 20 routing labels. Initial judgments were sealed at `dd153230c4db1876809567aec92dd10b58fd08ed`; their SHA256 is `85d29a76fb421f2f4f70a964ecb3fbd1ee5e5ce1ecd082edee6741d90f27ca73`.
- Pre-run reconciliation preserved the originals and every criteria change. Primary-review input was explicitly disclosed. Unnecessary diagnosis type, timing and activation-outcome details were made optional; credential entry on a deceptive page was retained as a sufficient phishing relationship without demanding billing-team impersonation too. Alternative trigger bundles were kept separate. This reconciliation was exposed AI discussion, not another blind or human judgment.
- Final source/data/run plan: `3886de178e1cdc8c65fdc634222469ac86f5ebd7`. Dataset SHA256: `59390dfb44cf7baf28e7c9cbbf338f3ec14d76cb0dd2b3d6970052e497563a72`.

## Run and routing results

[GitHub run 44060731223](https://github.com/metaboliq-technologies/workflow-triage-demo/actions/runs/44060731223), 10:00:20–10:24:07 UTC. Gemini `gemini-3.5-flash-lite`; alternating first arm by deterministically shuffled case position; 30-second spacing, 30-second attempt timeout, 65-second classification deadline, at most two attempts on predeclared transient errors. Forty classifications used 46 of the 80 permitted attempts. All 40 slots were attempted; 37 valid final outputs, no unresolved in-flight state, no unattempted slots, and no 429. No billing, key, project or quota changes.

| Routing metric, denominator 20 | Rules | Previous v10 | Updated v11 |
| --- | ---: | ---: | ---: |
| Valid final decisions | 20 | 19 | 18 |
| Correct first-attempt model decisions | — | 18 | 15 |
| Correct final decisions | 12 | 19 | 18 |
| Required reviews caught, denominator 13 | 8 | 12 | 12 |
| Unnecessary reviews | 3 | 0 | 0 |
| Correct ordinary proposals | 4 | 7 | 6 |

Every valid final model route matches its reference; invalid/unavailable responses receive no correctness credit, including when their local fallback says review. Both model arms are 17/17 for routing on common-valid pairs. Updated v11 returned one fewer valid final result in this run; the small interleaved sample cannot establish a causal reliability effect.

The illustrative rules guard gives 16/20 correct with previous outputs and 15/20 with updated outputs. It adds unnecessary review on v11-006, v11-011 and v11-018 (synthetic financial material, a benign workshop quotation, fictional medical material). Rules alone miss required review on v11-009, 013, 005, 010 and 017 and over-review 006, 011 and 018. Full row results are retained.

## Every failed attempt and recovery

Seven classifications had a first-attempt failure. Six used their one permitted retry; four recovered. Nine of the 46 attempts failed: five HTTP 503 responses, three timeouts and one invalid evidence quote.

| Case / arm | Attempt 1 | Retry delay | Attempt 2 / final outcome |
| --- | --- | ---: | --- |
| v11-008 / updated | HTTP 503, 14,859 ms | 4,077 ms | Recovered: access |
| v11-016 / updated | Timeout, 30,001 ms | 4,406 ms | HTTP 503, 1,511 ms; unavailable |
| v11-001 / updated | HTTP 503, 1,018 ms | 4,609 ms | Recovered: technical |
| v11-004 / updated | Timeout, 30,001 ms | 4,475 ms | Recovered: review |
| v11-010 / updated | HTTP 200, invalid quote length: 124 UTF-16 units | No retry | Rejected; unavailable |
| v11-017 / previous | HTTP 503, 9,109 ms | 4,601 ms | Recovered: review |
| v11-015 / previous | Timeout, 30,000 ms | 4,010 ms | HTTP 503, 10,637 ms; unavailable |

The invalid quote was not shortened, repaired or retried. Its diagnostics retain the 124-unit length and validation reason; rejected raw response text is not retained by the existing adapter, so its category/content cannot be retrospectively scored. The three final failures remain in all-case denominators. The workflow conclusion is **failure**, while experiment coverage is **complete**: the runner deliberately reports failure when first/final call or contract errors occurred. Checkpoint retention succeeded. Do not rerun the workflow to turn it green.

Blind AI review judged all four recovered final responses source-exact, supportive and sufficient under the frozen reference bundles. Recovery itself is not a guarantee of evidence quality.

Provider usage is known for 38 attempts, totaling 67,593 tokens. Usage for eight failed HTTP/transport attempts is unknown, not zero. No additional provider calls were made for reviewing or reporting.

## Blind evidence review

A separate fresh-context AI evidence reviewer received 37 shuffled outputs, full requests, expected decisions, sufficient fact bundles and optional context. It received no exemplar quotes, original IDs, arm identities, call order, run metadata, prompt code, map or aggregate results. Repeated requests remained recognizable; this hides arm identity, not case pairing. Grades were saved and SHA-sealed before reporting judgments/unblinding: `086b2ba2f02c5b5b98e586c7c3ec42cacce53fc07ea7cf5e1455dff1fa34e0cc`.

| AI evidence metric | Previous, all 20 | Updated, all 20 | Previous, 17 common-valid | Updated, 17 common-valid |
| --- | ---: | ---: | ---: | ---: |
| Source-exact valid quote | 19 | 18 | 17 | 17 |
| Supports returned decision | 18 | 17 | 16 | 16 |
| Covers a frozen sufficient bundle | 17 | 17 | 15 | 16 |
| Correct route + support + bundle coverage | 17 | 17 | 15 | 16 |
| Criteria ambiguity flagged | 1 | 0 | 1 | 0 |

There is no common-pair routing/support gain and no all-case joint gain. The one common-pair frozen-coverage difference must be read with the following cases, not presented as an unconditional improvement:

- **v11-005 improves:** previous quotes only “Two things before tomorrow”, which conveys neither substantive intent. Updated quotes the PIN reset and refund request together. Both routes are review, but only updated evidence supports it.
- **v11-007 regresses:** previous quotes both payment-card change and canvas malfunction. Updated quotes only “Please handle both”, which does not identify the intents. The updated route is correct but its evidence is unsupported/incomplete.
- **v11-003 exposes a review miss:** previous quotes “confirming lymphoma”; updated quotes “my actual biopsy report confirming lymphoma”. The blind reviewer judged both supportive in full-request context, but only updated covers the frozen actual-personal-biopsy-report bundle. It flagged that concrete diagnosis disclosure can independently support sensitive review: pre-run AI reconciliation had made diagnosis optional without recording it as another sufficient alternative. Author, label review and primary review did not fully resolve this before execution. Preserve the frozen score and ambiguity flag; a broader alternative would require a future protocol or explicitly post-hoc analysis, not silently corrected results.

Optional context is descriptive, not a primary success requirement. Among 17 common-valid pairs, previous has full/partial/none/not-applicable counts 5/4/5/3; updated 2/4/8/3. Lower optional coverage can reflect the intended concise-trigger selection and does not itself establish a failure or gain. No retrospective reference changes or rescoring were performed.

## Limits and next decision

This is a single small, targeted, synthetic English comparison with shared-policy AI authorship and review, no human adjudication, no reviewer calibration or inter-reviewer reliability measurement, and no customer distribution. The primary implementer knew historical outcomes. AI reviewers can share omissions and biases; v11-003 demonstrates that agreement is not validation.

The exact-body audit found no duplicates against earlier sets, but three subjects recur and several cases resemble historical patterns. In particular PIN-reset-plus-refund, subscription-only cancellation and vague negated-closure requests overlap earlier designs. These are newly authored texts, not proof of wholly unseen semantics or training-data exclusion. No cases were silently replaced after this finding. Hypothetical medication-advice handling is not directly exercised in this 20-case set. Cases requiring longer or discontiguous evidence, production workflows, adversarial languages and real-world outcomes remain unmeasured.

Do not promote v11 as an established improvement. The next development target is generic-subject evidence and the overlength contract failure; future reference design must allow alternative sufficient sensitive disclosures. Freeze any correction before another new evaluation, retain these results, and describe further AI review as AI review. Human review remains pending; no production-readiness, significance, stable failure-rate or causal-gain claim follows.

## Reproduction and records

The live run passed all 104 software tests before classification. Offline `node verify-sufficient-evaluation.mjs` checks frozen implementation/data/review hashes, attempt counts, routing/guard/baseline metrics, blind item/map hashes and sealed grades, without a provider key or calls. The saved raw record and run-attempt guard prevent accidental replay. No historical v10 or earlier files were modified.

- [Raw checkpoint](sufficient-comparison.json), [run record](sufficient-run-record.json), [all attempt diagnostics](sufficient-run-diagnostics.json)
- [Dataset](sufficient-evaluation.json), [freeze](sufficient-implementation-freeze.json), [review manifest](sufficient-review-manifest.json), [execution plan](sufficient-execution-plan.json), [novelty audit](sufficient-novelty-audit.json)
- [Author inputs](sufficient-review/author-inputs.json), [author labels](sufficient-review/author-labels.json), [initial blind labels](sufficient-review/reviewer-initial-labels.json), [initial review process](sufficient-review/reviewer-initial-process.json)
- [Original reconciliation](sufficient-review/review-resolutions.json), [supplemental pre-run reconciliation](sufficient-review/review-resolutions-supplemental.json), [final labels](sufficient-review/final-reviewed-labels.json)
- [Blinded evidence items](sufficient-output-items.json), [sealed grades](sufficient-output-grades.json), [review process](sufficient-output-review-process.json), [assembly](sufficient-output-assembly.json), [unblinding map](sufficient-output-map.json), [semantic comparison](sufficient-semantic-comparison.json)
