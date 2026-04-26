const { resolveRedactConfig, redactHelp, DEFAULT_PATTERNS } = require('./redactConfig');

describe('resolveRedactConfig', () => {
  test('returns defaults when no flags given', () => {
    const config = resolveRedactConfig({});
    expect(config.output).toBe('file');
    expect(config.outDir).toBeNull();
    expect(config.customPatterns).toEqual([]);
  });

  test('sets output to stdout when flag present', () => {
    const config = resolveRedactConfig({ stdout: true });
    expect(config.output).toBe('stdout');
  });

  test('sets outDir from --out-dir flag', () => {
    const config = resolveRedactConfig({ 'out-dir': '/tmp/out' });
    expect(config.outDir).toBe('/tmp/out');
  });

  test('sets outDir from --outDir flag', () => {
    const config = resolveRedactConfig({ outDir: '/tmp/out2' });
    expect(config.outDir).toBe('/tmp/out2');
  });

  test('parses single pattern string', () => {
    const config = resolveRedactConfig({ pattern: 'mykey' });
    expect(config.customPatterns).toHaveLength(1);
    expect(config.customPatterns[0]).toBeInstanceOf(RegExp);
    expect('mykey').toMatch(config.customPatterns[0]);
  });

  test('parses multiple patterns array', () => {
    const config = resolveRedactConfig({ pattern: ['foo', 'bar'] });
    expect(config.customPatterns).toHaveLength(2);
  });
});

describe('DEFAULT_PATTERNS', () => {
  test('matches common sensitive key names', () => {
    const sensitive = ['PASSWORD', 'api_key', 'AUTH_TOKEN', 'secret', 'PRIVATE_KEY'];
    for (const key of sensitive) {
      expect(DEFAULT_PATTERNS.some((p) => p.test(key))).toBe(true);
    }
  });

  test('does not match benign keys', () => {
    const safe = ['PORT', 'HOST', 'NODE_ENV', 'LOG_LEVEL'];
    for (const key of safe) {
      expect(DEFAULT_PATTERNS.some((p) => p.test(key))).toBe(false);
    }
  });
});

describe('redactHelp', () => {
  test('returns a non-empty string', () => {
    const help = redactHelp();
    expect(typeof help).toBe('string');
    expect(help.length).toBeGreaterThan(0);
    expect(help).toContain('envdiff redact');
  });
});
