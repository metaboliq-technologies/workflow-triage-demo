# Independent-input evaluation and failure diagnostics

First run on 16 November 2026 with Gemini 3.5 Flash Lite. Source inputs were authored by Bitext Innovations; METABOLIQ selected a deterministic sample and mapped its original intents to workflow expectations. This is independent input authorship, not independent semantic adjudication or a blind test.

| Measure | Rules | Gemini | Guarded Gemini |
| --- | ---: | ---: | ---: |
| Mapped-intent exact matches / 40 | 22 (55%) | 33 (82.5%) | 22 (55%) |
| Valid decisions / 40 | 40 | 40 | 40 |
| Correct proposals / proposals | 12/12 | 26/33 | 12/12 |
| Expected review cases caught / 10 | 10 | 7 | 10 |
| Unnecessary valid review decisions | 18 | 0 | 18 |
| Invalid outputs / provider errors | 0 | 0 | 0 |

Errors receive no correctness credit. All 40 cases remain in the denominator. The guarded approach preserves baseline abstentions and requires review on model disagreement.

Gemini agreed with more mapped intents, but it made seven mismatching route proposals, including three requests assigned to review. Its mapped-review recall was 7/10 (70%), versus 10/10 for both the rules and guarded approaches. Four mismatches concern signup problems: the fixed mapping treats them as access while the model chose technical. The other three concern account closure/cancellation: the conservative predeclared mapping requires review, while Gemini chose billing. This reflects policy-boundary disagreements and review misses under the stated mapping, not independently adjudicated ground truth.

The guarded approach did not improve on the baseline in this run. It proposed the same 12 routes and unnecessarily reviewed 18 routable cases. Zero invalid outputs here does not establish that the earlier validation failure was fixed; the case mix and live generation differ. The diagnostic implementation, rather than a success-rate improvement, is what the regression tests verify.

## Every model mismatch or failure

- **ext-006** (registration_problems): expected access; model technical. Guarded result: review.
- **ext-007** (registration_problems): expected access; model technical. Guarded result: review.
- **ext-008** (registration_problems): expected access; model technical. Guarded result: review.
- **ext-010** (registration_problems): expected access; model technical. Guarded result: review.
- **ext-032** (delete_account): expected review; model billing. Guarded result: review.
- **ext-034** (delete_account): expected review; model billing. Guarded result: review.
- **ext-035** (delete_account): expected review; model billing. Guarded result: review.

The pre-run audit already flagged ext-002 (“forgotten key”) as ambiguous: access follows the source intent, but review is defensible under the uncertainty policy. Do not treat disagreement on this case as an independently established semantic failure. Signup errors and payment errors also lie near routing-policy boundaries. All labels remain unchanged after prediction.

## What improved in diagnostics

Rejected decisions distinguish object shape, unsupported category, evidence type, quote length and evidence-not-in-input through fixed reason codes. Failures preserve sanitized stage, timing, known finish reason, bounded usage and attempt history. Raw rejected text, provider messages, headers and input text are omitted from diagnostics. Successes retain validated evidence as before.

CI passed all 31 tests on Node 22 and 24, with no skips in the inspected Node 22 run. Mocked tests explicitly exercised malformed output, invalid evidence, incomplete candidates, hostile metadata, retries, HTTP failures, timeouts, oversize responses and report propagation. No invalid/provider output was observed in this live run; the failure-diagnostic behavior is demonstrated by injected test cases rather than a live incident.

The earlier experiment’s rejected raw output was not retained, so this change cannot retrospectively identify its exact failure reason.

## Provenance and usage

- Frozen adapter/sample source: `d3664b3f6cceb9006569c736d3e06f3c4282ee50`.
- [Live workflow run](https://github.com/metaboliq-technologies/workflow-triage-demo/actions/runs/43869992285).
- Source-only import run: 43869071425; it made no model calls.
- Started 2026-11-16T12:49:22.825Z; completed 2026-11-16T12:58:34.480Z.
- Dataset SHA-256: `14c940cc189dac0228c402d5715014288b5f10354536ae6319139ce256d592ed`.
- Prompt SHA-256: `b7aca8fbf81483f9a71d638bbfef60f8c8b2348f8a219b81f531f8d25ed919df`; unchanged from the first model experiment.
- Bitext source revision: `72ea2203180d14a416b579c657033ecd21e59a11`; raw CSV SHA-256: `6f81102b0100b97b8468eb04368033a23206bf1fde9d53500d5806ec1001a434`.
- API attempts: **40**, including 0 retry records; maximum authorized by the runner was 80.
- Reported total tokens: **10531**, available for 40/40 attempts. Usage metadata was present for every attempt; it remains provider-reported usage, not a billing statement.
- Recorded attempt latency: median **894.5 ms**, nearest-rank p95 **1,420 ms**. This excludes the deliberate 13-second spacing and is not an end-to-end service guarantee.
- Business actions executed: **0**. Existing unbilled Free-tier project and secret reused; no billing changes.
- [Complete per-case result](independent-comparison.json). Publication adds a data-license notice; rows and metrics match the saved artifact.

## Limits and the next evaluation

The 40 inputs are public synthetic training examples and may have been seen during provider training. Selection used a fixed SHA-256 ranking, five cases from each of eight original intents, before model calls. The implementation author supplied the workflow mapping; its semantic correctness was not independently adjudicated. The slice contains 10 access, 20 billing and 10 review cases, with no technical, security, injection, sensitive-context or multi-intent coverage. It is not representative of customer traffic or evidence of production readiness.

The rules baseline and prompt were held fixed. Percentages across this and earlier sets cannot establish improvement or regression because the case mixes differ. The set is now seen; do not tune and reuse it as untouched evidence. A stronger next evaluation needs independently adjudicated workflow labels and unseen coverage of the missing strata, alongside repeated service-availability measurements.

## Data attribution and license

Original synthetic instructions and intent labels: Bitext Innovations, [pinned source](https://github.com/bitext/customer-support-llm-chatbot-training-dataset/tree/72ea2203180d14a416b579c657033ecd21e59a11). Selection, neutral subjects, IDs, mapping and provenance were added by METABOLIQ; original instruction bodies are unchanged. The enhanced dataset and source excerpts in the per-case report are **CDLA-Sharing-1.0**, with the complete text in [BITEXT-LICENSE.txt](BITEXT-LICENSE.txt). The repository’s source-code license does not restrict these data.
