/**
 * placeholder.js
 * Detect keys with placeholder/stub values like "CHANGEME", "TODO", "<value>", etc.
 */

const DEFAULT_PATTERNS = [
  /^changeme$/i,
  /^todo$/i,
  /^fixme$/i,
  /^replace[_-]?me$/i,
  /^your[_-]/i,
  /^<.+>$/,
  /^\[.+\]$/,
  /^\{.+\}$/,
  /^example$/i,
  /^placeholder$/i,
  /^xxx+$/i,
  /^tbd$/i,
  /^n\/a$/i,
];

/**
 * Check if a value looks like a placeholder.
 * @param {string} value
 * @param {RegExp[]} [patterns]
 * @returns {boolean}
 */
function isPlaceholder(value, patterns = DEFAULT_PATTERNS) {
  if (value === undefined || value === null) return false;
  const trimmed = String(value).trim();
  if (trimmed === '') return false;
  return patterns.some((re) => re.test(trimmed));
}

/**
 * Scan an env map and return keys whose values are placeholders.
 * @param {Record<string, string>} envMap
 * @param {RegExp[]} [patterns]
 * @returns {{ key: string, value: string }[]}
 */
function findPlaceholders(envMap, patterns = DEFAULT_PATTERNS) {
  return Object.entries(envMap)
    .filter(([, v]) => isPlaceholder(v, patterns))
    .map(([key, value]) => ({ key, value }));
}

/**
 * Run findPlaceholders across multiple named env maps.
 * @param {Record<string, Record<string, string>>} envMaps  e.g. { '.env.prod': {...} }
 * @param {RegExp[]} [patterns]
 * @returns {Record<string, { key: string, value: string }[]>}
 */
function detectPlaceholders(envMaps, patterns = DEFAULT_PATTERNS) {
  const result = {};
  for (const [name, map] of Object.entries(envMaps)) {
    const hits = findPlaceholders(map, patterns);
    if (hits.length > 0) result[name] = hits;
  }
  return result;
}

/**
 * Format a human-readable report of detected placeholders.
 * @param {Record<string, { key: string, value: string }[]>} detected
 * @returns {string}
 */
function formatPlaceholderReport(detected) {
  const entries = Object.entries(detected);
  if (entries.length === 0) return 'No placeholder values detected.';
  const lines = [];
  for (const [file, hits] of entries) {
    lines.push(`${file}:`);
    for (const { key, value } of hits) {
      lines.push(`  ${key} = "${value}"`);
    }
  }
  return lines.join('\n');
}

/**
 * Returns true if any placeholder was found.
 * @param {Record<string, { key: string, value: string }[]>} detected
 * @returns {boolean}
 */
function hasPlaceholders(detected) {
  return Object.values(detected).some((hits) => hits.length > 0);
}

module.exports = {
  DEFAULT_PATTERNS,
  isPlaceholder,
  findPlaceholders,
  detectPlaceholders,
  formatPlaceholderReport,
  hasPlaceholders,
};
