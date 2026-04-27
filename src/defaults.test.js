const { applyDefaults, buildDefaultsContent, formatDefaultsReport } = require('./defaults');

describe('applyDefaults', () => {
  test('fills keys present in base but missing in target', () => {
    const base = { A: '1', B: '2', C: '3' };
    const target = { A: 'override' };
    const { merged, filled } = applyDefaults(base, target);
    expect(merged).toEqual({ A: 'override', B: '2', C: '3' });
    expect(filled).toEqual(['B', 'C']);
  });

  test('does not overwrite existing target keys', () => {
    const base = { X: 'base_val' };
    const target = { X: 'target_val' };
    const { merged, filled } = applyDefaults(base, target);
    expect(merged.X).toBe('target_val');
    expect(filled).toHaveLength(0);
  });

  test('returns empty filled array when target already has all keys', () => {
    const base = { A: '1', B: '2' };
    const target = { A: 'a', B: 'b' };
    const { filled } = applyDefaults(base, target);
    expect(filled).toEqual([]);
  });

  test('handles empty base', () => {
    const { merged, filled } = applyDefaults({}, { FOO: 'bar' });
    expect(merged).toEqual({ FOO: 'bar' });
    expect(filled).toEqual([]);
  });

  test('handles empty target', () => {
    const base = { K: 'v' };
    const { merged, filled } = applyDefaults(base, {});
    expect(merged).toEqual({ K: 'v' });
    expect(filled).toEqual(['K']);
  });
});

describe('buildDefaultsContent', () => {
  test('produces KEY=VALUE lines', () => {
    const content = buildDefaultsContent({ FOO: 'bar', BAZ: '123' });
    expect(content).toContain('FOO=bar');
    expect(content).toContain('BAZ=123');
    expect(content.endsWith('\n')).toBe(true);
  });
});

describe('formatDefaultsReport', () => {
  test('reports filled keys', () => {
    const report = formatDefaultsReport(['B', 'C'], '.env.staging');
    expect(report).toContain('2 missing key(s)');
    expect(report).toContain('+ B');
    expect(report).toContain('+ C');
  });

  test('reports no missing keys', () => {
    const report = formatDefaultsReport([], '.env.staging');
    expect(report).toContain('already complete');
  });
});
