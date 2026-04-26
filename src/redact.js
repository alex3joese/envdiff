/**
 * redact.js — mask sensitive values in env output
 */

const DEFAULT_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
  /passphrase/i,
];

/**
 * Returns true if the key looks sensitive based on patterns.
 * @param {string} key
 * @param {RegExp[]} patterns
 * @returns {boolean}
 */
function isSensitiveKey(key, patterns = DEFAULT_PATTERNS) {
  return patterns.some((re) => re.test(key));
}

/**
 * Masks a value, showing only the first 2 chars if long enough.
 * @param {string} value
 * @returns {string}
 */
function maskValue(value) {
  if (!value || value.length <= 2) return '***';
  return value.slice(0, 2) + '*'.repeat(Math.min(value.length - 2, 6));
}

/**
 * Returns a redacted copy of an env map.
 * @param {Record<string, string>} envMap
 * @param {RegExp[]} [patterns]
 * @returns {Record<string, string>}
 */
function redactEnv(envMap, patterns = DEFAULT_PATTERNS) {
  const result = {};
  for (const [key, value] of Object.entries(envMap)) {
    result[key] = isSensitiveKey(key, patterns) ? maskValue(value) : value;
  }
  return result;
}

/**
 * Redacts sensitive values across a map of env files.
 * @param {Record<string, Record<string, string>>} envs
 * @param {RegExp[]} [patterns]
 * @returns {Record<string, Record<string, string>>}
 */
function redactAll(envs, patterns = DEFAULT_PATTERNS) {
  const result = {};
  for (const [file, envMap] of Object.entries(envs)) {
    result[file] = redactEnv(envMap, patterns);
  }
  return result;
}

module.exports = { isSensitiveKey, maskValue, redactEnv, redactAll, DEFAULT_PATTERNS };
