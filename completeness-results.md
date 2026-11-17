# Evidence completeness v10: partial paired evaluation

No observed routing or evidence-quality gain on five completed pairs. This is a quota-limited partial run, not a completed 20-case evaluation.

The optional createCompletenessAdapter asks for decisive protective context while retaining v9 routing, the single exact 4–120 UTF-16-unit quote contract, validator, rules and bounded transport. Implementation was frozen before implementer case exposure. Historical sources/results remain unchanged.

## Execution and blocker

[Run 44038024039](https://github.com/metaboliq-technologies/workflow-triage-demo/actions/runs/44038024039) used source 7e8ce73a4bf3d4e2da9af8283bb187b900f42213 on 2026-11-17, 07:21:16–07:24:09 UTC. Gemini 3.5 Flash Lite; alternating arm order; 15-second spacing; unchanged 30s/65s limits. Eleven classifications and eleven actual attempts of at most 80; no retries. The first ten calls produced valid outputs. Updated v10-006 returned HTTP 429 at the HTTP stage after 180ms; Retry-After was absent. The required quota stop worked. Prior v10-006 plus both arms of v10-007–020 were never attempted: 29 planned classifications. No schema/quote failures, recovered calls or unknown in-flight attempts occurred. The workflow correctly exited with failure and retained its checkpoint. No rerun, quota workaround, project/key/billing change or business action followed.

The sanitized response does not identify rate versus daily quota or a reset time. Immediate retry cannot be justified from it. Completing the remaining classifications requires a separately bounded continuation after provider access recovers; the original failed attempt must remain.

## Results

| Measure | Previous v9 | Updated v10 | Rules |
|---|---:|---:|---:|
| Available outputs / all 20 | 5/20 | 5/20 | 20/20 |
| Routing exact matches / all 20 | 5/20 | 5/20 | 10/20 |
| Routing on 5 common-valid pairs | 5/5 | 5/5 | 4/5 |
| AI evidence support / all 20 | 5/20 | 5/20 | not graded |
| AI frozen-fact coverage / all 20 | 5/20 | 5/20 | not graded |
| Joint route + support + coverage / all 20 | 5/20 | 5/20 | not graded |
| Required reviews caught / all 13 | 4/13 | 4/13 | 7/13 |
| Unnecessary reviews observed | 0 | 0 | 4 |
| Proposals / correct proposals | 1 / 1 | 1 / 1 | 9 / 3 |

First and final model views are identical. Both derived guard views match 5/20 and 5/5 common-valid. Missing/invalid outputs receive zero credit; 5/20 is completion-sensitive credit, not an estimate of model accuracy on unattempted cases. The five observed pairs exclude 15 cases, including every security_context and ordinary_evidence case. No general completeness or security claim follows. Four quotes were identical across arms; the fifth updated quote was longer, with both judged complete. There were no observed model review misses among valid outputs, but nine required-review cases remain unmeasured per arm.

## Blind AI review and provenance

Twenty fresh fictional cases were AI-authored and reviewed by a separate initially blind AI label/criteria reviewer. Initial routing agreement was 20/20; three evidence criteria were refined before calls; all originals retained in [completeness-review](completeness-review). Exact normalized body reuse was checked against nine older sets. These are not independent human labels.

A new AI output reviewer saw only frozen routing policy, semantic rubric and ten shuffled pseudonymized valid outputs with full inputs, expected decisions and minimum facts. It did not see example quotes, arms, call order, adapters, scores or map until initial grades were saved. Repeated text can reveal pairs and style may reveal a prompt; blinding is limited. All ten were graded supportive and reference-complete; no ambiguities flagged. The initial grades are preserved, not replaced by the implementer's judgments. The parent then validated fact-index accounting and unblinded mechanically.

[Items](completeness-output-items.json), [initial grades](completeness-output-grades.json), [review process](completeness-output-review-process.json), [unblinding map](completeness-output-map.json), [assembly record](completeness-output-assembly.json), [predeclared grading plan](completeness-grading-plan.json). [Raw report](completeness-comparison.json) preserves every attempt and every unattempted row; [derived metrics](completeness-semantic-comparison.json) retains all judgments and limitations.

## Every routing result

| Case | Group | Expected | Rules | Previous | Updated |
|---|---|---|---|---|---|
| v10-001 | multi_intent_scope | billing | billing | billing | billing |
| v10-002 | protective_scope | review | review | review | review |
| v10-003 | sensitive_scope | review | technical | review | review |
| v10-004 | multi_intent_scope | review | review | review | review |
| v10-005 | sensitive_scope | review | review | review | review |
| v10-006 | ordinary_evidence | technical | review | not_attempted_after_provider_http_429 | provider_http_429 |
| v10-007 | protective_scope | review | review | not_attempted_after_provider_http_429 | not_attempted_after_provider_http_429 |
| v10-008 | security_context | access | access | not_attempted_after_provider_http_429 | not_attempted_after_provider_http_429 |
| v10-009 | protective_scope | review | review | not_attempted_after_provider_http_429 | not_attempted_after_provider_http_429 |
| v10-010 | ordinary_evidence | billing | billing | not_attempted_after_provider_http_429 | not_attempted_after_provider_http_429 |
| v10-011 | security_context | review | access | not_attempted_after_provider_http_429 | not_attempted_after_provider_http_429 |
| v10-012 | ordinary_evidence | access | review | not_attempted_after_provider_http_429 | not_attempted_after_provider_http_429 |
| v10-013 | multi_intent_scope | review | billing | not_attempted_after_provider_http_429 | not_attempted_after_provider_http_429 |
| v10-014 | security_context | review | access | not_attempted_after_provider_http_429 | not_attempted_after_provider_http_429 |
| v10-015 | multi_intent_scope | review | technical | not_attempted_after_provider_http_429 | not_attempted_after_provider_http_429 |
| v10-016 | sensitive_scope | review | review | not_attempted_after_provider_http_429 | not_attempted_after_provider_http_429 |
| v10-017 | protective_scope | review | review | not_attempted_after_provider_http_429 | not_attempted_after_provider_http_429 |
| v10-018 | sensitive_scope | technical | review | not_attempted_after_provider_http_429 | not_attempted_after_provider_http_429 |
| v10-019 | security_context | review | access | not_attempted_after_provider_http_429 | not_attempted_after_provider_http_429 |
| v10-020 | ordinary_evidence | technical | review | not_attempted_after_provider_http_429 | not_attempted_after_provider_http_429 |

Rules miss ten frozen labels: v10-003,006,011,012,013,014,015,018,019,020. Rules miss required review on 003,011,013,014,015,019 and unnecessarily review 006,012,018,020. Only 003 was reached by both model arms; no credit is inferred for the others.

## All observed quotes

Both model routes match their reference in each row; all ten passed exact quote validation and blind AI support/coverage review.

| Case | Previous quote | Updated quote |
|---|---|---|
| v10-001 | Please cancel only my paid subscription. | Please cancel only my paid subscription. |
| v10-002 | This is just impossible; please sort it out. | This is just impossible; please sort it out. |
| v10-003 | The export stalls on my actual medication history, including my daily insulin dose. | The export stalls on my actual medication history, including my daily insulin dose. |
| v10-004 | Please reset my login PIN and refund last month's duplicate charge. | Please reset my login PIN and refund last month's duplicate charge. |
| v10-005 | My real overdue loan balance | My real overdue loan balance is on the statement |

## Usage, validation and limits

Previous five attempts recorded 6,496 prompt +137 candidate =6,633 total tokens. Updated five successful attempts recorded 8,026 +141 =8,167 tokens. Usage on the failed sixth updated attempt is unknown, not zero. Per-attempt latency and usage are preserved in raw/derived records; previous latencies 14,802,677,770,750,862ms; updated 1,110,912,791,1,098,770,180ms. These small unequal observations do not establish latency gains. Longer updated prompts are an execution confound.

All 90 software tests passed locally and in Node 22/24 GitHub validation before live calls. All ten frozen implementation hashes were verified against the uploaded source. Tests establish software behavior, not semantic improvement.

This small English synthetic, policy-directed, AI-authored and AI-reviewed partial study has correlated AI blind spots, no human adjudication, no real users and no production actions. Frozen minimum-fact sets can demand more context than the smallest sufficient trigger; semantic support is judged separately. Single-span feasibility was AI-assessed, not proven for all outputs. Discontiguous or longer evidence is outside the contract. No labels, criteria or prompts were tuned after results. All historical failures remain intact.
