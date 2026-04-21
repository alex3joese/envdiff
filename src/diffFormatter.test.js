const { formatDiffJson, applyDiffFormat } = require('./diffFormatter');

const sampleDiff = {
  added: { NEW_KEY: 'hello' },
  removed: { OLD_KEY: 'bye' },
  changed: { CHANGED_KEY: { from: 'v1', to: 'v2' } },
};

const emptyDiff = { added: {}, removed: {}, changed: {} };

describe('formatDiffJson', () => {
  test('includes added, removed, changed sections', () => {
    const result = formatDiffJson(sampleDiff);
    expect(result.added).toEqual({ NEW_KEY: 'hello' });
    expect(result.removed).toEqual({ OLD_KEY: 'bye' });
    expect(result.changed).toEqual({ CHANGED_KEY: { from: 'v1', to: 'v2' } });
  });

  test('summary counts are correct', () => {
    const result = formatDiffJson(sampleDiff);
    expect(result.summary.addedCount).toBe(1);
    expect(result.summary.removedCount).toBe(1);
    expect(result.summary.changedCount).toBe(1);
  });

  test('summary is zero for empty diff', () => {
    const result = formatDiffJson(emptyDiff);
    expect(result.summary.addedCount).toBe(0);
    expect(result.summary.removedCount).toBe(0);
    expect(result.summary.changedCount).toBe(0);
  });
});

describe('applyDiffFormat', () => {
  test('json format returns valid JSON string', () => {
    const output = applyDiffFormat(sampleDiff, 'json');
    expect(() => JSON.parse(output)).not.toThrow();
    const parsed = JSON.parse(output);
    expect(parsed.summary.addedCount).toBe(1);
  });

  test('text format returns a non-empty string for non-empty diff', () => {
    const output = applyDiffFormat(sampleDiff, 'text');
    expect(typeof output).toBe('string');
    expect(output.length).toBeGreaterThan(0);
  });

  test('text format mentions no differences for empty diff', () => {
    const output = applyDiffFormat(emptyDiff, 'text');
    expect(output).toMatch(/no differences/i);
  });

  test('defaults to text format', () => {
    const output = applyDiffFormat(emptyDiff);
    expect(output).toMatch(/no differences/i);
  });
});
