const { toJson, toYaml, toEnv, fromJson, applyConvert } = require('./convert');

describe('toJson', () => {
  it('serializes env map to pretty JSON', () => {
    const result = toJson({ FOO: 'bar', NUM: '42' });
    expect(JSON.parse(result)).toEqual({ FOO: 'bar', NUM: '42' });
    expect(result).toContain('\n');
  });

  it('handles empty map', () => {
    expect(toJson({})).toBe('{}');
  });
});

describe('toYaml', () => {
  it('renders simple key: value pairs', () => {
    const result = toYaml({ APP: 'myapp', PORT: '3000' });
    expect(result).toContain('APP: myapp');
    expect(result).toContain('PORT: 3000');
  });

  it('quotes values with special characters', () => {
    const result = toYaml({ URL: 'http://example.com:8080' });
    expect(result).toContain('URL: "http://example.com:8080"');
  });

  it('quotes empty string values', () => {
    const result = toYaml({ EMPTY: '' });
    expect(result).toContain('EMPTY: ""');
  });
});

describe('toEnv', () => {
  it('renders simple KEY=VALUE pairs', () => {
    const result = toEnv({ FOO: 'bar', BAZ: 'qux' });
    expect(result).toContain('FOO=bar');
    expect(result).toContain('BAZ=qux');
  });

  it('quotes values with spaces', () => {
    const result = toEnv({ NAME: 'hello world' });
    expect(result).toContain('NAME="hello world"');
  });

  it('quotes empty values', () => {
    const result = toEnv({ EMPTY: '' });
    expect(result).toContain('EMPTY=""');
  });
});

describe('fromJson', () => {
  it('parses a JSON object into an env map', () => {
    const result = fromJson('{"FOO":"bar","NUM":42}');
    expect(result).toEqual({ FOO: 'bar', NUM: '42' });
  });

  it('throws on non-object JSON', () => {
    expect(() => fromJson('["a","b"]')).toThrow();
    expect(() => fromJson('"just a string"')).toThrow();
  });
});

describe('applyConvert', () => {
  const map = { KEY: 'val' };

  it('dispatches to toJson', () => {
    expect(applyConvert(map, 'json')).toBe(toJson(map));
  });

  it('dispatches to toYaml', () => {
    expect(applyConvert(map, 'yaml')).toBe(toYaml(map));
  });

  it('dispatches to toEnv', () => {
    expect(applyConvert(map, 'env')).toBe(toEnv(map));
  });

  it('throws on unknown format', () => {
    expect(() => applyConvert(map, 'xml')).toThrow('Unsupported format: xml');
  });
});
