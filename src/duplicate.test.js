const { findDuplicateKeys, findDuplicateValues, detectDuplicates } = require('./duplicate');

describe('findDuplicateKeys', () => {
  test('returns empty array when no duplicates', () => {
    const content = 'FOO=1\nBAR=2\nBAZ=3';
    expect(findDuplicateKeys(content)).toEqual([]);
  });

  test('detects a single duplicate key', () => {
    const content = 'FOO=1\nBAR=2\nFOO=3';
    expect(findDuplicateKeys(content)).toEqual(['FOO']);
  });

  test('detects multiple duplicate keys', () => {
    const content = 'FOO=1\nBAR=2\nFOO=3\nBAR=4';
    const result = findDuplicateKeys(content);
    expect(result).toContain('FOO');
    expect(result).toContain('BAR');
  });

  test('ignores comment lines and blank lines', () => {
    const content = '# FOO=1\n\nFOO=2\nBAR=3';
    expect(findDuplicateKeys(content)).toEqual([]);
  });

  test('handles lines without equals sign gracefully', () => {
    const content = 'INVALID\nFOO=1\nFOO=2';
    expect(findDuplicateKeys(content)).toEqual(['FOO']);
  });
});

describe('findDuplicateValues', () => {
  test('returns empty object when all values are unique', () => {
    const map = { FOO: 'a', BAR: 'b', BAZ: 'c' };
    expect(findDuplicateValues(map)).toEqual({});
  });

  test('detects keys sharing the same value', () => {
    const map = { FOO: 'secret', BAR: 'other', BAZ: 'secret' };
    const result = findDuplicateValues(map);
    expect(result['secret']).toEqual(expect.arrayContaining(['FOO', 'BAZ']));
  });

  test('handles empty map', () => {
    expect(findDuplicateValues({})).toEqual({});
  });
});

describe('detectDuplicates', () => {
  test('aggregates results per file', () => {
    const files = {
      '.env.dev': {
        content: 'FOO=1\nBAR=2\nFOO=3',
        parsed: { FOO: '3', BAR: '2' },
      },
      '.env.prod': {
        content: 'FOO=1\nBAR=2',
        parsed: { FOO: 'same', BAR: 'same' },
      },
    };
    const { duplicateKeys, duplicateValues } = detectDuplicates(files);
    expect(duplicateKeys['.env.dev']).toContain('FOO');
    expect(duplicateKeys['.env.prod']).toBeUndefined();
    expect(duplicateValues['.env.prod']['same']).toEqual(expect.arrayContaining(['FOO', 'BAR']));
  });

  test('returns empty objects when no issues found', () => {
    const files = {
      '.env': { content: 'A=1\nB=2', parsed: { A: '1', B: '2' } },
    };
    const result = detectDuplicates(files);
    expect(result.duplicateKeys).toEqual({});
    expect(result.duplicateValues).toEqual({});
  });
});
