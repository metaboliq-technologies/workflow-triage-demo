# Vague-request review: implementation complete, live comparison blocked

Observed 2026-11-16T17:41:19.469Z. This is an execution-status and rules-baseline report, not a completed model comparison.

## Implementation and validation

[PR #9](https://github.com/metaboliq-technologies/workflow-triage-demo/pull/9) is merged into staging. The adapter now instructs the model to send generic dissatisfaction, unexplained references and unspecified fixes for review instead of guessing a technical route. Clear short requests and concrete symptoms remain routable. This is a prompt-level change, not a deterministic vagueness detector; behavioral improvement remains unmeasured.

The frozen evaluated source is 796365feb74937f8a126ee7622de59f1b3261b36. Core implementation was frozen before the implementer inspected the new cases. All 51 implementation tests passed locally and on GitHub Node 22/24. A separate guarded recovery passed 54 tests, including three recovery-guard tests.

## Fresh evaluation set

40 fictional cases were written by one AI agent and independently labelled by a separate AI agent before seeing the author's labels. Initial agreement was 40/40, with no unresolved disagreements. There are 17 review cases and 23 routable cases, five cases in each of eight strata. No exact normalized body was reused from the five earlier sets. Dataset SHA-256: 5a98ba3c9e73bf80f5ac68fa5e794a83111a1942691320307e1c70e62fdb3dd5.

## Rules baseline: all outcomes and failures

Exact match: 28/40 (70%). All 40 decisions were available, with zero execution errors. Review recall was 14/17; proposal precision was 14/17. There were three review misses and nine unnecessary reviews. All five deliberately vague requests were reviewed correctly.

| Stratum | Exact matches |
|---|---|
| vague | 5/5 |
| terse_clear | 3/5 |
| access | 2/5 |
| billing | 5/5 |
| technical | 3/5 |
| account_closure | 5/5 |
| security_injection | 2/5 |
| contextual | 3/5 |

All 12 mismatches:

| Case | Stratum | Expected | Rules decision |
|---|---|---|---|
| v6-009 | terse_clear | technical | review |
| v6-010 | terse_clear | access | review |
| v6-011 | access | access | review |
| v6-013 | access | access | review |
| v6-015 | access | access | review |
| v6-023 | technical | technical | review |
| v6-024 | technical | technical | review |
| v6-031 | security_injection | review | access |
| v6-033 | security_injection | review | technical |
| v6-034 | security_injection | review | billing |
| v6-037 | contextual | access | review |
| v6-038 | contextual | technical | review |

The three security/injection review misses are v6-031, v6-033 and v6-034. All other mismatches above are unnecessary reviews. Machine-readable rows preserve every baseline result.

## Live execution failure

[Original run 43910453557](https://github.com/metaboliq-technologies/workflow-triage-demo/actions/runs/43910453557) has remained queued since 16:42:27 UTC, with zero jobs. GitHub's normal cancellation returned an error. No approval gate was visible, and the organization showed zero of 20 Linux runner slots in use; these observations do not establish the root cause.

A single [guarded recovery run 43920176993](https://github.com/metaboliq-technologies/workflow-triage-demo/actions/runs/43920176993) ran tests but failed its pre-call guard because the original was still queued rather than confirmed cancelled with zero jobs. Its model-call step was skipped. No model calls are known to have occurred in either run as of this observation. No live model/provider failures, token totals, costs, accuracy, or gains can be measured from these runs.

The planned paired test uses the previous v4 prompt and new v6 prompt on the same 40 cases, alternating order, with one attempt per classification and at most 80 attempts. The rules baseline is unchanged. A guarded model arm is derived from the same v6 response without additional calls. Another unguarded run was not started because the original could later execute its calls. GitHub must clear the stuck run, or it must finish, before another full comparison is safe. The original may still start after this report.

## Limitations

This is AI review, not human adjudication. Agreement does not establish correctness; author and reviewer can share blind spots. The sample is small, synthetic and policy-directed, with possible conceptual overlap with earlier cases. Exact non-reuse does not establish semantic novelty. Routing labels do not establish evidence relevance or completeness. Unit tests check mechanics and contracts, not model behavior. There is no measured model improvement, regression, or equality result yet. Queue cause is unknown. No production deployment, new credentials, billing change, or LinkedIn publication was performed for this task.
