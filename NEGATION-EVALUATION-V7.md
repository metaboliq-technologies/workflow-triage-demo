# Account-closure negation experiment v7

The new Node adapter default is `closure-negation-v7`. It adds explicit polarity
and clause-scope handling to the unchanged v6 prompt. Negated account closure is
not by itself a destructive request or an extra substantive intent. A single
clear ordinary request should route on its own evidence. Active, ambiguous,
contradictory or suspected accidental closure, security, injection and multiple
substantive requests retain protective review. Vague requests still require
clarification through review. This is a prompt change, not a deterministic
negation detector or an assurance of model behavior.

## Predeclared design

Freeze implementation before the implementer reads fresh inputs or labels. Use
40 original fictional cases, five each in negated_technical, negated_access,
negated_billing, active_closure, ambiguous_closure, security_injection,
vague_controls and contextual. One fresh-context AI author receives only the
written v7 policy. A separate fresh-context AI reviewer saves independent labels
before reading author labels, then records every disagreement and resolution.
Preserve all originals. Never replace cases or tune labels to optimize results.

Compare the unchanged v6 and updated v7 prompts with Gemini 3.5 Flash Lite and
quoted-v1 evidence, alternating arm order, 6.5-second spacing, one attempt per
classification, no retries, at most 80 API attempts. Rules remain unchanged. A
rules-guarded v7 arm is derived from the same responses with no extra model calls.
Only ID/subject/body enter provider requests. No labels, strata or rationales.
No business actions. Use the existing authorized project and Actions secret;
no billing/access changes, new credentials or quota circumvention.

Stop both arms on 401/403/429 and retain unattempted rows explicitly. Other
provider or contract failures remain visible without retries or correctness
credit. All-case denominators include failures, even when operational fallback
requires review. A complete 80-attempt experiment can intentionally exit with
failure when it contains call/output errors. Do not mistake job status for
classification completeness, or rerun merely to erase errors.

Report all 40-case scores, every routing/review mismatch and failed call, review
recall, unnecessary review, availability, per-stratum performance, common-valid
paired changes, known usage/latency and unknown usage. Inspect whether gains on
negated ordinary requests come at the cost of active closure/security review.
Check exact normalized body non-reuse against all six older sets. Exact non-reuse
does not establish semantic novelty or provider-training exclusion.

## Limits

AI-authored and separately AI-reviewed labels are not human adjudication.
Agreement can conceal shared model/policy blind spots. Small synthetic English
sets authored from a policy are not representative customer traffic, causal
proof, production readiness or comprehensive injection resistance. Source-exact
evidence does not prove semantic support; excerpt relevance/completeness is not
independently adjudicated by these routing labels. This set becomes seen after
the freeze; later tuning needs new evidence. Historical evaluations must use
their pinned source revisions. Archived adapters preserve hashes and are not
standalone runnable packages. Previous sets are not an accuracy progress curve.

## Completed run

The [fresh account-closure negation comparison](negated-closure-results.md) found **no observed routing gain**: updated v7 matched 36/40, previous v6 38/40, rules 26/40 and guarded v7 29/40. Both prompts made identical correct decisions on all 35 common-valid cases. V7 had two timeouts and two HTTP 503 failures; v6 had one rejected exact quote and one unnecessary review. The v7 call on that remaining review-error case failed, so its correction is unmeasured. All 80 planned calls were attempted once without retries; every failure stays without correctness credit. Labels were AI-authored and separately AI-reviewed, not human-adjudicated. See [every result and diagnostic](negated-closure-comparison.json).

Both prompts caught all 22 required-review cases in this synthetic set. The completed experiment intentionally has a failed workflow conclusion because it records call/output errors. No evaluated prompt or reference label was changed after results; a further assessment needs new evidence.
