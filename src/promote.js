const fs = require('fs');
const { parseEnv } = require('./parser');
const { loadEnvFiles } = require('./loader');

/**
 * Promote values from a source env to a target env file.
 * Only copies keys that are missing or explicitly overridden.
 */
function promoteEnv(sourceMap, targetMap, opts = {}) {
  const { overwrite = false, keys = null } = opts;
  const result = { ...targetMap };
  const promoted = [];
  const skipped = [];

  for (const [key, value] of Object.entries(sourceMap)) {
    if (keys && !keys.includes(key)) continue;

    if (!(key in targetMap)) {
      result[key] = value;
      promoted.push({ key, value, reason: 'missing' });
    } else if (overwrite && targetMap[key] !== value) {
      result[key] = value;
      promoted.push({ key, value, reason: 'overwritten' });
    } else {
      skipped.push(key);
    }
  }

  return { result, promoted, skipped };
}

/**
 * Build the output content string from a key/value map.
 */
function buildPromotedContent(map) {
  return Object.entries(map)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';
}

/**
 * Promote from sourceFile into targetFile, writing the result.
 */
function promoteFiles(sourceFile, targetFile, opts = {}) {
  const sources = loadEnvFiles([sourceFile]);
  const targets = loadEnvFiles([targetFile]);

  const sourceMap = sources[sourceFile] || {};
  const targetMap = targets[targetFile] || {};

  const { result, promoted, skipped } = promoteEnv(sourceMap, targetMap, opts);

  if (promoted.length > 0) {
    fs.writeFileSync(targetFile, buildPromotedContent(result), 'utf8');
  }

  return { promoted, skipped };
}

module.exports = { promoteEnv, buildPromotedContent, promoteFiles };
