const path = require('path');
const { watchEnvFiles } = require('./watch');
const { applyFormat } = require('./formatter');

function clearLine() {
  process.stdout.write('\x1B[2J\x1B[0f');
}

function cmdWatch(args, options = {}) {
  const files = args;
  const format = options.format || 'text';
  const clear = options.clear !== false;
  const out = options.out || process.stdout;

  if (!files || files.length < 2) {
    out.write('Error: watch requires at least 2 .env file paths\n');
    return null;
  }

  out.write(`Watching ${files.length} file(s) for changes...\n`);
  out.write('Press Ctrl+C to stop.\n\n');

  const handle = watchEnvFiles(files, {
    format,
    onUpdate: ({ report, issues, error }) => {
      if (clear) clearLine();
      if (error) {
        out.write(`Error: ${error.message}\n`);
        return;
      }
      const timestamp = new Date().toLocaleTimeString();
      out.write(`[${timestamp}] ${issues.length} issue(s) found\n\n`);
      out.write(report + '\n');
    },
  });

  process.on('SIGINT', () => {
    handle.close();
    out.write('\nStopped watching.\n');
    process.exit(0);
  });

  return handle;
}

module.exports = { cmdWatch };
