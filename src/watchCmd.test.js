const fs = require('fs');
const os = require('os');
const path = require('path');
const { cmdWatch } = require('./watchCmd');

function writeTempEnv(content) {
  const p = path.join(os.tmpdir(), `envdiff-wcmd-${Date.now()}-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('cmdWatch', () => {
  let files = [];

  afterEach(() => {
    files.forEach(f => { try { fs.unlinkSync(f); } catch (_) {} });
    files = [];
  });

  test('returns null and writes error when fewer than 2 files given', () => {
    const lines = [];
    const out = { write: l => lines.push(l) };
    const result = cmdWatch(['/some/.env'], { out, clear: false });
    expect(result).toBeNull();
    expect(lines.some(l => l.includes('Error'))).toBe(true);
  });

  test('starts watching and writes initial output', done => {
    const a = writeTempEnv('KEY=1\nSHARED=yes');
    const b = writeTempEnv('KEY=1\nSHARED=yes');
    files.push(a, b);
    const lines = [];
    const out = { write: l => lines.push(l) };

    const handle = cmdWatch([a, b], { out, clear: false });
    setTimeout(() => {
      handle.close();
      expect(lines.some(l => l.includes('Watching'))).toBe(true);
      expect(lines.some(l => l.includes('issue'))).toBe(true);
      done();
    }, 400);
  });

  test('returns a handle with close method', () => {
    const a = writeTempEnv('A=1');
    const b = writeTempEnv('A=1');
    files.push(a, b);
    const out = { write: () => {} };
    const handle = cmdWatch([a, b], { out, clear: false });
    expect(handle).not.toBeNull();
    expect(typeof handle.close).toBe('function');
    handle.close();
  });
});
