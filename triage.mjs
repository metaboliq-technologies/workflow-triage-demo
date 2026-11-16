/** Offline baseline; proposes routes, never performs business actions. */
export const CATEGORIES = Object.freeze(['access', 'billing', 'technical']);
const MAX_BATCH = 100;
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function validateRequest(request) {
  if (!isRecord(request)) throw new TypeError('Each request must be an object.');
  if (Object.keys(request).some(key => !['id', 'subject', 'body'].includes(key))) {
    throw new TypeError('Only id, subject and body are accepted.');
  }
  if (typeof request.id !== 'string' || !/^[A-Za-z0-9_-]{1,40}$/.test(request.id)) {
    throw new TypeError('id must contain 1–40 ASCII letters, digits, underscores or hyphens.');
  }
  for (const [key, maximum] of [['subject', 140], ['body', 2000]]) {
    if (typeof request[key] !== 'string' || request[key].trim().length === 0 || request[key].length > maximum) {
      throw new TypeError(`${key} must be nonempty text of at most ${maximum} characters.`);
    }
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(request[key])) {
      throw new TypeError(`${key} contains unsupported control characters.`);
    }
  }
}

export function validateBatch(requests) {
  if (!Array.isArray(requests) || requests.length < 1 || requests.length > MAX_BATCH) {
    throw new TypeError(`Supply an array of 1–${MAX_BATCH} requests.`);
  }
  const ids = new Set();
  for (const request of requests) {
    validateRequest(request);
    if (ids.has(request.id)) throw new TypeError('Request IDs must be unique.');
    ids.add(request.id);
  }
}

// Distinct term groups, not probabilities or calibrated model confidence.
const TERMS = Object.freeze({
  access: [/\b(?:login|log in|sign in|password|account locked|reset access|2fa|mfa)\b/iu],
  billing: [/\b(?:invoice|billing|refund|charged|payment|receipt|subscription)\b/iu],
  technical: [/\b(?:crash|crashes|timeout|bug|error|not loading|broken|api|export)\b/iu],
});

// Illustrative guards, not a complete security or sensitive-data detector.
const GUARDS = [
  ['security_signal', /\b(?:hacked|breach|stolen|leaked|unauthorized|unauthorised|compromised|phishing)\b/iu],
  ['sensitive_context', /\b(?:medical|patient|diagnosis|credit card number|bank account number|social security|passport number|private key|api key)\b/iu],
  ['instruction_signal', /\b(?:ignore (?:all |the |previous |your )*instructions|system prompt|bypass (?:review|approval)|execute (?:this |a )?command)\b/iu],
];

function review(id, reason, categories = []) {
  return {id, route: null, requiresHumanReview: true, reason, matchedCategories: categories, source: 'rules-baseline'};
}

export function triage(request) {
  validateRequest(request);
  const text = `${request.subject}\n${request.body}`.normalize('NFKC');
  const guard = GUARDS.find(([, pattern]) => pattern.test(text));
  if (guard) return review(request.id, guard[0]);
  const matches = CATEGORIES.filter(category => TERMS[category].some(pattern => pattern.test(text)));
  if (matches.length === 0) return review(request.id, 'no_supported_route');
  if (matches.length > 1) return review(request.id, 'multiple_routes', matches);
  return {
    id: request.id, route: matches[0], requiresHumanReview: false,
    reason: 'single_route_match', matchedCategories: matches, source: 'rules-baseline',
  };
}

/** A file-based model-output contract, useful for testing a future adapter offline.
 * Model output cannot clear a guard or route an ambiguous request. */
export function reconcileSuggestion(request, suggestion) {
  const baseline = triage(request);
  if (!isRecord(suggestion) || Object.keys(suggestion).length !== 2 ||
      !Object.hasOwn(suggestion, 'category') || !Object.hasOwn(suggestion, 'evidence') ||
      !CATEGORIES.includes(suggestion.category) || typeof suggestion.evidence !== 'string' ||
      suggestion.evidence.length < 4 || suggestion.evidence.length > 120 ||
      !`${request.subject}\n${request.body}`.includes(suggestion.evidence)) {
    return {...review(request.id, 'invalid_model_output'), source: 'model-contract'};
  }
  if (baseline.requiresHumanReview) return {...baseline, source: 'model-contract'};
  if (baseline.route !== suggestion.category) {
    return {...review(request.id, 'model_baseline_disagreement', baseline.matchedCategories), source: 'model-contract'};
  }
  return {...baseline, reason: 'model_baseline_agreement', source: 'model-contract'};
}

export function triageBatch(requests) {
  validateBatch(requests);
  return requests.map(triage);
}
