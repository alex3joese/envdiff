const { lintLine, lintEnvContent, lintFiles, hasLintErrors } = require('./lint');

describe('lintLine', () => {
  it('returns no issues for valid line', () => {
    expect(lintLine('API_KEY=abc123', 1)).toEqual([]);
  });

  it('ignores comment lines', () => {
    expect(lintLine('# this is a comment', 1)).toEqual([]);
  });

  it('ignores empty lines', () => {
    expect(lintLine('', 1)).toEqual([]);
  });

  it('flags space before equals', () => {
    const issues = lintLine('API_KEY =value', 1);
    expect(issues.some((i) => i.message === 'space before equals sign')).toBe(true);
  });

  it('flags lowercase key', () => {
    const issues = lintLine('api_key=value', 1);
    expect(issues.some((i) => i.message === 'key should be uppercase')).toBe(true);
  });

  it('flags empty value', () => {
    const issues = lintLine('API_KEY=', 1);
    expect(issues.some((i) => i.message.includes('empty value'))).toBe(true);
  });

  it('flags mismatched double quotes', () => {
    const issues = lintLine('API_KEY="unclosed', 1);
    expect(issues.some((i) => i.message === 'mismatched quotes in value')).toBe(true);
  });

  it('flags mismatched single quotes', () => {
    const issues = lintLine("API_KEY='unclosed", 1);
    expect(issues.some((i) => i.message === 'mismatched quotes in value')).toBe(true);
  });

  it('flags missing equals sign', () => {
    const issues = lintLine('BADLINE', 1);
    expect(issues.some((i) => i.message === 'missing equals sign')).toBe(true);
  });
});

describe('lintEnvContent', () => {
  it('returns issues across multiple lines', () => {
    const content = 'API_KEY=\nDB_URL=postgres://host\napi_secret=oops';
    const issues = lintEnvContent(content);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((i) => i.line === 1)).toBe(true);
    expect(issues.some((i) => i.line === 3)).toBe(true);
  });
});

describe('lintFiles', () => {
  it('returns results keyed by filename', () => {
    const fileMap = { '.env': 'API_KEY=\n', '.env.prod': 'API_KEY=secret\n' };
    const results = lintFiles(fileMap);
    expect(results['.env'].length).toBeGreaterThan(0);
    expect(results['.env.prod']).toEqual([]);
  });
});

describe('hasLintErrors', () => {
  it('returns true when there are issues', () => {
    expect(hasLintErrors({ '.env': [{ line: 1, message: 'empty value' }] })).toBe(true);
  });

  it('returns false when no issues', () => {
    expect(hasLintErrors({ '.env': [] })).toBe(false);
  });
});
