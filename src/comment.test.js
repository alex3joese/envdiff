const { extractComment, stripComment, extractComments, applyComments } = require('./comment');

describe('extractComment', () => {
  it('returns comment text from a value with inline comment', () => {
    expect(extractComment('hello # world')).toBe('world');
  });

  it('returns null when no comment present', () => {
    expect(extractComment('hello')).toBeNull();
  });

  it('handles comment with no space before hash', () => {
    expect(extractComment('value#note')).toBe('note');
  });
});

describe('stripComment', () => {
  it('removes inline comment from value', () => {
    expect(stripComment('myvalue # this is a note')).toBe('myvalue');
  });

  it('returns original value when no comment', () => {
    expect(stripComment('myvalue')).toBe('myvalue');
  });
});

describe('extractComments', () => {
  const content = [
    '# top-level comment',
    'API_KEY=abc123 # the api key',
    'DEBUG=true',
    'PORT=3000 # default port',
  ].join('\n');

  it('extracts comments for keys that have them', () => {
    const result = extractComments(content);
    expect(result['API_KEY']).toBe('the api key');
    expect(result['PORT']).toBe('default port');
  });

  it('does not include keys without comments', () => {
    const result = extractComments(content);
    expect(result['DEBUG']).toBeUndefined();
  });

  it('ignores standalone comment lines', () => {
    const result = extractComments(content);
    expect(Object.keys(result)).toHaveLength(2);
  });
});

describe('applyComments', () => {
  it('appends comments to matching keys', () => {
    const content = 'API_KEY=abc123\nDEBUG=true';
    const comments = { API_KEY: 'the api key' };
    const result = applyComments(content, comments);
    expect(result).toContain('API_KEY=abc123 # the api key');
    expect(result).toContain('DEBUG=true');
  });

  it('replaces existing comment with new one', () => {
    const content = 'PORT=3000 # old comment';
    const comments = { PORT: 'new comment' };
    const result = applyComments(content, comments);
    expect(result).toBe('PORT=3000 # new comment');
  });

  it('leaves lines without matching comments unchanged', () => {
    const content = 'SECRET=xyz';
    const result = applyComments(content, {});
    expect(result).toBe('SECRET=xyz');
  });
});
