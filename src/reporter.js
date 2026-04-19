/**
 * Formats comparison results for CLI output
 */

const STATUS_LABELS = {
  ok: '✓',
  mismatch: '⚠ mismatch',
  missing_some: '✗ missing in some',
  missing_all: '✗ missing everywhere',
};

const STATUS_COLORS = {
  ok: '\x1b[32m',
  mismatch: '\x1b[33m',
  missing_some: '\x1b[31m',
  missing_all: '\x1b[31m',
};

const RESET = '\x1b[0m';

function formatReport(results, { color = true, issuesOnly = false } = {}) {
  const rows = issuesOnly ? results.filter(r => r.status !== 'ok') : results;

  if (rows.length === 0) {
    return color
      ? `${STATUS_COLORS.ok}All keys match across environments.${RESET}`
      : 'All keys match across environments.';
  }

  const lines = [];

  for (const { key, status, details } of rows) {
    const label = STATUS_LABELS[status] || status;
    const prefix = color ? `${STATUS_COLORS[status] || ''}` : '';
    const suffix = color ? RESET : '';
    lines.push(`${prefix}[${label}] ${key}${suffix}`);

    if (status !== 'ok') {
      for (const [file, value] of Object.entries(details)) {
        const display = value === null ? '(missing)' : `"${value}"`;
        lines.push(`       ${file}: ${display}`);
      }
    }
  }

  return lines.join('\n');
}

function summarize(results) {
  const counts = { ok: 0, mismatch: 0, missing_some: 0, missing_all: 0 };
  for (const { status } of results) {
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

module.exports = { formatReport, summarize };
