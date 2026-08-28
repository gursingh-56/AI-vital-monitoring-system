#!/usr/bin/env node
/**
 * STRIP SOURCE — publish a minified, comment-free copy of the project
 *
 * Rewrites the source files in place: comments and JSDoc go, type annotations are
 * erased, local variable and parameter names are mangled, and whitespace is
 * collapsed. The result still builds and deploys exactly like the original.
 *
 *   strip     Back up the originals to .source-backup/, then strip the tree.
 *   restore   Copy the originals back over the stripped files.
 *   status    Show whether the tree is currently stripped.
 *
 * Usage:
 *   npm run strip
 *   npm run strip:restore
 *   npm run strip:status
 *
 * IMPORTANT — this is one-way. Minification destroys names, comments and layout;
 * `restore` works only because `strip` kept a copy first. That copy lives in
 * .source-backup/, which is gitignored and therefore NOT pushed. Your durable
 * copy of the readable source is git history — keep the readable version on a
 * branch (or a private repo) before you commit a stripped tree over it.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BACKUP_DIR = path.join(ROOT, '.source-backup');
const STATE = path.join(BACKUP_DIR, 'state.json');
const CONFIG = path.join(ROOT, 'strip.config.json');

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function die(msg) {
  console.error(`\n${c.red('✖')} ${msg}\n`);
  process.exit(1);
}

/**
 * Overwrite a file in place, preserving its filesystem attributes.
 *
 * fs.writeFileSync re-creates the file, which fails with EPERM on Windows when the
 * target carries the hidden or system attribute (several files in this repo do).
 * Opening 'r+' and truncating writes through the existing entry instead.
 */
function writeFileInPlace(file, data) {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
  let fd;
  try {
    fd = fs.openSync(file, 'r+');
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, buf);
    return;
  }
  try {
    fs.writeSync(fd, buf, 0, buf.length, 0);
    fs.ftruncateSync(fd, buf.length);
  } finally {
    fs.closeSync(fd);
  }
}

// ---------------------------------------------------------------- config

function resolveFiles() {
  if (!fs.existsSync(CONFIG)) die(`Missing ${rel(CONFIG)}.`);
  const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  if (!Array.isArray(cfg.include) || cfg.include.length === 0) {
    die(`${rel(CONFIG)} has no "include" patterns.`);
  }
  const exclude = cfg.exclude ?? [];
  const seen = new Set();
  for (const pattern of cfg.include) {
    let matches;
    try {
      matches = fs.globSync(pattern, { cwd: ROOT, exclude });
    } catch {
      die('This tool needs Node 22+ for fs.globSync. Check `node --version`.');
    }
    for (const m of matches) {
      const abs = path.resolve(ROOT, m);
      if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;
      const r = rel(abs);
      if (r.split('/').some((seg) => seg === 'node_modules' || seg === '.source-backup')) continue;
      seen.add(r);
    }
  }
  return [...seen].sort();
}

// ---------------------------------------------------------------- stripping

const JS_LOADERS = { '.ts': 'ts', '.tsx': 'tsx', '.js': 'js', '.jsx': 'jsx', '.mjs': 'js', '.cjs': 'js' };

/**
 * Minify JS/TS/JSX with esbuild, preserving JSX so each file stays valid at its
 * original path and extension and Vite can still build it.
 *
 * This mangles local bindings and parameters and drops all comments. Names that
 * cross a module boundary (exported functions, components, constants) must keep
 * their identifiers or the imports in other files would no longer resolve — files
 * are minified individually, not bundled.
 */
async function stripJs(source, ext) {
  const esbuild = await import('esbuild');
  const { code } = await esbuild.transform(source, {
    loader: JS_LOADERS[ext],
    jsx: 'preserve',
    minify: true,
    legalComments: 'none',
    target: 'es2020',
  });
  // A declarations-only file (types.ts) erases to nothing. An empty .ts file is
  // treated as a script rather than a module, which breaks `import ... from` at
  // the other end, so emit an explicit empty module instead.
  if (code.trim() === '' && (ext === '.ts' || ext === '.tsx')) return 'export {};\n';
  return code;
}

