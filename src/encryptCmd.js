const fs = require('fs');
const path = require('path');
const { parseEnv } = require('./parser');
const { encryptEnv, decryptEnv } = require('./encrypt');
const { resolveEncryptConfig, encryptHelp } = require('./encryptConfig');

function buildOutput(envMap) {
  return Object.entries(envMap)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';
}

function cmdEncrypt(argv, opts = {}) {
  const files = argv.file
    ? (Array.isArray(argv.file) ? argv.file : [argv.file])
    : ['.env'];

  if (argv.help) {
    console.log(encryptHelp);
    return;
  }

  const config = resolveEncryptConfig({
    passphrase: argv.passphrase || argv.p,
    keys: argv.keys || argv.k,
  });

  if (!config.passphrase) {
    console.error('Error: passphrase is required (--passphrase or ENVDIFF_PASSPHRASE)');
    process.exitCode = 1;
    return;
  }

  const decrypt = !!(argv.decrypt || argv.d);
  const write = opts.write !== false;

  const results = [];

  for (const file of files) {
    const resolved = path.resolve(file);
    if (!fs.existsSync(resolved)) {
      console.error(`File not found: ${file}`);
      process.exitCode = 1;
      continue;
    }

    const content = fs.readFileSync(resolved, 'utf8');
    const envMap = parseEnv(content);
    const processed = decrypt
      ? decryptEnv(envMap, config.passphrase)
      : encryptEnv(envMap, config.passphrase, config.keys);

    const output = buildOutput(processed);

    if (write) {
      fs.writeFileSync(resolved, output, 'utf8');
      console.log(`${decrypt ? 'Decrypted' : 'Encrypted'}: ${file}`);
    }

    results.push({ file, output });
  }

  return results;
}

module.exports = { cmdEncrypt };
