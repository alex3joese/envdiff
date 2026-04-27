/**
 * duplicate.js — detect duplicate keys and duplicate values across env files
 */

/**
 * Find keys that appear more than once within a single env map.
 * (Normally the parser takes the last value, so this works on raw lines.)
 * @param {string} content - raw .env file content
 * @returns {string[]} array of duplicate key names
 */
function findDuplicateKeys(content) {
  const seen = new Set();
  const dupes = new Set();
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (seen.has(key)) dupes.add(key);
    else seen.add(key);
  }
  return Array.from(dupes);
}

/**
 * Find keys whose values are identical across two or more env maps.
 * Returns a map of value -> [key, ...] for values shared by multiple keys.
 * @param {Object} envMap - { key: value }
 * @returns {Object} { value: [key, key2, ...] } only where count > 1
 */
function findDuplicateValues(envMap) {
  const valueToKeys = {};
  for (const [key, val] of Object.entries(envMap)) {
    if (!valueToKeys[val]) valueToKeys[val] = [];
    valueToKeys[val].push(key);
  }
  const result = {};
  for (const [val, keys] of Object.entries(valueToKeys)) {
    if (keys.length > 1) result[val] = keys;
  }
  return result;
}

/**
 * Run both duplicate checks on a map of filename -> { content, parsed }.
 * @param {Object} files - { filename: { content: string, parsed: Object } }
 * @returns {Object} { duplicateKeys: { file: [key] }, duplicateValues: { file: { val: [key] } } }
 */
function detectDuplicates(files) {
  const duplicateKeys = {};
  const duplicateValues = {};
  for (const [file, { content, parsed }] of Object.entries(files)) {
    const keys = findDuplicateKeys(content);
    if (keys.length) duplicateKeys[file] = keys;
    const vals = findDuplicateValues(parsed);
    if (Object.keys(vals).length) duplicateValues[file] = vals;
  }
  return { duplicateKeys, duplicateValues };
}

module.exports = { findDuplicateKeys, findDuplicateValues, detectDuplicates };
