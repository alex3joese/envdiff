const fs = require('fs');
const os = require('os');
const path = require('path');
const { cmdTemplate } = require('./templateCmd');

function writeTempEnv(content) {
  const p = path.join(os.tmpdir(), `envdiff-tpl-${Date.now()}-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('cmdTemplate', () => {
  let outputPath;

  beforeEach(() => {
    outputPath = path.join(os.tmpdir(), `envdiff-out-${Date.now()}.env`);
  });

  afterEach(() => {
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  });

  it('writes a template file with sorted empty keys', async () => {
    const f = writeTempEnv('B=2\nA=1\n');
    try {
      await cmdTemplate([f], { output: outputPath, includeComments: false });
      const content = fs.readFileSync(outputPath, 'utf8');
      expect(content).toBe('A=\nB=\n');
    } finally {
      fs.unlinkSync(f);
    }
  });

  it('uses placeholder option', async () => {
    const f = writeTempEnv('FOO=bar\n');
    try {
      await cmdTemplate([f], { output: outputPath, placeholder: 'FILL_ME', includeComments: false });
      const content = fs.readFileSync(outputPath, 'utf8');
      expect(content).toContain('FOO=FILL_ME');
    } finally {
      fs.unlinkSync(f);
    }
  });

  it('merges keys from multiple files', async () => {
    const f1 = writeTempEnv('A=1\n');
    const f2 = writeTempEnv('B=2\n');
    try {
      await cmdTemplate([f1, f2], { output: outputPath, includeComments: false });
      const content = fs.readFileSync(outputPath, 'utf8');
      expect(content).toContain('A=');
      expect(content).toContain('B=');
    } finally {
      fs.unlinkSync(f1);
      fs.unlinkSync(f2);
    }
  });

  it('exits with error when no files given', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(cmdTemplate([], {})).rejects.toThrow('exit');
    mockExit.mockRestore();
  });
});
