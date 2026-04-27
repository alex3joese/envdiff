/**
 * required.js
 * Check that all keys listed as required are present and non-empty
 * across a set of env files.
 */

/**
 * @param {string[]} requiredKeys
 * @param {Record<string, Record<string, string>>} envMap  { filename: { KEY: value } }
 * @returns {{ file: string, key: string, reason: string }[]}
 */
function checkRequired(requiredKeys, envMap) {
  const issues = [];

  for (const [file, vars] of Object.entries(envMap)) {
    for (const key of requiredKeys) {
      if (!(key in vars)) {
        issues.push({ file, key, reason: 'missing' });
      } else if (vars[key].trim() === '') {
        issues.push({ file, key, reason: 'empty' });
      }
    }
  }

  return issues;
}

/**
 * Format required-key issues into a human-readable string.
 * @param {{ file: string, key: string, reason: string }[]} issues
 * @returns {string}
 */
function formatRequiredReport(issues) {
  if (issues.length === 0) return 'All required keys are present.';

  const lines = issues.map(
    ({ file, key, reason }) => `  [${reason.toUpperCase()}] ${key}  (${file})`
  );

  return `Required key issues found:\n${lines.join('\n')}`;
}

/**
 * Returns true when there are no required-key violations.
 * @param {{ file: string, key: string, reason: string }[]} issues
 * @returns {boolean}
 */
function hasRequiredViolations(issues) {
  return issues.length > 0;
}

module.exports = { checkRequired, formatRequiredReport, hasRequiredViolations };
