// lintCmd.js — CLI handler for the lint command

const fs = require('fs');
const path = require('path');
const { lintFiles, hasLintErrors } = require('./lint');

function resolveLintFiles(args) {
  const files = args.filter((a) => !a.startsWith('--'));
  return files.length > 0 ? files : ['.env'];
}

function formatLintResults(results, { json = false } = {}) {
  if (json) return JSON.stringify(results, null, 2);

  const lines = [];
  for (const [file, issues] of Object.entries(results)) {
    if (issues.length === 0) {
      lines.push(`✓ ${file}: no issues`);
    } else {
      lines.push(`✗ ${file}: ${issues.length} issue(s)`);
      for (const issue of issues) {
        lines.push(`  line ${issue.line}: ${issue.message}`);
        lines.push(`    > ${issue.text}`);
      }
    }
  }
  return lines.join('\n');
}

function cmdLint(args = [], opts = {}) {
  const filePaths = resolveLintFiles(args);
  const useJson = args.includes('--json') || opts.json;
  const strict = args.includes('--strict') || opts.strict;

  const fileMap = {};
  const missing = [];

  for (const filePath of filePaths) {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      missing.push(filePath);
      continue;
    }
    fileMap[filePath] = fs.readFileSync(resolved, 'utf8');
  }

  if (missing.length > 0) {
    const msg = `File(s) not found: ${missing.join(', ')}`;
    if (opts.stderr) opts.stderr(msg);
    else process.stderr.write(msg + '\n');
  }

  const results = lintFiles(fileMap);
  const output = formatLintResults(results, { json: useJson });

  if (opts.stdout) opts.stdout(output);
  else process.stdout.write(output + '\n');

  const exitCode = strict && hasLintErrors(results) ? 1 : 0;
  return exitCode;
}

module.exports = { cmdLint, formatLintResults, resolveLintFiles };
