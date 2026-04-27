const DEFAULT_ENCRYPT_CONFIG = {
  passphrase: null,
  keys: null, // null means encrypt all keys
  passphraseEnvVar: 'ENVDIFF_PASSPHRASE',
};

function resolveEncryptConfig(opts = {}) {
  const passphrase =
    opts.passphrase ||
    process.env[opts.passphraseEnvVar || DEFAULT_ENCRYPT_CONFIG.passphraseEnvVar] ||
    null;

  const keys =
    opts.keys
      ? (Array.isArray(opts.keys) ? opts.keys : opts.keys.split(',').map(k => k.trim()))
      : null;

  return { passphrase, keys };
}

const encryptHelp = `
encrypt  Encrypt values in .env files
  --passphrase, -p   Passphrase used for encryption/decryption
  --keys, -k         Comma-separated list of keys to encrypt (default: all)
  --decrypt          Decrypt instead of encrypt
  --file             Target .env file(s)

The passphrase can also be set via ENVDIFF_PASSPHRASE environment variable.
`.trim();

module.exports = { resolveEncryptConfig, encryptHelp };
