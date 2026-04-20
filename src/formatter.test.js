const { formatJson, formatMinimal, formatTable, applyFormat } = require('./formatter');

const sampleIssues = [
  { type: 'missing', key: 'DB_HOST', env: 'production' },
  { type: 'mismatch', key: 'API_URL', env: 'staging' },
  { type: 'missing', key: 'SECRET_KEY', env: 'development' },
];

const sampleReport = { issues: sampleIssues, total: 3 };

describe('formatJson', () => {
  it('returns valid JSON string', () => {
    const result = formatJson(sampleReport);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('includes issues in output', () => {
    const result = JSON.parse(formatJson(sampleReport));
    expect(result.issues).toHaveLength(3);
    expect(result.total).toBe(3);
  });
});

describe('formatMinimal', () => {
  it('returns one line per issue', () => {
    const result = formatMinimal(sampleIssues);
    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
  });

  it('includes type and key in each line', () => {
    const result = formatMinimal(sampleIssues);
    expect(result).toContain('MISSING');
    expect(result).toContain('DB_HOST');
    expect(result).toContain('MISMATCH');
    expect(result).toContain('API_URL');
  });

  it('returns no issues message for empty array', () => {
    expect(formatMinimal([])).toBe('No issues found.');
  });
});

describe('formatTable', () => {
  it('renders a table with headers', () => {
    const result = formatTable(sampleIssues);
    expect(result).toContain('TYPE');
    expect(result).toContain('KEY');
    expect(result).toContain('ENV');
  });

  it('includes all issue keys', () => {
    const result = formatTable(sampleIssues);
    expect(result).toContain('DB_HOST');
    expect(result).toContain('API_URL');
    expect(result).toContain('SECRET_KEY');
  });

  it('returns no issues message for empty array', () => {
    expect(formatTable([])).toBe('No issues found.');
  });
});

describe('applyFormat', () => {
  it('dispatches to formatJson', () => {
    const result = applyFormat('json', sampleReport);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('dispatches to formatTable', () => {
    const result = applyFormat('table', sampleReport);
    expect(result).toContain('TYPE');
  });

  it('dispatches to formatMinimal', () => {
    const result = applyFormat('minimal', sampleReport);
    expect(result).toContain('MISSING');
  });

  it('throws on unknown format', () => {
    expect(() => applyFormat('xml', sampleReport)).toThrow('Unknown format');
  });
});
