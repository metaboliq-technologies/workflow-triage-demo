import {readFile,writeFile} from 'node:fs/promises';import {summarizeAnchor,digest} from './anchor-grades.mjs';
const read=n=>readFile(new URL('./'+n,import.meta.url),'utf8'),json=async n=>JSON.parse(await read(n));
const gradesBytes=await read('anchor-output-grades.json'),process=await json('anchor-output-review-process.json'),hash=process.gradesSha256??process.initialGradesSha256??process.gradeSha256??process.gradeSHA256;
if(typeof hash!=='string'||hash.toLowerCase()!==digest(gradesBytes))throw Error('Blind grades are not sealed');
const summary=summarizeAnchor(await json('anchor-comparison.json'),await json('anchor-evaluation.json'),await json('anchor-output-items.json'),await json('anchor-output-map.json'),JSON.parse(gradesBytes));
await writeFile(new URL('./anchor-semantic-comparison.json',import.meta.url),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({allCases:summary.allCases,commonValid:summary.commonValid,failures:summary.failures}));
