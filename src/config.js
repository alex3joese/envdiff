/**
 * config.js - resolve and merge envdiff configuration
 */

const path = require('path');
const fs = require('fs');

const CONFIG_FILENAMES = ['envdiff.config.js', 'envdiff.config.json', '.envdiffrc'];

const DEFAULTS = {
  files: [],
  ignore: [],
  strict: false,
  reporter: 'text',
};

/**
 * Search for a config file starting from cwd
 * @param {string} cwd
 * @returns {object|null}
 */
function resolveConfig(cwd = process.cwd()) {
  for (const name of CONFIG_FILENAMES) {
    const filePath = path.join(cwd, name);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = name.endsWith('.js') ? require(filePath) : JSON.parse(raw);
        return mergeConfig(parsed);
      } catch (e) {
        throw new Error(`Failed to parse config file ${filePath}: ${e.message}`);
      }
    }
  }
  return mergeConfig({});
}

/**
 * Merge user config with defaults
 * @param {object} userConfig
 * @returns {object}
 */
function mergeConfig(userConfig = {}) {
  return {
    ...DEFAULTS,
    ...userConfig,
    ignore: [
      ...(DEFAULTS.ignore || []),
      ...(userConfig.ignore || []),
    ],
    files: userConfig.files || DEFAULTS.files,
  };
}

module.exports = { resolveConfig, mergeConfig, DEFAULTS, CONFIG_FILENAMES };
