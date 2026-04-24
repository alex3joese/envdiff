// lint.js — checks for common .env style issues

const SUSPICIOUS_PATTERNS = [
  { pattern: /\s=/, message: 'space before equals sign' },
  { pattern: /=\s/, message: 'space after equals sign' },
  { pattern: /^[a-z]/, message: 'key should be uppercase' },
  { pattern: /[^A-Z0-9_].*=/, message: 'key contains invalid characters' },
];

const EMPTY_VALUE_WARNING = 'empty value (consider using a placeholder)';
const QUOTE_MISMATCH_WARNING = 'mismatched quotes in value';

function lintLine(line, lineNumber) {
  const issues = [];
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith('#')) return issues;

  for (const { pattern, message } of SUSPICIOUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      issues.push({ line: lineNumber, text: trimmed, message });
    }
  }

  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) {
    issues.push({ line: lineNumber, text: trimmed, message: 'missing equals sign' });
    return issues;
  }

  const value = trimmed.slice(eqIdx + 1);

  if (value === '') {
    issues.push({ line: lineNumber, text: trimmed, message: EMPTY_VALUE_WARNING });
  }

  if (
    (value.startsWith('"') && !value.endsWith('"')) ||
    (value.startsWith("'") && !value.endsWith("'"))
  ) {
    issues.push({ line: lineNumber, text: trimmed, message: QUOTE_MISMATCH_WARNING });
  }

  return issues;
}

function lintEnvContent(content) {
  const lines = content.split('\n');
  return lines.flatMap((line, idx) => lintLine(line, idx + 1));
}

function lintFiles(fileMap) {
  const results = {};
  for (const [filename, content] of Object.entries(fileMap)) {
    results[filename] = lintEnvContent(content);
  }
  return results;
}

function hasLintErrors(results) {
  return Object.values(results).some((issues) => issues.length > 0);
}

module.exports = { lintLine, lintEnvContent, lintFiles, hasLintErrors };
