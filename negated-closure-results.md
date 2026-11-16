# Account-closure negation: paired evaluation v7

Status: **complete**. 80/80 planned classifications, 80/80 maximum API attempts, one attempt per call and no retries. Stop reason: none. Zero business actions. A complete experiment may have a failed workflow conclusion because call/output errors intentionally produce a nonzero exit.

Rules matched 26/40, previous v6 38/40, updated v7 36/40 and guarded v7 29/40. All 40 denominators include unavailable/invalid decisions without credit.

## Main finding: no observed routing gain

Both prompts made identical category/review decisions on all 35 common-valid cases, and all 35 matched the frozen labels. There were no common-valid corrections or regressions. The updated arm had four failed calls (two timeouts and two HTTP 503 responses), versus one invalid exact-quote output in the previous arm. Its lower all-case score therefore does not establish a semantic regression, and the zero observed valid-output mistakes do not establish a routing improvement.

The previous prompt unnecessarily reviewed v7-012, a receipt request that explicitly ruled out workspace closure. It quoted “I do not want our workspace closed.” The updated call for the same case failed with HTTP 503. This experiment cannot establish whether v7 corrects that remaining negation error. No retry was used to fill the gap. Both prompts correctly reviewed all 22 required-review cases, including the active/ambiguous closure and security/injection controls, on this small set.

## Change and controlled design

The new default `closure-negation-v7` appends explicit polarity and clause-scope instructions to the unchanged v6 prompt. Negated closure is not by itself an active destructive request, extra substantive intent or review trigger. A single identified ordinary request should route using evidence of its actual intent or concrete symptom. Active, conditional, ambiguous or suspected accidental closure, security/injection, sensitive context, multiple substantive intents and vague requests retain protective review. This is a prompt-level change, not a deterministic negation detector or production guarantee.

Implementation was frozen 2026-11-16T18:43:35.708Z, before the implementer read fresh cases. The AI author read only the written policy. A separate fresh-context AI reviewer saved independent initial labels before opening author labels. Initial agreement: 40/40; resolved disagreements: 0; unresolved: 0; replacements: 0. The reviewer knew assigned strata, which can influence interpretation. **This is AI review, not human adjudication.**

The 40 fictional English cases include five each in negated_technical, negated_access, negated_billing, active_closure, ambiguous_closure, security_injection, vague_controls and contextual. There are 22 review expectations and 18 routable expectations. Original inputs, author proposals, reviewer initial labels, every resolution and final labels are hash-bound. No exact normalized body reuse from six earlier sets was found. Exact non-reuse cannot establish semantic novelty or exclude analogous training material.

Both prompts use Gemini 3.5 Flash Lite, quoted-v1 evidence, alternating arm order by case and 6.5-second spacing. Only ID/subject/body enter provider requests; labels, strata and rationales do not. The same unchanged rules baseline is evaluated on every input. Guarded v7 is derived from v7 outputs with no extra calls. The existing authorized project/secret is reused with no billing/access changes. A first 401/403/429 stops both arms; other errors remain without retries. No additional run is used to erase failures.

## All-case metrics

| Measure | Rules | Previous v6 | Updated v7 | Guarded v7 |
|---|---:|---:|---:|---:|
| Exact matches / 40 | 26 | 38 | 36 | 29 |
| Valid decisions / 40 | 40 | 39 | 36 | 36 |
| Unavailable or invalid / 40 | 0 | 1 | 4 | 4 |
| Required review caught / 22 | 16 | 22 | 22 | 22 |
| Unnecessary valid reviews | 8 | 1 | 0 | 7 |
| Correct route proposals / proposals | 10/16 | 16/16 | 14/14 | 7/7 |

Failures do not earn review credit merely because operational fallback abstains.

## Every stratum and the protective controls

| Stratum | Rules | Previous v6 | Updated v7 | Guarded v7 |
|---|---:|---:|---:|---:|
| negated_technical | 2/5 | 4/5 | 4/5 | 2/5 |
| negated_access | 1/5 | 5/5 | 5/5 | 1/5 |
| negated_billing | 5/5 | 4/5 | 3/5 | 3/5 |
| active_closure | 2/5 | 5/5 | 5/5 | 5/5 |
| ambiguous_closure | 5/5 | 5/5 | 5/5 | 5/5 |
| security_injection | 2/5 | 5/5 | 5/5 | 5/5 |
| vague_controls | 5/5 | 5/5 | 5/5 | 5/5 |
| contextual | 4/5 | 5/5 | 4/5 | 3/5 |

A stratum name does not itself establish a label. The actual frozen label applies to each request. The three negated ordinary strata must be considered alongside active/ambiguous closure, security/injection and vague controls; gains in coverage do not justify missed protective review.

## Common-valid paired differences

On 35 cases with valid decisions in both model arms, previous v6 matched 35/35 and v7 35/35. Corrections: none (0); regressions: none (0). All common-valid decision changes: none. This subset excludes failures and cannot replace the all-40 scores.

Previous error with correct v7 output: v7-004. Correct previous output with a v7 error: v7-005, v7-011, v7-037. These availability/contract differences do not establish semantic routing gains or regressions.

