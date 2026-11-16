# Evidence contract reliability experiment v5

The routing policy is unchanged clarified-v4. `createGeminiAdapter` adds an explicit
`evidenceMode: 'indexed-v1'` option; the default remains `quoted-v1` for historical
compatibility. No promotion decision is made from this small experiment alone.

Indexed mode partitions each input field into consecutive exact excerpts of at
most 99 UTF-16 code units (96 normally, with up to three remaining units appended).
Surrogate pairs are not split. Fields shorter than four units provide no excerpt.
Each request gets local e0, e1, ... references. The model receives the original
subject/body plus these untrusted excerpts and returns category/evidenceId using
a request-specific enum. The adapter verifies shape, reference membership and
category, resolves the ID locally, and applies the existing 4–120-unit exact-quote
contract. It never trims, normalizes, repairs or truncates generated quotes.

Both modes now reject evidence spanning the synthetic subject/body newline; a
quote must belong to one original field. Quoted mode otherwise retains the old
prompt and schema. Indexed mode replaces the evidence-output instruction, adds
options and changes the schema. Therefore this compares two integration designs,
not a claim about one isolated prompt sentence.

The enum prevents nonexistent references only if the provider obeys it; local
validation remains mandatory. A valid reference proves exact extraction, not that
the excerpt supports the selected category, contains all relevant context, or is
minimal. Fixed windows may cut a meaningful clause and can contain hostile text.
The complete request still enters the semantic classifier as untrusted data.
The extra options increase input size. Entirely sub-four-unit fields fail closed
before any provider call instead of fabricating evidence. No raw rejected text is
logged. Success records retain the resolved quote and source field/offsets.

## Predeclared evaluation

Freeze implementation before the implementer opens the fresh inputs or labels.
Use 40 new fictional cases, five per eight policy strata, authored by one AI agent
and independently labeled by a separate fresh-context AI reviewer before that
reviewer sees proposed author labels. Save original labels and every disagreement
and resolution. This is AI review, not human adjudication; shared blind spots
remain possible. Exact non-reuse checks do not prove conceptual novelty.

Evaluate unchanged rules, clarified-v4 quoted mode, clarified-v4 indexed mode and
rules-guarded indexed results on this same set. Alternate call order, use Gemini
3.5 Flash Lite, one attempt per call, 6.5-second spacing, at most 80 calls, no
retries, no billing upgrade and no business actions. Use the existing repository
secret without reading or exposing it. Stop on authentication failure. Retain
checkpoints on all failures; intentional nonzero exit records provider/contract
errors even when all planned calls completed.

Report all-40 exact matches, output availability, evidence-contract failures,
provider failures, proposal precision/coverage, expected-review misses,
unnecessary review, common-valid paired differences, usage/latency with missing
usage unknown, all per-case failures and review uncertainty. No post-run tuning
or repeat evaluation will be described as untouched evidence. A single small
synthetic run cannot establish production readiness or injection resistance.

Historical v4 source remains pinned to commit
867359c65bebac5b5ab1542d3c1e994f907df6d3. Its adapter is preserved in frozen-v4;
the historical live workflow should be run only at that pinned revision, since
its root implementation freeze intentionally rejects subsequent adapter changes.
