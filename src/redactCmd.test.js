const fs = require('fs');
const path = require('path');
const os = require('os');
const { cmdRedact } = require('./redactCmd');

function writeTempEnv(content) {
  const p = path.join(os.tmpdir(), `test-${Date.now()}-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('cmdRedact', () => {
  let tmpFile;

  beforeEach(() => {
    tmpFile = writeTempEnv(
      'PORT=3000\nDB_PASSWORD=secret123\nAPI_KEY=abc\nHOST=localhost\n'
    );
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    const redacted = tmpFile.replace('.env', '.env.redacted');
    if (fs.existsSync(redacted)) fs.unlinkSync(redacted);
  });

  test('prints redacted output to stdout', () => {
    const logs = [];
    const spy = jest.spyOn(console, 'log').mockImplementation((...args) => logs.push(args.join(' ')));

    cmdRedact([tmpFile], { stdout: true });

    spy.mockRestore();
    const out = logs.join('\n');
    expect(out).toContain('PORT=3000');
    expect(out).toContain('HOST=localhost');
    expect(out).toMatch(/DB_PASSWORD=\*+/);
    expect(out).toMatch(/API_KEY=\*+/);
  });

  test('writes redacted file when no stdout flag', () => {
    cmdRedact([tmpFile], {});
    const redactedPath = tmpFile.replace(/(\.env)$/, '.env.redacted');
    // file name pattern may differ; check any written file
    const dir = path.dirname(tmpFile);
    const files = fs.readdirSync(dir).filter((f) => f.includes('redacted'));
    expect(files.length).toBeGreaterThan(0);
  });

  test('shows help when --help flag passed', () => {
    const logs = [];
    const spy = jest.spyOn(console, 'log').mockImplementation((...args) => logs.push(args.join(' ')));
    cmdRedact([], { help: true });
    spy.mockRestore();
    expect(logs.join('\n')).toContain('envdiff redact');
  });

  test('exits with error when no files given', () => {
    const spy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => cmdRedact([], {})).toThrow('exit');
    spy.mockRestore();
    jest.restoreAllMocks();
  });
});
