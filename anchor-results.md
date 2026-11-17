# Fact-anchor evidence evaluation v14

Fresh paired run: complete; 40/40 classifications, 46/80 provider attempts. No business actions executed. AI-authored and separately AI-reviewed; no human validation.

The targeted missing-witness case v14-013 improves: v12 quotes only invoice duplication, while v14 includes invoice duplication and the separate login failure. However, v14-016 has a final 503 after both attempts fail. Joint success is 19/20 for both arms: no observed all-case gain. Common-valid success improves 18/19 to 19/19, conditional on both arms responding; that does not erase the availability regression.

## All-case results

| Measure | v12 bounded selector | v14 fact anchors |
|---|---:|---:|
| Valid final outputs | 20/20 | 19/20 |
| Correct routing | 20/20 | 19/20 |
| Source-exact quotes | 20/20 | 19/20 |
| AI-rated decision support | 19/20 | 19/20 |
| AI-rated sufficient-bundle coverage | 19/20 | 19/20 |
| Joint correct routing, support and coverage | 19/20 | 19/20 |
| Criteria ambiguity flags | 0/20 | 0/20 |

Unchanged rules: **9/20 correct routing**, review recall 7/14, unnecessary review 4. Rules do not produce comparable quoted evidence; their routing score is not a joint evidence score. Invalid, failed and unattempted model outputs earn no all-case correctness credit, even when fallback says review.

Common-valid pairs: 19/20. Joint result 18/19 for v12 and 19/19 for v14.

## By predeclared group

| Group | Cases | v12 routing / joint | v14 routing / joint |
|---|---:|---:|---:|
| boundary_span | 6 | 6 / 5 | 5 / 5 |
| multi_intent | 6 | 6 / 6 | 6 / 6 |
| protective_controls | 4 | 4 / 4 | 4 / 4 |
| subject_context | 4 | 4 / 4 | 4 / 4 |

## Every model failure and review limitation

- **v14-016, v14 fact anchors:** provider_http_503. Unavailable; no semantic or correctness credit.
- **v14-013, v12 bounded selector:** valid final response. Routing true; support false; bundle coverage false; ambiguity false. Only invoice duplication is quoted; the separate login failure is absent. This quote does not establish multiple intents or another protective trigger. Quote: "Here is what I saw: Invoices duplicate.".

Residual selection roughness remains: v12 case v14-016 ends with an extra The after both complete symptoms; v14 case v14-003 ends My actual chemotherapy results are. The blind reviewer accepts both because their sufficient facts remain complete, but their endings are grammatically unfinished. Structural anchoring therefore does not guarantee polished evidence or prevent every trailing fragment. There were no observed valid-response routing/review misses, invalid anchors or length rejections in this run; the unavailable response cannot be classified or semantically graded.

## Provider failures, retries and usage

First-attempt routing: v12 17/20 (3 errors); v14 17/20 (3 errors). Final routing errors: v12 0, v14 1. 7 failed provider attempts are retained.

- v14-016, v14 fact anchors: first provider_http_503; recovered false; final provider_http_503. 
- v14-004, v12 bounded selector: first provider_http_503; recovered true; final valid output. Recovery is availability, not automatic correctness credit.
- v14-006, v14 fact anchors: first provider_timeout; recovered true; final valid output. Recovery is availability, not automatic correctness credit.
- v14-011, v12 bounded selector: first provider_timeout; recovered true; final valid output. Recovery is availability, not automatic correctness credit.
- v14-002, v12 bounded selector: first provider_http_503; recovered true; final valid output. Recovery is availability, not automatic correctness credit.
- v14-002, v14 fact anchors: first provider_timeout; recovered true; final valid output. Recovery is availability, not automatic correctness credit.
- Attempt 1, v14-016, v14 fact anchors: provider_http_503; HTTP 503; validation not reported; anchor failure not applicable; latency 971 ms.
- Attempt 2, v14-016, v14 fact anchors: provider_http_503; HTTP 503; validation not reported; anchor failure not applicable; latency 802 ms.
- Attempt 1, v14-004, v12 bounded selector: provider_http_503; HTTP 503; validation not reported; anchor failure not applicable; latency 1054 ms.
- Attempt 1, v14-006, v14 fact anchors: provider_timeout; HTTP not reported; validation not reported; anchor failure not applicable; latency 30000 ms.
- Attempt 1, v14-011, v12 bounded selector: provider_timeout; HTTP not reported; validation not reported; anchor failure not applicable; latency 30001 ms.
- Attempt 1, v14-002, v12 bounded selector: provider_http_503; HTTP 503; validation not reported; anchor failure not applicable; latency 1468 ms.
- Attempt 1, v14-002, v14 fact anchors: provider_timeout; HTTP not reported; validation not reported; anchor failure not applicable; latency 30000 ms.

