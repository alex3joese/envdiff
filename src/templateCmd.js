const { loadEnvFiles, collectAllKeys } = require('./loader');
const { parseEnv } = require('./parser');
const { buildTemplate, writeTemplate, checkAgainstTemplate } = require('./template');
const { resolveTemplateConfig, templateHelp } = require('./templateConfig');
const fs = require('fs');

async function cmdTemplate(files, opts = {}) {
  if (!files || files.length === 0) {
    console.error('envdiff template: no input files specified');
    process.exit(1);
  }

  const config = resolveTemplateConfig(opts);

  let envMaps;
  try {
    envMaps = loadEnvFiles(files);
  } catch (err) {
    console.error(`envdiff template: failed to load files — ${err.message}`);
    process.exit(1);
  }

  const content = buildTemplate(envMaps, {
    placeholder: config.placeholder,
    includeComments: config.includeComments,
  });

  writeTemplate(config.output, content);
  console.log(`Template written to ${config.output}`);

  if (config.check) {
    let checkContent;
    try {
      checkContent = fs.readFileSync(config.check, 'utf8');
    } catch (err) {
      console.error(`envdiff template: cannot read check file — ${err.message}`);
      process.exit(1);
    }
    const templateMap = parseEnv(content);
    const envMap = parseEnv(checkContent);
    const { missing, extra } = checkAgainstTemplate(templateMap, envMap);
    if (missing.length > 0) {
      console.warn(`Missing keys in ${config.check}: ${missing.join(', ')}`);
    }
    if (extra.length > 0) {
      console.warn(`Extra keys in ${config.check}: ${extra.join(', ')}`);
    }
    if (missing.length === 0 && extra.length === 0) {
      console.log(`${config.check} matches template perfectly.`);
    }
  }
}

module.exports = { cmdTemplate, templateHelp };
