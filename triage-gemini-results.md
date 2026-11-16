# First live Gemini comparison

Run on 16 November 2026 using `gemini-3.5-flash-lite`, with the unchanged rules baseline and 40 newly authored fictional requests.

| Measure | Rules | Gemini | Guarded Gemini |
| --- | ---: | ---: | ---: |
| Exact decisions / 40 | 20 (50%) | 38 (95%) | 29 (72.5%) |
| Valid decisions / 40 | 40 | 39 | 39 |
| Correct route proposals / proposals | 8/17 | 18/19 | 8/8 |
| Expected review cases caught / 21 | 12 | 20 | 21 |
| Unnecessary review decisions | 11 | 0 | 10 |
| Invalid/provider outputs | 0 | 1 | 1 |

Failures receive no correctness credit. The workflow deliberately exited with failure because one output was invalid, while successfully retaining all 40 rows.

## What failed

- **v2-009:** the locked-out-user paraphrase produced `invalid_model_decision`. The adapter rejected it and required review. Raw rejected output was intentionally not retained, so the specific schema/evidence violation cannot be diagnosed from this report.
- **v2-023:** a vague unsupported request was proposed as technical support. Expected behavior was review. The existing rules abstention prevented this incorrect proposal in the guarded arm.
- The guarded arm retained baseline abstentions, preventing recovery of many ordinary paraphrases. It made only eight proposals, all correct in this small set, and unnecessarily reviewed ten routable requests. The invalid output is reported separately from those ten review decisions.

## Provenance and operating limits

- [Implementation PR #1](https://github.com/metaboliq-technologies/workflow-triage-demo/pull/1), merged before model access.
- Frozen source: `3ef1f280a24daca6505e5d64c5b8d3bddd01aec1`.
- Dataset SHA-256: `2818c93f6f8ed00635872a2b0e978a7858aa4d5ec5112b33f9c32b52ed09b533`.
- Prompt SHA-256: `b7aca8fbf81483f9a71d638bbfef60f8c8b2348f8a219b81f531f8d25ed919df`.
- Started: 2026-11-16T11:54:11.090Z; completed: 2026-11-16T12:03:57.715Z.
- Requested and returned model: `gemini-3.5-flash-lite`.
- **40 API attempts**, one per case, no retries. Zero business actions executed.
- Successful validated responses reported 10,546 total tokens. The rejected response's usage was not retained; this figure is not the complete billed/request usage.
- Latency for the 39 validated responses: median 1,007 ms; nearest-rank p95 7,705 ms. This excludes the rejected response and the 13-second spacing between requests.
- A dedicated unbilled Free-tier project was used. No billing upgrade was performed. The key remains an Actions secret and is absent from the browser demo and report.
- [Original run and artifact](https://github.com/metaboliq-technologies/workflow-triage-demo/actions/runs/43861730495). A separate read-only inspection workflow printed the same saved artifact without additional model calls.
- [Full per-case report](triage-gemini-comparison.json).

## Interpretation

Gemini interpreted more paraphrases and review triggers correctly on this set. The guarded version improved review recall and proposal precision at the cost of routing coverage. These are observations from one run on a small, deliberately diagnostic set authored by the implementation author. It is not blind or representative of customer traffic, and these figures do not establish production readiness.

The prompt and labels were frozen before the first call, and labels were not sent to Google. The set is now seen: future prompt/model selection should use a separate evaluation set. The original published 30-case rules evaluation remains historical evidence on its original revision and is not directly comparable to this changed case mix. No rerun or policy tuning was used to improve these first-run figures.

