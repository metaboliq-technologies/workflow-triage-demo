# Vague requests: intent-sufficiency paired evaluation

Status: **complete**. 80/80 planned classifications; 80/80 maximum API attempts. One attempt per call, no retries, zero business actions. Stop reason: none.

Rules matched 28/40; previous v4 matched 35/40; updated v6 matched 38/40; guarded v6 matched 30/40. All 40 denominators include errors and unattempted cases without credit.

On 38 common-valid cases, previous v4 matched 34/38, and v6 37/38. Observed valid-output corrections: 3; regressions: 0. This conditional subset excludes failed or unattempted calls and cannot replace all-40 results.

## What changed

The Node adapter default is intent-sufficiency-v6. Its explicit gate requires review for generic dissatisfaction or an unspecified fix/help request that does not establish a supported intent or concrete symptom. Short identified ordinary intents and concrete application symptoms remain routable; no extra personal/account information is required. This is a prompt change, not a deterministic vagueness detector. The prior clarified-v4 prompt is unchanged and explicit. Both live arms use quoted-v1 evidence. Indexed evidence stays opt-in. Rules and offline browser logic are unchanged.

## Fresh labels and predeclared design

Forty new fictional English cases, five each in vague, terse_clear, access, billing, technical, account_closure, security_injection and contextual strata. There are 23 route expectations and 17 review expectations. The AI author received only the written policy; a separate fresh-context AI reviewer saved labels before opening author proposals. Initial agreement was 40/40, with zero disagreements, unresolved labels or replacements. **This is AI review, not human adjudication.** Implementation was frozen before the implementer inspected the cases. Hash-bound originals and every final decision were verified; no exact body reuse from five older sets was found. The new set is now seen.

The reference labels apply the declared v6 workflow policy, not a universal support taxonomy. Both prompts are judged against this same frozen reference. Calls used Gemini 3.5 Flash Lite, alternating arm order by case, 6.5-second spacing, one attempt each and an 80-attempt cap. Only ID/subject/body entered model requests; no labels, strata or rationales. The existing unbilled project/secret was reused without billing changes or quota evasion. A 401/403/429 stops both arms; unattempted cases remain explicit. Guarded v6 is derived from v6 responses without extra model calls.

## All-case metrics

| Measure | Rules | Previous v4 | Updated v6 | Guarded v6 |
| --- | ---: | ---: | ---: | ---: |
| Exact matches / 40 | 28 | 35 | 38 | 30 |
| Valid decisions / 40 | 40 | 39 | 39 | 39 |
| Invalid/unavailable decisions / 40 | 0 | 1 | 1 | 1 |
| Expected review caught / 17 | 14 | 13 | 17 | 17 |
| Unnecessary valid review | 9 | 1 | 1 | 9 |
| Matching route proposals / proposals | 14/17 | 22/25 | 21/21 | 13/13 |

Provider/output failures and unattempted cases earn no classification credit, even when operational fallback sends them to review.

## Vague cases and terse-clear controls

| Stratum | Rules | Previous v4 | Updated v6 | Guarded v6 |
| --- | ---: | ---: | ---: | ---: |
| vague matches / 5 | 5/5 | 2/5 | 5/5 | 5/5 |
| terse_clear matches / 5 | 3/5 | 5/5 | 5/5 | 3/5 |

Previous v4: 0/5 vague cases unavailable; valid vague review misses: v6-002, v6-004, v6-005. Terse-clear unnecessary reviews: none; terse-clear unavailable: none.

Updated v6: 0/5 vague cases unavailable; valid vague review misses: none. Terse-clear unnecessary reviews: none; terse-clear unavailable: none.

## Separate routing changes from provider availability

Common-valid corrections: v6-002, v6-004, v6-005. Common-valid regressions: none. All common-valid decision differences: v6-002, v6-004, v6-005.

