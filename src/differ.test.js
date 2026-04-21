const { diffEnvs, isIdentical } = require('./differ');

describe('diffEnvs', () => {
  test('detects added keys', () => {
    const result = diffEnvs({ A: '1' }, { A: '1', B: '2' });
    expect(result.added).toEqual({ B: '2' });
    expect(result.removed).toEqual({});
    expect(result.changed).toEqual({});
  });

  test('detects removed keys', () => {
    const result = diffEnvs({ A: '1', B: '2' }, { A: '1' });
    expect(result.removed).toEqual({ B: '2' });
    expect(result.added).toEqual({});
    expect(result.changed).toEqual({});
  });

  test('detects changed values', () => {
    const result = diffEnvs({ A: 'old' }, { A: 'new' });
    expect(result.changed).toEqual({ A: { from: 'old', to: 'new' } });
    expect(result.added).toEqual({});
    expect(result.removed).toEqual({});
  });

  test('handles empty envs', () => {
    const result = diffEnvs({}, {});
    expect(result.added).toEqual({});
    expect(result.removed).toEqual({});
    expect(result.changed).toEqual({});
  });

  test('handles all three change types at once', () => {
    const base = { KEEP: 'same', GONE: 'bye', CHANGE: 'v1' };
    const head = { KEEP: 'same', NEW: 'hi', CHANGE: 'v2' };
    const result = diffEnvs(base, head);
    expect(result.added).toEqual({ NEW: 'hi' });
    expect(result.removed).toEqual({ GONE: 'bye' });
    expect(result.changed).toEqual({ CHANGE: { from: 'v1', to: 'v2' } });
  });
});

describe('isIdentical', () => {
  test('returns true for identical maps', () => {
    expect(isIdentical({ A: '1' }, { A: '1' })).toBe(true);
  });

  test('returns false when keys differ', () => {
    expect(isIdentical({ A: '1' }, { A: '1', B: '2' })).toBe(false);
  });

  test('returns false when values differ', () => {
    expect(isIdentical({ A: '1' }, { A: '2' })).toBe(false);
  });

  test('returns true for two empty maps', () => {
    expect(isIdentical({}, {})).toBe(true);
  });
});
