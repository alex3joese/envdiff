const fs = require('fs');
const path = require('path');

/**
 * Export comparison results to a file in the given format.
 * @param {string} outputPath
 * @param {string} content
 */
function writeExport(outputPath, content) {
  const dir = path.dirname(outputPath);
  if (dir && dir !== '.' && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, content, 'utf8');
}

/**
 * Build a structured export payload from issues and metadata.
 * @param {object} opts
 * @param {string[]} opts.files
 * @param {object[]} opts.issues
 * @param {string} opts.format  'json' | 'csv' | 'text'
 * @returns {string}
 */
function buildExportContent({ files, issues, format = 'json' }) {
  if (format === 'json') {
    return JSON.stringify({ exportedAt: new Date().toISOString(), files, issues }, null, 2);
  }
  if (format === 'csv') {
    const header = 'key,type,files';
    const rows = issues.map(i => `${i.key},${i.type},"${(i.files || []).join(';')}"`);
    return [header, ...rows].join('\n');
  }
  // text
  const lines = issues.map(i => `[${i.type}] ${i.key} (${(i.files || []).join(', ')})`);
  return [`Exported: ${new Date().toISOString()}`, `Files: ${files.join(', ')}`, '', ...lines].join('\n');
}

/**
 * Determine file extension for a given format.
 * @param {string} format
 * @returns {string}
 */
function extensionFor(format) {
  const map = { json: '.json', csv: '.csv', text: '.txt' };
  return map[format] || '.txt';
}

module.exports = { writeExport, buildExportContent, extensionFor };
