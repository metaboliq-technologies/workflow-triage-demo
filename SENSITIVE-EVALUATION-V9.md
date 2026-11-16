# Sensitive context and fictional medical scope v9

The optional `createSensitiveGeminiAdapter` entry point appends explicit
sensitive-context scope to the historical v7 policy. Actual or plausibly real
health/financial disclosures override ordinary symptoms. Clearly fictional,
nonpersonal sample data alone does not; ordinary software intent is still
necessary, and other protective conditions retain precedence. Medical judgment
or advice and pure creative-writing requests remain unsupported. Mixed or
unclear real/fictional scope requires review. See ROUTING-POLICY-V9.md.

Historical adapters, prompts, rules, validators and v8 reliability handling
remain unchanged. The scoped transport bridge replaces only the known system
instruction. It does not transform request data or schema, repair output, or
turn semantic mistakes into retryable errors. The wrapper is explicitly
selected, rather than silently replacing historical consumers.

## Predeclared evaluation

- Freeze implementation before the implementer inspects fresh cases or labels.
- Forty fictional English requests: five each real_medical, real_financial,
  fictional_medical, fictional_financial, mixed_or_ambiguous, ordinary_controls,
  security_injection, closure_vague_controls. These are within-world distinctions;
  all evaluation content itself is synthetic, with no actual personal records.
- Separate fresh-context AI author and reviewer. Reviewer first labels only
  input text and policy, blind to author labels and assigned groups. Preserve
  originals, initial agreement, all disagreements and final reasons. No silent
  replacements. Unresolved labels block calls. AI review is not human review.
- Same Gemini 3.5 Flash Lite, quoted-v1 exact evidence, and unchanged rules.
  One model arm on 40 cases, at most two attempts each / 80 attempts overall.
  New sensitive policy is compared with rules; this is NOT a paired prior-prompt
  experiment and cannot establish causal policy gain over v7 or earlier sets.
- Preserve v8 bounded transport: 30s/attempt, 65s/classification including wait;
  only timeout/503/504 permit one retry; quota/auth/configuration and unhandled
  retry advice stop the batch; three consecutive final transient failures stop.
  6.5s spacing. No retries for valid wrong routes or invalid/blocked output.
- Report all40 denominators, first/final output views, rules and guarded views,
  every failure, every mismatch, review recall, unnecessary reviews, proposal
  coverage, all-attempt known/unknown usage and latency. No extra calls for guard.
- Workflow exits nonzero if any initial/final call failed or batch incomplete.
  Fallback review receives no correctness credit. No business actions.
- Labels and prompt are not tuned after results. Inspect exact quotes without
  claiming independently adjudicated semantic evidence support. Flag ambiguous
  labels; retain frozen primary scores without favorable relabelling.

## Limits

Policy-directed small synthetic samples and correlated AI labels do not establish
customer accuracy, production readiness, stable failure rates or comprehensive
injection resistance. "Fictional" is scoped context, not a trusted safety marker.
Review-label agreement is not ground truth. Prior sets differ; do not infer an
accuracy progress curve. The set becomes seen after assembly. No independent
human routing or evidence-support adjudication is claimed.

Timeout cancellation may not stop remote processing. Checkpoints are per
classification, not per attempt; interruption may leave up to two unrecorded
in-flight attempts. Missing usage is unknown, not zero. Do not blindly rerun.
The existing unbilled evaluation secret is used only inside the manual workflow;
no credentials are read, no access expanded and no billing changes are included.
