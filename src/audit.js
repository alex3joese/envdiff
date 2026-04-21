// audit.js — tracks and records comparison run history

const fs = require('fs');
const path = require('path');

const DEFAULT_AUDIT_FILE = '.envdiff-audit.json';

function timestamp() {
  return new Date().toISOString();
}

function loadAuditLog(auditPath = DEFAULT_AUDIT_FILE) {
  if (!fs.existsSync(auditPath)) return [];
  try {
    const raw = fs.readFileSync(auditPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveAuditLog(entries, auditPath = DEFAULT_AUDIT_FILE) {
  fs.writeFileSync(auditPath, JSON.stringify(entries, null, 2), 'utf8');
}

function appendAuditEntry(entry, auditPath = DEFAULT_AUDIT_FILE) {
  const entries = loadAuditLog(auditPath);
  entries.push({ ...entry, timestamp: timestamp() });
  saveAuditLog(entries, auditPath);
  return entries;
}

function buildAuditEntry({ files, issues, summary }) {
  return {
    files: files.map(f => path.basename(f)),
    issueCount: issues.length,
    summary,
  };
}

function clearAuditLog(auditPath = DEFAULT_AUDIT_FILE) {
  saveAuditLog([], auditPath);
}

module.exports = {
  loadAuditLog,
  saveAuditLog,
  appendAuditEntry,
  buildAuditEntry,
  clearAuditLog,
  DEFAULT_AUDIT_FILE,
};
