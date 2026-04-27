/**
 * interpolate.js
 * Resolve variable references within .env values (e.g. BASE_URL=${HOST}:${PORT})
 */

/**
 * Expand ${VAR} references in a single value string using the provided env map.
 * References to unknown keys are left as-is.
 * @param {string} value
 * @param {Record<string, string>} envMap
 * @param {Set<string>} [_seen] — internal cycle guard
 * @returns {string}
 */
function expandValue(value, envMap, _seen = new Set()) {
  return value.replace(/\$\{([^}]+)\}/g, (match, key) => {
    if (_seen.has(key)) return match; // circular reference — leave unexpanded
    const raw = envMap[key];
    if (raw === undefined) return match;
    _seen.add(key);
    const expanded = expandValue(raw, envMap, new Set(_seen));
    _seen.delete(key);
    return expanded;
  });
}

/**
 * Interpolate all values in an env map, resolving cross-references.
 * @param {Record<string, string>} envMap
 * @returns {Record<string, string>}
 */
function interpolateEnv(envMap) {
  const result = {};
  for (const [key, value] of Object.entries(envMap)) {
    result[key] = expandValue(value, envMap);
  }
  return result;
}

/**
 * Return a list of keys whose values contain unresolved ${VAR} references
 * after interpolation.
 * @param {Record<string, string>} interpolated
 * @returns {string[]}
 */
function findUnresolved(interpolated) {
  return Object.entries(interpolated)
    .filter(([, v]) => /\$\{[^}]+\}/.test(v))
    .map(([k]) => k);
}

module.exports = { expandValue, interpolateEnv, findUnresolved };
