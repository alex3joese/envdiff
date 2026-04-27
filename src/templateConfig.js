const path = require('path');

const DEFAULTS = {
  output: '.env.template',
  placeholder: '',
  includeComments: true,
  check: null,
};

function resolveTemplateConfig(opts = {}) {
  return {
    output: opts.output || DEFAULTS.output,
    placeholder: opts.placeholder !== undefined ? opts.placeholder : DEFAULTS.placeholder,
    includeComments: opts.includeComments !== undefined ? opts.includeComments : DEFAULTS.includeComments,
    check: opts.check || DEFAULTS.check,
  };
}

const templateHelp = `
template command options:
  --output <file>       Output path for generated template (default: .env.template)
  --placeholder <val>   Value to use for each key (default: empty)
  --no-comments         Omit header comment block
  --check <file>        Check a .env file against the generated template
`.trim();

module.exports = { resolveTemplateConfig, templateHelp };