Unattempted classifications: 0; in-flight uncertainty: null; stop reason: none.

Known total tokens: 96746 from 39 attempts; 7 attempts lack total usage. Unknown usage is not zero. No monetary cost estimate, billing upgrade, quota workaround, key/project change, extra probe or semantic retry was used.

| Arm | Attempts | Known total tokens | Attempts missing total usage |
|---|---:|---:|---:|
| v12 bounded selector | 23 | 44523 | 3 |
| v14 fact anchors | 23 | 52223 | 4 |

## Rules misses and guarded routing

| Case | Expected | Rules | Reason |
|---|---|---|---|
| v14-005 | access | review | no_supported_route |
| v14-015 | technical | review | no_supported_route |
| v14-020 | technical | review | no_supported_route |
| v14-004 | review | access | single_route_match |
| v14-017 | technical | review | sensitive_context |
| v14-010 | review | access | single_route_match |
| v14-001 | review | billing | single_route_match |
| v14-014 | review | billing | single_route_match |
| v14-013 | review | access | single_route_match |
| v14-003 | review | technical | single_route_match |
| v14-008 | review | billing | single_route_match |

| Model plus unchanged guard | Correct routing | Review recall | Unnecessary review |
|---|---:|---:|---:|
| guardedPrevious | 16/20 | 14/14 | 4 |
| guardedUpdated | 15/20 | 13/14 | 4 |

## Candidate coverage and incomplete selection

v12 remains unchanged. v14 replaces the sampled, capped menu with all source word/punctuation token endpoints. The model names one decisive fact, or exactly two nonoverlapping facts for multiple intents. Deterministic source slicing returns their smallest contiguous envelope. No quote is rewritten, stitched, trimmed or repaired. All six historical boundary witnesses are now representable in offline regressions; historical live results are unchanged.

| Case | Group | Observed witness units | v12 containing choices | v14 witness token-aligned |
|---|---|---:|---|---|
| v14-016 | boundary_span | 114 | s5 | true |
| v14-005 | multi_intent | 28 | s0, s2 | true |
| v14-019 | boundary_span | 116 | s8 | true |
| v14-015 | multi_intent | 30 | s0, s2, s3 | true |
| v14-007 | boundary_span | 115 | s4 | true |
| v14-020 | protective_controls | 31 | s0, s2, s3 | true |
| v14-018 | multi_intent | 57 | s0 | true |
| v14-004 | boundary_span | 114 | s0 | true |
| v14-017 | subject_context | 22 | s2 | true |
| v14-010 | boundary_span | 115 | s4 | true |
| v14-006 | subject_context | 32 | s1 | true |
| v14-009 | protective_controls | 26 | s0, s2 | true |
| v14-011 | subject_context | 28 | s1 | true |
| v14-001 | multi_intent | 44 | s0 | true |
| v14-014 | protective_controls | 14 | s0, s1 | true |
| v14-013 | boundary_span | 116 | none | true |
| v14-003 | protective_controls | 30 | s0 | true |
| v14-008 | multi_intent | 43 | s0 | true |
| v14-012 | multi_intent | 44 | s0 | true |
| v14-002 | subject_context | 40 | s4 | true |

