/**
 * filter.js - filter and ignore keys based on patterns or explicit lists
 */

/**
 * @param {string[]} keys
 * @param {string[]} ignorePatterns - glob-style or exact strings, supports * wildcard
 * @returns {string[]}
 */
function filterKeys(keys, ignorePatterns = []) {
  if (!ignorePatterns.length) return keys;

  return keys.filter((key) => !shouldIgnore(key, ignorePatterns));
}

/**
 * @param {string} key
 * @param {string[]} patterns
 * @returns {boolean}
 */
function shouldIgnore(key, patterns) {
  return patterns.some((pattern) => matchPattern(key, pattern));
}

/**
 * Simple wildcard matcher supporting * as any sequence of chars
 * @param {string} key
 * @param {string} pattern
 * @returns {boolean}
 */
function matchPattern(key, pattern) {
  if (!pattern.includes('*')) {
    return key === pattern;
  }
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const regexStr = escaped.replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexStr}$`);
  return regex.test(key);
}

/**
 * Filter issues from comparator output based on ignored keys
 * @param {object[]} issues
 * @param {string[]} ignorePatterns
 * @returns {object[]}
 */
function filterIssues(issues, ignorePatterns = []) {
  if (!ignorePatterns.length) return issues;
  return issues.filter((issue) => !shouldIgnore(issue.key, ignorePatterns));
}

module.exports = { filterKeys, filterIssues, shouldIgnore, matchPattern };
