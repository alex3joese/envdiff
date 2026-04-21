const fs = require('fs');
const path = require('path');
const { loadEnvFiles, collectAllKeys } = require('./loader');
const { compareEnvs, getIssues } = require('./comparator');
const { formatReport } = require('./reporter');

const DEFAULT_DEBOUNCE_MS = 300;

function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function watchEnvFiles(filePaths, options = {}) {
  const { onUpdate, debounceMs = DEFAULT_DEBOUNCE_MS, format = 'text' } = options;
  const watchers = [];

  const runCompare = debounce(() => {
    try {
      const envs = loadEnvFiles(filePaths);
      const allKeys = collectAllKeys(envs);
      const results = compareEnvs(envs, allKeys);
      const issues = getIssues(results);
      const report = formatReport(results, issues, { format });
      if (typeof onUpdate === 'function') {
        onUpdate({ report, issues, results, error: null });
      }
    } catch (err) {
      if (typeof onUpdate === 'function') {
        onUpdate({ report: null, issues: [], results: {}, error: err });
      }
    }
  }, debounceMs);

  for (const filePath of filePaths) {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) continue;
    const watcher = fs.watch(resolved, () => runCompare());
    watchers.push(watcher);
  }

  runCompare();

  return {
    close() {
      watchers.forEach(w => w.close());
    },
    watchers,
  };
}

module.exports = { watchEnvFiles, debounce };
