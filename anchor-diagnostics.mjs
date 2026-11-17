import {sanitizeDiagnostics} from './model-adapter.mjs';
export const ANCHOR_FAILURES=Object.freeze(['object_shape','reason_mismatch','fact_count','unknown_token','reverse_span','cross_field','overlap','incomplete_terminal','self_reported_unavailable','quote_limit']);
export function sanitizeAnchorDiagnostics(value={}){const result=sanitizeDiagnostics(value);if(ANCHOR_FAILURES.includes(value.anchorFailure))result.anchorFailure=value.anchorFailure;return result;}
