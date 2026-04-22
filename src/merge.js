// merge.js — merge multiple .env files into a single unified output

/**
 * Merge multiple parsed env objects into one.
 * Later files take precedence over earlier ones (last-wins strategy).
 * @param {Array<{file: string, env: Record<string, string>}>} envFiles
 * @param {object} opts
 * @param {boolean} opts.preferFirst - if true, first file wins instead
 * @returns {{ merged: Record<string, string>, conflicts: Array }}
 */
function mergeEnvs(envFiles, opts = {}) {
  const { preferFirst = false } = opts;
  const merged = {};
  const conflicts = [];
  const seen = {}; // key -> { value, file }

  for (const { file, env } of envFiles) {
    for (const [key, value] of Object.entries(env)) {
      if (key in seen) {
        if (seen[key].value !== value) {
          conflicts.push({
            key,
            files: [seen[key].file, file],
            values: [seen[key].value, value],
          });
        }
        if (!preferFirst) {
          merged[key] = value;
          seen[key] = { value, file };
        }
      } else {
        merged[key] = value;
        seen[key] = { value, file };
      }
    }
  }

  return { merged, conflicts };
}

/**
 * Build a .env-formatted string from a merged env object.
 * @param {Record<string, string>} env
 * @returns {string}
 */
function buildMergedOutput(env) {
  return Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';
}

module.exports = { mergeEnvs, buildMergedOutput };
