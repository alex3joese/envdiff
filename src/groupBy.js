/**
 * groupBy.js — group env keys by prefix (e.g. DB_, AWS_, APP_)
 */

/**
 * Extract the prefix from a key, using the first segment before '_'.
 * Keys with no underscore fall into the '__ungrouped__' bucket.
 * @param {string} key
 * @returns {string}
 */
function getPrefix(key) {
  const idx = key.indexOf('_');
  return idx > 0 ? key.slice(0, idx) : '__ungrouped__';
}

/**
 * Group an array of keys by their prefix.
 * @param {string[]} keys
 * @returns {Record<string, string[]>}
 */
function groupKeys(keys) {
  const groups = {};
  for (const key of keys) {
    const prefix = getPrefix(key);
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(key);
  }
  return groups;
}

/**
 * Group a parsed env map by prefix, returning a map of
 * prefix -> { key: value } objects.
 * @param {Record<string, string>} envMap
 * @returns {Record<string, Record<string, string>>}
 */
function groupEnvMap(envMap) {
  const result = {};
  for (const [key, value] of Object.entries(envMap)) {
    const prefix = getPrefix(key);
    if (!result[prefix]) result[prefix] = {};
    result[prefix][key] = value;
  }
  return result;
}

/**
 * Format grouped keys as a human-readable string.
 * @param {Record<string, string[]>} groups
 * @returns {string}
 */
function formatGroups(groups) {
  const lines = [];
  for (const [prefix, keys] of Object.entries(groups).sort()) {
    lines.push(`[${prefix}] (${keys.length})`);
    for (const key of keys.sort()) {
      lines.push(`  ${key}`);
    }
  }
  return lines.join('\n');
}

module.exports = { getPrefix, groupKeys, groupEnvMap, formatGroups };
