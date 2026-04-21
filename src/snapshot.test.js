const fs = require('fs');
const os = require('os');
const path = require('path');
const { saveSnapshot, loadSnapshot, diffSnapshot } = require('./snapshot');

function tempPath(name) {
  return path.join(os.tmpdir(), `envdiff-snapshot-test-${Date.now()}-${name}`);
}

describe('saveSnapshot / loadSnapshot', () => {
  test('round-trips envMap correctly', () => {
    const file = tempPath('snap.json');
    const envMap = { '.env.dev': { FOO: 'bar', PORT: '3000' } };
    saveSnapshot(file, envMap);
    const loaded = loadSnapshot(file);
    expect(loaded.envs).toEqual(envMap);
    expect(loaded.createdAt).toBeTruthy();
    fs.unlinkSync(file);
  });

  test('throws when snapshot file missing', () => {
    expect(() => loadSnapshot('/nonexistent/path/snap.json')).toThrow('Snapshot not found');
  });

  test('creates intermediate directories', () => {
    const dir = tempPath('nested/dir');
    const file = path.join(dir, 'snap.json');
    saveSnapshot(file, {});
    expect(fs.existsSync(file)).toBe(true);
    fs.rmSync(dir, { recursive: true });
  });
});

describe('diffSnapshot', () => {
  const saved = {
    '.env.dev': { FOO: 'old', BAR: 'keep', GONE: 'bye' },
  };

  test('detects added keys', () => {
    const current = { '.env.dev': { FOO: 'old', BAR: 'keep', NEW: 'hi' } };
    const diff = diffSnapshot(current, saved);
    expect(diff['.env.dev'].added).toEqual(['NEW']);
    expect(diff['.env.dev'].removed).toEqual(['GONE']);
  });

  test('detects changed values', () => {
    const current = { '.env.dev': { FOO: 'new', BAR: 'keep', GONE: 'bye' } };
    const diff = diffSnapshot(current, saved);
    expect(diff['.env.dev'].changed).toEqual(['FOO']);
  });

  test('returns empty object when nothing changed', () => {
    const diff = diffSnapshot(saved, saved);
    expect(diff).toEqual({});
  });

  test('handles file present only in current', () => {
    const current = { '.env.prod': { SECRET: 'x' } };
    const diff = diffSnapshot(current, saved);
    expect(diff['.env.prod'].added).toEqual(['SECRET']);
    expect(diff['.env.dev'].removed).toContain('FOO');
  });
});
