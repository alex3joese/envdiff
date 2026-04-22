const { mergeEnvs, buildMergedOutput } = require('./merge');

const fileA = { file: '.env.a', env: { FOO: 'foo', SHARED: 'from-a' } };
const fileB = { file: '.env.b', env: { BAR: 'bar', SHARED: 'from-b' } };
const fileC = { file: '.env.c', env: { BAZ: 'baz', SHARED: 'from-c' } };

describe('mergeEnvs', () => {
  test('merges two files with no conflicts', () => {
    const a = { file: 'a', env: { FOO: '1' } };
    const b = { file: 'b', env: { BAR: '2' } };
    const { merged, conflicts } = mergeEnvs([a, b]);
    expect(merged).toEqual({ FOO: '1', BAR: '2' });
    expect(conflicts).toHaveLength(0);
  });

  test('last file wins by default', () => {
    const { merged } = mergeEnvs([fileA, fileB]);
    expect(merged.SHARED).toBe('from-b');
  });

  test('first file wins when preferFirst=true', () => {
    const { merged } = mergeEnvs([fileA, fileB], { preferFirst: true });
    expect(merged.SHARED).toBe('from-a');
  });

  test('records conflicts for differing values', () => {
    const { conflicts } = mergeEnvs([fileA, fileB, fileC]);
    const sharedConflicts = conflicts.filter(c => c.key === 'SHARED');
    expect(sharedConflicts.length).toBeGreaterThan(0);
    expect(sharedConflicts[0].files).toContain('.env.a');
  });

  test('no conflict when same value in multiple files', () => {
    const a = { file: 'a', env: { KEY: 'same' } };
    const b = { file: 'b', env: { KEY: 'same' } };
    const { conflicts } = mergeEnvs([a, b]);
    expect(conflicts).toHaveLength(0);
  });

  test('handles empty file list', () => {
    const { merged, conflicts } = mergeEnvs([]);
    expect(merged).toEqual({});
    expect(conflicts).toHaveLength(0);
  });
});

describe('buildMergedOutput', () => {
  test('produces KEY=VALUE lines', () => {
    const out = buildMergedOutput({ A: '1', B: 'hello' });
    expect(out).toContain('A=1');
    expect(out).toContain('B=hello');
  });

  test('ends with newline', () => {
    const out = buildMergedOutput({ X: 'y' });
    expect(out.endsWith('\n')).toBe(true);
  });
});
