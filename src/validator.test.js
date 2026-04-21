const { validateEnv, validateAll, isBoolean, isNumeric } = require('./validator');

describe('isBoolean', () => {
  test('recognizes truthy strings', () => {
    expect(isBoolean('true')).toBe(true);
    expect(isBoolean('1')).toBe(true);
    expect(isBoolean('yes')).toBe(true);
    expect(isBoolean('TRUE')).toBe(true);
  });

  test('recognizes falsy strings', () => {
    expect(isBoolean('false')).toBe(true);
    expect(isBoolean('0')).toBe(true);
    expect(isBoolean('no')).toBe(true);
  });

  test('rejects non-boolean strings', () => {
    expect(isBoolean('maybe')).toBe(false);
    expect(isBoolean('2')).toBe(false);
  });
});

describe('isNumeric', () => {
  test('accepts numeric strings', () => {
    expect(isNumeric('42')).toBe(true);
    expect(isNumeric('3.14')).toBe(true);
    expect(isNumeric('-7')).toBe(true);
  });

  test('rejects non-numeric strings', () => {
    expect(isNumeric('abc')).toBe(false);
    expect(isNumeric('')).toBe(false);
  });
});

describe('validateEnv', () => {
  const env = { PORT: '3000', DEBUG: 'true', NAME: 'myapp', SECRET: '' };

  test('passes with no rules', () => {
    expect(validateEnv(env, [])).toEqual([]);
  });

  test('catches missing required key', () => {
    const errors = validateEnv(env, [{ key: 'SECRET', required: true }]);
    expect(errors).toHaveLength(1);
    expect(errors[0].key).toBe('SECRET');
  });

  test('catches wrong type: number', () => {
    const errors = validateEnv(env, [{ key: 'NAME', type: 'number' }]);
    expect(errors[0].message).toMatch(/numeric/);
  });

  test('catches wrong type: boolean', () => {
    const errors = validateEnv(env, [{ key: 'PORT', type: 'boolean' }]);
    expect(errors[0].message).toMatch(/boolean/);
  });

  test('catches pattern mismatch', () => {
    const errors = validateEnv(env, [{ key: 'PORT', pattern: '^[a-z]+$' }]);
    expect(errors[0].message).toMatch(/pattern/);
  });

  test('passes pattern match', () => {
    const errors = validateEnv(env, [{ key: 'PORT', pattern: '^\\d+$' }]);
    expect(errors).toHaveLength(0);
  });

  test('skips optional missing keys', () => {
    const errors = validateEnv(env, [{ key: 'MISSING_KEY', type: 'number' }]);
    expect(errors).toHaveLength(0);
  });
});

describe('validateAll', () => {
  test('returns errors keyed by filename', () => {
    const envMap = {
      '.env.production': { PORT: 'abc' },
      '.env.development': { PORT: '3000' },
    };
    const rules = [{ key: 'PORT', type: 'number' }];
    const results = validateAll(envMap, rules);
    expect(results['.env.production']).toHaveLength(1);
    expect(results['.env.development']).toBeUndefined();
  });

  test('returns empty object when all pass', () => {
    const envMap = { '.env': { PORT: '8080' } };
    const results = validateAll(envMap, [{ key: 'PORT', type: 'number' }]);
    expect(results).toEqual({});
  });
});
