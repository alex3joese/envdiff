const {
  isPlaceholder,
  findPlaceholders,
  detectPlaceholders,
  formatPlaceholderReport,
  hasPlaceholders,
} = require('./placeholder');

describe('isPlaceholder', () => {
  it('detects CHANGEME', () => {
    expect(isPlaceholder('CHANGEME')).toBe(true);
    expect(isPlaceholder('changeme')).toBe(true);
  });

  it('detects TODO and FIXME', () => {
    expect(isPlaceholder('TODO')).toBe(true);
    expect(isPlaceholder('fixme')).toBe(true);
  });

  it('detects angle bracket placeholders', () => {
    expect(isPlaceholder('<your-secret>')).toBe(true);
    expect(isPlaceholder('[insert-value]')).toBe(true);
  });

  it('detects xxx and TBD', () => {
    expect(isPlaceholder('xxx')).toBe(true);
    expect(isPlaceholder('TBD')).toBe(true);
  });

  it('returns false for real values', () => {
    expect(isPlaceholder('mysecretpassword')).toBe(false);
    expect(isPlaceholder('https://example.com/api')).toBe(false);
    expect(isPlaceholder('true')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isPlaceholder('')).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isPlaceholder(null)).toBe(false);
    expect(isPlaceholder(undefined)).toBe(false);
  });
});

describe('findPlaceholders', () => {
  it('returns keys with placeholder values', () => {
    const map = { API_KEY: 'CHANGEME', DB_URL: 'postgres://localhost/db', SECRET: '<secret>' };
    const result = findPlaceholders(map);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.key)).toEqual(expect.arrayContaining(['API_KEY', 'SECRET']));
  });

  it('returns empty array when no placeholders', () => {
    const map = { HOST: 'localhost', PORT: '5432' };
    expect(findPlaceholders(map)).toEqual([]);
  });
});

describe('detectPlaceholders', () => {
  it('groups results by file name', () => {
    const maps = {
      '.env.prod': { API_KEY: 'CHANGEME', HOST: 'prod.host.com' },
      '.env.staging': { HOST: 'staging.host.com', TOKEN: 'real-token' },
    };
    const result = detectPlaceholders(maps);
    expect(Object.keys(result)).toEqual(['.env.prod']);
    expect(result['.env.prod']).toHaveLength(1);
    expect(result['.env.prod'][0].key).toBe('API_KEY');
  });

  it('returns empty object when nothing detected', () => {
    const maps = { '.env': { A: '1', B: '2' } };
    expect(detectPlaceholders(maps)).toEqual({});
  });
});

describe('formatPlaceholderReport', () => {
  it('returns no-issue message when empty', () => {
    expect(formatPlaceholderReport({})).toBe('No placeholder values detected.');
  });

  it('formats detected placeholders', () => {
    const detected = { '.env.prod': [{ key: 'API_KEY', value: 'CHANGEME' }] };
    const report = formatPlaceholderReport(detected);
    expect(report).toContain('.env.prod');
    expect(report).toContain('API_KEY');
    expect(report).toContain('CHANGEME');
  });
});

describe('hasPlaceholders', () => {
  it('returns true when there are hits', () => {
    expect(hasPlaceholders({ '.env': [{ key: 'X', value: 'TODO' }] })).toBe(true);
  });

  it('returns false when empty', () => {
    expect(hasPlaceholders({})).toBe(false);
  });
});
