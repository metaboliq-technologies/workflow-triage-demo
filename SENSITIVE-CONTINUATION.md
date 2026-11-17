# Continuation of the twelve unattempted v9 cases

User authorized a separate continuation after the original HTTP429 stop. The
original sensitive-context-comparison.json and sensitive-context-results.md are
immutable historical records. Do not overwrite them, rerun the first28 cases,
replace their failures, or tune prompts/labels.

The pinned plan binds original run43951438030 and the exact original report hash.
Only v9-029 through v9-040, whose original provider record is null, may be selected.
Before any call, verify the original dataset, AI-review manifest, all nine frozen
source hashes, policy and system prompt. This is not a new unseen set: cases and
labels have been inspected since the original run.

Same Gemini3.5FlashLite, frozen sensitive-context-v9 policy, quoted-v1 validator
and bounded-v8 transport. Thirty seconds between classifications reduces request
rate; it is an execution change and temporal confound, not a policy improvement.
At most12 classifications /24 continuation attempts; original28 plus continuation
remain below the existing80 attempt cap. Stop on the first429/auth/configuration
failure, unhandled retry advice, or three consecutive unrecovered transients.
One timeout/503/504 retry is permitted by unchanged transport. Never retry invalid
output or a valid wrong route for correctness. No billing/project/key changes.

The first continuation request is also the availability check; no separate probe
call. Safe429 observations may retain only quota categories and bounded numeric
Retry-After/RetryInfo delays. Raw error messages, quota dimensions, identifiers,
credentials and rejected model text are not retained. A short RetryInfo delay
does not justify bypassing a daily limit. Continue only through the frozen stop
rules; no automatic second run.

Keep separate original, continuation and combined accounting. Combine rows only
where the original provider is null; preserve original failures and prior outputs.
Any new429 on an originally untouched case also stays without credit. Report all
failed attempts, valid mismatches, unseen/unattempted cases, per-group denominators,
guard tradeoffs, known/unknown all-attempt usage and timing. Combined results span
two time windows and spacing settings, not one fresh40-case run. AI labels are not
human-adjudicated; no prior-prompt control, stable reliability or production claim.

Checkpoints are per classification, not per attempt. An interrupted classification
can leave up to two calls outside the last saved checkpoint. Never assume unknown
attempts were zero or blindly rerun. A valid exact quote is not proof of semantic
evidence support. The original medical review miss and quote failure are retained.

## Recorded outcome

The separate [twelve-case continuation](sensitive-continuation-results.md) is **complete**: 12/12 classifications, 12/24 continuation attempts, 40/80 cumulative attempts including the original 28. Continuation model matches 12/12 versus rules 5/12 and guard 7/12. The [combined cross-window view](sensitive-combined-comparison.json) retains all original attempted rows and failures: model 37/40, rules 22/40, guard 28/40. Original invalid quote, HTTP 429 and migraine review miss are preserved. Different time windows and 30s versus 6.5s spacing prevent a single-run or causal policy-gain interpretation. Cases and labels are unchanged AI-authored/AI-reviewed, not newly unseen or human-adjudicated. See [all continuation attempts](sensitive-continuation-comparison.json); the original partial report and raw record remain unchanged.

