/**
 * diffFormatter.js
 * Renders a DiffResult (from differ.js) into human-readable or
 * machine-readable output.
 */

const chalk = require('chalk');

/**
 * @param {DiffResult} diff
 * @returns {string}  coloured terminal output
 */
function formatDiffText(diff) {
  const lines = [];

  for (const [key, value] of Object.entries(diff.added)) {
    lines.push(chalk.green(`+ ${key}=${value}`));
  }

  for (const [key, value] of Object.entries(diff.removed)) {
    lines.push(chalk.red(`- ${key}=${value}`));
  }

  for (const [key, { from, to }] of Object.entries(diff.changed)) {
    lines.push(chalk.yellow(`~ ${key}: "${from}" → "${to}"`));
  }

  if (lines.length === 0) {
    return chalk.gray('No differences found.');
  }

  return lines.join('\n');
}

/**
 * @param {DiffResult} diff
 * @returns {Object}  plain JSON-serialisable object
 */
function formatDiffJson(diff) {
  return {
    added: diff.added,
    removed: diff.removed,
    changed: diff.changed,
    summary: {
      addedCount: Object.keys(diff.added).length,
      removedCount: Object.keys(diff.removed).length,
      changedCount: Object.keys(diff.changed).length,
    },
  };
}

/**
 * Dispatch to the right formatter.
 * @param {DiffResult} diff
 * @param {'text'|'json'} format
 * @returns {string}
 */
function applyDiffFormat(diff, format = 'text') {
  if (format === 'json') {
    return JSON.stringify(formatDiffJson(diff), null, 2);
  }
  return formatDiffText(diff);
}

module.exports = { formatDiffText, formatDiffJson, applyDiffFormat };
