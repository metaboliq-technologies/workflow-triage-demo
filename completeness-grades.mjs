export function validateEvidenceGrades(items,grades){
  if(!Array.isArray(items)||!Array.isArray(grades)||grades.length!==items.length||new Set(grades.map(g=>g.itemId)).size!==items.length)throw Error('Incomplete output grades');
  for(const item of items){const g=grades.find(g=>g.itemId===item.itemId);if(!g||typeof g.evidenceSupportsReturnedDecision!=='boolean'||typeof g.referenceFactsCovered!=='boolean'||!Array.isArray(g.coveredFacts)||!Array.isArray(g.missingFacts)||typeof g.rationale!=='string'||!g.rationale.trim()||!(g.referenceAmbiguity===null||typeof g.referenceAmbiguity==='string'))throw Error('Invalid output judgment');
    const all=[...g.coveredFacts,...g.missingFacts],n=item.minimumFacts.length;if(all.length!==n||new Set(all).size!==n||all.some(x=>!Number.isInteger(x)||x<0||x>=n)||g.referenceFactsCovered!==(g.missingFacts.length===0))throw Error('Fact coverage not accounted for');
  }return grades;
}
