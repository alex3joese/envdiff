const fs = require('fs');
const os = require('os');
const path = require('path');
const { appendAuditEntry } = require('./audit');
const { cmdAuditShow, cmdAuditClear, cmdAuditLast } = require('./auditCmd');

function tempPath() {
  return path.join(os.tmpdir(), `auditcmd-${Date.now()}.json`);
}

test('cmdAuditShow prints no entries message when log is empty', () => {
  const p = tempPath();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  cmdAuditShow({ auditFile: p });
  expect(spy).toHaveBeenCalledWith('No audit entries found.');
  spy.mockRestore();
});

test('cmdAuditShow prints entries in text format', () => {
  const p = tempPath();
  appendAuditEntry({ files: ['.env'], issueCount: 1, summary: 'one issue' }, p);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  cmdAuditShow({ auditFile: p });
  const output = spy.mock.calls.flat().join('\n');
  expect(output).toContain('.env');
  expect(output).toContain('one issue');
  spy.mockRestore();
  fs.unlinkSync(p);
});

test('cmdAuditShow json format outputs valid JSON', () => {
  const p = tempPath();
  appendAuditEntry({ issueCount: 0 }, p);
  const logs = [];
  const spy = jest.spyOn(console, 'log').mockImplementation(v => logs.push(v));
  cmdAuditShow({ auditFile: p, format: 'json' });
  spy.mockRestore();
  const parsed = JSON.parse(logs[0]);
  expect(Array.isArray(parsed)).toBe(true);
  fs.unlinkSync(p);
});

test('cmdAuditClear clears the log', () => {
  const p = tempPath();
  appendAuditEntry({ issueCount: 9 }, p);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  cmdAuditClear({ auditFile: p });
  spy.mockRestore();
  const { loadAuditLog } = require('./audit');
  expect(loadAuditLog(p)).toEqual([]);
  fs.unlinkSync(p);
});

test('cmdAuditLast prints last entry', () => {
  const p = tempPath();
  appendAuditEntry({ issueCount: 1, summary: 'first' }, p);
  appendAuditEntry({ issueCount: 2, summary: 'second' }, p);
  const logs = [];
  const spy = jest.spyOn(console, 'log').mockImplementation(v => logs.push(v));
  cmdAuditLast({ auditFile: p });
  spy.mockRestore();
  const parsed = JSON.parse(logs[0]);
  expect(parsed.summary).toBe('second');
  fs.unlinkSync(p);
});
