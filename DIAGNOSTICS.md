# Failure diagnostics and externally authored evaluation

## Diagnostics contract

The prompt, categories, rules baseline, retry eligibility and output evidence constraints are unchanged. Error codes remain compatible. `ModelError.diagnostics` now distinguishes transport, HTTP, provider JSON, candidate, model JSON and decision-validation stages.

Decision validation adds one of six fixed reasons: `object_shape`, `unsupported_category`, `evidence_type`, `evidence_too_short`, `evidence_too_long`, or `evidence_not_in_request`. Only a bounded evidence length is retained, never the rejected quote or object.

Both failures and successes retain a maximum two-entry attempt log, bounded latency, HTTP status, known finish reason, candidate count and sanitized token counts. Responses rejected after decoding preserve available usage. Unavailable usage remains null; absence is not zero cost. Returned model identifiers outside a conservative Gemini identifier pattern are omitted. Arbitrary metadata fields, provider error bodies, headers, raw candidate text and input text are not copied into diagnostics.

The comparison report keeps the same fail-to-review behavior and gives errors no correctness credit. Diagnostics locate software-contract failures; they do not diagnose semantic mistakes. A schema-valid wrong route still needs evaluation against an expected decision.

Run `node --test` for transport, redaction, retry-history, validation-reason and report-propagation tests. These are mocked failure tests, not live service reliability measurements. The loopback test may skip in environments that cannot connect local sockets; CI runs it on Linux.

## Independent authorship and sampling

The new inputs are authored by **Bitext Innovations**, not by the adapter implementation author. `import-independent.py` downloads a pinned public synthetic training dataset and chooses five instructions from each of eight predeclared intents by a deterministic SHA-256 ranking. Selection uses no model output or baseline prediction. Instruction text is unchanged; the subject is the neutral `Support request`.

The implementation author maps original intents to the narrow workflow: recover_password and registration_problems to access; check_invoice, get_invoice, check_payment_methods and payment_issue to billing; delete_account and contact_human_agent to review. This yields 10 access, 20 billing and 10 review expectations. The workflow mapping is not independent human adjudication. Registration trouble is treated as an ordinary access problem; account deletion requires review, and an explicit request for a human remains review.

No technical-malfunction, security, multi-intent, sensitive-context or injection cases are covered by this slice. It is an independently authored input sample, **not** a newly commissioned blind benchmark, representative customer traffic or proof of generalization. Public training data may have appeared in provider training. Do not compare headline percentages directly with earlier datasets.

Pre-run label audit: `ext-002` says only “I am looking for information about a forgotten key.” Its original intent is recover_password, which the fixed mapping treats as access. The text itself is ambiguous, so a review decision is defensible under our uncertainty policy. Scores will measure agreement with the predeclared mapped source intents, not independently adjudicated semantic correctness. Keep this case and the original mapping visible rather than repairing its label after prediction. Signup errors may also sit near the access/technical boundary; payment errors are mapped to billing by their original intent. These interpretation limits must accompany the results.

The source revision, raw-file hash, CSV line, instruction hash, original intent, ranking seed and mapped expectation are recorded in `independent-evaluation.json`. Freeze this file and diagnostics implementation before any model call. Do not adjust labels or select different cases after inspecting predictions. The first live run will be retained even if it fails.

## Data license

Original source: [Bitext customer support dataset](https://github.com/bitext/customer-support-llm-chatbot-training-dataset/tree/72ea2203180d14a416b579c657033ecd21e59a11). The selected data and its added mapping/provenance are **CDLA-Sharing-1.0**, with the complete original license in [BITEXT-LICENSE.txt](BITEXT-LICENSE.txt). The repository's source-code license does not impose restrictions on this data. The dataset carries a prominent attribution and modification notice. Instructions are synthetic and public; no customer records or credentials are included.

## Run protocol

The manual `Independent synthetic evaluation` workflow has separate `import` and `live` modes. Import makes no model calls and prints the selected data for review and commit. Live consumes only the committed sample, records its hash and source revision, runs the baseline and model, and always retains and prints the complete fictional-case comparison. It uses the existing secret, Gemini 3.5 Flash Lite, 13-second spacing and at most 80 attempts for 40 cases. No billing change or recurring job is involved.

First live measurement: [complete results and limitations](independent-results.md), with [all per-case decisions and attempt metadata](independent-comparison.json). Gemini matched 33/40 mapped intents; rules and guarded Gemini each matched 22/40. All 40 responses passed output validation, but Gemini missed three mapped review cases and chose technical over access on four signup requests. These results do not independently adjudicate workflow labels or prove production readiness. The run made 40 attempts with no retries. All 31 tests passed in Linux CI before the live run. The first result was retained without rerunning or relabeling.
