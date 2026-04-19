/**
 * Compares env files and returns a diff report
 */

/**
 * @param {Record<string, Record<string, string>>} envMap - { filename: { key: value } }
 * @param {string[]} allKeys
 * @returns {Array<{ key: string, status: string, details: Record<string, string|null> }>}
 */
function compareEnvs(envMap, allKeys) {
  const files = Object.keys(envMap);
  const results = [];

  for (const key of allKeys) {
    const details = {};
    let missingIn = [];
    let values = new Set();

    for (const file of files) {
      const val = envMap[file][key] ?? null;
      details[file] = val;
      if (val === null) {
        missingIn.push(file);
      } else {
        values.add(val);
      }
    }

    let status;
    if (missingIn.length === files.length) {
      status = 'missing_all';
    } else if (missingIn.length > 0) {
      status = 'missing_some';
    } else if (values.size > 1) {
      status = 'mismatch';
    } else {
      status = 'ok';
    }

    results.push({ key, status, details });
  }

  return results;
}

/**
 * Filters results to only problematic entries
 */
function getIssues(results) {
  return results.filter(r => r.status !== 'ok');
}

module.exports = { compareEnvs, getIssues };
