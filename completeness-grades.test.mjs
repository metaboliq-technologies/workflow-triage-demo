import test from 'node:test';import assert from 'node:assert/strict';import {validateEvidenceGrades} from './completeness-grades.mjs';
test('semantic output grades require every blinded item and every fact without conflating support with coverage',()=>{
  const items=[{itemId:'blind-1',minimumFacts:['unfamiliar page','password entered there']}],g={itemId:'blind-1',evidenceSupportsReturnedDecision:false,referenceFactsCovered:true,coveredFacts:[0,1],missingFacts:[],rationale:'Reference trigger quoted, returned ordinary route conflicts with policy.',referenceAmbiguity:null};assert.equal(validateEvidenceGrades(items,[g])[0].referenceFactsCovered,true);
  for(const bad of [[],[{...g,coveredFacts:[0,0]}],[{...g,coveredFacts:[0],missingFacts:[]}],[{...g,referenceFactsCovered:false}]])assert.throws(()=>validateEvidenceGrades(items,bad));
});
