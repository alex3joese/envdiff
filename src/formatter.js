/**
 * formatter.js
 * Handles output formatting for different display modes (table, json, minimal)
 */

/**
 * Format issues as a JSON string
 * @param {object} report - the report object from reporter
 * @returns {string}
 */
function formatJson(report) {
  return JSON.stringify(report, null, 2);
}

/**
 * Format issues as a minimal line-by-line list
 * @param {object[]} issues - array of issue objects
 * @returns {string}
 */
function formatMinimal(issues) {
  if (!issues || issues.length === 0) return 'No issues found.';
  return issues
    .map((issue) => {
      const envLabel = issue.env ? `[${issue.env}]` : '';
      return `${issue.type.toUpperCase()} ${envLabel} ${issue.key}`.trim();
    })
    .join('\n');
}

/**
 * Format issues as a simple ASCII table
 * @param {object[]} issues - array of issue objects
 * @returns {string}
 */
function formatTable(issues) {
  if (!issues || issues.length === 0) return 'No issues found.';

  const headers = ['TYPE', 'KEY', 'ENV'];
  const rows = issues.map((issue) => [
    issue.type.toUpperCase(),
    issue.key,
    issue.env || '-',
  ]);

  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] || '').length))
  );

  const divider = colWidths.map((w) => '-'.repeat(w + 2)).join('+');
  const formatRow = (cells) =>
    cells.map((c, i) => ` ${(c || '').padEnd(colWidths[i])} `).join('|');

  const lines = [
    divider,
    formatRow(headers),
    divider,
    ...rows.map(formatRow),
    divider,
  ];

  return lines.join('\n');
}

/**
 * Dispatch to the correct formatter based on format string
 * @param {string} format - 'json' | 'table' | 'minimal'
 * @param {object} report - report object with issues array
 * @returns {string}
 */
function applyFormat(format, report) {
  switch (format) {
    case 'json':
      return formatJson(report);
    case 'table':
      return formatTable(report.issues);
    case 'minimal':
      return formatMinimal(report.issues);
    default:
      throw new Error(`Unknown format: "${format}". Use json, table, or minimal.`);
  }
}

module.exports = { formatJson, formatMinimal, formatTable, applyFormat };