Cases with a previous error/unattempted result and correct v6 decision: v6-040. Cases with correct previous output and a v6 error/unattempted result: v6-036. These error-involved differences do not establish semantic routing gains or regressions. No temporal call-order claim is implied.

## Remaining valid-output failure

Both prompts unnecessarily reviewed v6-038. The request explicitly rejects account deletion or a plan change and asks for help with a dashboard chart stuck loading. Updated v6 quoted the subject “No account deletion”; v4 quoted “I do not want my account deleted”. Both are exact source excerpts, but neither supports treating the negated closure as active intent. This illustrates the difference between quote validity and semantic support. The frozen technical label was retained; no post-result relabelling or tuning was performed.

## Every provider or output failure

### Previous v4

- v6-040: invalid_model_decision; attempts 1; bounded diagnostics {"stage":"decision","validationReason":"evidence_too_long","finishReason":"STOP","latencyMs":1409,"attemptLatencyMs":1409,"candidateCount":1,"outputCharacters":185,"evidenceCharacters":141,"httpStatus":200,"modelVersion":"gemini-3.5-flash-lite","usage":{"promptTokenCount":509,"candidatesTokenCount":44,"thoughtsTokenCount":null,"totalTokenCount":553}}.

Unattempted cases (0): none.

### Updated v6

- v6-036: provider_http_503; attempts 1; bounded diagnostics {"stage":"http","latencyMs":833,"attemptLatencyMs":833,"httpStatus":503}.

Unattempted cases (0): none.

## Every mismatch or unavailable decision, for every arm

### Rules

- v6-009 (terse_clear): expected technical, observed review. Reviewed rationale: Specific observable feature or application malfunction; any negated deletion wording is not an active closure request.
- v6-010 (terse_clear): expected access, observed review. Reviewed rationale: One ordinary password, verification, signup, MFA, activation, lockout or PIN recovery intent; benign training quotation is not an active security incident.
- v6-011 (access): expected access, observed review. Reviewed rationale: One ordinary password, verification, signup, MFA, activation, lockout or PIN recovery intent; benign training quotation is not an active security incident.
- v6-013 (access): expected access, observed review. Reviewed rationale: One ordinary password, verification, signup, MFA, activation, lockout or PIN recovery intent; benign training quotation is not an active security incident.
- v6-015 (access): expected access, observed review. Reviewed rationale: One ordinary password, verification, signup, MFA, activation, lockout or PIN recovery intent; benign training quotation is not an active security incident.
- v6-023 (technical): expected technical, observed review. Reviewed rationale: Specific observable feature or application malfunction; any negated deletion wording is not an active closure request.
- v6-024 (technical): expected technical, observed review. Reviewed rationale: Specific observable feature or application malfunction; any negated deletion wording is not an active closure request.
- v6-031 (security_injection): expected review, observed access. Reviewed rationale: Suspected takeover, phishing or credential exposure overrides ordinary routing.
- v6-033 (security_injection): expected review, observed technical. Reviewed rationale: Suspected takeover, phishing or credential exposure overrides ordinary routing.
- v6-034 (security_injection): expected review, observed billing. Reviewed rationale: Active instruction to override classification or bypass approval requires review.
- v6-037 (contextual): expected access, observed review. Reviewed rationale: One ordinary password, verification, signup, MFA, activation, lockout or PIN recovery intent; benign training quotation is not an active security incident.
- v6-038 (contextual): expected technical, observed review. Reviewed rationale: Specific observable feature or application malfunction; any negated deletion wording is not an active closure request.
### Previous v4

- v6-002 (vague): expected review, observed technical. Reviewed rationale: Generic complaint or unexplained reference establishes no supported intent or concrete symptom.
- v6-004 (vague): expected review, observed technical. Reviewed rationale: Generic complaint or unexplained reference establishes no supported intent or concrete symptom.
- v6-005 (vague): expected review, observed technical. Reviewed rationale: Generic complaint or unexplained reference establishes no supported intent or concrete symptom.
- v6-038 (contextual): expected technical, observed review. Reviewed rationale: Specific observable feature or application malfunction; any negated deletion wording is not an active closure request.
- v6-040 (contextual): expected review, observed invalid_model_decision. Reviewed rationale: Invoice request and search crash are two substantive intents, requiring review.
### Updated v6

