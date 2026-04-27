const { encryptValue, decryptValue, encryptEnv, decryptEnv } = require('./encrypt');

const PASS = 'supersecret';

describe('encryptValue / decryptValue', () => {
  test('round-trips a plain string', () => {
    const cipher = encryptValue('hello', PASS);
    expect(cipher).not.toBe('hello');
    expect(decryptValue(cipher, PASS)).toBe('hello');
  });

  test('produces different ciphertext each call (random IV)', () => {
    const a = encryptValue('hello', PASS);
    const b = encryptValue('hello', PASS);
    expect(a).not.toBe(b);
  });

  test('throws on bad passphrase', () => {
    const cipher = encryptValue('hello', PASS);
    expect(() => decryptValue(cipher, 'wrongpass')).toThrow();
  });

  test('throws on malformed ciphertext', () => {
    expect(() => decryptValue('notvalid', PASS)).toThrow('Invalid encrypted format');
  });
});

describe('encryptEnv', () => {
  const env = { SECRET: 'abc', PUBLIC: 'xyz' };

  test('encrypts all keys by default', () => {
    const result = encryptEnv(env, PASS);
    expect(result.SECRET).toMatch(/^enc:/);
    expect(result.PUBLIC).toMatch(/^enc:/);
  });

  test('encrypts only specified keys', () => {
    const result = encryptEnv(env, PASS, ['SECRET']);
    expect(result.SECRET).toMatch(/^enc:/);
    expect(result.PUBLIC).toBe('xyz');
  });
});

describe('decryptEnv', () => {
  test('decrypts enc: prefixed values and leaves others alone', () => {
    const encrypted = encryptEnv({ SECRET: 'abc', PUBLIC: 'xyz' }, PASS, ['SECRET']);
    const result = decryptEnv(encrypted, PASS);
    expect(result.SECRET).toBe('abc');
    expect(result.PUBLIC).toBe('xyz');
  });

  test('full round-trip encrypt all then decrypt', () => {
    const env = { A: 'foo', B: 'bar' };
    const enc = encryptEnv(env, PASS);
    const dec = decryptEnv(enc, PASS);
    expect(dec).toEqual(env);
  });
});
