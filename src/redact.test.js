const { isSensitiveKey, maskValue, redactEnv, redactAll, DEFAULT_PATTERNS } = require('./redact');

describe('isSensitiveKey', () => {
  test('detects password keys', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('user_password')).toBe(true);
  });

  test('detects token keys', () => {
    expect(isSensitiveKey('ACCESS_TOKEN')).toBe(true);
    expect(isSensitiveKey('github_token')).toBe(true);
  });

  test('detects api key variants', () => {
    expect(isSensitiveKey('API_KEY')).toBe(true);
    expect(isSensitiveKey('STRIPE_APIKEY')).toBe(true);
  });

  test('does not flag safe keys', () => {
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
    expect(isSensitiveKey('DATABASE_URL')).toBe(false);
  });

  test('supports custom patterns', () => {
    expect(isSensitiveKey('MY_PIN', [/pin/i])).toBe(true);
    expect(isSensitiveKey('API_KEY', [/pin/i])).toBe(false);
  });
});

describe('maskValue', () => {
  test('masks long values showing first 2 chars', () => {
    expect(maskValue('supersecret')).toBe('su******');
  });

  test('masks short values entirely', () => {
    expect(maskValue('ab')).toBe('***');
    expect(maskValue('x')).toBe('***');
  });

  test('handles empty string', () => {
    expect(maskValue('')).toBe('***');
  });

  test('caps mask length at 6 stars', () => {
    expect(maskValue('averylongsecretvalue')).toBe('av******');
  });
});

describe('redactEnv', () => {
  const env = {
    PORT: '3000',
    DB_PASSWORD: 'hunter2',
    API_KEY: 'abc123xyz',
    NODE_ENV: 'production',
  };

  test('masks sensitive keys and leaves others intact', () => {
    const result = redactEnv(env);
    expect(result.PORT).toBe('3000');
    expect(result.NODE_ENV).toBe('production');
    expect(result.DB_PASSWORD).not.toBe('hunter2');
    expect(result.API_KEY).not.toBe('abc123xyz');
  });

  test('does not mutate original', () => {
    redactEnv(env);
    expect(env.DB_PASSWORD).toBe('hunter2');
  });
});

describe('redactAll', () => {
  test('redacts across multiple env files', () => {
    const envs = {
      '.env.dev': { PORT: '3000', SECRET_KEY: 'devsecret' },
      '.env.prod': { PORT: '8080', SECRET_KEY: 'prodsecret' },
    };
    const result = redactAll(envs);
    expect(result['.env.dev'].PORT).toBe('3000');
    expect(result['.env.dev'].SECRET_KEY).not.toBe('devsecret');
    expect(result['.env.prod'].SECRET_KEY).not.toBe('prodsecret');
  });
});
