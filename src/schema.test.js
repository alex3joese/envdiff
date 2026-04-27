const { checkType, validateAgainstSchema, hasSchemaErrors, formatSchemaReport } = require('./schema');

describe('checkType', () => {
  test('passes valid number', () => expect(checkType('42', 'number')).toBeNull());
  test('fails invalid number', () => expect(checkType('abc', 'number')).toMatch(/expected number/));
  test('passes true boolean', () => expect(checkType('true', 'boolean')).toBeNull());
  test('passes 0 boolean', () => expect(checkType('0', 'boolean')).toBeNull());
  test('fails invalid boolean', () => expect(checkType('yes', 'boolean')).toMatch(/expected boolean/));
  test('passes valid url', () => expect(checkType('https://example.com', 'url')).toBeNull());
  test('fails invalid url', () => expect(checkType('not-a-url', 'url')).toMatch(/expected URL/));
  test('passes valid email', () => expect(checkType('a@b.com', 'email')).toBeNull());
  test('fails invalid email', () => expect(checkType('notanemail', 'email')).toMatch(/expected email/));
  test('string type always passes', () => expect(checkType('anything', 'string')).toBeNull());
  test('no type always passes', () => expect(checkType('anything', undefined)).toBeNull());
});

describe('validateAgainstSchema', () => {
  const schema = {
    PORT: { type: 'number', required: true },
    DEBUG: { type: 'boolean' },
    API_URL: { type: 'url', required: true },
    TAG: { pattern: '^v\\d+\\.\\d+' },
  };

  test('returns no errors for valid env', () => {
    const env = { PORT: '3000', DEBUG: 'true', API_URL: 'https://api.example.com', TAG: 'v1.2' };
    expect(validateAgainstSchema(env, schema)).toHaveLength(0);
  });

  test('reports missing required key', () => {
    const env = { DEBUG: 'true', TAG: 'v1.0' };
    const errs = validateAgainstSchema(env, schema);
    expect(errs.some(e => e.key === 'PORT')).toBe(true);
    expect(errs.some(e => e.key === 'API_URL')).toBe(true);
  });

  test('reports type mismatch', () => {
    const env = { PORT: 'not-a-number', API_URL: 'https://ok.com' };
    const errs = validateAgainstSchema(env, schema);
    expect(errs.some(e => e.key === 'PORT' && e.message.includes('number'))).toBe(true);
  });

  test('reports pattern mismatch', () => {
    const env = { PORT: '80', API_URL: 'https://ok.com', TAG: 'bad-tag' };
    const errs = validateAgainstSchema(env, schema);
    expect(errs.some(e => e.key === 'TAG')).toBe(true);
  });

  test('skips optional missing keys', () => {
    const env = { PORT: '80', API_URL: 'https://ok.com' };
    const errs = validateAgainstSchema(env, schema);
    expect(errs.some(e => e.key === 'DEBUG')).toBe(false);
  });
});

describe('hasSchemaErrors', () => {
  test('true when errors present', () => expect(hasSchemaErrors([{ key: 'X', message: 'bad' }])).toBe(true));
  test('false when empty', () => expect(hasSchemaErrors([])).toBe(false));
});

describe('formatSchemaReport', () => {
  test('success message on no errors', () => {
    expect(formatSchemaReport([])).toBe('Schema validation passed.');
  });

  test('lists errors', () => {
    const report = formatSchemaReport([{ key: 'PORT', message: 'expected number' }]);
    expect(report).toContain('[PORT]');
    expect(report).toContain('expected number');
    expect(report).toContain('1 error');
  });
});
