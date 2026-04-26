const fs = require('fs');
const os = require('os');
const path = require('path');
const { renameKeyInContent, renameKeyInMap, renameInFiles } = require('./rename');

function writeTempEnv(content) {
  const p = path.join(os.tmpdir(), `envdiff-rename-${Date.now()}-${Math.random()}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('renameKeyInContent', () => {
  test('renames a matching key', () => {
    const { content, renamed } = renameKeyInContent('OLD_KEY=hello\nOTHER=world', 'OLD_KEY', 'NEW_KEY');
    expect(content).toBe('NEW_KEY=hello\nOTHER=world');
    expect(renamed).toBe(1);
  });

  test('returns renamed=0 when key not found', () => {
    const { renamed } = renameKeyInContent('FOO=bar', 'MISSING', 'NEW');
    expect(renamed).toBe(0);
  });

  test('preserves comments and blank lines', () => {
    const input = '# comment\n\nFOO=1\nBAR=2';
    const { content } = renameKeyInContent(input, 'FOO', 'BAZ');
    expect(content).toBe('# comment\n\nBAZ=1\nBAR=2');
  });

  test('preserves value with equals sign', () => {
    const { content } = renameKeyInContent('KEY=a=b=c', 'KEY', 'NEW');
    expect(content).toBe('NEW=a=b=c');
  });
});

describe('renameKeyInMap', () => {
  test('renames key in map', () => {
    const result = renameKeyInMap({ A: '1', B: '2' }, 'A', 'Z');
    expect(result).toEqual({ Z: '1', B: '2' });
  });

  test('returns unchanged map when key missing', () => {
    const result = renameKeyInMap({ A: '1' }, 'X', 'Y');
    expect(result).toEqual({ A: '1' });
  });
});

describe('renameInFiles', () => {
  test('renames key in file on disk', () => {
    const p = writeTempEnv('DB_HOST=localhost\nDB_PORT=5432');
    const results = renameInFiles([p], 'DB_HOST', 'DATABASE_HOST');
    expect(results[0].renamed).toBe(1);
    expect(fs.readFileSync(p, 'utf8')).toContain('DATABASE_HOST=localhost');
    fs.unlinkSync(p);
  });

  test('dry run does not write file', () => {
    const p = writeTempEnv('FOO=bar');
    renameInFiles([p], 'FOO', 'BAR', true);
    expect(fs.readFileSync(p, 'utf8')).toBe('FOO=bar');
    fs.unlinkSync(p);
  });
});
