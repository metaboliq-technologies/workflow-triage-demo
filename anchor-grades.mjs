import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export const digest=x=>createHash('sha256').update(x).digest('hex');
export function summarizeAnchor(raw,dataset,items,map,grades){
  const available=raw.rows.reduce((n,r)=>n+Number(!r.previous.error)+Number(!r.updated.error),0);
  if(items.length!==available||map.length!==items.length||new Set(items.map(x=>x.id)).size!==items.length||new Set(map.map(x=>x.id)).size!==items.length)throw Error('Incomplete blinded assembly');
  if(!Array.isArray(grades)||grades.length!==items.length||new Set(grades.map(g=>g.id)).size!==items.length)throw Error('Incomplete grades');
  const rows=raw.rows.map(r=>({...r,semantic:{}}));
  for(const item of items){const g=grades.find(x=>x.id===item.id),m=map.find(x=>x.id===item.id);if(!g||!m||typeof g.sourceExact!=='boolean'||typeof g.supportsReturnedDecision!=='boolean'||typeof g.coversSufficientReferenceBundle!=='boolean'||typeof g.criteriaAmbiguous!=='boolean'||!g.rationale?.trim()||!['not-applicable','full','partial','none'].includes(g.optionalContextCoverage))throw Error('Invalid evidence grade');
    const row=rows.find(x=>x.id===m.caseId),c=dataset.cases.find(x=>x.input.id===m.caseId);if(!row||!c||!['previous','updated'].includes(m.arm)||row.semantic[m.arm]||row[m.arm].error)throw Error('Invalid map');
    const evidence=item.returned.evidence;if(typeof evidence!=='string'||evidence.length<4||evidence.length>120||![c.input.subject,c.input.body].some(x=>x.includes(evidence)))throw Error('Invalid evidence span');
    if(row.providers&&JSON.stringify(item.returned)!==JSON.stringify(row.providers[m.arm].output))throw Error('Blinded output differs from raw');
    if(g.coversSufficientReferenceBundle&&(!Array.isArray(g.coveredBundleIndexes)||!g.coveredBundleIndexes.length||g.coveredBundleIndexes.some(i=>!Number.isInteger(i)||i<0||i>=c.evidenceCriteria.sufficientBundles.length)))throw Error('Missing covered bundle');
    if(c.evidenceCriteria.optionalContext.length===0&&g.optionalContextCoverage!=='not-applicable')throw Error('Optional context not applicable');
    if(c.evidenceCriteria.optionalContext.length>0&&g.optionalContextCoverage==='not-applicable')throw Error('Optional context assessment missing');
    if(!g.coversSufficientReferenceBundle&&g.coveredBundleIndexes?.length)throw Error('Inconsistent bundle coverage');
    row.semantic[m.arm]={...g,reviewerSourceExact:g.sourceExact??null,sourceExact:true,routingCorrect:row[m.arm].route===row.expected.route&&row[m.arm].requiresHumanReview===row.expected.requiresHumanReview};
  }
  const valid=r=>!r.previous.error&&!r.updated.error;const common=rows.filter(valid);
  const metrics=rs=>Object.fromEntries(['previous','updated'].map(arm=>[arm,{total:rs.length,available:rs.filter(r=>!r[arm].error).length,routingCorrect:rs.filter(r=>r.semantic[arm]?.routingCorrect).length,sourceExact:rs.filter(r=>r.semantic[arm]?.sourceExact).length,supportsReturnedDecision:rs.filter(r=>r.semantic[arm]?.supportsReturnedDecision).length,coversSufficientReferenceBundle:rs.filter(r=>r.semantic[arm]?.coversSufficientReferenceBundle).length,jointRoutingSupportAndCoverage:rs.filter(r=>r.semantic[arm]?.routingCorrect&&r.semantic[arm]?.supportsReturnedDecision&&r.semantic[arm]?.coversSufficientReferenceBundle).length,criteriaAmbiguous:rs.filter(r=>r.semantic[arm]?.criteriaAmbiguous).length,optionalContext:Object.fromEntries(['not-applicable','full','partial','none'].map(k=>[k,rs.filter(r=>r.semantic[arm]?.optionalContextCoverage===k).length]))}]));
  return {schemaVersion:1,experiment:'paired-fact-envelope-v14',humanReviewed:false,rawSha256:digest(JSON.stringify(raw)),allCases:metrics(rows),byGroup:Object.fromEntries([...new Set(rows.map(r=>r.stratum))].map(g=>{const xs=rows.filter(r=>r.stratum===g);return [g,{caseIds:xs.map(r=>r.id),allCases:metrics(xs),commonValid:metrics(xs.filter(valid))}];})),commonValid:{caseIds:common.map(r=>r.id),metrics:metrics(common)},failures:rows.flatMap(r=>['previous','updated'].filter(a=>r[a].error||!r.semantic[a]?.routingCorrect||!r.semantic[a]?.supportsReturnedDecision||!r.semantic[a]?.coversSufficientReferenceBundle||r.semantic[a]?.criteriaAmbiguous).map(arm=>({id:r.id,arm,result:r[arm],grade:r.semantic[arm]??null}))),rows};
}
