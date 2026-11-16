import {triageBatch} from './triage.mjs';

const MAX_BYTES = 1024 * 1024;
try {
  if (process.argv.length !== 3 || process.argv[2].startsWith('-')) {
    throw new Error('Usage: node cli.mjs path/to/requests.json');
  }
  // Read at most 1 MiB. The demo only reads an explicit local file; no URLs.
  const {open} = await import('node:fs/promises');
  const file = await open(process.argv[2], 'r');
  let bytes;
  try {
    if (!(await file.stat()).isFile()) throw new Error('Input must be a regular file.');
    const buffer = Buffer.alloc(MAX_BYTES + 1);
    let total = 0;
    while (total < buffer.length) {
      const result = await file.read(buffer, total, buffer.length - total, null);
      if (result.bytesRead === 0) break;
      total += result.bytesRead;
    }
    if (total > MAX_BYTES) throw new Error('Input exceeds the 1 MiB limit.');
    bytes = buffer.subarray(0, total);
  } finally { await file.close(); }
  let requests;
  try { requests = JSON.parse(new TextDecoder('utf-8', {fatal:true}).decode(bytes)); }
  catch { throw new Error('Input must be valid UTF-8 JSON.'); }
  const decisions = triageBatch(requests);
  process.stdout.write(JSON.stringify({demo: true, actionsExecuted: 0, decisions}, null, 2) + '\n');
} catch (error) {
  // Never echo user content or filesystem error messages to the terminal.
  const safe = error instanceof TypeError || error.message?.startsWith('Usage:') ||
    ['Input must be a regular file.', 'Input exceeds the 1 MiB limit.', 'Input must be valid UTF-8 JSON.'].includes(error.message);
  process.stderr.write((safe ? error.message : 'Could not read the local input file.') + '\n');
  process.exitCode = 1;
}
