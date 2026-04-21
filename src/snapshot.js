const fs = require('fs');
const path = require('path');

/**
 * Save a snapshot of parsed env keys/values to a JSON file.
 * @param {string} snapshotPath - destination file path
 * @param {Object} envMap - map of { filename: { key: value } }
 */
function saveSnapshot(snapshotPath, envMap) {
  const snapshot = {
    createdAt: new Date().toISOString(),
    envs: envMap,
  };
  fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf8');
}

/**
 * Load a previously saved snapshot from a JSON file.
 * @param {string} snapshotPath
 * @returns {{ createdAt: string, envs: Object }}
 */
function loadSnapshot(snapshotPath) {
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot not found: ${snapshotPath}`);
  }
  const raw = fs.readFileSync(snapshotPath, 'utf8');
  return JSON.parse(raw);
}

/**
 * Compare current envMap against a saved snapshot.
 * Returns an object describing added, removed, and changed keys per file.
 * @param {Object} currentEnvMap
 * @param {Object} snapshotEnvs
 * @returns {Object} diff per filename
 */
function diffSnapshot(currentEnvMap, snapshotEnvs) {
  const result = {};
  const allFiles = new Set([...Object.keys(currentEnvMap), ...Object.keys(snapshotEnvs)]);

  for (const file of allFiles) {
    const current = currentEnvMap[file] || {};
    const saved = snapshotEnvs[file] || {};
    const added = [];
    const removed = [];
    const changed = [];

    for (const key of Object.keys(current)) {
      if (!(key in saved)) added.push(key);
      else if (current[key] !== saved[key]) changed.push(key);
    }
    for (const key of Object.keys(saved)) {
      if (!(key in current)) removed.push(key);
    }

    if (added.length || removed.length || changed.length) {
      result[file] = { added, removed, changed };
    }
  }
  return result;
}

module.exports = { saveSnapshot, loadSnapshot, diffSnapshot };