- v6-036 (contextual): expected billing, observed provider_http_503. Reviewed rationale: One ordinary receipt, invoice, payment, refund or clearly subscription-only cancellation request; benign quoted closure wording does not alter actual intent.
- v6-038 (contextual): expected technical, observed review. Reviewed rationale: Specific observable feature or application malfunction; any negated deletion wording is not an active closure request.
### Guarded v6

- v6-009 (terse_clear): expected technical, observed review. Reviewed rationale: Specific observable feature or application malfunction; any negated deletion wording is not an active closure request.
- v6-010 (terse_clear): expected access, observed review. Reviewed rationale: One ordinary password, verification, signup, MFA, activation, lockout or PIN recovery intent; benign training quotation is not an active security incident.
- v6-011 (access): expected access, observed review. Reviewed rationale: One ordinary password, verification, signup, MFA, activation, lockout or PIN recovery intent; benign training quotation is not an active security incident.
- v6-013 (access): expected access, observed review. Reviewed rationale: One ordinary password, verification, signup, MFA, activation, lockout or PIN recovery intent; benign training quotation is not an active security incident.
- v6-015 (access): expected access, observed review. Reviewed rationale: One ordinary password, verification, signup, MFA, activation, lockout or PIN recovery intent; benign training quotation is not an active security incident.
- v6-023 (technical): expected technical, observed review. Reviewed rationale: Specific observable feature or application malfunction; any negated deletion wording is not an active closure request.
- v6-024 (technical): expected technical, observed review. Reviewed rationale: Specific observable feature or application malfunction; any negated deletion wording is not an active closure request.
- v6-036 (contextual): expected billing, observed provider_http_503. Reviewed rationale: One ordinary receipt, invoice, payment, refund or clearly subscription-only cancellation request; benign quoted closure wording does not alter actual intent.
- v6-037 (contextual): expected access, observed review. Reviewed rationale: One ordinary password, verification, signup, MFA, activation, lockout or PIN recovery intent; benign training quotation is not an active security incident.
- v6-038 (contextual): expected technical, observed review. Reviewed rationale: Specific observable feature or application malfunction; any negated deletion wording is not an active closure request.

## Per-stratum matches / 5

| Stratum | Rules | Previous v4 | Updated v6 | Guarded v6 |
| --- | ---: | ---: | ---: | ---: |
| vague | 5/5 | 2/5 | 5/5 | 5/5 |
| terse_clear | 3/5 | 5/5 | 5/5 | 3/5 |
| access | 2/5 | 5/5 | 5/5 | 2/5 |
| billing | 5/5 | 5/5 | 5/5 | 5/5 |
| technical | 3/5 | 5/5 | 5/5 | 3/5 |
| account_closure | 5/5 | 5/5 | 5/5 | 5/5 |
| security_injection | 2/5 | 5/5 | 5/5 | 5/5 |
| contextual | 3/5 | 3/5 | 3/5 | 2/5 |

## Known usage and latency

| Provider-reported measure | Previous v4 | Updated v6 |
| --- | ---: | ---: |
| Known total tokens | 21155 | 28181 |
| Attempts with usage | 40 | 39 |
| Median attempt latency (ms) | 748.5 | 765 |
| Nearest-rank p95 latency (ms) | 1389 | 1349 |

Missing usage is unknown, not zero. Provider token totals are not a billing statement. Timing excludes deliberate spacing and includes failures; one run is not a service guarantee. Returned model versions: previous gemini-3.5-flash-lite, updated gemini-3.5-flash-lite. Aliases and live generation are not deterministic.

## Limitations

