# Gemini adapter and fresh evaluation

The [29-classification completeness continuation](completeness-continuation-results.md) is complete: 29/29 final routing matches using31 attempts, with two retained HTTP503 failures recovered on one retry each. Across both windows: previous20/20, updated19/20 (original429 unchanged), rules10/20;42/80 attempts total. On19 common-valid pairs both prompts route19/19: no observed routing gain. Blind AI evidence support is18/19 versus19/19; frozen-fact coverage15/19 versus18/19, with over-demanding criteria flagged on two of the three updated-only coverage differences. Both prompts miss fuller reference coverage on016 while supporting review. The recovered previous013 response has a correct route but unsupported generic-subject evidence. Original outputs/grades remain unchanged; AI review is not human adjudication and the later/slower continuation is not a fresh single-window evaluation. See [every attempt](completeness-continuation-comparison.json) and [semantic findings](completeness-continuation-semantic-comparison.json).

An optional [decisive-evidence selection adapter](COMPLETENESS-EVALUATION-V10.md) preserves the v9 routing policy and one exact-quote contract while asking for the context that actually supports a decision. The paired v10 study holds routing/validation/transport fixed and separately reviews semantic evidence quality with blinded AI output review. The [paired evidence-completeness evaluation](completeness-results.md) is **partial**: HTTP 429 stopped call 11 after five valid pairs, using 11/80 permitted attempts. Both prompts matched all five observed routes and received 5/5 blind AI support and reference-fact coverage judgments: **no observed gain**. Each earns 5/20 all-case credit, with unavailable/unattempted outputs uncredited; rules match 10/20 overall and 4/5 on common-valid cases. One updated call failed; 29 planned classifications remain unattempted. No security cases or ordinary-evidence controls were reached. AI labels and semantic judgments are not human adjudication or production-readiness evidence. See [every call](completeness-comparison.json) and [sealed grades and derived metrics](completeness-semantic-comparison.json).


The separate [twelve-case continuation](sensitive-continuation-results.md) is **complete**: 12/12 classifications, 12/24 continuation attempts, 40/80 cumulative attempts including the original 28. Continuation model matches 12/12 versus rules 5/12 and guard 7/12. The [combined cross-window view](sensitive-combined-comparison.json) retains all original attempted rows and failures: model 37/40, rules 22/40, guard 28/40. Original invalid quote, HTTP 429 and migraine review miss are preserved. Different time windows and 30s versus 6.5s spacing prevent a single-run or causal policy-gain interpretation. Cases and labels are unchanged AI-authored/AI-reviewed, not newly unseen or human-adjudicated. See [all continuation attempts](sensitive-continuation-comparison.json); the original partial report and raw record remain unchanged.


The **partial** [sensitive-context and fictional medical evaluation](sensitive-context-results.md) stopped at HTTP 429 after 28/40 classifications using 28/80 permitted attempts. Twelve cases remain unattempted. One earlier quote was invalid; one valid output missed required review on an actual migraine-medication reminder. Final model exact matches 25/40; rules 22/40; guarded 21/40, retaining failures and unattempted without credit. On the 26 model-valid cases: model 25, rules 16, guard 21; this excludes 14 cases and is not full-set performance. Four observed fictional-medical cases routed correctly; the fifth was unattempted. Valid required-review decisions 14/23; unnecessary reviews 0. See [every attempt and diagnostic](sensitive-context-comparison.json). Labels were separately blind AI-reviewed, not human-adjudicated. This single updated-model versus rules experiment has no paired previous-prompt control and does not establish causal policy gain, stable reliability or production readiness.


An optional [sensitive-context scope adapter](SENSITIVE-EVALUATION-V9.md) now distinguishes real or plausibly real health/financial disclosures from explicitly fictional nonpersonal data. Mixed or unclear scope retains review. Use createSensitiveGeminiAdapter from sensitive-adapter.mjs explicitly; historical adapters and rules remain unchanged. Software tests do not establish semantic gains.


The completed [bounded reliability and negation evaluation](reliability-negation-results.md) used 41/80 allowed attempts for 40 fresh cases. One HTTP 503 retry recovered a valid but incorrect route under the frozen label: availability rose from 39/40 to 40/40 while exact matches stayed 38/40. Rules matched 29/40; guarded final matched 33/40. All 15 negated ordinary requests matched, but two required-review labels were missed; the fictional-medical-context label is explicitly debatable. No first attempt exceeded the old 15-second deadline. This is not an independent legacy-timeout comparison or a measured semantic gain. Labels were AI-authored and separately AI-reviewed, not human-adjudicated. See [every attempt and diagnostic](reliability-negation-comparison.json).