## Every failed or unattempted call

### Previous v6

- v7-004: invalid_model_decision; attempts 1; diagnostics {"stage":"decision","validationReason":"evidence_not_in_request","finishReason":"STOP","latencyMs":8032,"attemptLatencyMs":8032,"candidateCount":1,"outputCharacters":154,"evidenceCharacters":107,"httpStatus":200,"modelVersion":"gemini-3.5-flash-lite","usage":{"promptTokenCount":716,"candidatesTokenCount":44,"thoughtsTokenCount":null,"totalTokenCount":760}}.

### Updated v7

- v7-005: provider_timeout; attempts 1; diagnostics {"stage":"transport","latencyMs":15001,"attemptLatencyMs":15001}.
- v7-011: provider_timeout; attempts 1; diagnostics {"stage":"transport","latencyMs":15001,"attemptLatencyMs":15001}.
- v7-012: provider_http_503; attempts 1; diagnostics {"stage":"http","latencyMs":2348,"attemptLatencyMs":2348,"httpStatus":503}.
- v7-037: provider_http_503; attempts 1; diagnostics {"stage":"http","latencyMs":651,"attemptLatencyMs":651,"httpStatus":503}.

## Every mismatch or unavailable decision, all arms

### Rules

- v7-001 (negated_technical): expected technical; observed review. Frozen AI-reviewed rationale: Calendar day offset is concrete; closure denied.
- v7-004 (negated_technical): expected technical; observed review. Frozen AI-reviewed rationale: Viewer loses zoom on next picture; deletion denied.
- v7-005 (negated_technical): expected technical; observed review. Frozen AI-reviewed rationale: Blank dashboard is a concrete display failure.
- v7-006 (negated_access): expected access; observed review. Frozen AI-reviewed rationale: Sign-in verification email missing; closure denied.
- v7-007 (negated_access): expected access; observed review. Frozen AI-reviewed rationale: Forgotten PIN prevents unlock; account preservation requested.
- v7-009 (negated_access): expected access; observed review. Frozen AI-reviewed rationale: Lost old phone requires ordinary MFA recovery without compromise evidence.
- v7-010 (negated_access): expected access; observed review. Frozen AI-reviewed rationale: Sign-in loops back to form; cancellation denied.
- v7-017 (active_closure): expected review; observed billing. Frozen AI-reviewed rationale: How-to permanent account deletion is active despite denying refund.
- v7-019 (active_closure): expected review; observed billing. Frozen AI-reviewed rationale: Typo still clearly requests account and boards deletion.
- v7-020 (active_closure): expected review; observed billing. Frozen AI-reviewed rationale: Permanent membership-tier closure and profile removal are destructive despite denying subscription cancellation.
- v7-027 (security_injection): expected review; observed access. Frozen AI-reviewed rationale: Password entered on fake support page indicates phishing and credential exposure.
- v7-028 (security_injection): expected review; observed billing. Frozen AI-reviewed rationale: Technical issue accompanies active classifier override with claimed system role and harmlessness.
- v7-029 (security_injection): expected review; observed technical. Frozen AI-reviewed rationale: Quoted override is ordered to be followed; it is active rather than benign quotation.
- v7-036 (contextual): expected technical; observed review. Frozen AI-reviewed rationale: Dragging task duplicates it; deletion is disclaimed training quotation.

### Previous v6

- v7-004 (negated_technical): expected technical; observed invalid_model_decision. Frozen AI-reviewed rationale: Viewer loses zoom on next picture; deletion denied.
- v7-012 (negated_billing): expected billing; observed review. Frozen AI-reviewed rationale: Requests receipt; workspace closure denied.

### Updated v7

- v7-005 (negated_technical): expected technical; observed provider_timeout. Frozen AI-reviewed rationale: Blank dashboard is a concrete display failure.
- v7-011 (negated_billing): expected billing; observed provider_timeout. Frozen AI-reviewed rationale: Only monthly paid subscription ends; free account retained.
- v7-012 (negated_billing): expected billing; observed provider_http_503. Frozen AI-reviewed rationale: Requests receipt; workspace closure denied.
- v7-037 (contextual): expected access; observed provider_http_503. Frozen AI-reviewed rationale: Forgot password is clear recovery intent despite brevity.

### Guarded v7

