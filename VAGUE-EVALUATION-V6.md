# Vague-request review experiment v6

The default Node adapter policy is intent-sufficiency-v6. It adds an explicit
intent-sufficiency check before ordinary routing: generic dissatisfaction and
unspecified fix/help requests require review; concise identified ordinary intents
and concrete application symptoms still route. It must not invent missing facts.
This is a prompt change, not a deterministic detector or a production guarantee.
Quoted evidence remains the default. Indexed evidence remains opt-in. Historical
v4/v3 prompts are unchanged and selected explicitly by historical comparisons.
The unchanged offline rules lab still uses its original policy.

## Predeclared live comparison

Freeze implementation before the implementer opens fresh inputs or labels.
Use 40 new fictional cases, five each in vague, terse_clear, access, billing,
technical, account_closure, security_injection and contextual strata. An AI author
receives only the written policy; a separate fresh-context AI reviewer saves
independent initial labels before opening author labels. Preserve all originals,
initial agreement, every disagreement, its final decision and rationale. No case
replacement or label adjustment to optimize a measured score is allowed.

Compare clarified-v4 and intent-sufficiency-v6 on the same set, both quoted-v1,
Gemini 3.5 Flash Lite, alternating call order, at most 80 API attempts, one attempt
per call, no retries, 6.5-second spacing. Evaluate unchanged rules and reconcile
the new responses with rules as a separate guarded arm without extra model calls.
Use the existing authorized unbilled project/secret; do not expose credentials,
upgrade billing or create another project to evade quota. Stop on the first
401/403/429 response and retain explicitly unattempted rows. Other provider or
contract errors remain visible without correctness credit. A stopped run must
not be described as a completed 80-call experiment. Zero business actions.

Report all-40 exact matches and availability, expected-review misses (especially
vague cases), unnecessary review (especially terse clear controls), per-stratum
results, every provider/output/routing failure, common-valid paired differences,
and known usage/latency with missing usage unknown. A job may intentionally exit
nonzero for errors after completing all planned calls; inspect the saved status.

AI review is not human adjudication. Shared model/policy blind spots may persist;
agreement is not ground truth. Exact non-reuse checks cannot establish conceptual
novelty or exclude analogous provider training material. Routing labels do not
independently assess evidence relevance or completeness. A small synthetic run is
not representative traffic, production readiness or comprehensive injection
resistance. The new set becomes seen after implementation freeze; do not tune and
rerun while calling it untouched evidence. Prior datasets are not a progress curve.

Historical live evaluations must use their pinned source revisions. The v4 and
v5 adapter files are archived for byte-exact provenance checks; those folders are
not standalone runnable packages. Original freezes and result artifacts remain
unchanged. The new prompt's semantic behavior is assessed live, not established
by mocked transport or provenance tests.
