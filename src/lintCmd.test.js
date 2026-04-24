const fs = require('fs');
const os = require('os');
const path = require('path');
const { cmdLint, formatLintResults, resolveLintFiles } = require('./lintCmd');

function writeTempEnv(content) {
  const tmpFile = path.join(os.tmpdir(), `.env.lint.test.${Date.now()}`);
  fs.writeFileSync(tmpFile, content, 'utf8');
  return tmpFile;
}

describe('resolveLintFiles', () => {
  it('defaults to .env when no args given', () => {
    expect(resolveLintFiles([])).toEqual(['.env']);
  });

  it('returns provided files, ignoring flags', () => {
    expect(resolveLintFiles(['--json', '.env.staging'])).toEqual(['.env.staging']);
  });
});

describe('formatLintResults', () => {
  it('shows no issues message for clean file', () => {
    const out = formatLintResults({ '.env': [] });
    expect(out).toContain('no issues');
  });

  it('shows issue count and details for dirty file', () => {
    const results = { '.env': [{ line: 2, message: 'empty value', text: 'API_KEY=' }] };
    const out = formatLintResults(results);
    expect(out).toContain('1 issue');
    expect(out).toContain('line 2');
    expect(out).toContain('empty value');
  });

  it('returns JSON when json option set', () => {
    const results = { '.env': [] };
    const out = formatLintResults(results, { json: true });
    expect(() => JSON.parse(out)).not.toThrow();
  });
});

describe('cmdLint', () => {
  it('outputs clean result for valid env file', () => {
    const tmpFile = writeTempEnv('API_KEY=secret\nDB_URL=postgres://localhost\n');
    const lines = [];
    const code = cmdLint([tmpFile], { stdout: (s) => lines.push(s) });
    expect(lines.join('')).toContain('no issues');
    expect(code).toBe(0);
    fs.unlinkSync(tmpFile);
  });

  it('reports issues for bad env file', () => {
    const tmpFile = writeTempEnv('api_key=\nDB_URL=postgres\n');
    const lines = [];
    cmdLint([tmpFile], { stdout: (s) => lines.push(s) });
    expect(lines.join('')).toContain('issue');
    fs.unlinkSync(tmpFile);
  });

  it('returns exit code 1 with --strict and errors', () => {
    const tmpFile = writeTempEnv('api_key=\n');
    const code = cmdLint([tmpFile, '--strict'], { stdout: () => {} });
    expect(code).toBe(1);
    fs.unlinkSync(tmpFile);
  });

  it('reports missing file to stderr', () => {
    const errs = [];
    cmdLint(['nonexistent.env'], { stdout: () => {}, stderr: (s) => errs.push(s) });
    expect(errs.join('')).toContain('not found');
  });
});
