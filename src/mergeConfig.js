// mergeConfig.js — resolve config for the merge subcommand

/**
 * Parse argv for merge options.
 * Supports: --prefer-first, --output <file>, --quiet, positional file args
 * @param {string[]} argv
 * @returns {object}
 */
function resolveMergeConfig(argv) {
  const config = {
    files: [],
    preferFirst: false,
    output: null,
    quiet: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--prefer-first') {
      config.preferFirst = true;
    } else if (arg === '--quiet' || arg === '-q') {
      config.quiet = true;
    } else if (arg === '--output' || arg === '-o') {
      config.output = argv[++i] || null;
    } else if (!arg.startsWith('-')) {
      config.files.push(arg);
    }
  }

  return config;
}

function mergeHelp() {
  return [
    'Usage: envdiff merge <file1> <file2> [file3...] [options]',
    '',
    'Merge multiple .env files into one unified file.',
    'By default, later files take precedence (last-wins).',
    '',
    'Options:',
    '  --prefer-first      First file wins on conflict',
    '  --output, -o <file> Write merged output to file (default: stdout)',
    '  --quiet, -q         Suppress warnings and info messages',
    '  --help, -h          Show this help message',
  ].join('\n');
}

module.exports = { resolveMergeConfig, mergeHelp };
