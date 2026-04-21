// auditConfig.js — resolve audit configuration from argv and defaults

const path = require('path');
const { DEFAULT_AUDIT_FILE } = require('./audit');

const AUDIT_DEFAULTS = {
  auditFile: DEFAULT_AUDIT_FILE,
  enabled: true,
  maxEntries: 100,
};

function resolveAuditConfig(argv = {}) {
  return {
    auditFile: argv.auditFile || AUDIT_DEFAULTS.auditFile,
    enabled: argv.noAudit ? false : AUDIT_DEFAULTS.enabled,
    maxEntries: argv.maxEntries
      ? parseInt(argv.maxEntries, 10)
      : AUDIT_DEFAULTS.maxEntries,
  };
}

function pruneAuditLog(entries, maxEntries) {
  if (!maxEntries || entries.length <= maxEntries) return entries;
  return entries.slice(entries.length - maxEntries);
}

const auditConfigHelp = `
Audit options:
  --audit-file <path>   Path to audit log file (default: ${DEFAULT_AUDIT_FILE})
  --no-audit            Disable audit logging for this run
  --max-entries <n>     Maximum number of audit entries to keep (default: 100)
`.trim();

module.exports = { resolveAuditConfig, pruneAuditLog, auditConfigHelp, AUDIT_DEFAULTS };