Optional bounded transport: import `createReliableGeminiAdapter` from `./reliable-adapter.mjs`. See [the v8 design and limits](RELIABILITY-EVALUATION-V8.md). It holds the v7 prompt and evidence contract fixed, with at most two attempts, 30 seconds each and 65 seconds total. Invalid output and quota/auth errors are not retried. The historical adapter remains unchanged.

The [fresh account-closure negation comparison](negated-closure-results.md) found **no observed routing gain**: updated v7 matched 36/40, previous v6 38/40, rules 26/40 and guarded v7 29/40. Both prompts made identical correct decisions on all 35 common-valid cases. V7 had two timeouts and two HTTP 503 failures; v6 had one rejected exact quote and one unnecessary review. The v7 call on that remaining review-error case failed, so its correction is unmeasured. All 80 planned calls were attempted once without retries; every failure stays without correctness credit. Labels were AI-authored and separately AI-reviewed, not human-adjudicated. See [every result and diagnostic](negated-closure-comparison.json).


Current default: `closure-negation-v7`, with quoted evidence. See [the negation comparison plan](NEGATION-EVALUATION-V7.md) and [written v7 policy](ROUTING-POLICY-V7.md). The previous `intent-sufficiency-v6` prompt is unchanged and explicit. See [the vague-request experiment and limits](VAGUE-EVALUATION-V6.md) and [written routing policy](ROUTING-POLICY-V6.md). Explicit `clarified-v4` and `legacy-v3` policies remain unchanged. Historical comparisons and reports below use their frozen source revisions; do not rerun an old freeze against the current root adapter.

For the subsequent diagnostics implementation and externally authored sample, see [DIAGNOSTICS.md](DIAGNOSTICS.md). The first live results below remain historical evidence on their recorded revision.

The optional Node.js adapter calls the Gemini Developer API. It is not imported into the public browser lab. The browser lab and original rules evaluation remain offline and unchanged.

## Run status

The first live comparison ran on 16 November 2026 with `gemini-3.5-flash-lite`: rules matched 20/40 decisions, Gemini 38/40, and guarded Gemini 29/40. One invalid model output was rejected, so the workflow deliberately exited with failure and retained the complete report. All 22 automated tests passed before the live run. See [results, failures and limitations](triage-gemini-results.md) and the [full per-case report](triage-gemini-comparison.json). The key is an Actions secret in a separate unbilled evaluation project; the public browser lab remains offline.

## The new set

`fresh-evaluation.json` contains 40 new fictional requests, with no exact input reuse from the original set. It covers ordinary requests, paraphrases, multiple intents, negation, security, sensitive context, destructive requests, instruction-like content, benign quotations and an unsupported language.

The expected decisions define a narrow, English-language workflow. The set is hand-authored by the implementation author and is deliberately diagnostic. It is neither a blind test nor a sample of customer traffic. Comparing its overall score to the original 30-case score would confound policy quality with a changed case mix.

Freeze the dataset and prompt in a commit before the first model call. The runner records their SHA-256 hashes and the source commit when run in GitHub Actions. The model receives only the request ID, subject and body—never the stratum or expected decision. After the first run, treat this set as seen; do not tune on it and call it untouched.

The unchanged rules baseline matches **20/40** decisions on this diagnostic set. It makes 17 route proposals, 8 correct, and catches 12 of the 21 expected review cases. Eleven ordinary requests are unnecessarily sent for review. These figures describe this case mix only.

## Three comparison arms

1. **baseline:** unchanged rules policy.
2. **model:** Gemini's validated category, including an explicit review option.
3. **guarded:** model suggestions reconciled with the existing baseline contract. Baseline abstentions cannot be overridden; disagreements and model review requests require review.

This distinction matters: the guarded arm cannot recover a routable paraphrase when the baseline abstains. It can trade proposal coverage for additional review. Report exact match, proposal precision, review recall, unnecessary review and provider availability separately.

Provider failures and invalid model output fall back to review operationally, but receive no credit as correct classifications. The report exposes error counts; a run with errors exits nonzero. There is no action executor in any arm.

## Running

Use Node.js 22 or newer. No package installation is needed.

```sh
npm test
npm run compare:baseline
```

For a live run, provide `GEMINI_API_KEY` through a local secret mechanism or a repository Actions secret. Do not put it in source, a browser form in the demo, a report or a command-line argument. Set `MBQ_ALLOW_SYNTHETIC_MODEL_RUN=yes` to acknowledge sending the bundled fictional requests to Google. `GEMINI_MODEL` selects the model; the default is `gemini-3.8-flash` and can be changed to an available structured-output model before the frozen run.

```sh
npm run compare:live
```

