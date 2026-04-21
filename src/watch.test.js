const fs = require('fs');
const os = require('os');
const path = require('path');
const { watchEnvFiles, debounce } = require('./watch');

function writeTempEnv(content) {
  const p = path.join(os.tmpdir(), `envdiff-watch-${Date.now()}-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('debounce', () => {
  test('calls function after delay', done => {
    let count = 0;
    const fn = debounce(() => { count++; }, 50);
    fn(); fn(); fn();
    setTimeout(() => {
      expect(count).toBe(1);
      done();
    }, 100);
  });
});

describe('watchEnvFiles', () => {
  let files = [];

  afterEach(() => {
    files.forEach(f => { try { fs.unlinkSync(f); } catch (_) {} });
    files = [];
  });

  test('calls onUpdate immediately with report', done => {
    const a = writeTempEnv('KEY=val\nSHARED=yes');
    const b = writeTempEnv('KEY=val\nSHARED=yes');
    files.push(a, b);

    const handle = watchEnvFiles([a, b], {
      onUpdate: ({ report, error }) => {
        expect(error).toBeNull();
        expect(typeof report).toBe('string');
        handle.close();
        done();
      },
    });
  });

  test('returns close function', () => {
    const a = writeTempEnv('A=1');
    files.push(a);
    const handle = watchEnvFiles([a], { onUpdate: () => {} });
    expect(typeof handle.close).toBe('function');
    handle.close();
  });

  test('skips non-existent files without throwing', done => {
    const a = writeTempEnv('X=1');
    files.push(a);
    const handle = watchEnvFiles([a, '/nonexistent/.env'], {
      onUpdate: ({ error }) => {
        expect(error).toBeNull();
        handle.close();
        done();
      },
    });
  });
});
