#!/usr/bin/env node
'use strict';

const assert = require('assert');
const {
  buildVerificationReport,
  idempotencyKey,
} = require('../../scripts/lib/verification-report');

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

let passed = 0;
let failed = 0;

console.log('\n=== send-verification-report ===\n');

if (
  test('buildVerificationReport marks FAIL when tests fail', () => {
    const { text, overall } = buildVerificationReport({
      repoName: 'ecc-universal',
      branch: 'main',
      commit: 'abc1234',
      passed: false,
      summaryLine: '5 failed',
      output: 'error: boom',
    });
    assert.ok(text.includes('NOT READY'));
    assert.strictEqual(overall, 'NOT READY');
  })
) {
  passed++;
} else {
  failed++;
}

if (
  test('idempotencyKey is stable per commit and recipient', () => {
    const a = idempotencyKey('abc1234', 'dev@example.com');
    const b = idempotencyKey('abc1234', 'dev@example.com');
    assert.strictEqual(a, b);
    assert.ok(a.startsWith('verification-report/'));
  })
) {
  passed++;
} else {
  failed++;
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