The runner writes `comparison.local.json` (ignored by Git). A manual GitHub Actions workflow can upload it as an artifact. Review the artifact before publishing it; it includes synthetic quoted evidence, decision details and provider metadata, but never intentionally includes the key or full provider error body.

## Limits and provenance

The adapter uses a fixed HTTPS provider endpoint, header authentication, a 15-second timeout, at most two attempts and at most 1,024 output tokens per attempt. Only 429 and 503 responses retry, after a bounded delay; timeouts and ambiguous network failures do not retry. It accepts only complete, single-candidate JSON responses up to 64 KiB, with a supported category and an exact evidence quote.

Forty cases produce at most 80 API attempts. This bounds requests, not currency. Provider billing and quota must be checked separately before a run. No billing upgrade is part of this implementation. The temperature setting is sent as zero; current provider documentation says newer Flash models may ignore it. Live generation is not claimed deterministic.

Returned model version, token counts when available, attempts, latency, prompt hash and dataset hash are retained per run. Usage metadata from successful responses does not establish the cost of failed requests. A quoted substring is not proof of correct intent, and a schema-valid answer can still be wrong.

## Primary API documentation

- [Gemini content generation](https://aistudio.google.com/api-reference/generate-content)
- [Structured output](https://aistudio.google.com/docs/structured-output)
- [Rate limits](https://aistudio.google.com/docs/rate-limits)

The live comparison should report all cases and failures, not just examples that improve on the baseline. A small synthetic result is evidence for the next experiment, not production readiness.

## Sufficient-evidence v11 candidate

`createSufficientAdapter` in `sufficient-adapter.mjs` adds a single-sufficient-trigger clarification to the explicit v10 adapter. Routing policy, one exact 4–120 UTF-16 quote, Gemini model and bounded-v8 retries stay fixed. It remains an experimental explicit adapter, not an established improvement. The [v11 results](sufficient-results.md) preserve all 40 attempted classifications, three final failures, unsupported generic-subject evidence and the reference-criteria miss. No historical results were replaced.

## Bounded selection v12 candidate

`createSelectionAdapter` in `selection-adapter.mjs` retains the public category/evidence schema but uses an internal bounded source-span ID selection format. `selection-options.mjs` generates exact 4–120 UTF-16 spans and excludes recognized generic headings while preserving meaningful subjects. Invalid IDs fail closed; no quote repair or formatting retry. The current v11 adapter and all historical source remain unchanged. See [v12 results](selection-results.md) for the one observed injection-review difference, five recovered 503 attempts, no demonstrated reduction of the original target failures and AI-only limits. This explicit experimental adapter is not made the default.

## Focused challenge findings; adapters unchanged

[Challenge v13](challenge-results.md) and [separate v13b follow-up](boundary-results.md) compare the same explicit v11/v12 adapters without tuning. The main set favors v12, but the stronger six-case follow-up regresses joint routing/support/coverage from4/6 to2/6. Missing candidate spans, a truncated selected object and a generic heading can yield valid bounded evidence that is semantically incomplete. Format bounds alone are not sufficient. Historical records/defaults stay intact; this remains experimental and AI-reviewed.

## Fact-anchor v14 candidate

`createAnchoredAdapter` in `anchor-adapter.mjs` is an explicit experimental adapter using the unchanged v10/v11 routing policy. Its default model is Gemini 3.5 Flash Lite; the v14 study fixes this model in both arms. Public output remains category/evidence with one unchanged 4–120 UTF16-unit source quote. Internally it selects token endpoints for one sufficient fact or exactly two nonoverlapping facts for multiple intents; deterministic extraction returns the smallest enclosing span. All original word/punctuation tokens are available, without the old sampled-window/64-option cap. Generic subjects remain visible and require semantic judgment.

Reason/category agreement, fact count, token identity/order, same-field selection, nonoverlap, per-fact/envelope length and a narrow trailing-determiner check fail closed. Self-reported unavailable is an error, with no correctness credit. Fixed-enum anchor diagnostics preserve failure categories without raw invalid model text or credentials. These structural checks do not prove facts are distinct, complete or semantically sufficient. The English cut heuristic can reject legitimate wording; intra-token, cross-field and discontiguous-only evidence are not repaired.

The explicit adapter uses inherited bounded-v8 retries: 30-second attempt limit, 65-second total deadline, at most two attempts for timeout/503/504 only, bounded jitter/Retry-After and no quota or semantic/format retry. The full source-token schema can grow with input length; the live study bodies are at most 500 units, not a full 2,000-unit provider/schema stress test. Defaults and historical adapters stay unchanged.

[Fresh v14 results, every failure and limitations](anchor-results.md). Audit saved outcomes offline with `node verify-anchor-evaluation.mjs`; do not rerun the saved live workflow or regenerate its plan.
