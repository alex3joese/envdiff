// auditCmd.js — CLI commands for audit log management

const {
  loadAuditLog,
  clearAuditLog,
  DEFAULT_AUDIT_FILE,
} = require('./audit');
const { applyFormat } = require('./formatter');

function cmdAuditShow(argv) {
  const auditPath = argv.auditFile || DEFAULT_AUDIT_FILE;
  const format = argv.format || 'table';
  const entries = loadAuditLog(auditPath);

  if (entries.length === 0) {
    console.log('No audit entries found.');
    return;
  }

  if (format === 'json') {
    console.log(JSON.stringify(entries, null, 2));
    return;
  }

  console.log(`Audit log: ${auditPath} (${entries.length} entries)\n`);
  entries.forEach((e, i) => {
    const files = (e.files || []).join(', ');
    console.log(`[${i + 1}] ${e.timestamp}`);
    console.log(`    Files   : ${files || 'n/a'}`);
    console.log(`    Issues  : ${e.issueCount ?? 'n/a'}`);
    console.log(`    Summary : ${e.summary || 'n/a'}`);
    console.log();
  });
}

function cmdAuditClear(argv) {
  const auditPath = argv.auditFile || DEFAULT_AUDIT_FILE;
  clearAuditLog(auditPath);
  console.log(`Audit log cleared: ${auditPath}`);
}

function cmdAuditLast(argv) {
  const auditPath = argv.auditFile || DEFAULT_AUDIT_FILE;
  const entries = loadAuditLog(auditPath);
  if (entries.length === 0) {
    console.log('No audit entries found.');
    return;
  }
  const last = entries[entries.length - 1];
  console.log(JSON.stringify(last, null, 2));
}

module.exports = { cmdAuditShow, cmdAuditClear, cmdAuditLast };
