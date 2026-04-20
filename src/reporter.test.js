import { formatReport, summarize } from './reporter.js';

// Sample issues for testing
const sampleIssues = [
  {
    key: 'DATABASE_URL',
    type: 'missing',
    presentIn: ['production'],
    missingIn: ['staging', 'development'],
  },
  {
    key: 'API_KEY',
    type: 'missing',
    presentIn: ['production', 'staging'],
    missingIn: ['development'],
  },
  {
    key: 'LOG_LEVEL',
    type: 'mismatch',
    values: {
      production: 'error',
      staging: 'warn',
      development: 'debug',
    },
  },
  {
    key: 'PORT',
    type: 'mismatch',
    values: {
      production: '443',
      staging: '8080',
      development: '3000',
    },
  },
];

describe('summarize', () => {
  test('returns zero counts for empty issues', () => {
    const result = summarize([]);
    expect(result.total).toBe(0);
    expect(result.missing).toBe(0);
    expect(result.mismatched).toBe(0);
  });

  test('counts missing and mismatched issues correctly', () => {
    const result = summarize(sampleIssues);
    expect(result.total).toBe(4);
    expect(result.missing).toBe(2);
    expect(result.mismatched).toBe(2);
  });

  test('counts only missing issues', () => {
    const missingOnly = sampleIssues.filter((i) => i.type === 'missing');
    const result = summarize(missingOnly);
    expect(result.total).toBe(2);
    expect(result.missing).toBe(2);
    expect(result.mismatched).toBe(0);
  });

  test('counts only mismatch issues', () => {
    const mismatchOnly = sampleIssues.filter((i) => i.type === 'mismatch');
    const result = summarize(mismatchOnly);
    expect(result.total).toBe(2);
    expect(result.missing).toBe(0);
    expect(result.mismatched).toBe(2);
  });
});

describe('formatReport', () => {
  test('returns a string', () => {
    const result = formatReport(sampleIssues, ['production', 'staging', 'development']);
    expect(typeof result).toBe('string');
  });

  test('includes all issue keys in output', () => {
    const result = formatReport(sampleIssues, ['production', 'staging', 'development']);
    expect(result).toContain('DATABASE_URL');
    expect(result).toContain('API_KEY');
    expect(result).toContain('LOG_LEVEL');
    expect(result).toContain('PORT');
  });

  test('includes environment names in output', () => {
    const result = formatReport(sampleIssues, ['production', 'staging', 'development']);
    expect(result).toContain('production');
    expect(result).toContain('staging');
    expect(result).toContain('development');
  });

  test('includes summary line with counts', () => {
    const result = formatReport(sampleIssues, ['production', 'staging', 'development']);
    expect(result).toMatch(/4 issue/i);
    expect(result).toMatch(/2 missing/i);
    expect(result).toMatch(/2 mismatch/i);
  });

  test('handles empty issues gracefully', () => {
    const result = formatReport([], ['production', 'staging']);
    expect(result).toMatch(/no issues/i);
  });

  test('shows missing environment names for missing key issues', () => {
    const result = formatReport(
      [sampleIssues[0]],
      ['production', 'staging', 'development']
    );
    expect(result).toContain('staging');
    expect(result).toContain('development');
  });

  test('shows differing values for mismatch issues', () => {
    const result = formatReport(
      [sampleIssues[2]],
      ['production', 'staging', 'development']
    );
    expect(result).toContain('error');
    expect(result).toContain('warn');
    expect(result).toContain('debug');
  });
});
