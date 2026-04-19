const { filterKeys, filterIssues, matchPattern } = require('./filter');

describe('matchPattern', () => {
  test('exact match', () => {
    expect(matchPattern('DB_HOST', 'DB_HOST')).toBe(true);
    expect(matchPattern('DB_HOST', 'DB_PORT')).toBe(false);
  });

  test('wildcard prefix', () => {
    expect(matchPattern('DB_HOST', 'DB_*')).toBe(true);
    expect(matchPattern('API_KEY', 'DB_*')).toBe(false);
  });

  test('wildcard suffix', () => {
    expect(matchPattern('SECRET_KEY', '*_KEY')).toBe(true);
    expect(matchPattern('SECRET_VALUE', '*_KEY')).toBe(false);
  });

  test('wildcard both sides', () => {
    expect(matchPattern('MY_SECRET_KEY', '*SECRET*')).toBe(true);
    expect(matchPattern('MY_TOKEN', '*SECRET*')).toBe(false);
  });
});

describe('filterKeys', () => {
  const keys = ['DB_HOST', 'DB_PORT', 'API_KEY', 'SECRET_TOKEN', 'NODE_ENV'];

  test('no patterns returns all keys', () => {
    expect(filterKeys(keys, [])).toEqual(keys);
  });

  test('filters exact keys', () => {
    expect(filterKeys(keys, ['NODE_ENV'])).not.toContain('NODE_ENV');
    expect(filterKeys(keys, ['NODE_ENV'])).toHaveLength(4);
  });

  test('filters by wildcard', () => {
    const result = filterKeys(keys, ['DB_*']);
    expect(result).not.toContain('DB_HOST');
    expect(result).not.toContain('DB_PORT');
    expect(result).toContain('API_KEY');
  });

  test('multiple patterns', () => {
    const result = filterKeys(keys, ['DB_*', 'API_KEY']);
    expect(result).toEqual(['SECRET_TOKEN', 'NODE_ENV']);
  });
});

describe('filterIssues', () => {
  const issues = [
    { key: 'DB_HOST', type: 'missing' },
    { key: 'API_KEY', type: 'mismatch' },
    { key: 'SECRET_TOKEN', type: 'missing' },
  ];

  test('no patterns returns all issues', () => {
    expect(filterIssues(issues, [])).toHaveLength(3);
  });

  test('filters issues by key pattern', () => {
    const result = filterIssues(issues, ['DB_*']);
    expect(result).toHaveLength(2);
    expect(result.find((i) => i.key === 'DB_HOST')).toBeUndefined();
  });
});
