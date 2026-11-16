import {readFile} from 'node:fs/promises';
import {triage, validateBatch} from './triage.mjs';

const fixtures = JSON.parse(await readFile(new URL('./fixtures.json', import.meta.url), 'utf8'));
validateBatch(fixtures.map(item => item.input));
const report = {schemaVersion: 1, dataset: 'synthetic-v1', model: 'rules-baseline', actionsExecuted: 0, splits: {}};
for (const split of ['development', 'evaluation']) {
  const cases = fixtures.filter(item => item.split === split);
  let correct = 0, proposals = 0, correctProposals = 0, expectedReview = 0, caughtReview = 0;
  const mismatches = [];
  for (const item of cases) {
    const actual = triage(item.input);
    const matches = actual.route === item.expected.route && actual.requiresHumanReview === item.expected.requiresHumanReview;
    correct += Number(matches);
    if (!actual.requiresHumanReview) { proposals++; correctProposals += Number(matches); }
    if (item.expected.requiresHumanReview) { expectedReview++; caughtReview += Number(actual.requiresHumanReview); }
    if (!matches) mismatches.push({id:item.input.id, expected:item.expected, actual:{route:actual.route,requiresHumanReview:actual.requiresHumanReview}, note:item.note ?? ''});
  }
  report.splits[split] = {
    total: cases.length, correct, exactMatchRate: correct/cases.length,
    proposals, correctProposals, proposalPrecision: proposals ? correctProposals/proposals : null,
    expectedReview, caughtReview, reviewRecall: expectedReview ? caughtReview/expectedReview : null,
    mismatches,
  };
}
// Deliberately deterministic: no timestamp, network call or paid API.
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
