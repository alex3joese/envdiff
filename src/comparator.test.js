const { compareEnvs, getIssues } = require('./comparator');

const envMap = {
  '.env.development': {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    SECRET: 'devsecret',
  },
  '.env.production': {
    DB_HOST: 'prod.db.example.com',
    DB_PORT: '5432',
    // SECRET is missing
  },
  '.env.staging': {
    DB_HOST: 'staging.db.example.com',
    DB_PORT: '5433', // different port
    SECRET: 'stagingsecret',
  },
};

const allKeys = ['DB_HOST', 'DB_PORT', 'SECRET'];

describe('compareEnvs', () => {
  let results;

  beforeAll(() => {
    results = compareEnvs(envMap, allKeys);
  });

  test('returns a result for every key', () => {
    expect(results).toHaveLength(allKeys.length);
  });

  test('DB_HOST is mismatch (different values across envs)', () => {
    const r = results.find(r => r.key === 'DB_HOST');
    expect(r.status).toBe('mismatch');
  });

  test('DB_PORT is mismatch (staging differs)', () => {
    const r = results.find(r => r.key === 'DB_PORT');
    expect(r.status).toBe('mismatch');
  });

  test('SECRET is missing_some (absent in production)', () => {
    const r = results.find(r => r.key === 'SECRET');
    expect(r.status).toBe('missing_some');
    expect(r.details['.env.production']).toBeNull();
  });
});

describe('getIssues', () => {
  test('returns only non-ok entries', () => {
    const results = compareEnvs(envMap, allKeys);
    const issues = getIssues(results);
    expect(issues.every(r => r.status !== 'ok')).toBe(true);
  });

  test('returns empty array when all keys match', () => {
    const sameMap = { a: { KEY: 'val' }, b: { KEY: 'val' } };
    const results = compareEnvs(sameMap, ['KEY']);
    expect(getIssues(results)).toHaveLength(0);
  });
});
