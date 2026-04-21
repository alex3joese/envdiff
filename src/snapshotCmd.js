const path = require('path');
const { loadEnvFiles } = require('./loader');
const { saveSnapshot, loadSnapshot, diffSnapshot } = require('./snapshot');

const DEFAULT_SNAPSHOT_PATH = '.envdiff-snapshot.json';

/**
 * Handle the `snapshot save` command.
 * Loads env files and writes a snapshot to disk.
 */
function cmdSave(files, options = {}) {
  const snapshotPath = options.output || DEFAULT_SNAPSHOT_PATH;
  const envMap = loadEnvFiles(files);
  saveSnapshot(snapshotPath, envMap);
  console.log(`Snapshot saved to ${snapshotPath} (${files.length} file(s))`);
}

/**
 * Handle the `snapshot diff` command.
 * Loads current env files and compares against a saved snapshot.
 */
function cmdDiff(files, options = {}) {
  const snapshotPath = options.snapshot || DEFAULT_SNAPSHOT_PATH;
  const envMap = loadEnvFiles(files);
  const { envs: snapshotEnvs, createdAt } = loadSnapshot(snapshotPath);

  console.log(`Comparing against snapshot from ${createdAt}\n`);

  const diff = diffSnapshot(envMap, snapshotEnvs);

  if (Object.keys(diff).length === 0) {
    console.log('No changes detected.');
    return;
  }

  for (const [file, changes] of Object.entries(diff)) {
    console.log(`${file}:`);
    if (changes.added.length) {
      console.log(`  + added:   ${changes.added.join(', ')}`);
    }
    if (changes.removed.length) {
      console.log(`  - removed: ${changes.removed.join(', ')}`);
    }
    if (changes.changed.length) {
      console.log(`  ~ changed: ${changes.changed.join(', ')}`);
    }
  }
}

module.exports = { cmdSave, cmdDiff, DEFAULT_SNAPSHOT_PATH };
