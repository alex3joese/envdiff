const path = require('path');
const { loadEnvFiles, collectAllKeys } = require('./loader');
const { compareEnvs, getIssues } = require('./comparator');
const { resolveConfig } = require('./config');
const { resolveExportConfig, exportConfigHelp } = require('./exportConfig');
const { buildExportContent, writeExport, extensionFor } = require('./export');

/**
 * CLI command: export comparison results to a file.
 * @param {string[]} envPaths  Paths to .env files
 * @param {object}  argv       Parsed CLI arguments
 */
function cmdExport(envPaths, argv = {}) {
  if (!envPaths || envPaths.length < 2) {
    console.error('envdiff export: provide at least two .env file paths');
    process.exit(1);
  }

  const config = resolveConfig(argv);
  const exportCfg = resolveExportConfig({
    format: argv['export-format'] || argv.exportFormat,
    output: argv['export-output'] || argv.exportOutput,
    append: argv['export-append'] || argv.exportAppend,
  });

  const envs = loadEnvFiles(envPaths);
  const allKeys = collectAllKeys(envs);
  const compared = compareEnvs(envs, allKeys);
  const issues = getIssues(compared, config);

  const ext = extensionFor(exportCfg.format);
  const outputPath = exportCfg.output.endsWith(ext)
    ? exportCfg.output
    : exportCfg.output + ext;

  const content = buildExportContent({
    files: envPaths.map(p => path.basename(p)),
    issues,
    format: exportCfg.format,
  });

  writeExport(outputPath, content);
  console.log(`Exported ${issues.length} issue(s) to ${outputPath} [${exportCfg.format}]`);
}

function exportHelp() {
  console.log('Usage: envdiff export <file1> <file2> [...files]');
  console.log('');
  console.log(exportConfigHelp);
}

module.exports = { cmdExport, exportHelp };
