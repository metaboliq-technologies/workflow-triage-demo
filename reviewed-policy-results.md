# Reviewed routing policy: first paired evaluation

Run on 16 November 2026 with Gemini 3.5 Flash Lite. The old and clarified prompts were evaluated once each on the same 40 newly authored synthetic cases, with alternating request order. The default Node adapter now uses the clarified policy. Historical comparison modes keep the legacy prompt; the offline rules lab is unchanged.

| Measure | Rules | Old prompt | Clarified prompt | Guarded clarified |
| --- | ---: | ---: | ---: | ---: |
| Exact reviewed-decision matches / 40 | 24 (60%) | 30 (75%) | 36 (90%) | 27 (67.5%) |
| Valid decisions / 40 | 40 | 36 | 36 | 36 |
| Matching route proposals / proposals | 12/19 | 17/23 | 20/20 | 11/11 |
| Reviewed cases caught / 18 | 12 | 13 | 16 | 16 |
| Unnecessary valid review decisions | 9 | 0 | 0 | 9 |
| Invalid outputs / provider errors | 0 | 4 | 4 | 4 |

Errors receive no classification credit; all 40 denominators are retained. Review recall is against the 18 independently AI-reviewed review expectations. Routing proposals are suggestions only; zero business actions were executed.

**Execution is complete, although GitHub marks the job as failed.** That nonzero exit is intentional when either model arm has provider/output errors. All 80 planned invocations finished; the saved report has `status: complete`. The queued run eventually dispatched without a configuration change or duplicate submission. The same original run and attempt were used.

The clarified prompt's 36 valid decisions all matched the reviewed labels, but four failed calls remain incorrect/unavailable in the all-case score. In particular, the signup and security HTTP failures cannot be credited as successful routing. The guarded arm made only 11 proposals and unnecessarily reviewed nine routable cases.

## Separate routing changes from service availability

There were 34 cases with valid output from **both** prompts. On this common-valid subset, the old prompt matched 29/34 and the clarified prompt matched 34/34. The five observed routing corrections were three signup cases (`v4-001`, `v4-002`, `v4-004`) and two account-closure cases (`v4-006`, `v4-008`). This conditional subset is informative but excludes failures and must not replace the full 40-case scores.

Two additional gains (`v4-031`, `v4-034`) occurred where the old call returned HTTP 503 and the clarified call succeeded. The one loss (`v4-030`) was a clarified HTTP 503 where the old prompt succeeded. These are observed availability differences, not evidence that the prompt improved or worsened semantic routing. The fourth signup case (`v4-003`) had an old technical-route mismatch and a clarified HTTP 503, so its correction was not demonstrated.

## Every old/clarified mismatch and failure

| Case | Reviewed expectation | Old prompt | Clarified prompt |
| --- | --- | --- | --- |
| v4-001 | access | technical | access |
| v4-002 | access | technical | access |
| v4-003 | access | technical | HTTP 503 |
| v4-004 | access | technical | access |
| v4-006 | review | billing | review |
| v4-008 | review | billing | review |
| v4-019 | billing | evidence_not_in_request | evidence_not_in_request |
| v4-030 | review | review | HTTP 503 |
| v4-031 | review | HTTP 503 | review |
| v4-034 | review | HTTP 503 | review |
| v4-039 | review | evidence_too_long | evidence_too_long |

Each arm had two HTTP 503 failures and two output-contract failures. No retry or second evaluation was performed. `v4-019` failed the exact evidence-substring check in both arms; the rejected quote itself was not retained, so its exact textual discrepancy cannot be reconstructed. `v4-039` returned 135-character evidence in both arms, exceeding the 120-character limit. Both failures finished with HTTP 200 and provider finish reason STOP: complete JSON was still insufficient to satisfy the local contract. The diagnostics retained their usage metadata without raw rejected text.

## Results by stratum

| Stratum | Rules | Old prompt | Clarified prompt | Guarded clarified |
| --- | ---: | ---: | ---: | ---: |
| signup | 2/5 | 1/5 | 4/5 | 2/5 |
| account_closure | 5/5 | 3/5 | 5/5 | 5/5 |
| ordinary_access | 5/5 | 5/5 | 5/5 | 5/5 |
| billing | 3/5 | 4/5 | 4/5 | 2/5 |
| technical | 2/5 | 5/5 | 5/5 | 2/5 |
| security | 1/5 | 5/5 | 4/5 | 4/5 |
| injection | 3/5 | 3/5 | 5/5 | 5/5 |
| contextual | 3/5 | 4/5 | 4/5 | 2/5 |

Relative to the old prompt on these same cases, the clarified prompt matched 7 previously mismatching decisions and lost 1 previously matching decision. Gained IDs: v4-001, v4-002, v4-004, v4-006, v4-008, v4-031, v4-034. Lost ID: v4-030. This is a single paired observation, not a statistical population-performance estimate. The availability-related gains and loss are identified separately above.

## Every clarified-prompt mismatch or failure

