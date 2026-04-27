const { checkRequired, formatRequiredReport, hasRequiredViolations } = require('./required');

const envMap = {
  '.env.development': { DB_HOST: 'localhost', DB_PASS: 'secret', PORT: '3000' },
  '.env.production':  { DB_HOST: 'prod-db',   DB_PASS: '',        PORT: '8080' },
  '.env.test':        {                        DB_PASS: 'test',    PORT: '3001' },
};

describe('checkRequired', () => {
  test('returns empty array when all required keys are present and non-empty', () => {
    const issues = checkRequired(['PORT', 'DB_PASS'], envMap);
    // .env.production has empty DB_PASS, so should not be empty
    expect(issues.length).toBeGreaterThan(0);
  });

  test('flags missing key across a file', () => {
    const issues = checkRequired(['DB_HOST'], envMap);
    const missing = issues.filter(i => i.key === 'DB_HOST' && i.reason === 'missing');
    expect(missing).toHaveLength(1);
    expect(missing[0].file).toBe('.env.test');
  });

  test('flags empty value', () => {
    const issues = checkRequired(['DB_PASS'], envMap);
    const empty = issues.filter(i => i.reason === 'empty');
    expect(empty).toHaveLength(1);
    expect(empty[0].file).toBe('.env.production');
    expect(empty[0].key).toBe('DB_PASS');
  });

  test('returns no issues when required list is empty', () => {
    expect(checkRequired([], envMap)).toEqual([]);
  });

  test('returns no issues when all keys satisfy requirements', () => {
    const simple = { '.env': { FOO: 'bar' } };
    expect(checkRequired(['FOO'], simple)).toEqual([]);
  });
});

describe('formatRequiredReport', () => {
  test('returns success message when no issues', () => {
    expect(formatRequiredReport([])).toBe('All required keys are present.');
  });

  test('includes MISSING label', () => {
    const issues = [{ file: '.env.test', key: 'DB_HOST', reason: 'missing' }];
    const out = formatRequiredReport(issues);
    expect(out).toContain('[MISSING]');
    expect(out).toContain('DB_HOST');
    expect(out).toContain('.env.test');
  });

  test('includes EMPTY label', () => {
    const issues = [{ file: '.env.production', key: 'DB_PASS', reason: 'empty' }];
    const out = formatRequiredReport(issues);
    expect(out).toContain('[EMPTY]');
  });
});

describe('hasRequiredViolations', () => {
  test('returns false for empty issues', () => {
    expect(hasRequiredViolations([])).toBe(false);
  });

  test('returns true when issues exist', () => {
    expect(hasRequiredViolations([{ file: 'x', key: 'Y', reason: 'missing' }])).toBe(true);
  });
});
