# envdiff

> CLI tool to compare .env files across environments and flag missing or mismatched keys

## Installation

```bash
npm install -g envdiff
```

## Usage

Compare two or more `.env` files to identify missing or mismatched keys:

```bash
envdiff .env.development .env.production
```

**Example output:**

```
✔ Matching keys:  DATABASE_URL, PORT, NODE_ENV
✘ Missing in .env.production:  DEBUG, LOG_LEVEL
⚠ Value mismatch:  API_URL
```

You can also compare multiple files at once:

```bash
envdiff .env.development .env.staging .env.production
```

### Options

| Flag | Description |
|------|-------------|
| `--keys-only` | Only compare key names, ignore values |
| `--strict` | Exit with code 1 if any differences are found |
| `--json` | Output results as JSON |

```bash
envdiff .env .env.production --strict --json
```

## License

MIT © [envdiff contributors](https://github.com/envdiff/envdiff)