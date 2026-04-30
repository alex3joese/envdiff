// comment.js — preserve and manipulate inline comments in .env files

/**
 * Extract inline comment from a raw env line.
 * e.g. "KEY=value # some comment" => "# some comment"
 */
function extractComment(line) {
  const match = line.match(/#(.*)$/);
  return match ? match[1].trim() : null;
}

/**
 * Strip inline comment from a raw env line value portion.
 * Returns the clean value string.
 */
function stripComment(value) {
  return value.replace(/\s+#.*$/, '').trim();
}

/**
 * Parse a .env file content and return a map of key => comment.
 * Only keys that have comments are included.
 */
function extractComments(content) {
  const comments = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const rest = trimmed.slice(eqIdx + 1);
    const comment = extractComment(rest);
    if (comment !== null) {
      comments[key] = comment;
    }
  }
  return comments;
}

/**
 * Reattach comments from a comment map onto env file content.
 * If a key exists in the comment map, its line gets the comment appended.
 */
function applyComments(content, comments) {
  return content
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return line;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return line;
      const key = trimmed.slice(0, eqIdx).trim();
      if (comments[key] !== undefined) {
        const cleanLine = line.replace(/\s+#.*$/, '');
        return `${cleanLine} # ${comments[key]}`;
      }
      return line;
    })
    .join('\n');
}

module.exports = { extractComment, stripComment, extractComments, applyComments };