/** Strip comments and docstrings from Python via the stdlib tokenizer. */
function stripPy(source, relPath) {
  const stripper = path.join(ROOT, 'tools', 'strip_py.py');
  for (const exe of ['python', 'python3', 'py']) {
    try {
      return execFileSync(exe, [stripper], { input: source, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (err) {
      if (err.status !== undefined) {
        throw new Error(`strip_py.py failed on ${relPath}: ${String(err.stderr || err.message).trim()}`);
      }
      // Interpreter not found under this name; try the next.
    }
  }
  console.warn(c.yellow(`  ! no Python interpreter found; leaving ${relPath} unchanged`));
  return source;
}

async function stripFile(source, relPath) {
  const ext = path.extname(relPath).toLowerCase();
  if (JS_LOADERS[ext]) return stripJs(source, ext);
  if (ext === '.py') return stripPy(source, relPath);
  return null; // Nothing to do for this type.
}

// ---------------------------------------------------------------- commands

const readState = () => (fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : null);
const backupPathFor = (relPath) => path.join(BACKUP_DIR, 'files', relPath);

async function cmdStrip() {
  const state = readState();
  if (state?.stripped) {
    die('Already stripped. Run `npm run strip:restore` first.\n' +
        '  Stripping a stripped tree would overwrite the backup with minified code.');
  }

  const files = resolveFiles();
  if (files.length === 0) die('No files matched the "include" patterns.');

  console.log(`\n${c.bold('Stripping')} ${files.length} file(s)\n`);

  // Transform everything in memory first, so a failure leaves the tree untouched.
  const results = [];
  for (const relPath of files) {
    const original = fs.readFileSync(path.join(ROOT, relPath));
    let stripped;
    try {
      stripped = await stripFile(original.toString('utf8'), relPath);
    } catch (err) {
      die(`Could not strip ${relPath}: ${err.message}\n  Nothing was changed.`);
    }
    results.push({ path: relPath, original, stripped });
  }

  // Back the originals up before writing anything.
  fs.rmSync(path.join(BACKUP_DIR, 'files'), { recursive: true, force: true });
  for (const r of results) {
    const dest = backupPathFor(r.path);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, r.original);
  }

  let changed = 0;
  for (const r of results) {
    if (r.stripped === null) {
      console.log(`  ${c.dim('skipped ')} ${r.path} ${c.dim('(no stripper for this type)')}`);
      continue;
    }
    writeFileInPlace(path.join(ROOT, r.path), r.stripped);
    changed++;
    console.log(`  ${c.green('stripped')} ${r.path} ${c.dim(`${r.original.length} → ${Buffer.byteLength(r.stripped)} bytes`)}`);
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  writeFileInPlace(STATE, JSON.stringify({
    stripped: true,
    strippedAt: new Date().toISOString(),
    files: results.map((r) => r.path),
  }, null, 2) + '\n');

  console.log(`\n${c.green('✔')} ${changed} file(s) stripped. Originals saved to ${c.bold(rel(BACKUP_DIR))}`);
  console.log(c.dim('  Verify with `npm run build`, then commit and push.'));
  console.log(c.yellow(`  ${rel(BACKUP_DIR)} is gitignored — it is NOT pushed. Keep the readable source in git too.`));
  console.log();
}

function cmdRestore() {
  const state = readState();
  if (!state) die(`No backup at ${rel(BACKUP_DIR)}. Nothing to restore.`);
  if (!state.stripped) {
    console.log(`\n${c.yellow('•')} Already restored — the tree holds the original source.\n`);
    return;
  }

  console.log(`\n${c.bold('Restoring')} ${state.files.length} file(s)\n`);

  // Check every backup is present before writing any of them.
  const pending = [];
  for (const relPath of state.files) {
    const src = backupPathFor(relPath);
    if (!fs.existsSync(src)) die(`Backup missing for ${relPath}. Nothing was changed.`);
    pending.push({ path: relPath, data: fs.readFileSync(src) });
  }

  for (const p of pending) {
    writeFileInPlace(path.join(ROOT, p.path), p.data);
    console.log(`  ${c.green('restored')} ${p.path}`);
  }

  writeFileInPlace(STATE, JSON.stringify({
    ...state, stripped: false, restoredAt: new Date().toISOString(),
  }, null, 2) + '\n');

  console.log(`\n${c.green('✔')} ${pending.length} file(s) restored to their original contents.\n`);
}

function cmdStatus() {
  const state = readState();
  if (!state) {
    console.log(`\n${c.dim('never stripped')} — run \`npm run strip\` to produce a stripped tree\n`);
    return;
  }
  console.log(`\nstate   : ${state.stripped
    ? c.yellow('STRIPPED (minified — safe to commit for deployment)')
    : c.green('ORIGINAL (readable source in tree)')}`);
  console.log(`files   : ${state.files.length}`);
  console.log(`stripped: ${state.strippedAt ?? '—'}`);
  console.log(`backup  : ${rel(BACKUP_DIR)}\n`);
}

// ---------------------------------------------------------------- entry

const command = process.argv[2];
const commands = { strip: cmdStrip, restore: cmdRestore, status: cmdStatus };

if (!commands[command]) {
  console.log(`
${c.bold('Strip source')} — publish minified, comment-free code that still builds

  node tools/strip-source.mjs strip     back up originals, then strip the tree
  node tools/strip-source.mjs restore   put the originals back
  node tools/strip-source.mjs status    is the tree stripped?
`);
  process.exit(command ? 1 : 0);
}

await commands[command]();
