# Bounded model-call reliability and fresh negation evaluation v8

Use the explicit `createReliableGeminiAdapter` entry point from
`reliable-adapter.mjs`. The historical adapter, `closure-negation-v7` prompt,
quoted evidence validator and rules baseline remain unchanged. The wrapper uses
up to 30 seconds per attempt and 65 seconds per classification, including retry
wait, with at most two attempts. Only timeout, HTTP 503 and HTTP 504 permit one
retry. Default jittered backoff is 4–4.8 seconds. Supported Retry-After integer
seconds or IMF-fixdate values can extend that wait up to eight seconds; malformed
or longer advice defers retry rather than shortening it. Other provider/body
retry hints are not interpreted. Invalid/blocked model output, generic transport
errors, quota, authentication and other HTTP statuses are not retried.

These are fictional read-only classifications, not action requests. A timed-out
request might still be processed remotely; usage and cost for it remain unknown.
No idempotency or remote cancellation guarantee is claimed. This wrapper must not
be generalized to side-effecting business calls without their own design.

## Predeclared live design

Freeze implementation before the implementer reads fresh cases. Retain 40 new
fictional English cases, five in each of negated_technical, negated_access,
negated_billing, active_closure, ambiguous_closure, security_injection,
vague_controls and contextual. The author receives only the unchanged routing
reference. Shuffle groups before assigning IDs and preserve the order. A separate
fresh-context reviewer saves initial labels while blind to author labels AND
assigned groups, then records all disagreements, final decisions and rationales.
Preserve originals; no score-driven replacements or relabelling.

Use the unchanged v7 prompt, Gemini 3.5 Flash Lite and quoted-v1 evidence. Each of
40 classifications gets at most two attempts: at most 80 API attempts total,
including all failed/recovered attempts. Space classifications by 6.5 seconds.
Report first-attempt outcomes and final bounded outcomes on the SAME run; first
attempts also use the new 30-second deadline. They are not a controlled legacy
15-second comparison or an independent second prompt arm. Derive guarded final
decisions with no extra calls. Compare every view with unchanged rules and frozen
labels. Only ID/subject/body go to the provider.

Stop on HTTP 400/401/402/403/404/429, unsupported/excessive Retry-After advice,
or three consecutive classifications ending
in unrecovered timeout/503/504. Retain all unattempted rows without credit. A
checkpoint is saved before the batch and after each classification; interruption
during a classification can leave up to two attempts outside the last saved
checkpoint. Do not claim a complete count for an interrupted run. Workflow cap:
60 minutes, above the configured worst-case classification/spacing envelope.
No new credentials/projects, billing changes, quota circumvention or business
actions. Use the existing authorized evaluation secret/project only.

Report all first-attempt failures, each retry/deferred retry, recovered/unrecovered
cases, all final mismatches, all-case denominators, group results, review recall,
unnecessary review, attempts, total/backoff latency and known/unknown usage across
ALL attempts. A complete run intentionally exits nonzero if any initial/final
call failed, even when a retry recovers it. Retry recovery is availability
evidence, not a semantic routing correction. Never retry a successful but wrong
classification or invalid quote to optimize measured scores.

## Limits and sources

AI review is not human adjudication. Shared training/policy blind spots, a small
policy-directed English sample, one fixed shuffled order and model variation
limit inference. Exact non-reuse against seven older sets does not establish
semantic novelty or training exclusion. Evidence relevance/completeness are not
independently adjudicated by routing labels. This is not representative traffic,
production readiness or comprehensive injection testing. A longer deadline and
extra calls can increase latency and cost. The set becomes seen after the freeze;
later tuning needs fresh evidence. Prior datasets are not an accuracy curve.

The bounded strategy is an implementation choice informed by the official
[generateContent error reference](https://ai.google.dev/gemini-api/docs/generate-content/api-errors)
and [HTTP Retry-After semantics](https://www.rfc-editor.org/rfc/rfc9110.html#name-retry-after).
It is deliberately stricter about quota/auth errors than general retry guidance.

## Completed execution

The completed [bounded reliability and negation evaluation](reliability-negation-results.md) used 41/80 allowed attempts for 40 fresh cases. One HTTP 503 retry recovered a valid but incorrect route under the frozen label: availability rose from 39/40 to 40/40 while exact matches stayed 38/40. Rules matched 29/40; guarded final matched 33/40. All 15 negated ordinary requests matched, but two required-review labels were missed; the fictional-medical-context label is explicitly debatable. No first attempt exceeded the old 15-second deadline. This is not an independent legacy-timeout comparison or a measured semantic gain. Labels were AI-authored and separately AI-reviewed, not human-adjudicated. See [every attempt and diagnostic](reliability-negation-comparison.json).

All 71 tests passed before live calls. The complete manual run intentionally has a failure conclusion because its initial HTTP 503 remains recorded, even though final calls all produced valid output. No prompts, reference labels or frozen implementation were tuned after results; no extra provider run was submitted.
