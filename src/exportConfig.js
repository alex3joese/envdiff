const VALID_FORMATS = ['json', 'csv', 'text'];
const DEFAULT_FORMAT = 'json';
const DEFAULT_OUTPUT = 'envdiff-export';

/**
 * Resolve export configuration from CLI args / config object.
 * @param {object} opts
 * @returns {{ format: string, output: string, append: boolean }}
 */
function resolveExportConfig(opts = {}) {
  const format = VALID_FORMATS.includes(opts.format) ? opts.format : DEFAULT_FORMAT;
  const output = opts.output || DEFAULT_OUTPUT;
  const append = Boolean(opts.append);
  return { format, output, append };
}

/**
 * Help text for export-related CLI flags.
 */
const exportConfigHelp = `
Export options:
  --export              Enable exporting results to a file
  --export-format       Output format: json (default), csv, text
  --export-output       Output file path (default: envdiff-export.<ext>)
  --export-append       Append to existing file instead of overwriting
`.trim();

module.exports = { resolveExportConfig, exportConfigHelp, VALID_FORMATS, DEFAULT_FORMAT };