Mechanical witness containment measures whether that pre-reviewed string is representable, not whether every sufficient alternative is absent or the model must select it. The structural fact contract cannot establish that two anchors are distinct intents, preserve all qualifiers, or semantically justify the chosen route. A narrow trailing-determiner check rejects some obvious incomplete endings; legitimate names/wording can be false positives. Whole-token boundaries omit intra-token slices; cross-field and discontiguous-only evidence cannot be stitched.

## Review provenance and prospective design changes

Implementation frozen at [dae5e02](https://github.com/metaboliq-technologies/workflow-triage-demo/commit/dae5e02ffa19c72c9d68b0f8d806c409940c586f) before authoring. Original author files and independent initial judgments sealed at [8048cb2](https://github.com/metaboliq-technologies/workflow-triage-demo/commit/8048cb2311e5d299e4aa54c5679d0f16f27edfae). Initial routing agreement 20/20; unresolved disagreements 0. All criteria/span changes are preserved in the reconciliation record.

The initial boundary framing was repetitive. A permitted second prospective round changed only six neutral prefixes/suffixes and placement, retaining every original draft, input, label and process record. Core paired symptoms and independently observed 114–116-unit witnesses remained unchanged. No provider outcome informed these revisions. Temporary whitespace-padded drafts were rejected and preserved; final cases use ordinary prose. These are deliberately constructed English cases, with repeated symptom/neutral-gap structure, not representative traffic.

Fresh-context author, initial label reviewer and output reviewer were separate AI agents. They read the written protocol, which itself disclosed conceptual token/fact representation; they were not blind to all algorithm concepts. They did not read actual implementation, candidate menus or historical outputs. The primary implementer knew historical failures and inspected fresh cases only after freeze. Final reference reconciliation was exposed to author labels and primary design feedback. Returned-evidence review used shuffled arm-blinded public outputs with reference facts; it hid original IDs/groups, exemplar/shortest quotes, anchors/reasons, code, prompts, arm/order and aggregate results. Repeated requests and output style can reveal pairing or suggest arms. Grades were saved and hashed before unblinding. Agreement does not establish independent human truth; shared model bias and missed alternatives remain possible.

Novelty audit against 442 prior requests: 0 exact body duplicates; 1 cases reuse a prior subject. Highest word-set Jaccard 0.75; semantic novelty and training exclusion are not established.

## Limits and reproducibility

This is one targeted 20-case paired run of Gemini 3.5 Flash Lite, compared with unchanged v12 and rules. Source representation, internal schema, prompt and validation change together; there is no isolated causal attribution or statistical significance claim. Synthetic English, AI-only labels and evidence review, intentionally near-limit cases, fixed provider model and time, and small sample constrain generalization. Live bodies are at most 500 units; full 2,000-unit input/provider schema complexity and multilingual behavior are unmeasured. Larger token enums can increase prompt/schema size. Optional context coverage is descriptive and separate from joint correctness; see semantic JSON. Guarded routing is separately retained and can add unnecessary review. No default application adapter was promoted and no customer actions were executed.

Live source commit: def1a310b6bf079a02990b7dd21c524c33015285. [Original workflow](https://github.com/metaboliq-technologies/workflow-triage-demo/actions/runs/44088433663); workflow conclusion failure. A nonzero conclusion may deliberately preserve failed first attempts even when all classifications finish. Raw checkpoints, individual attempts, diagnostics, references, initial/reconciled labels and blinded grades remain in the repository. Do not rerun the saved live workflow.

Offline audit: `node verify-anchor-evaluation.mjs`; contract suite: `npm test`. These make no provider calls. See [raw results](anchor-comparison.json), [semantic results](anchor-semantic-comparison.json), [diagnostics](anchor-run-diagnostics.json), [candidate audit](anchor-candidate-audit.json), [review reconciliation](anchor-review/review-resolutions.json), [sealed output review](anchor-output-review-process.json), and [frozen protocol](OUTPUT-REVIEW-RUBRIC-V14.md).
