/**
 * Validates parsed env key-value pairs against optional rules.
 * Supports required keys, type hints, and pattern matching.
 */

const TRUTHY = new Set(['true', '1', 'yes']);
const FALSY = new Set(['false', '0', 'no']);

/**
 * Check if a value looks like a boolean string.
 * @param {string} value
 * @returns {boolean}
 */
function isBoolean(value) {
  return TRUTHY.has(value.toLowerCase()) || FALSY.has(value.toLowerCase());
}

/**
 * Check if a value looks like a number.
 * @param {string} value
 * @returns {boolean}
 */
function isNumeric(value) {
  return value.trim() !== '' && !isNaN(Number(value));
}

/**
 * Validate a single env record against a rule set.
 * @param {Record<string, string>} env
 * @param {Array<{key: string, required?: boolean, type?: string, pattern?: string}>} rules
 * @returns {Array<{key: string, message: string}>}
 */
function validateEnv(env, rules = []) {
  const errors = [];

  for (const rule of rules) {
    const { key, required, type, pattern } = rule;
    const value = env[key];

    if (required && (value === undefined || value === '')) {
      errors.push({ key, message: `required key "${key}" is missing or empty` });
      continue;
    }

    if (value === undefined) continue;

    if (type === 'boolean' && !isBoolean(value)) {
      errors.push({ key, message: `"${key}" expected boolean-like value, got "${value}"` });
    }

    if (type === 'number' && !isNumeric(value)) {
      errors.push({ key, message: `"${key}" expected numeric value, got "${value}"` });
    }

    if (pattern) {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        errors.push({ key, message: `"${key}" value "${value}" does not match pattern /${pattern}/` });
      }
    }
  }

  return errors;
}

/**
 * Validate multiple env records.
 * @param {Record<string, Record<string, string>>} envMap  { filename: parsedEnv }
 * @param {Array} rules
 * @returns {Record<string, Array<{key: string, message: string}>>}
 */
function validateAll(envMap, rules = []) {
  const results = {};
  for (const [filename, env] of Object.entries(envMap)) {
    const errors = validateEnv(env, rules);
    if (errors.length > 0) {
      results[filename] = errors;
    }
  }
  return results;
}

module.exports = { validateEnv, validateAll, isBoolean, isNumeric };
