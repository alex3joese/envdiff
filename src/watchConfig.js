const DEFAULT_WATCH_CONFIG = {
  debounceMs: 300,
  clear: true,
  format: 'text',
};

function resolveWatchConfig(cliOptions = {}, fileConfig = {}) {
  const merged = Object.assign({}, DEFAULT_WATCH_CONFIG, fileConfig.watch || {}, cliOptions);

  if (typeof merged.debounceMs !== 'number' || merged.debounceMs < 0) {
    merged.debounceMs = DEFAULT_WATCH_CONFIG.debounceMs;
  }

  const validFormats = ['text', 'json', 'minimal', 'table'];
  if (!validFormats.includes(merged.format)) {
    merged.format = DEFAULT_WATCH_CONFIG.format;
  }

  merged.clear = Boolean(merged.clear);

  return merged;
}

function watchConfigHelp() {
  return [
    'Watch mode options:',
    '  --format <fmt>     Output format: text, json, minimal, table (default: text)',
    '  --debounce <ms>    Debounce delay in milliseconds (default: 300)',
    '  --no-clear         Do not clear screen between updates',
  ].join('\n');
}

module.exports = { resolveWatchConfig, watchConfigHelp, DEFAULT_WATCH_CONFIG };
