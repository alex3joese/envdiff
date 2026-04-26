// rename.js — rename keys across one or more .env files

const fs = require('fs');
const { parseEnv } = require('./parser');

/**
 * Build new file content with a key renamed.
 * Preserves comments and blank lines.
 */
function renameKeyInContent(content, fromKey, toKey) {
  const lines = content.split('\n');
  let renamed = 0;
  const result = lines.map(line => {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('#') || trimmed === '') return line;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) return line;
    const key = line.slice(0, eqIdx).trim();
    if (key === fromKey) {
      renamed++;
      return toKey + '=' + line.slice(eqIdx + 1);
    }
    return line;
  });
  return { content: result.join('\n'), renamed };
}

/**
 * Rename a key in a parsed env map (returns new object).
 */
function renameKeyInMap(envMap, fromKey, toKey) {
  const result = {};
  for (const [k, v] of Object.entries(envMap)) {
    result[k === fromKey ? toKey : k] = v;
  }
  return result;
}

/**
 * Apply rename to a list of files on disk.
 * Returns array of { file, renamed } results.
 */
function renameInFiles(files, fromKey, toKey, dryRun = false) {
  return files.map(file => {
    const raw = fs.readFileSync(file, 'utf8');
    const { content, renamed } = renameKeyInContent(raw, fromKey, toKey);
    if (renamed > 0 && !dryRun) {
      fs.writeFileSync(file, content, 'utf8');
    }
    return { file, renamed };
  });
}

module.exports = { renameKeyInContent, renameKeyInMap, renameInFiles };
