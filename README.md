# Workflow triage lab

The default Node adapter now checks [account-closure negation and clause scope](NEGATION-EVALUATION-V7.md) before activating protective closure review. The previous v6 prompt remains frozen and selectable. This is a prompt change; tests do not establish semantic improvement. The rules baseline is unchanged.

The completed [vague-request paired evaluation](vague-review-results.md) matched 38/40 cases with the updated v6 prompt, 35/40 with previous v4, and 28/40 with rules. All 80 planned calls were attempted once; the comparison includes one HTTP 503 and one evidence-length violation without correctness credit. V6 reviewed all five vague cases and routed all five terse-clear controls correctly. Both prompts unnecessarily reviewed a negated account-closure example. Labels were authored and separately reviewed by AI, not human-adjudicated; this small synthetic result does not establish production readiness. See [every decision and diagnostic](vague-review-comparison.json).


The optional [bounded-source evidence mode](EVIDENCE-CONTRACT-V5.md) selects request-local excerpt references instead of generating quote text. See the [fresh paired findings and every failure](evidence-contract-results.md) and [machine-readable results](evidence-contract-comparison.json). Labels were authored and separately reviewed by AI agents, not human-adjudicated. Quoted evidence remains the compatibility default; use `createGeminiAdapter({apiKey, evidenceMode: 'indexed-v1'})` to opt in. Exact extraction does not establish semantic support.

The default Node adapter now applies an [intent-sufficiency check before routing vague requests](VAGUE-EVALUATION-V6.md). The paired v6 comparison holds quoted evidence constant and uses a fresh AI-authored, separately AI-reviewed set. Software tests do not establish semantic improvement; see the experiment record for live status and limits. The earlier [signup/account-closure evaluation](REVIEWED-EVALUATION-V4.md) and historical prompts remain available at their frozen revisions.

The adapter now includes [sanitized failure diagnostics and an independently authored input evaluation protocol](DIAGNOSTICS.md). The Bitext-derived evaluation data has its own CDLA-Sharing-1.0 license; see [BITEXT-LICENSE.txt](BITEXT-LICENSE.txt). The source-code license does not restrict that data.

