// renameCmd.js — CLI handler for the rename command

const { renameInFiles } = require('./rename');
const { resolveRenameConfig, renameHelp } = require('./renameConfig');

/**
 * Parse a comma-separated files string into an array.
 */
function parseFiles(raw) {
  if (!raw) return [];
  return raw.split(',').map(f => f.trim()).filter(Boolean);
}

/**
 * cmdRename — entry point for `envdiff rename`
 */
function cmdRename(argv, options = {}) {
  const print = options.print || (msg => process.stdout.write(msg + '\n'));
  const exit = options.exit || (code => process.exit(code));

  if (argv.help || argv.h) {
    print(renameHelp);
    return exit(0);
  }

  const [fromKey, toKey] = argv._?.slice(1) ?? [];

  if (!fromKey || !toKey) {
    print('Error: FROM_KEY and TO_KEY are required.');
    print(renameHelp);
    return exit(1);
  }

  const files = parseFiles(argv.files);
  if (files.length === 0) {
    print('Error: no --files specified.');
    return exit(1);
  }

  const config = resolveRenameConfig(argv);
  const results = renameInFiles(files, fromKey, toKey, config.dryRun);

  let anyRenamed = false;
  for (const { file, renamed } of results) {
    if (renamed > 0) {
      anyRenamed = true;
      const tag = config.dryRun ? '[dry-run] would rename' : 'renamed';
      print(`${tag}: ${fromKey} → ${toKey} in ${file}`);
    }
  }

  if (!anyRenamed) {
    print(`Key "${fromKey}" not found in any specified file.`);
  }

  return exit(0);
}

module.exports = { cmdRename, parseFiles };
