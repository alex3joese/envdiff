const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

function deriveKey(passphrase) {
  return crypto.scryptSync(passphrase, 'envdiff-salt', KEY_LENGTH);
}

function encryptValue(value, passphrase) {
  const key = deriveKey(passphrase);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptValue(encrypted, passphrase) {
  const [ivHex, dataHex] = encrypted.split(':');
  if (!ivHex || !dataHex) throw new Error('Invalid encrypted format');
  const key = deriveKey(passphrase);
  const iv = Buffer.from(ivHex, 'hex');
  const data = Buffer.from(dataHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

function encryptEnv(envMap, passphrase, keys = null) {
  const result = {};
  for (const [k, v] of Object.entries(envMap)) {
    if (!keys || keys.includes(k)) {
      result[k] = 'enc:' + encryptValue(v, passphrase);
    } else {
      result[k] = v;
    }
  }
  return result;
}

function decryptEnv(envMap, passphrase) {
  const result = {};
  for (const [k, v] of Object.entries(envMap)) {
    if (typeof v === 'string' && v.startsWith('enc:')) {
      result[k] = decryptValue(v.slice(4), passphrase);
    } else {
      result[k] = v;
    }
  }
  return result;
}

module.exports = { encryptValue, decryptValue, encryptEnv, decryptEnv };
