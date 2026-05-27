'use strict';

const { execSync, spawnSync } = require('child_process');
const path = require('path');

/**
 * Run the ECC test suite and return a structured verification summary.
 * @param {string} repoRoot
 * @returns {{ passed: boolean, output: string, summaryLine: string }}
 */
function runEccTests(repoRoot) {
  const result = spawnSync(
    process.execPath,
    ['tests/run-all.js'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: process.env,
    }
  );

  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
  const summaryLine =
    output
      .split('\n')
      .reverse()
      .find(line => /passed|failed|Tests:/i.test(line)) || 'Tests: see log';

  return {
    passed: result.status === 0,
    output: output.slice(-8000),
    summaryLine,
  };
}

/**
 * @param {{ passed: boolean, output: string, summaryLine: string, repoName: string, branch: string, commit: string }} input
 */
function buildVerificationReport(input) {
  const overall = input.passed ? 'READY' : 'NOT READY';
  const status = input.passed ? 'PASS' : 'FAIL';

  const text = [
    'VERIFICATION REPORT',
    '==================',
    '',
    `Project:   ${input.repoName}`,
    `Branch:    ${input.branch}`,
    `Commit:    ${input.commit}`,
    `Tests:     ${status} — ${input.summaryLine}`,
    '',
    `Overall:   ${overall} for PR`,
    '',
    '--- Test log (tail) ---',
    input.output || '(no output)',
  ].join('\n');

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <h2 style="margin-bottom: 0.25rem;">ECC verification report</h2>
  <p style="color: #555; margin-top: 0;">${escapeHtml(input.repoName)} · ${escapeHtml(input.branch)} · <code>${escapeHtml(input.commit)}</code></p>
  <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; margin: 1rem 0;">
    <tr><td><strong>Tests</strong></td><td style="color: ${input.passed ? '#0a7' : '#c00'};">${status}</td></tr>
    <tr><td><strong>Overall</strong></td><td><strong>${overall}</strong> for PR</td></tr>
  </table>
  <p style="font-size: 0.9rem; color: #555;">${escapeHtml(input.summaryLine)}</p>
  <pre style="background: #f4f4f5; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 12px;">${escapeHtml(
    (input.output || '').slice(-4000)
  )}</pre>
</body>
</html>`;

  return { text, html, overall, status };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function gitValue(repoRoot, args) {
  try {
    return execSync(`git ${args}`, { cwd: repoRoot, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * @param {string} repoRoot
 */
function collectGitContext(repoRoot) {
  return {
    repoName: path.basename(repoRoot),
    branch: gitValue(repoRoot, 'rev-parse --abbrev-ref HEAD'),
    commit: gitValue(repoRoot, 'rev-parse --short HEAD'),
  };
}

/**
 * Resend idempotency key: same commit + recipient => no duplicate on retry.
 * @param {string} commit
 * @param {string} to
 */
function idempotencyKey(commit, to) {
  const safeTo = to.replace(/[^a-zA-Z0-9@._-]/g, '_').slice(0, 80);
  return `verification-report/${commit}/${safeTo}`;
}

/**
 * Send via Resend REST API (no SDK dependency).
 * @param {object} params
 * @returns {Promise<{ id?: string, error?: string }>}
 */
async function sendViaResend(params) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { error: 'RESEND_API_KEY is not set' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': params.idempotencyKey,
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      text: params.text,
      html: params.html,
      tags: [
        { name: 'source', value: 'ecc-verification-report' },
        { name: 'status', value: params.statusTag },
      ],
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: body.message || `Resend API ${response.status}` };
  }
  return { id: body.id };
}

module.exports = {
  runEccTests,
  buildVerificationReport,
  collectGitContext,
  idempotencyKey,
  sendViaResend,
};
