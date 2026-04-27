const fs = require('fs');
const os = require('os');
const path = require('path');
const { promoteEnv, buildPromotedContent, promoteFiles } = require('./promote');

function writeTempEnv(content) {
  const p = path.join(os.tmpdir(), `promote-test-${Date.now()}-${Math.random()}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('promoteEnv', () => {
  const source = { A: '1', B: '2', C: '3' };
  const target = { A: '10', D: '4' };

  test('promotes missing keys', () => {
    const { promoted, result } = promoteEnv(source, target);
    expect(result.B).toBe('2');
    expect(result.C).toBe('3');
    expect(promoted.map(p => p.key)).toEqual(expect.arrayContaining(['B', 'C']));
  });

  test('does not overwrite by default', () => {
    const { result, skipped } = promoteEnv(source, target);
    expect(result.A).toBe('10');
    expect(skipped).toContain('A');
  });

  test('overwrites when option is set', () => {
    const { result, promoted } = promoteEnv(source, target, { overwrite: true });
    expect(result.A).toBe('1');
    const entry = promoted.find(p => p.key === 'A');
    expect(entry.reason).toBe('overwritten');
  });

  test('filters by keys option', () => {
    const { promoted, skipped } = promoteEnv(source, target, { keys: ['B'] });
    expect(promoted.map(p => p.key)).toEqual(['B']);
    expect(skipped).not.toContain('C');
  });
});

describe('buildPromotedContent', () => {
  test('produces key=value lines', () => {
    const content = buildPromotedContent({ X: 'hello', Y: 'world' });
    expect(content).toContain('X=hello');
    expect(content).toContain('Y=world');
  });
});

describe('promoteFiles', () => {
  test('writes promoted keys to target file', () => {
    const src = writeTempEnv('A=1\nB=2\n');
    const tgt = writeTempEnv('A=99\n');
    try {
      const { promoted } = promoteFiles(src, tgt);
      expect(promoted.map(p => p.key)).toContain('B');
      const written = fs.readFileSync(tgt, 'utf8');
      expect(written).toContain('B=2');
      expect(written).toContain('A=99');
    } finally {
      fs.unlinkSync(src);
      fs.unlinkSync(tgt);
    }
  });

  test('does not write when nothing to promote', () => {
    const src = writeTempEnv('A=1\n');
    const tgt = writeTempEnv('A=1\nB=2\n');
    const originalMtime = fs.statSync(tgt).mtimeMs;
    try {
      const { promoted } = promoteFiles(src, tgt);
      expect(promoted).toHaveLength(0);
    } finally {
      fs.unlinkSync(src);
      fs.unlinkSync(tgt);
    }
  });
});
