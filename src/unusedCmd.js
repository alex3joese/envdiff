const { loadEnvFiles, collectAllKeys } = require('./loader');
const { findUnusedKeys, formatUnusedReport, hasUnusedKeys } = require('./unused');

/**
 * Print usage help for the unused command.
 */
function unusedHelp() {
  console.log(`
envdiff unused --base <label> <file1> <file2> [...]

Detect keys defined in the base env that do not appear in any other env file.

Options:
  --base <label>   Label of the base env file (default: first file)
  --json           Output results as JSON
  --help           Show this help
`.trim());
}

/**
 * CLI handler for the 'unused' command.
 * @param {object} opts
 * @param {string[]} opts.files  - paths to env files
 * @param {string}   opts.base   - label/path to treat as base
 * @param {boolean}  opts.json   - output as JSON
 */
async function cmdUnused(opts = {}) {
  const { files = [], base, json = false } = opts;

  if (!files.length) {
    console.error('Error: provide at least two env files.');
    process.exitCode = 1;
    return;
  }

  const envMap = loadEnvFiles(files);
  const labels = Object.keys(envMap);
  const baseLabel = base || labels[0];

  if (!envMap[baseLabel]) {
    console.error(`Error: base label "${baseLabel}" not found in provided files.`);
    process.exitCode = 1;
    return;
  }

  if (labels.length < 2) {
    console.error('Error: provide at least two env files to compare.');
    process.exitCode = 1;
    return;
  }

  const unused = findUnusedKeys(baseLabel, envMap);

  if (json) {
    console.log(JSON.stringify({ base: baseLabel, unused }, null, 2));
  } else {
    process.stdout.write(formatUnusedReport(baseLabel, unused));
  }

  if (hasUnusedKeys(unused)) {
    process.exitCode = 1;
  }
}

module.exports = { cmdUnused, unusedHelp };
