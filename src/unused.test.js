const { findUnusedKeys, formatUnusedReport, hasUnusedKeys } = require('./unused');

const envMap = {
  base: { API_KEY: 'abc', DB_URL: 'postgres://...', LEGACY_FLAG: 'true' },
  staging: { API_KEY: 'xyz', DB_URL: 'postgres://staging' },
  prod: { API_KEY: 'prod-key', DB_URL: 'postgres://prod' },
};

describe('findUnusedKeys', () => {
  test('finds keys in base missing from all others', () => {
    const result = findUnusedKeys('base', envMap);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('LEGACY_FLAG');
    expect(result[0].presentIn).toEqual([]);
  });

  test('returns empty array when all base keys are used', () => {
    const map = {
      base: { A: '1', B: '2' },
      other: { A: '1', B: '2' },
    };
    expect(findUnusedKeys('base', map)).toHaveLength(0);
  });

  test('returns all keys when there are no other envs', () => {
    const map = { base: { X: '1', Y: '2' } };
    const result = findUnusedKeys('base', map);
    expect(result).toHaveLength(2);
  });

  test('handles missing base gracefully', () => {
    const result = findUnusedKeys('missing', envMap);
    expect(result).toEqual([]);
  });

  test('key present in at least one other env is not unused', () => {
    const result = findUnusedKeys('base', envMap);
    const keys = result.map((r) => r.key);
    expect(keys).not.toContain('API_KEY');
    expect(keys).not.toContain('DB_URL');
  });
});

describe('formatUnusedReport', () => {
  test('reports unused keys', () => {
    const unused = [{ key: 'LEGACY_FLAG', presentIn: [] }];
    const out = formatUnusedReport('base', unused);
    expect(out).toContain('LEGACY_FLAG');
    expect(out).toContain('base');
  });

  test('reports clean state', () => {
    const out = formatUnusedReport('base', []);
    expect(out).toContain('No unused keys');
  });
});

describe('hasUnusedKeys', () => {
  test('true when unused keys exist', () => {
    expect(hasUnusedKeys([{ key: 'X' }])).toBe(true);
  });

  test('false when no unused keys', () => {
    expect(hasUnusedKeys([])).toBe(false);
  });
});
