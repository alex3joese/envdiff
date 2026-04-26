// renameConfig.js — resolve config for the rename command

const DEFAULT_RENAME_CONFIG = {
  dryRun: false,
  files: [],
};

/**
 * Resolve rename config from CLI args and optional base config.
 */
function resolveRenameConfig(args = {}, base = {}) {
  return {
    ...DEFAULT_RENAME_CONFIG,
    ...base,
    dryRun: args.dryRun ?? args['dry-run'] ?? base.dryRun ?? false,
    files: args.files ?? base.files ?? [],
  };
}

const renameHelp = `
Usage: envdiff rename <FROM_KEY> <TO_KEY> [options]

Rename a key across one or more .env files.

Options:
  --files <f1,f2,...>   Comma-separated list of .env files to update
  --dry-run             Preview changes without writing to disk
  --help                Show this help message

Examples:
  envdiff rename OLD_API_KEY NEW_API_KEY --files .env,.env.staging
  envdiff rename DB_HOST DATABASE_HOST --files .env --dry-run
`.trim();

module.exports = { resolveRenameConfig, renameHelp };
