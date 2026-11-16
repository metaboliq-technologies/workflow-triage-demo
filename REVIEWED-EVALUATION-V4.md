# Clarified policy and independently AI-reviewed unseen evaluation

## Routing boundaries

[ROUTING-POLICY-V4.md](ROUTING-POLICY-V4.md) defines signup/authentication failures as access, payment-specific faults and clear subscription-only cancellation as billing, and other ordinary application failures as technical. Account/workspace closure or deletion, and account cancellation/deactivation with unclear scope, require review. Protective security, sensitive-context, injection and multiple-intent conditions take precedence. Benign quoted context is interpreted by actual intent.

The Node adapter now defaults to `clarified-v4`. The previous prompt remains available only by the fixed `legacy-v3` version; arbitrary caller-supplied system text is not accepted. Historical `compare.mjs` commands explicitly retain that legacy prompt so their recorded results remain reproducible on pinned sources. The rules baseline, output validation and guarded reconciliation are unchanged. A clarified prompt is not a guarantee that every model output follows the policy; test results must establish the observed behavior.

## Independent AI author and reviewer

The user approved separate AI case-author and reviewer agents. Each used a fresh context containing the written policy, without the adapter code, prior fixtures or prior provider results. The author wrote 40 new fictional inputs and proposed labels in separate files. The reviewer labeled the inputs before seeing the proposed labels, saved the initial labels, then compared them. They initially agreed on **40/40** with no unresolved disagreements or replacements. This is separate-context **AI review**, not human adjudication. Shared model training/architecture can create correlated blind spots; agreement is not proof of ground truth.

The set has five cases each for signup, account closure, ordinary access, billing, technical faults, security, injection and contextual interpretation. It contains 22 routable and 18 review expectations. The original author and reviewer artifacts are preserved in [review-evidence/](review-evidence/). [review-manifest.json](review-manifest.json) binds their hashes, the final dataset and the policy. Structural tests verify every label against both original label files and reject exact body reuse from all three older sets.

The implementation author did not open case/label content until after freezing the adapter, paired runner, policy and unchanged rules source. [implementation-freeze.json](implementation-freeze.json) records that process and file hashes. This is an operational separation of implementation from held-out cases, not a claim about what the provider has encountered in training. No prompt tuning or relabeling is allowed after the first provider call; this set becomes seen after testing.

## Paired first-run protocol

The manual `Reviewed routing policy evaluation` workflow runs software tests, verifies dataset/policy/review/freeze hashes, and compares the old and clarified prompts on the **same 40 inputs** with Gemini 3.5 Flash Lite. Request order alternates by case, each call is isolated, and only ID, subject and body reach Google. Labels, strata, rationales and review artifacts never enter requests.

There are at most **80 API attempts**, one per arm per case, with retries disabled and 6.5 seconds between invocations. Check free-project daily quota and the selected model's requests-per-minute limit before running. Existing unbilled project and repository secret are reused; no billing upgrade or recurring schedule is involved. Both arms use the same transport limits and model alias. Record alias/version and time; generation is not deterministic and a single paired run does not measure reliability.

The report compares rules, legacy model, clarified model and clarified model reconciled with the existing rules. It separately records exact decisions, proposal precision, expected-review recall, unnecessary review and output/provider availability. Failures get no correctness credit. A checkpoint is written before calls and after each result; interrupted runs retain status and all 40 denominators. Any authentication failure stops both arms. No business actions are executed.

The workflow always retains and prints the saved fictional-case report, including failures, without making additional model calls for retrieval. New routing-boundary tests are meaningful transport/provenance/budget tests; they do not mock a correct semantic answer and call it measured accuracy.

## Current status

Implementation and review are frozen. No live predictions on this set have been recorded yet. Publish the first paired result and all mismatches after validating the report. The earlier 30-case, hand-authored 40-case and Bitext-derived 40-case reports remain historical evidence on their own revisions and are not directly comparable across changed case mixes.
