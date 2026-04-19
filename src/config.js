/**
 * Resolves and normalizes CLI options into a config object.
 */

const VALID_FORMATS = ['text', 'json'];

/**
 * @param {object} options - raw options from commander
 * @returns {object} normalized config
 */
function resolveConfig(options = {}) {
  const format = VALID_FORMATS.includes(options.format) ? options.format : 'text';

  const ignoreKeys = options.ignore
    ? options.ignore.split(',').map(k => k.trim()).filter(Boolean)
    : [];

  const strict = Boolean(options.strict);

  return {
    format,
    ignoreKeys,
    strict,
  };
}

/**
 * Merges a config file (e.g. envdiff.config.json) with CLI options.
 * CLI options take precedence.
 * @param {object} fileConfig
 * @param {object} cliOptions
 * @returns {object}
 */
function mergeConfig(fileConfig = {}, cliOptions = {}) {
  const base = {
    format: fileConfig.format || 'text',
    ignoreKeys: fileConfig.ignoreKeys || [],
    strict: fileConfig.strict || false,
  };

  return resolveConfig({
    format: cliOptions.format || base.format,
    ignore: cliOptions.ignore || base.ignoreKeys.join(','),
    strict: cliOptions.strict !== undefined ? cliOptions.strict : base.strict,
  });
}

module.exports = { resolveConfig, mergeConfig };
