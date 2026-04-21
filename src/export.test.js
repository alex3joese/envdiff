const fs = require('fs');
const os = require('os');
const path = require('path');
const { writeExport, buildExportContent, extensionFor } = require('./export');

const issues = [
  { key: 'DB_HOST', type: 'missing', files: ['staging.env'] },
  { key: 'API_KEY', type: 'mismatch', files: ['dev.env', 'prod.env'] },
];

const files = ['dev.env', 'staging.env', 'prod.env'];

test('buildExportContent json includes keys', () => {
  const out = buildExportContent({ files, issues, format: 'json' });
  const parsed = JSON.parse(out);
  expect(parsed.issues).toHaveLength(2);
  expect(parsed.files).toEqual(files);
  expect(parsed.exportedAt).toBeDefined();
});

test('buildExportContent csv has header and rows', () => {
  const out = buildExportContent({ files, issues, format: 'csv' });
  const lines = out.split('\n');
  expect(lines[0]).toBe('key,type,files');
  expect(lines[1]).toContain('DB_HOST');
  expect(lines[2]).toContain('mismatch');
});

test('buildExportContent text lists issues', () => {
  const out = buildExportContent({ files, issues, format: 'text' });
  expect(out).toContain('[missing] DB_HOST');
  expect(out).toContain('[mismatch] API_KEY');
});

test('extensionFor returns correct extensions', () => {
  expect(extensionFor('json')).toBe('.json');
  expect(extensionFor('csv')).toBe('.csv');
  expect(extensionFor('text')).toBe('.txt');
  expect(extensionFor('unknown')).toBe('.txt');
});

test('writeExport writes file to disk', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envdiff-export-'));
  const outPath = path.join(tmpDir, 'result.json');
  writeExport(outPath, '{"ok":true}');
  const content = fs.readFileSync(outPath, 'utf8');
  expect(JSON.parse(content)).toEqual({ ok: true });
  fs.rmSync(tmpDir, { recursive: true });
});

test('writeExport creates nested directories', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envdiff-export-'));
  const outPath = path.join(tmpDir, 'nested', 'deep', 'result.csv');
  writeExport(outPath, 'key,type');
  expect(fs.existsSync(outPath)).toBe(true);
  fs.rmSync(tmpDir, { recursive: true });
});
