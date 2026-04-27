const { sortFiles } = require('./sort');

function sortHelp() {
  return [
    'Usage: envdiff sort [options] <files...>',
    '',
    'Sort keys in .env files alphabetically.',
    '',
    'Options:',
    '  --dry-run    Preview changes without writing to disk',
    '  --quiet      Suppress output',
    '  --help       Show this help message',
  ].join('\n');
}

/**
 * @param {string[]} files
 * @param {{ dryRun?: boolean, quiet?: boolean }} opts
 */
function cmdSort(files, opts = {}) {
  if (!files || files.length === 0) {
    console.error('envdiff sort: no files specified');
    process.exit(1);
  }

  let results;
  try {
    results = sortFiles(files, { dryRun: opts.dryRun });
  } catch (err) {
    console.error(`envdiff sort: ${err.message}`);
    process.exit(1);
  }

  if (!opts.quiet) {
    for (const { file, changed } of results) {
      if (opts.dryRun) {
        console.log(`${changed ? 'would sort' : 'already sorted'}: ${file}`);
      } else {
        console.log(`${changed ? 'sorted' : 'already sorted'}: ${file}`);
      }
    }
  }

  const anyChanged = results.some((r) => r.changed);
  process.exitCode = anyChanged && opts.dryRun ? 1 : 0;
}

module.exports = { cmdSort, sortHelp };
