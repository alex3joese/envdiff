const { expandValue, interpolateEnv, findUnresolved } = require('./interpolate');

describe('expandValue', () => {
  test('expands a simple reference', () => {
    expect(expandValue('${HOST}:8080', { HOST: 'localhost' })).toBe('localhost:8080');
  });

  test('expands multiple references', () => {
    const map = { PROTO: 'https', HOST: 'example.com', PORT: '443' };
    expect(expandValue('${PROTO}://${HOST}:${PORT}', map)).toBe('https://example.com:443');
  });

  test('leaves unknown references intact', () => {
    expect(expandValue('${UNKNOWN}', {})).toBe('${UNKNOWN}');
  });

  test('resolves nested references', () => {
    const map = { A: '${B}', B: 'hello' };
    expect(expandValue('${A}', map)).toBe('hello');
  });

  test('handles circular references without infinite loop', () => {
    const map = { A: '${B}', B: '${A}' };
    const result = expandValue('${A}', map);
    // circular — at least one ref must remain unresolved
    expect(result).toMatch(/\$\{[AB]\}/);
  });

  test('returns plain string unchanged', () => {
    expect(expandValue('no-refs', { FOO: 'bar' })).toBe('no-refs');
  });
});

describe('interpolateEnv', () => {
  test('resolves all values in a map', () => {
    const map = { HOST: 'localhost', PORT: '3000', URL: '${HOST}:${PORT}' };
    expect(interpolateEnv(map)).toEqual({
      HOST: 'localhost',
      PORT: '3000',
      URL: 'localhost:3000',
    });
  });

  test('leaves unresolvable refs intact', () => {
    const map = { KEY: '${MISSING}/path' };
    expect(interpolateEnv(map).KEY).toBe('${MISSING}/path');
  });

  test('does not mutate original map', () => {
    const map = { A: '${B}', B: 'val' };
    interpolateEnv(map);
    expect(map.A).toBe('${B}');
  });
});

describe('findUnresolved', () => {
  test('returns keys with leftover references', () => {
    const result = findUnresolved({ A: 'ok', B: '${MISSING}', C: 'also ${GONE}' });
    expect(result).toEqual(expect.arrayContaining(['B', 'C']));
    expect(result).not.toContain('A');
  });

  test('returns empty array when all resolved', () => {
    expect(findUnresolved({ A: 'hello', B: 'world' })).toEqual([]);
  });
});
