const path = require('path');
const fs = require('fs');
const os = require('os');
const { loadEnvFiles, collectAllKeys } = require('./loader');

function writeTempEnv(content) {
  const tmpFile = path.join(os.tmpdir(), `envdiff-test-${Date.now()}-${Math.random()}.env`);
  fs.writeFileSync(tmpFile, content, 'utf8');
  return tmpFile;
}

describe('loadEnvFiles', () => {
  it('loads a single env file', () => {
    const file = writeTempEnv('FOO=bar\nBAZ=qux\n');
    const result = loadEnvFiles([file]);
    expect(result[file]).toEqual({ FOO: 'bar', BAZ: 'qux' });
    fs.unlinkSync(file);
  });

  it('loads multiple env files', () => {
    const f1 = writeTempEnv('KEY=one\n');
    const f2 = writeTempEnv('KEY=two\nEXTRA=yes\n');
    const result = loadEnvFiles([f1, f2]);
    expect(Object.keys(result)).toHaveLength(2);
    expect(result[f1].KEY).toBe('one');
    expect(result[f2].KEY).toBe('two');
    fs.unlinkSync(f1);
    fs.unlinkSync(f2);
  });

  it('throws if a file does not exist', () => {
    expect(() => loadEnvFiles(['/nonexistent/.env'])).toThrow();
  });
});

describe('collectAllKeys', () => {
  it('collects union of all keys across envs', () => {
    const envData = {
      'a.env': { FOO: '1', BAR: '2' },
      'b.env': { FOO: '1', BAZ: '3' },
    };
    const keys = collectAllKeys(envData);
    expect(keys.sort()).toEqual(['BAR', 'BAZ', 'FOO']);
  });

  it('returns empty array for empty input', () => {
    expect(collectAllKeys({})).toEqual([]);
  });
});
