const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  loadAuditLog,
  saveAuditLog,
  appendAuditEntry,
  buildAuditEntry,
  clearAuditLog,
} = require('./audit');

function tempAuditPath() {
  return path.join(os.tmpdir(), `audit-test-${Date.now()}.json`);
}

test('loadAuditLog returns empty array when file missing', () => {
  const result = loadAuditLog('/nonexistent/path.json');
  expect(result).toEqual([]);
});

test('saveAuditLog and loadAuditLog round-trip', () => {
  const p = tempAuditPath();
  const entries = [{ foo: 'bar', timestamp: '2024-01-01T00:00:00.000Z' }];
  saveAuditLog(entries, p);
  expect(loadAuditLog(p)).toEqual(entries);
  fs.unlinkSync(p);
});

test('appendAuditEntry adds entry with timestamp', () => {
  const p = tempAuditPath();
  const entry = { files: ['a.env'], issueCount: 2, summary: 'ok' };
  const result = appendAuditEntry(entry, p);
  expect(result).toHaveLength(1);
  expect(result[0].issueCount).toBe(2);
  expect(result[0].timestamp).toBeDefined();
  fs.unlinkSync(p);
});

test('appendAuditEntry accumulates entries', () => {
  const p = tempAuditPath();
  appendAuditEntry({ issueCount: 1 }, p);
  appendAuditEntry({ issueCount: 3 }, p);
  const log = loadAuditLog(p);
  expect(log).toHaveLength(2);
  fs.unlinkSync(p);
});

test('buildAuditEntry extracts basenames and counts', () => {
  const entry = buildAuditEntry({
    files: ['/some/path/.env.production', '/other/.env.staging'],
    issues: [{ key: 'FOO' }, { key: 'BAR' }],
    summary: '2 issues',
  });
  expect(entry.files).toEqual(['.env.production', '.env.staging']);
  expect(entry.issueCount).toBe(2);
  expect(entry.summary).toBe('2 issues');
});

test('clearAuditLog empties the log', () => {
  const p = tempAuditPath();
  appendAuditEntry({ issueCount: 5 }, p);
  clearAuditLog(p);
  expect(loadAuditLog(p)).toEqual([]);
  fs.unlinkSync(p);
});