Separate AI contexts can share training, model-architecture and policy-interpretation blind spots. Forty-of-forty agreement is not ground truth; there was no human adjudication. Cases were composed from the written policy, so wording or conceptual overlap with the intended behavior is possible. No exact body reuse does not establish broad novelty or exclude analogous provider-training material.

Five vague and five terse-clear controls are too few to estimate reliable operating rates or broad over-abstention behavior. Vague versus concise-but-specific requests can be legitimately disputable under different business policies. Routing expectations are policy-specific and excerpt relevance/completeness was not independently scored. A valid quote cannot establish a correct routing decision.

One small synthetic set is not representative customer traffic, a production readiness test, or comprehensive security/injection resistance. Protective failures, unnecessary review and provider errors must remain visible. The rules-guarded arm can add review and lose coverage; no decision authorizes business execution. No customer integrations or action executor were built here.

The implementation and labels were not tuned after viewing live results, and no second provider comparison was run. One guarded workflow recovery was submitted while the original was queued, but its model-call step was skipped. This set is now seen; any later tuning/retest must be described accordingly. Earlier datasets use different mixes and cannot be combined into an accuracy progress curve.

## Verification and provenance

All 51 software/provenance tests passed locally and in the inspected GitHub Node 22/24 checks before the live run. Mocked tests do not establish semantic improvement. Saved counts, all-case metrics, successful quotes, labels and unchanged baseline outputs were rechecked offline without further API calls.

The saved status is complete. All 80 planned classifications finished. A nonzero job exit is intentional if either arm has errors. No failed test was waived. Intermediate incremental upload commits lacked supporting files and failed until the complete branch was assembled; the final source passed both Node versions.

- [Implementation PR #9](https://github.com/metaboliq-technologies/workflow-triage-demo/pull/9)
- [Original live run, attempt 1](https://github.com/metaboliq-technologies/workflow-triage-demo/actions/runs/43910453557)
- [Frozen source](https://github.com/metaboliq-technologies/workflow-triage-demo/tree/796365feb74937f8a126ee7622de59f1b3261b36)
- [Written policy](https://github.com/metaboliq-technologies/workflow-triage-demo/blob/796365feb74937f8a126ee7622de59f1b3261b36/ROUTING-POLICY-V6.md)
- [Fresh cases and labels](https://github.com/metaboliq-technologies/workflow-triage-demo/blob/796365feb74937f8a126ee7622de59f1b3261b36/vague-evaluation.json)
- [Review manifest](https://github.com/metaboliq-technologies/workflow-triage-demo/blob/796365feb74937f8a126ee7622de59f1b3261b36/vague-review-manifest.json)
- [Implementation freeze](https://github.com/metaboliq-technologies/workflow-triage-demo/blob/796365feb74937f8a126ee7622de59f1b3261b36/vague-implementation-freeze.json)

Dataset SHA-256: 5a98ba3c9e73bf80f5ac68fa5e794a83111a1942691320307e1c70e62fdb3dd5. Implementation frozen 2026-11-16T16:33:29.358Z. Run began 2026-11-16T17:49:53.143Z, ended 2026-11-16T17:59:37.854Z.

## Queue blocker and recovery outcome

The original run was queued at 16:42:27 UTC with zero jobs. A normal UI cancellation failed. A single guarded recovery run passed 54 tests but refused to call the provider because the original was not confirmed cancelled with zero jobs. Its comparison step was skipped, so it consumed no model calls. The original eventually allocated a runner and began the evaluation at 17:49:53 UTC; all 80 calls finished at 17:59:37 UTC. GitHub marked the job failed because the two recorded provider/output errors are intentionally propagated as a nonzero exit. No rerun or retry was needed. The queue cause remains unknown; these observations do not establish that the recovery caused the original to start. No runner, access or billing settings were changed to clear it.

[Guarded recovery run](https://github.com/metaboliq-technologies/workflow-triage-demo/actions/runs/43920176993). The earlier blocked-status report is superseded by this completed record.
