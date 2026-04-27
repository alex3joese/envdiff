const { promoteFiles } = require('./promote');

function promoteHelp() {
  return [
    'Usage: envdiff promote <source> <target> [options]',
    '',
    'Options:',
    '  --overwrite     Overwrite existing keys in target with source values',
    '  --keys=a,b,c    Only promote specific keys',
    '  --dry-run       Preview changes without writing',
    '  --quiet         Suppress output',
  ].join('\n');
}

function cmdPromote(argv) {
  const [source, target] = argv._;

  if (!source || !target) {
    console.error('Error: source and target files are required.');
    console.error(promoteHelp());
    process.exit(1);
  }

  const opts = {
    overwrite: !!argv.overwrite,
    keys: argv.keys ? argv.keys.split(',').map(k => k.trim()) : null,
  };

  const dryRun = !!argv['dry-run'];
  const quiet = !!argv.quiet;

  let promoted, skipped;

  if (dryRun) {
    const { loadEnvFiles } = require('./loader');
    const { promoteEnv } = require('./promote');
    const sources = loadEnvFiles([source]);
    const targets = loadEnvFiles([target]);
    ({ promoted, skipped } = promoteEnv(
      sources[source] || {},
      targets[target] || {},
      opts
    ));
    console.log('[dry-run] No files were modified.');
  } else {
    ({ promoted, skipped } = promoteFiles(source, target, opts));
  }

  if (!quiet) {
    if (promoted.length === 0) {
      console.log('Nothing to promote.');
    } else {
      promoted.forEach(({ key, reason }) =>
        console.log(`  ${reason === 'overwritten' ? '~' : '+'} ${key} (${reason})`)
      );
      console.log(`\nPromoted ${promoted.length} key(s), skipped ${skipped.length}.`);
    }
  }
}

module.exports = { cmdPromote, promoteHelp };
