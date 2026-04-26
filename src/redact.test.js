const { isSensitiveKey, maskValue, redactEnv, redactAll } = require('./redact');

describe('isSensitiveKey', () => {
  test('detects password keys', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('password')).toBe(true);
  });

  test('detects token keys', () => {
    expect(isSensitiveKey('AUTH_TOKEN')).toBe(true);
    expect(isSensitiveKey('ACCESS_TOKEN')).toBe(true);
  });

  test('detects api key variants', () => {
    expect(isSensitiveKey('API_KEY')).toBe(true);
    expect(isSensitiveKey('APIKEY')).toBe(true);
  });

  test('returns false for safe keys', () => {
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('HOST')).toBe(false);
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
  });

  test('respects custom patterns', () => {
    expect(isSensitiveKey('MY_CUSTOM_FIELD', [/custom/i])).toBe(true);
    expect(isSensitiveKey('SAFE_FIELD', [/custom/i])).toBe(false);
  });
});

describe('maskValue', () => {
  test('replaces value with asterisks', () => {
    expect(maskValue('hello')).toBe('*****');
  });

  test('masks empty string as single asterisk', () => {
    expect(maskValue('')).toBe('*');
  });

  test('masks long values', () => {
    const val = 'a'.repeat(20);
    expect(maskValue(val)).toBe('*'.repeat(20));
  });
});

describe('redactEnv', () => {
  const env = { PORT: '3000', DB_PASSWORD: 'secret', API_KEY: 'abc123', HOST: 'localhost' };

  test('redacts sensitive keys', () => {
    const result = redactEnv(env);
    expect(result.DB_PASSWORD).toMatch(/^\*+$/);
    expect(result.API_KEY).toMatch(/^\*+$/);
  });

  test('preserves safe keys', () => {
    const result = redactEnv(env);
    expect(result.PORT).toBe('3000');
    expect(result.HOST).toBe('localhost');
  });

  test('does not mutate original', () => {
    redactEnv(env);
    expect(env.DB_PASSWORD).toBe('secret');
  });
});

describe('redactAll', () => {
  test('redacts across multiple env maps', () => {
    const envMap = {
      '.env.prod': { SECRET: 'val1', PORT: '80' },
      '.env.dev': { SECRET: 'val2', PORT: '3000' },
    };
    const result = redactAll(envMap);
    expect(result['.env.prod'].SECRET).toMatch(/^\*+$/);
    expect(result['.env.dev'].SECRET).toMatch(/^\*+$/);
    expect(result['.env.prod'].PORT).toBe('80');
  });
});