A small, offline engineering demo from [MetaboliQ](https://metaboliq.in): validate a support request, propose a route or abstain, and inspect the evidence before connecting anything to a business system.

**The browser lab is a rules baseline, not a production support agent.** Its offline path uses fictional requests and no external APIs, keys, dependencies, telemetry or customer integrations.

An optional **server-side Gemini adapter and a new 40-case comparison** are now implemented separately from the browser lab. See [MODEL-ADAPTER.md](MODEL-ADAPTER.md) for configuration, tests and live-run status. The original offline quick start and published 30-case results below are unchanged. The adapter requires authorized provider access; mocked tests are not live model measurements.

## Run it

Use Node.js 22 or newer. No dependency installation is required.

```sh
git clone https://github.com/metaboliq-technologies/workflow-triage-demo.git
cd workflow-triage-demo
npm test
npm run demo
npm run evaluate
npm start
```

Open **http://127.0.0.1:8787** for the interactive lab. Stop the local server with Ctrl+C. The server binds only to loopback and serves three allowlisted files. It does not accept uploads or persist requests. The page classifies text in your browser. Use synthetic text only; this is not a sensitive-data processing tool.

For the CLI, run `node cli.mjs sample-requests.json`. To use your own fictional batch, copy that file to `requests.local.json` and run `node cli.mjs requests.local.json`. IDs must be unique, with 1–40 letters, digits, underscores or hyphens. Subjects are required and limited to 140 characters; bodies to 2,000 characters. Batches contain 1–100 requests, at most 1 MiB of UTF-8 JSON. Invalid batches fail atomically with a nonzero exit status.

## What it demonstrates

```mermaid
flowchart LR
  A[Synthetic request] --> B[Validate schema and size]
  B --> C{Illustrative guard matched?}
  C -->|Yes| H[Human review]
  C -->|No| D{Exactly one category?}
  D -->|No| H
  D -->|Yes| E[Route proposal]
  E --> F[Inspect JSON and reason]
  H --> F
```

The supported categories are **access**, **billing** and **technical**. Each decision includes an ID, route, reason, review flag, matched categories and source. It omits the subject and body. No ticket is dispatched, message sent, account changed or payment initiated, regardless of `requiresHumanReview`.

The review flag means the baseline abstained. A false flag is not authorization to execute an action and is not a correctness guarantee. Known cases in the evaluation show why.

## Measured baseline results

Run `node evaluate.mjs` to regenerate the deterministic JSON report. The committed `evaluation-report.json` contains the same results. Six development cases illustrate basic behavior; 30 separate, hand-authored evaluation cases include ambiguity, unsupported language, normalization, negation and guard failures. This is a small synthetic diagnostic set, not a blind benchmark or evidence of customer performance.

| Evaluation metric | Observed result |
| --- | --- |
| Exact route and review match | 25 / 30 (83.3%) |
| Route proposals | 17 / 30 |
| Correct route proposals | 14 / 17 (82.4%) |
| Requests requiring review caught | 11 / 14 (78.6%) |
| External actions executed | 0 |

The five mismatches remain visible rather than being removed or patched away after evaluation:

| Case | Failure | Operational implication |
| --- | --- | --- |
| eval-23 | Access paraphrase is missed | Extra human review |
| eval-25 | Negated billing request is routed to billing | Wrong proposal |
| eval-26 | Quoted security term triggers the guard | Unnecessary escalation |
| eval-27 | Security paraphrase misses the guard | Review bypass in the proposal |
| eval-28 | Destructive intent coexists with a billing term | Review bypass in the proposal |

These results **do not support production automation**. The keyword guards are not complete security, prompt-injection or sensitive-data detectors. English vocabulary, indirect intent, Unicode obfuscation, quoting and context need further work. The test suite verifies software behavior and contracts; passing tests does not erase these policy failures.

## Testing the model boundary

The offline lab does not call or impersonate a model. `reconcileSuggestion` accepts a model-shaped object with exactly `category` and `evidence`. Evidence must be an exact quote from the input. Unknown categories, fabricated evidence, extra fields, ambiguity and model/baseline disagreement go to review. Evidence matching alone does not establish that a suggestion is semantically correct. The optional Node adapter wraps this contract in a separate guarded comparison arm.

```js
import {reconcileSuggestion} from './triage.mjs';

const request = {
  id: 'example-01',
  subject: 'Invoice copy',
  body: 'Please share the fictional invoice.'
};
console.log(reconcileSuggestion(request, {
  category: 'billing',
  evidence: 'invoice'
}));
```

The optional Gemini adapter includes explicit provider configuration, timeouts, bounded retries and a new diagnostic dataset. Running it requires an authorized data-flow and quota decision; see [MODEL-ADAPTER.md](MODEL-ADAPTER.md). Business actions still require a separate authorization boundary. No action executor is included.

## Repository map

| File | Purpose |
| --- | --- |
| triage.mjs | Input validation, baseline policy and model-output contract |
| cli.mjs | Bounded local JSON-file runner |
| index.html / app.mjs | Interactive local lab |
| serve.mjs | Loopback-only, allowlisted static server |
| sample-requests.json | Five fictional examples |
| fixtures.json | Development and evaluation cases with expected decisions |
| evaluate.mjs | Repeatable metrics and mismatch report |
| triage.test.mjs | Contract, input-boundary and CLI tests |

## Contributing and scope

Suggest a failure case with fictional input, the expected decision and a reason. Keep evaluation changes separate from policy changes so improvements can be assessed honestly. Do not submit production records, credentials or personal data in issues or pull requests.

This repository is separate from MetaboliQ's proprietary website and applications. No private application source or customer data is included. It has no Firebase or production deployment configuration. Publishing source here does not grant an open-source license; see `LICENSE`.

[How we work](https://metaboliq.in/how-we-work.html) · [Engineering journal](https://metaboliq.in/blog.html) · [Discuss a project](https://metaboliq.in/contact.html)
