const { resolveConfig, mergeConfig } = require('./config');

describe('resolveConfig', () => {
  it('returns defaults when no options provided', () => {
    const config = resolveConfig();
    expect(config.format).toBe('text');
    expect(config.ignoreKeys).toEqual([]);
    expect(config.strict).toBe(false);
  });

  it('parses ignore keys from comma-separated string', () => {
    const config = resolveConfig({ ignore: 'SECRET,TOKEN, DEBUG' });
    expect(config.ignoreKeys).toEqual(['SECRET', 'TOKEN', 'DEBUG']);
  });

  it('falls back to text for invalid format', () => {
    const config = resolveConfig({ format: 'xml' });
    expect(config.format).toBe('text');
  });

  it('accepts json format', () => {
    const config = resolveConfig({ format: 'json' });
    expect(config.format).toBe('json');
  });

  it('sets strict mode', () => {
    const config = resolveConfig({ strict: true });
    expect(config.strict).toBe(true);
  });

  it('filters out empty keys from ignore list', () => {
    const config = resolveConfig({ ignore: 'KEY1,,KEY2,' });
    expect(config.ignoreKeys).toEqual(['KEY1', 'KEY2']);
  });
});

describe('mergeConfig', () => {
  it('uses file config as base', () => {
    const config = mergeConfig({ format: 'json', ignoreKeys: ['FOO'], strict: true });
    expect(config.format).toBe('json');
    expect(config.ignoreKeys).toContain('FOO');
    expect(config.strict).toBe(true);
  });

  it('CLI options override file config', () => {
    const config = mergeConfig(
      { format: 'json', ignoreKeys: ['FOO'] },
      { format: 'text', ignore: 'BAR' }
    );
    expect(config.format).toBe('text');
    expect(config.ignoreKeys).toEqual(['BAR']);
  });

  it('handles empty file config', () => {
    const config = mergeConfig({}, { format: 'json' });
    expect(config.format).toBe('json');
  });
});
