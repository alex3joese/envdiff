/**
 * Loads and normalizes validation rules from config or a dedicated rules file.
 * Rules can be defined inline in envdiff config or in a separate JSON file.
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_RULES_FILE = 'envdiff.rules.json';

/**
 * Normalize a raw rule entry to ensure consistent shape.
 * @param {object} raw
 * @returns {{key: string, required?: boolean, type?: string, pattern?: string}}
 */
function normalizeRule(raw) {
  if (typeof raw !== 'object' || !raw.key) {
    throw new Error(`Invalid rule: each rule must have a "key" field. Got: ${JSON.stringify(raw)}`);
  }
  const rule = { key: raw.key };
  if (raw.required !== undefined) rule.required = Boolean(raw.required);
  if (raw.type !== undefined) {
    const allowed = ['string', 'number', 'boolean'];
    if (!allowed.includes(raw.type)) {
      throw new Error(`Invalid type "${raw.type}" for key "${raw.key}". Allowed: ${allowed.join(', ')}`);
    }
    rule.type = raw.type;
  }
  if (raw.pattern !== undefined) rule.pattern = String(raw.pattern);
  return rule;
}

/**
 * Load rules from a JSON file.
 * @param {string} filePath
 * @returns {Array}
 */
function loadRulesFile(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    return [];
  }
  const raw = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  if (!Array.isArray(raw)) {
    throw new Error(`Rules file must export a JSON array. Found: ${typeof raw}`);
  }
  return raw.map(normalizeRule);
}

/**
 * Resolve validation rules from config object or default file.
 * @param {object} config  may contain { rules: [...] } or { rulesFile: '...' }
 * @param {string} [cwd]
 * @returns {Array}
 */
function resolveRules(config = {}, cwd = process.cwd()) {
  if (config.rules && Array.isArray(config.rules)) {
    return config.rules.map(normalizeRule);
  }
  const rulesFile = config.rulesFile || path.join(cwd, DEFAULT_RULES_FILE);
  return loadRulesFile(rulesFile);
}

module.exports = { normalizeRule, loadRulesFile, resolveRules, DEFAULT_RULES_FILE };
