const { parseEnv } = require('./parser');

describe('parseEnv', () => {
  test('parses simple key=value pairs', () => {
    const input = 'FOO=bar\nBAZ=qux';
    expect(parseEnv(input)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  test('ignores blank lines and comments', () => {
    const input = '\n# this is a comment\nKEY=value\n';
    expect(parseEnv(input)).toEqual({ KEY: 'value' });
  });

  test('strips double-quoted values', () => {
    const input = 'DB_URL="postgres://localhost/mydb"';
    expect(parseEnv(input)).toEqual({ DB_URL: 'postgres://localhost/mydb' });
  });

  test('strips single-quoted values', () => {
    const input = "SECRET='mysecret'";
    expect(parseEnv(input)).toEqual({ SECRET: 'mysecret' });
  });

  test('strips inline comments from unquoted values', () => {
    const input = 'PORT=3000 # default port';
    expect(parseEnv(input)).toEqual({ PORT: '3000' });
  });

  test('handles empty values', () => {
    const input = 'EMPTY=';
    expect(parseEnv(input)).toEqual({ EMPTY: '' });
  });

  test('handles values with equals sign', () => {
    const input = 'TOKEN=abc=def=ghi';
    expect(parseEnv(input)).toEqual({ TOKEN: 'abc=def=ghi' });
  });

  test('returns empty object for empty input', () => {
    expect(parseEnv('')).toEqual({});
  });

  test('trims whitespace around keys', () => {
    const input = '  KEY  =  value  ';
    expect(parseEnv(input)).toEqual({ KEY: 'value' });
  });
});
