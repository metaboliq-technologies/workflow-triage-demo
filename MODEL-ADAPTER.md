# Gemini adapter and fresh evaluation

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
