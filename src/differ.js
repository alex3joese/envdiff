/**
 * differ.js
 * Computes a structured diff between two env snapshots,
 * categorizing changes as added, removed, or value-changed.
 */

/**
 * @param {Object} base  - baseline env key/value map
 * @param {Object} head  - target env key/value map
 * @returns {DiffResult}
 */
function diffEnvs(base, head) {
  const added = {};
  const removed = {};
  const changed = {};

  const allKeys = new Set([...Object.keys(base), ...Object.keys(head)]);

  for (const key of allKeys) {
    const inBase = Object.prototype.hasOwnProperty.call(base, key);
    const inHead = Object.prototype.hasOwnProperty.call(head, key);

    if (inBase && !inHead) {
      removed[key] = base[key];
    } else if (!inBase && inHead) {
      added[key] = head[key];
    } else if (base[key] !== head[key]) {
      changed[key] = { from: base[key], to: head[key] };
    }
  }

  return { added, removed, changed };
}

/**
 * Returns true when two env maps are identical.
 * @param {Object} base
 * @param {Object} head
 * @returns {boolean}
 */
function isIdentical(base, head) {
  const diff = diffEnvs(base, head);
  return (
    Object.keys(diff.added).length === 0 &&
    Object.keys(diff.removed).length === 0 &&
    Object.keys(diff.changed).length === 0
  );
}

module.exports = { diffEnvs, isIdentical };
