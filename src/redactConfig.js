const DEFAULT_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private/i,
  /auth/i,
  /credential/i,
];

function resolveRedactConfig(flags = {}) {
  const config = {
    files: [],
    output: flags.stdout ? 'stdout' : 'file',
    outDir: flags.outDir || flags['out-dir'] || null,
    customPatterns: [],
  };

  if (flags.pattern) {
    const patterns = Array.isArray(flags.pattern) ? flags.pattern : [flags.pattern];
    config.customPatterns = patterns.map((p) => new RegExp(p, 'i'));
  }

  return config;
}

function redactHelp() {
  return [
    'Usage: envdiff redact <files...> [options]',
    '',
    'Redact sensitive values from .env files.',
    '',
    'Options:',
    '  --stdout          Print redacted output to stdout instead of writing files',
    '  --out-dir <dir>   Directory to write redacted files into',
    '  --pattern <regex> Additional key pattern to redact (repeatable)',
    '  -h, --help        Show this help message',
    '',
    `Default sensitive patterns: ${DEFAULT_PATTERNS.map((r) => r.source).join(', ')}`,
  ].join('\n');
}

module.exports = { resolveRedactConfig, redactHelp, DEFAULT_PATTERNS };