- v7-001 (negated_technical): expected technical; observed review. Frozen AI-reviewed rationale: Calendar day offset is concrete; closure denied.
- v7-004 (negated_technical): expected technical; observed review. Frozen AI-reviewed rationale: Viewer loses zoom on next picture; deletion denied.
- v7-005 (negated_technical): expected technical; observed provider_timeout. Frozen AI-reviewed rationale: Blank dashboard is a concrete display failure.
- v7-006 (negated_access): expected access; observed review. Frozen AI-reviewed rationale: Sign-in verification email missing; closure denied.
- v7-007 (negated_access): expected access; observed review. Frozen AI-reviewed rationale: Forgotten PIN prevents unlock; account preservation requested.
- v7-009 (negated_access): expected access; observed review. Frozen AI-reviewed rationale: Lost old phone requires ordinary MFA recovery without compromise evidence.
- v7-010 (negated_access): expected access; observed review. Frozen AI-reviewed rationale: Sign-in loops back to form; cancellation denied.
- v7-011 (negated_billing): expected billing; observed provider_timeout. Frozen AI-reviewed rationale: Only monthly paid subscription ends; free account retained.
- v7-012 (negated_billing): expected billing; observed provider_http_503. Frozen AI-reviewed rationale: Requests receipt; workspace closure denied.
- v7-036 (contextual): expected technical; observed review. Frozen AI-reviewed rationale: Dragging task duplicates it; deletion is disclaimed training quotation.
- v7-037 (contextual): expected access; observed provider_http_503. Frozen AI-reviewed rationale: Forgot password is clear recovery intent despite brevity.

## Evidence-support observation, separate from routing scores

The prior prompt also cited “Please do not erase the account.” for v7-031. Review is the frozen correct decision because the remaining request is vague (“This is awful and I need someone to fix it”), not because the negated action is active. The updated prompt quoted the vague complaint instead. This inspection illustrates why a matching route plus a valid exact quote does not establish a sufficient explanation. It is not an independently adjudicated evidence-support score or a measured semantic gain. Invalid-output diagnostics retain the rejection reason and counts, not the rejected raw response; the exact quote defect in v7-004 cannot be reconstructed from the sanitized report.

## Known usage and latency

| Measure | Previous v6 | Updated v7 |
|---|---:|---:|
| Known total tokens | 29334 | 34831 |
| Attempts with usage metadata | 40 | 36 |
| Median attempt latency, ms | 1108.5 | 970.5 |
| Nearest-rank p95 latency, ms | 8528 | 8475 |

Missing usage is unknown, not zero. Token totals are not a complete billing statement. Timings include failures with known timings but exclude deliberate spacing. One run does not establish a latency/service guarantee. Returned versions: v6 gemini-3.5-flash-lite; v7 gemini-3.5-flash-lite. Model aliases and generation are not deterministic.

## Verification, failures during preparation and limits

All 56 final software/provenance tests passed locally without skips, and GitHub checks were required before the live run. Initial local setup exposed historical-byte mismatches after line-ending normalization; original bytes were restored without changing old hashes. The local server test initially skipped under restricted networking, then passed with local networking enabled. No failed test was waived. Saved metrics, attempt counts, labels, successful quotes, rules outputs, derived guarded decisions and provenance hashes were independently recomputed offline without extra provider calls. Tests verify mechanics and contracts, not semantic improvement.

Author and reviewer can share model/training and policy-interpretation blind spots. Agreement is not ground truth, and the policy-directed strata can cue expected behavior. No human routing or excerpt-support adjudication was performed. The set is small, synthetic and English-only; negation scope can be disputed under different business rules. Exact quotes do not establish semantic relevance or completeness, which routing labels do not independently score.

This is one paired run, not representative customer traffic, a causal guarantee, production readiness or comprehensive security/injection resistance. Five cases per stratum cannot establish reliable operating rates. Guards can add unnecessary review and lose coverage. Availability and model variation affect scores; earlier sets have different mixes and are not an accuracy progress curve. This set is now seen. Implementation and labels were not tuned after results; later changes need new evidence. No decision authorizes business execution.

Cases ran in fixed dataset/stratum order with alternating prompt order, not randomized repeated trials. Temporal provider variation can correlate with case position. There is no significance claim or estimate of a stable population effect. The new instruction also makes the prompt longer, so observed behavior cannot isolate the contribution of each sentence.

## Provenance

- [Implementation PR](https://github.com/metaboliq-technologies/workflow-triage-demo/pull/11)
- [Original live run, attempt 1](https://github.com/metaboliq-technologies/workflow-triage-demo/actions/runs/43933389030)
- [Frozen source](https://github.com/metaboliq-technologies/workflow-triage-demo/tree/722425d4807425d4dbebfffb02f029630eb4a98a)
- [Routing policy](https://github.com/metaboliq-technologies/workflow-triage-demo/blob/722425d4807425d4dbebfffb02f029630eb4a98a/ROUTING-POLICY-V7.md)
- [Fresh cases and labels](https://github.com/metaboliq-technologies/workflow-triage-demo/blob/722425d4807425d4dbebfffb02f029630eb4a98a/negation-evaluation.json)
- [Review manifest](https://github.com/metaboliq-technologies/workflow-triage-demo/blob/722425d4807425d4dbebfffb02f029630eb4a98a/negation-review-manifest.json)
- [Implementation freeze](https://github.com/metaboliq-technologies/workflow-triage-demo/blob/722425d4807425d4dbebfffb02f029630eb4a98a/negation-implementation-freeze.json)

Dataset SHA-256: 8bbf957ffe3ecc392433be930c8b69a1d2bfbecdc9df8284f646a3560be93c41. Run started 2026-11-16T18:52:36.154Z; finished 2026-11-16T19:05:01.753Z.
