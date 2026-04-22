// mergeCmd.js — CLI handler for the `merge` subcommand
const fs = require('fs');
const path = require('path');
const { loadEnvFiles } = require('./loader');
const { mergeEnvs, buildMergedOutput } = require('./merge');
const { resolveMergeConfig, mergeHelp } = require('./mergeConfig');

/**
 * cmdMerge — merge env files and write or print the result.
 * @param {string[]} argv  - raw CLI args after `merge`
 */
function cmdMerge(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log(mergeHelp());
    return;
  }

  const config = resolveMergeConfig(argv);

  if (config.files.length < 2) {
    console.error('error: provide at least two .env files to merge');
    process.exit(1);
  }

  const envFiles = loadEnvFiles(config.files);
  const { merged, conflicts } = mergeEnvs(envFiles, {
    preferFirst: config.preferFirst,
  });

  if (conflicts.length > 0 && !config.quiet) {
    console.warn(`warn: ${conflicts.length} conflict(s) found:`);
    for (const c of conflicts) {
      console.warn(`  ${c.key}: ${c.files.join(' vs ')} (${c.values.join(' / ')})`);
    }
  }

  const output = buildMergedOutput(merged);

  if (config.output) {
    fs.writeFileSync(path.resolve(config.output), output, 'utf8');
    if (!config.quiet) {
      console.log(`merged output written to ${config.output}`);
    }
  } else {
    process.stdout.write(output);
  }
}

module.exports = { cmdMerge };
