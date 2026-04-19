#!/usr/bin/env node

const { program } = require('commander');
const { loadEnvFiles, collectAllKeys } = require('./loader');
const { compareEnvs, getIssues } = require('./comparator');
const { formatReport, summarize } = require('./reporter');
const { resolveConfig } = require('./config');

program
  .name('envdiff')
  .description('Compare .env files across environments and flag missing or mismatched keys')
  .version('1.0.0');

program
  .command('compare <files...>')
  .description('Compare two or more .env files')
  .option('-f, --format <type>', 'output format: text or json', 'text')
  .option('-s, --strict', 'exit with non-zero code if issues found', false)
  .option('-i, --ignore <keys>', 'comma-separated list of keys to ignore')
  .action((files, options) => {
    const config = resolveConfig(options);

    let envData;
    try {
      envData = loadEnvFiles(files);
    } catch (err) {
      console.error(`Error loading files: ${err.message}`);
      process.exit(1);
    }

    const allKeys = collectAllKeys(envData);
    const filteredKeys = config.ignoreKeys.length
      ? allKeys.filter(k => !config.ignoreKeys.includes(k))
      : allKeys;

    const results = compareEnvs(envData, filteredKeys);
    const issues = getIssues(results);

    const report = formatReport(results, files, config.format);
    console.log(report);

    const summary = summarize(issues);
    console.log(summary);

    if (config.strict && issues.length > 0) {
      process.exit(1);
    }
  });

program.parse(process.argv);
