const { parseEnv } = require('./parser');
const fs = require('fs');

/**
 * Sort env keys alphabetically within a parsed env map.
 * @param {Record<string, string>} envMap
 * @returns {Record<string, string>}
 */
function sortEnvMap(envMap) {
  return Object.fromEntries(
    Object.entries(envMap).sort(([a], [b]) => a.localeCompare(b))
  );
}

/**
 * Build sorted .env file content from a map.
 * @param {Record<string, string>} sortedMap
 * @returns {string}
 */
function buildSortedContent(sortedMap) {
  return (
    Object.entries(sortedMap)
      .map(([key, val]) => `${key}=${val}`)
      .join('\n') + '\n'
  );
}

/**
 * Sort the contents of one or more .env files in place.
 * @param {string[]} filePaths
 * @param {{ dryRun?: boolean }} opts
 * @returns {{ file: string, changed: boolean }[]}
 */
function sortFiles(filePaths, opts = {}) {
  const { dryRun = false } = opts;
  return filePaths.map((file) => {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = parseEnv(raw);
    const sorted = sortEnvMap(parsed);
    const output = buildSortedContent(sorted);
    const changed = output !== buildSortedContent(parsed);
    if (changed && !dryRun) {
      fs.writeFileSync(file, output, 'utf8');
    }
    return { file, changed };
  });
}

module.exports = { sortEnvMap, buildSortedContent, sortFiles };
