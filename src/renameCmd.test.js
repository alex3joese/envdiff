const fs = require('fs');
const os = require('os');
const path = require('path');
const { cmdRename, parseFiles } = require('./renameCmd');

function writeTempEnv(content) {
  const p = path.join(os.tmpdir(), `envdiff-renamecmd-${Date.now()}-${Math.random()}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

function makeOpts() {
  const lines = [];
  let exitCode = null;
  return {
    print: msg => lines.push(msg),
    exit: code => { exitCode = code; },
    lines,
    get exitCode() { return exitCode; },
  };
}

describe('parseFiles', () => {
  test('splits comma-separated list', () => {
    expect(parseFiles('.env,.env.staging')).toEqual(['.env', '.env.staging']);
  });
  test('returns empty array for falsy input', () => {
    expect(parseFiles(null)).toEqual([]);
  });
});

describe('cmdRename', () => {
  test('prints help and exits 0', () => {
    const opts = makeOpts();
    cmdRename({ help: true, _: ['rename'] }, opts);
    expect(opts.exitCode).toBe(0);
    expect(opts.lines.some(l => l.includes('Usage'))).toBe(true);
  });

  test('exits 1 when keys missing', () => {
    const opts = makeOpts();
    cmdRename({ _: ['rename'] }, opts);
    expect(opts.exitCode).toBe(1);
  });

  test('exits 1 when no files given', () => {
    const opts = makeOpts();
    cmdRename({ _: ['rename', 'OLD', 'NEW'] }, opts);
    expect(opts.exitCode).toBe(1);
  });

  test('renames key and reports success', () => {
    const p = writeTempEnv('OLD_KEY=value\nOTHER=x');
    const opts = makeOpts();
    cmdRename({ _: ['rename', 'OLD_KEY', 'NEW_KEY'], files: p }, opts);
    expect(opts.exitCode).toBe(0);
    expect(opts.lines.some(l => l.includes('OLD_KEY → NEW_KEY'))).toBe(true);
    expect(fs.readFileSync(p, 'utf8')).toContain('NEW_KEY=value');
    fs.unlinkSync(p);
  });

  test('dry-run does not write file', () => {
    const p = writeTempEnv('FOO=bar');
    const opts = makeOpts();
    cmdRename({ _: ['rename', 'FOO', 'BAR'], files: p, 'dry-run': true }, opts);
    expect(fs.readFileSync(p, 'utf8')).toBe('FOO=bar');
    expect(opts.lines.some(l => l.includes('[dry-run]'))).toBe(true);
    fs.unlinkSync(p);
  });

  test('reports when key not found in any file', () => {
    const p = writeTempEnv('X=1');
    const opts = makeOpts();
    cmdRename({ _: ['rename', 'MISSING', 'NEW'], files: p }, opts);
    expect(opts.lines.some(l => l.includes('not found'))).toBe(true);
    fs.unlinkSync(p);
  });
});
