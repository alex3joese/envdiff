/**
 * Detect unused keys — keys that exist in a 'base' env file
 * but are absent from all other provided env files.
 */

/**
 * Find keys present in base but missing from every other env.
 * @param {string} base - label of the base env
 * @param {Record<string, Record<string, string>>} envMap - { label: parsedEnv }
 * @returns {{ key: string, presentIn: string[] }[]}
 */
function findUnusedKeys(base, envMap) {
  const baseKeys = Object.keys(envMap[base] || {});
  const otherLabels = Object.keys(envMap).filter((l) => l !== base);

  return baseKeys
    .map((key) => {
      const presentIn = otherLabels.filter((label) => key in envMap[label]);
      return { key, presentIn };
    })
    .filter(({ presentIn }) => presentIn.length === 0);
}

/**
 * Build a human-readable report of unused keys.
 * @param {string} base
 * @param {{ key: string, presentIn: string[] }[]} unused
 * @returns {string}
 */
function formatUnusedReport(base, unused) {
  if (unused.length === 0) {
    return `No unused keys found in base env "${base}".\n`;
  }
  const lines = [`Unused keys in "${base}" (not present in any other env):`];
  for (const { key } of unused) {
    lines.push(`  - ${key}`);
  }
  return lines.join('\n') + '\n';
}

/**
 * Returns true if there are any unused keys.
 * @param {{ key: string }[]} unused
 * @returns {boolean}
 */
function hasUnusedKeys(unused) {
  return unused.length > 0;
}

module.exports = { findUnusedKeys, formatUnusedReport, hasUnusedKeys };
