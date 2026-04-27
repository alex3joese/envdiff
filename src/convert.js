/**
 * convert.js — convert .env files to/from other formats (JSON, YAML, TOML-like)
 */

/**
 * Convert a parsed env map to JSON string
 * @param {Record<string,string>} envMap
 * @returns {string}
 */
function toJson(envMap) {
  return JSON.stringify(envMap, null, 2);
}

/**
 * Convert a parsed env map to YAML-like string (simple key: value)
 * @param {Record<string,string>} envMap
 * @returns {string}
 */
function toYaml(envMap) {
  return Object.entries(envMap)
    .map(([k, v]) => {
      const needsQuotes = v === '' || /[:#{}\[\],&*?|<>=!%@`]/.test(v);
      return needsQuotes ? `${k}: "${v.replace(/"/g, '\\"')}"` : `${k}: ${v}`;
    })
    .join('\n');
}

/**
 * Convert a parsed env map back to .env format
 * @param {Record<string,string>} envMap
 * @returns {string}
 */
function toEnv(envMap) {
  return Object.entries(envMap)
    .map(([k, v]) => {
      const needsQuotes = v === '' || /\s/.test(v);
      return needsQuotes ? `${k}="${v.replace(/"/g, '\\"')}"` : `${k}=${v}`;
    })
    .join('\n');
}

/**
 * Parse a JSON string into an env map
 * @param {string} content
 * @returns {Record<string,string>}
 */
function fromJson(content) {
  const parsed = JSON.parse(content);
  if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
    throw new Error('JSON input must be a plain object');
  }
  return Object.fromEntries(
    Object.entries(parsed).map(([k, v]) => [k, String(v)])
  );
}

/**
 * Apply a conversion given format name
 * @param {Record<string,string>} envMap
 * @param {'json'|'yaml'|'env'} format
 * @returns {string}
 */
function applyConvert(envMap, format) {
  switch (format) {
    case 'json': return toJson(envMap);
    case 'yaml': return toYaml(envMap);
    case 'env':  return toEnv(envMap);
    default: throw new Error(`Unsupported format: ${format}`);
  }
}

module.exports = { toJson, toYaml, toEnv, fromJson, applyConvert };
