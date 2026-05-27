#!/usr/bin/env node
'use strict';

/**
 * Run ECC tests, build a verification report (verification-loop skill format),
 * and email it via Resend. Pairs with the Resend Cursor plugin / MCP.
 *
 * Env:
 *   RESEND_API_KEY          — required unless --dry-run
 *   RESEND_FROM             — sender, e.g. "ECC <reports@yourdomain.com>"
 *   VERIFICATION_REPORT_TO  — recipient inbox
 *
 * Usage:
 *   node scripts/send-verification-report.js --dry-run
 *   RESEND_API_KEY=re_... RESEND_FROM="ECC <onboarding@resend.dev>" \
 *     VERIFICATION_REPORT_TO=you@example.com node scripts/send-verification-report.js
 */

const path = require('path');

const {
  runEccTests,
  buildVerificationReport,
  collectGitContext,
  idempotencyKey,
  sendViaResend,
} = require('./lib/verification-report');

function usage() {
  console.log(`Usage: node scripts/send-verification-report.js [--dry-run] [--skip-tests]

  --dry-run     Print report and Resend payload; do not call API
  --skip-tests  Use existing log from stdin or empty (for CI artifacts)
`);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    skipTests: args.includes('--skip-tests'),
  };
}

async function main() {
  const { dryRun, skipTests } = parseArgs(process.argv);
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    usage();
    process.exit(0);
  }

  const repoRoot = path.resolve(__dirname, '..');
  const git = collectGitContext(repoRoot);

  let testResult = { passed: true, output: '(tests skipped)', summaryLine: 'Skipped' };
  if (!skipTests) {
    console.error('Running ECC test suite…');
    testResult = runEccTests(repoRoot);
  }

  const report = buildVerificationReport({
    ...git,
    passed: testResult.passed,
    output: testResult.output,
    summaryLine: testResult.summaryLine,
  });

  const subject = `[ECC] Verification ${report.status} — ${git.branch}@${git.commit}`;
  const to = process.env.VERIFICATION_REPORT_TO;
  const from = process.env.RESEND_FROM;
  const key = to ? idempotencyKey(git.commit, to) : null;

  if (dryRun) {
    console.log(report.text);
    console.log('\n--- Resend (dry-run) ---');
    console.log(
      JSON.stringify(
        {
          to,
          from,
          subject,
          idempotencyKey: key,
          tags: ['ecc-verification-report', report.status],
        },
        null,
        2
      )
    );
    process.exit(testResult.passed ? 0 : 1);
  }

  if (!to || !from) {
    console.error('Set VERIFICATION_REPORT_TO and RESEND_FROM (or use --dry-run).');
    process.exit(1);
  }

  const sendResult = await sendViaResend({
    from,
    to,
    subject,
    text: report.text,
    html: report.html,
    idempotencyKey: key,
    statusTag: report.status.toLowerCase(),
  });

  if (sendResult.error) {
    console.error('Resend:', sendResult.error);
    console.error('Tip: authenticate the Resend MCP in Cursor (RESEND_API_KEY) or export the key in your shell.');
    process.exit(1);
  }

  console.log(`Verification report sent (id: ${sendResult.id})`);
  process.exit(testResult.passed ? 0 : 1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
