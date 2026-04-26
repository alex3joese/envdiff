const { redactAll } = require('./redact');
const { resolveRedactConfig, redactHelp } = require('./redactConfig');
const { loadEnvFiles } = require('./loader');
const fs = require('fs');
const path = require('path');

function cmdRedact(argv, flags) {
  if (flags.help || flags.h) {
    console.log(redactHelp());
    return;
  }

  const config = resolveRedactConfig(flags);
  const files = argv.length > 0 ? argv : config.files;

  if (!files || files.length === 0) {
    console.error('No .env files specified.');
    process.exit(1);
  }

  const envMap = loadEnvFiles(files);
  const redacted = redactAll(envMap, config.customPatterns);

  if (config.output === 'stdout' || flags.stdout) {
    for (const [label, vars] of Object.entries(redacted)) {
      console.log(`\n# ${label}`);
      for (const [k, v] of Object.entries(vars)) {
        console.log(`${k}=${v}`);
      }
    }
    return;
  }

  for (const [label, vars] of Object.entries(redacted)) {
    const outPath = config.outDir
      ? path.join(config.outDir, path.basename(label))
      : label.replace(/(\.env)(\.[^.]+)?$/, '$1.redacted$2');

    const lines = Object.entries(vars).map(([k, v]) => `${k}=${v}`).join('\n');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, lines + '\n', 'utf8');
    console.log(`Wrote redacted file: ${outPath}`);
  }
}

module.exports = { cmdRedact };