- **v4-003 / signup:** expected access; clarified result provider_http_503; old result technical; guarded result provider_http_503. Reviewed rationale: Registration or activation failure is an access intent. Safe diagnostics: {"stage":"http","latencyMs":810,"attemptLatencyMs":810,"httpStatus":503}
- **v4-019 / billing:** expected billing; clarified result invalid_model_decision; old result invalid_model_decision; guarded result invalid_model_decision. Reviewed rationale: Single ordinary invoice, payment, refund or subscription-only renewal/cancellation intent. Safe diagnostics: {"stage":"decision","validationReason":"evidence_not_in_request","finishReason":"STOP","latencyMs":1017,"attemptLatencyMs":1017,"candidateCount":1,"outputCharacters":99,"evidenceCharacters":54,"httpStatus":200,"modelVersion":"gemini-3.5-flash-lite","usage":{"promptTokenCount":500,"candidatesTokenCount":26,"thoughtsTokenCount":null,"totalTokenCount":526}}
- **v4-030 / security:** expected review; clarified result provider_http_503; old result review; guarded result provider_http_503. Reviewed rationale: Sensitive medical context coexists with a refund request; protective review wins. Safe diagnostics: {"stage":"http","latencyMs":1007,"attemptLatencyMs":1007,"httpStatus":503}
- **v4-039 / contextual:** expected review; clarified result invalid_model_decision; old result invalid_model_decision; guarded result invalid_model_decision. Reviewed rationale: Two substantive intents, password recovery and invoice inquiry, require review. Safe diagnostics: {"stage":"decision","validationReason":"evidence_too_long","finishReason":"STOP","latencyMs":1691,"attemptLatencyMs":1691,"candidateCount":1,"outputCharacters":179,"evidenceCharacters":135,"httpStatus":200,"modelVersion":"gemini-3.5-flash-lite","usage":{"promptTokenCount":509,"candidatesTokenCount":43,"thoughtsTokenCount":null,"totalTokenCount":552}}

All per-case decisions for both prompts, rules, guarded reconciliation, provider metadata and errors are retained in [reviewed-policy-comparison.json](reviewed-policy-comparison.json). Never repair these labels or tune the prompt against this run and then present the same set as untouched evidence.

## Clarified boundaries

Signup and authentication-specific failures take access even when described as bugs or errors. Payment-specific failures and clear subscription-only cancellation take billing. Other ordinary application malfunctions take technical. Account/workspace closure or deletion, and account cancellation/deactivation with unclear scope, require review. Protective security, sensitive-context, instruction-override and multiple-intent conditions override ordinary routes. Benign quoted security/instruction text is interpreted in context. These are declared workflow choices, not a universal support taxonomy.

## Independent review and unseen-set process

The user approved separate AI author and reviewer agents. Each had a fresh context containing the written policy, without implementation code, older fixtures or previous provider results. The author stored inputs separately from proposed labels. The reviewer assigned and saved all labels before seeing those proposals. Initial agreement was 40/40, with zero unresolved disagreements and no replacements. [Original artifacts](review-evidence/) and the [review manifest](review-manifest.json) preserve this evidence.

The implementation author froze the adapter, paired runner, policy and unchanged rules before opening the case/label files; [implementation-freeze.json](implementation-freeze.json) records the file hashes and timing. The final set has five cases each in eight strata and 22 routable/18 review expectations. Tests reject exact body reuse from the previous three evaluation sets and bind final labels to both original label files.

This is **independent-context AI review**, not human adjudication. Shared model architecture/training may produce correlated blind spots; 40/40 reviewer agreement does not establish ground truth. Newly written cases are operationally held out from implementation until freeze, but do not prove absence of analogous material from provider training. The set is now seen.

## Validation, provenance and operating limits

- All **38 tests passed** in the inspected Linux Node 22 run with zero skips; Node 24 validation also passed before testing. Tests cover prompt-version isolation, review hashes, label isolation, budget/order/checkpoints, authentication stop, diagnostics and existing contracts. Mocked tests do not establish semantic policy accuracy.
- Frozen source revision: `867359c65bebac5b5ab1542d3c1e994f907df6d3`. [Implementation PR #5](https://github.com/metaboliq-technologies/workflow-triage-demo/pull/5).
- [Original live run](https://github.com/metaboliq-technologies/workflow-triage-demo/actions/runs/43878448174). Started 2026-11-16T14:26:11.452Z; completed 2026-11-16T14:36:39.287Z.
- Dataset SHA-256: `9a1c15488157cce40c0f05ff13e7da63accc2fe8cf2dc74a864c560312a551da`.
- Review-manifest SHA-256: `ef4652d8431da2b76d09f51f69cb009c7e1410284359784c8fa794c2b962fd89`.
- Clarified-prompt SHA-256: `1f93fa63bf3eda557a758154998e1e175c8cd2f57dabdcfb61dd64c549495fc2`.
- Old-prompt SHA-256: `b7aca8fbf81483f9a71d638bbfef60f8c8b2348f8a219b81f531f8d25ed919df`.
- Provider invocations: **80/80 maximum**, one attempt per call, no retries. Requests were spaced by 6.5 seconds and arm order alternated by case. Each request contained only ID, subject and body, plus its selected policy.
- Existing unbilled Free-tier project and repository secret were reused. No billing change or recurring task was added.

| Provider-reported measure | Old prompt | Clarified prompt |
| --- | ---: | ---: |
| Total tokens reported | 10756 | 20311 |
| Attempts with total-token metadata | 38/40 | 38/40 |
| Median attempt latency (ms) | 1015 | 865.5 |
| Nearest-rank p95 latency (ms) | 6766 | 1691 |

Missing usage is unknown, not zero. Provider token metadata is not a billing statement. Latencies exclude deliberate spacing and are not an end-to-end service guarantee. Returned model versions were old: gemini-3.5-flash-lite; clarified: gemini-3.5-flash-lite. Live generation and aliases are not deterministic; one run does not measure reliability.

## Limits

Forty policy-specific synthetic cases and AI-reviewed labels are not representative customer traffic or evidence of production readiness. The unchanged rules can still create unnecessary review and cannot be overridden by the guarded arm. Security and injection cases demonstrate only behavior on the specific tested requests, not comprehensive resistance. Real deployment needs appropriate data authorization, action permissions, human review ownership, monitoring and rollback. Those business integrations were not built or executed here.

Earlier hand-authored and Bitext-derived scores belong to different case mixes and are not directly comparable. This paired result is the relevant comparison for these prompt versions, subject to the limitations above.
