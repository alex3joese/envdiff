const fs = require('fs');
const os = require('os');
const path = require('path');
const { sortEnvMap, buildSortedContent, sortFiles } = require('./sort');

function writeTempEnv(content) {
  const file = path.join(os.tmpdir(), `sort-test-${Date.now()}.env`);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

describe('sortEnvMap', () => {
  test('sorts keys alphabetically', () => {
    const result = sortEnvMap({ ZEBRA: '1', ALPHA: '2', MANGO: '3' });
    expect(Object.keys(result)).toEqual(['ALPHA', 'MANGO', 'ZEBRA']);
  });

  test('returns empty object for empty input', () => {
    expect(sortEnvMap({})).toEqual({});
  });

  test('preserves values after sorting', () => {
    const result = sortEnvMap({ B: 'bee', A: 'ay' });
    expect(result).toEqual({ A: 'ay', B: 'bee' });
  });
});

describe('buildSortedContent', () => {
  test('produces KEY=VALUE lines with trailing newline', () => {
    const content = buildSortedContent({ A: 'one', B: 'two' });
    expect(content).toBe('A=one\nB=two\n');
  });

  test('handles empty map', () => {
    expect(buildSortedContent({})).toBe('\n');
  });
});

describe('sortFiles', () => {
  test('sorts a file in place', () => {
    const file = writeTempEnv('Z=last\nA=first\nM=mid\n');
    const results = sortFiles([file]);
    expect(results[0].changed).toBe(true);
    const written = fs.readFileSync(file, 'utf8');
    expect(written).toBe('A=first\nM=mid\nZ=last\n');
    fs.unlinkSync(file);
  });

  test('reports unchanged when already sorted', () => {
    const file = writeTempEnv('A=1\nB=2\nC=3\n');
    const results = sortFiles([file]);
    expect(results[0].changed).toBe(false);
    fs.unlinkSync(file);
  });

  test('dry run does not write changes', () => {
    const original = 'Z=last\nA=first\n';
    const file = writeTempEnv(original);
    const results = sortFiles([file], { dryRun: true });
    expect(results[0].changed).toBe(true);
    expect(fs.readFileSync(file, 'utf8')).toBe(original);
    fs.unlinkSync(file);
  });

  test('handles multiple files', () => {
    const f1 = writeTempEnv('B=2\nA=1\n');
    const f2 = writeTempEnv('X=x\nY=y\n');
    const results = sortFiles([f1, f2]);
    expect(results).toHaveLength(2);
    expect(results[0].changed).toBe(true);
    expect(results[1].changed).toBe(false);
    fs.unlinkSync(f1);
    fs.unlinkSync(f2);
  });
});
