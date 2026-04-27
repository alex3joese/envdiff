const { getPrefix, groupKeys, groupEnvMap, formatGroups } = require('./groupBy');

describe('getPrefix', () => {
  test('returns prefix before first underscore', () => {
    expect(getPrefix('DB_HOST')).toBe('DB');
    expect(getPrefix('AWS_ACCESS_KEY_ID')).toBe('AWS');
  });

  test('returns __ungrouped__ when no underscore', () => {
    expect(getPrefix('PORT')).toBe('__ungrouped__');
    expect(getPrefix('NODE')).toBe('__ungrouped__');
  });

  test('handles leading underscore as ungrouped', () => {
    expect(getPrefix('_SECRET')).toBe('__ungrouped__');
  });
});

describe('groupKeys', () => {
  test('groups keys by prefix', () => {
    const keys = ['DB_HOST', 'DB_PORT', 'AWS_KEY', 'PORT'];
    const groups = groupKeys(keys);
    expect(groups['DB']).toEqual(['DB_HOST', 'DB_PORT']);
    expect(groups['AWS']).toEqual(['AWS_KEY']);
    expect(groups['__ungrouped__']).toEqual(['PORT']);
  });

  test('returns empty object for empty input', () => {
    expect(groupKeys([])).toEqual({});
  });
});

describe('groupEnvMap', () => {
  test('groups env map entries by prefix', () => {
    const envMap = {
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      APP_NAME: 'myapp',
      DEBUG: 'true',
    };
    const result = groupEnvMap(envMap);
    expect(result['DB']).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(result['APP']).toEqual({ APP_NAME: 'myapp' });
    expect(result['__ungrouped__']).toEqual({ DEBUG: 'true' });
  });

  test('returns empty object for empty map', () => {
    expect(groupEnvMap({})).toEqual({});
  });
});

describe('formatGroups', () => {
  test('formats groups as readable string', () => {
    const groups = {
      DB: ['DB_HOST', 'DB_PORT'],
      APP: ['APP_NAME'],
    };
    const output = formatGroups(groups);
    expect(output).toContain('[APP] (1)');
    expect(output).toContain('[DB] (2)');
    expect(output).toContain('  DB_HOST');
    expect(output).toContain('  APP_NAME');
  });

  test('returns empty string for empty groups', () => {
    expect(formatGroups({})).toBe('');
  });
});
