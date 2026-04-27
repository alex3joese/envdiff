// schema.js — validate env keys against a declared schema (type + required + pattern)

/**
 * @typedef {{ type?: 'string'|'number'|'boolean'|'url'|'email', required?: boolean, pattern?: string }} SchemaRule
 */

const URL_RE = /^https?:\/\/.+/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkType(value, type) {
  if (!type) return null;
  switch (type) {
    case 'number':
      return isNaN(Number(value)) ? `expected number, got "${value}"` : null;
    case 'boolean':
      return ['true', 'false', '1', '0'].includes(value.toLowerCase())
        ? null
        : `expected boolean, got "${value}"`;
    case 'url':
      return URL_RE.test(value) ? null : `expected URL, got "${value}"`;
    case 'email':
      return EMAIL_RE.test(value) ? null : `expected email, got "${value}"`;
    case 'string':
    default:
      return null;
  }
}

function validateAgainstSchema(envMap, schema) {
  const errors = [];

  for (const [key, rule] of Object.entries(schema)) {
    const value = envMap[key];

    if (rule.required && (value === undefined || value === '')) {
      errors.push({ key, message: 'required key is missing or empty' });
      continue;
    }

    if (value === undefined) continue;

    const typeError = checkType(value, rule.type);
    if (typeError) errors.push({ key, message: typeError });

    if (rule.pattern) {
      const re = new RegExp(rule.pattern);
      if (!re.test(value)) {
        errors.push({ key, message: `value does not match pattern /${rule.pattern}/` });
      }
    }
  }

  return errors;
}

function hasSchemaErrors(errors) {
  return errors.length > 0;
}

function formatSchemaReport(errors, { verbose = false } = {}) {
  if (errors.length === 0) return 'Schema validation passed.';
  const lines = [`Schema validation failed with ${errors.length} error(s):`];
  for (const e of errors) {
    lines.push(`  [${e.key}] ${e.message}`);
  }
  return lines.join('\n');
}

module.exports = { checkType, validateAgainstSchema, hasSchemaErrors, formatSchemaReport };
