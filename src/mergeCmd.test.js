const fs = require('fs');
const os = require('os');
const path = require('path');
const { cmdMerge } = require('./mergeCmd');

function writeTempEnv(content) {
  const p = path.join(os.tmpdir(), `envdiff-merge-${Date.now()}-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('cmdMerge', () => {
  let outPath;
  afterEach(() => {
    if (outPath && fs.existsSync(outPath)) fs.unlinkSync(outPath);
    outPath = null;
  });

  test('writes merged output to file', () => {
    const a = writeTempEnv('FOO=1\nSHARED=from-a\n');
    const b = writeTempEnv('BAR=2\nSHARED=from-b\n');
    outPath = path.join(os.tmpdir(), `merged-${Date.now()}.env`);
    cmdMerge([a, b, '--output', outPath, '--quiet']);
    const content = fs.readFileSync(outPath, 'utf8');
    expect(content).toContain('FOO=1');
    expect(content).toContain('BAR=2');
    expect(content).toContain('SHARED=from-b');
    fs.unlinkSync(a);
    fs.unlinkSync(b);
  });

  test('prefer-first flag respected', () => {
    const a = writeTempEnv('SHARED=from-a\n');
    const b = writeTempEnv('SHARED=from-b\n');
    outPath = path.join(os.tmpdir(), `merged-pf-${Date.now()}.env`);
    cmdMerge([a, b, '--prefer-first', '--output', outPath, '--quiet']);
    const content = fs.readFileSync(outPath, 'utf8');
    expect(content).toContain('SHARED=from-a');
    fs.unlinkSync(a);
    fs.unlinkSync(b);
  });

  test('exits with error when fewer than 2 files given', () => {
    const spy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => cmdMerge(['only-one.env'])).toThrow('exit');
    spy.mockRestore();
  });

  test('prints help without error', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    cmdMerge(['--help']);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
