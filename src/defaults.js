// defaults.js — fill missing keys in an env map using a base/default env

/**
 * Given a base env map and a target env map, return a new map with any keys
 * from base that are absent in target filled in with the base value.
 *
 * @param {Record<string,string>} base
 * @param {Record<string,string>} target
 * @returns {{ merged: Record<string,string>, filled: string[] }}
 */
function applyDefaults(base, target) {
  const merged = { ...target };
  const filled = [];

  for (const [key, value] of Object.entries(base)) {
    if (!(key in target)) {
      merged[key] = value;
      filled.push(key);
    }
  }

  return { merged, filled };
}

/**
 * Build .env file content from a map, preserving KEY=VALUE format.
 *
 * @param {Record<string,string>} envMap
 * @returns {string}
 */
function buildDefaultsContent(envMap) {
  return Object.entries(envMap)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';
}

/**
 * Format a human-readable report of which keys were filled.
 *
 * @param {string[]} filled
 * @param {string} targetFile
 * @returns {string}
 */
function formatDefaultsReport(filled, targetFile) {
  if (filled.length === 0) {
    return `No missing keys — ${targetFile} is already complete.`;
  }
  const lines = [`Filled ${filled.length} missing key(s) in ${targetFile}:`];
  for (const key of filled) {
    lines.push(`  + ${key}`);
  }
  return lines.join('\n');
}

module.exports = { applyDefaults, buildDefaultsContent, formatDefaultsReport };
