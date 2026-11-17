# Blind semantic evidence review, v10

Review only the supplied blinded items and ROUTING-POLICY-V10.md. Do not inspect
unblinding map, source adapters/prompts, run records, scores, case author/reviewer
files or any other result files until the initial output grades are saved.

Each item supplies request subject/body, frozen reference decision, frozen minimum
facts, returned category and exact quote. The example quote is intentionally not
supplied: it is a feasibility example, never a whitelist. Items are independently
shuffled and pseudonymized; no policy arm or call order is supplied. Repeated text
may reveal paired items but not the arm. Do not prefer length or wording style.

Score two separate judgments using only frozen policy and full request:

1. evidenceSupportsReturnedDecision: does the quote, with the request's actual
   scope and policy precedence, substantiate the returned category/review? Generic
   ordinary symptoms do not support an ordinary route when a protective condition
   overrides it. An attack word in a benign quote alone does not justify review.
2. referenceFactsCovered: does the quote itself convey every frozen minimum fact
   necessary to explain the reference decision? Do not count a decisive fact merely
   because it occurs elsewhere in the full request. A pronoun such as "there" that
   omits the unfamiliar page/relationship is not a complete statement of that fact.
   Semantic equivalents count; exact example matching is neither required nor scored.

Use zero-based fact indices. coveredFacts and missingFacts must partition every
minimum-fact index exactly once. referenceFactsCovered is true iff none are missing.
Routing match is computed separately; a wrong category can quote a complete true
reference trigger. Do not force those component scores to agree. Give concise
reasons for both judgments and flag any disputed reference/criteria interpretation
as referenceAmbiguity (null or explanation). Do not change a reference label or
minimum facts after seeing an output. Ambiguities remain in the primary score and
are reported; AI judgment is not ground truth or human adjudication.

Case criteria can demand scope beyond the smallest sufficient protective trigger.
Support for the returned decision must be judged separately: do not mark it false
solely because a case-specific reference fact is missing. Flag criteria that seem
over-demanding or ambiguous. Reference-fact coverage measures the frozen fact set,
not proof that it is the uniquely minimal explanation of a policy decision.

Save initial grades as an array of {itemId,evidenceSupportsReturnedDecision,
referenceFactsCovered,coveredFacts,missingFacts,rationale,referenceAmbiguity}.
Save a process record with input hash, rubric/policy hashes, time, initially blind
status and files consulted. Do not unblind until grades are sealed. Invalid or
unavailable outputs are not sent for semantic judgment and earn zero credit in
all-case denominators; do not invent quotes or semantic grades for them.
