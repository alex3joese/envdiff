const fs = require('fs');
const path = require('path');
const { parseEnv } = require('./parser');

/**
 * Load and parse one or more .env files by path.
 * Returns an object keyed by a label (filename or provided alias).
 */
function loadEnvFiles(filePaths) {
  const envs = {};

  for (const filePath of filePaths) {
    const resolved = path.resolve(filePath);

    if (!fs.existsSync(resolved)) {
      throw new Error(`File not found: ${resolved}`);
    }

    const content = fs.readFileSync(resolved, 'utf8');
    const label = path.basename(filePath);

    envs[label] = parseEnv(content);
  }

  return envs;
}

/**
 * Collect all unique keys across all parsed env maps.
 */
function collectAllKeys(envs) {
  const keys = new Set();
  for (const map of Object.values(envs)) {
    for (const key of Object.keys(map)) {
      keys.add(key);
    }
  }
  return Array.from(keys).sort();
}

module.exports = { loadEnvFiles, collectAllKeys };
