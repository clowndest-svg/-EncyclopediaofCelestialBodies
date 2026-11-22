import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOOLS = 'D:\\RuanJian\\CosmicDesktopTools';
const STAGE = path.join(TOOLS, '_staging');
const OUT = path.join(ROOT, 'dist_exe');

function copyRecursive(src, dst) {
  fs.cpSync(src, dst, { recursive: true, force: true });
}

console.log('1. Generating desktop app icon...');
execSync(`python "${path.join(ROOT, 'desktop', 'make_icon.py')}"`, { stdio: 'inherit' });

console.log('2. Preparing clean runtime staging directory...');
fs.rmSync(STAGE, { recursive: true, force: true });
fs.mkdirSync(STAGE, { recursive: true });
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// Copy ONLY runtime essentials (no .git, .work dev files, promo_media, scratch, tests)
for (const file of ['cosmic_atlas_3_0.html', 'encyclopedia-catalog.js']) {
  fs.copyFileSync(path.join(ROOT, file), path.join(STAGE, file));
}
fs.mkdirSync(path.join(STAGE, '.work'), { recursive: true });
fs.copyFileSync(path.join(ROOT, '.work', 'sandbox-schema.mjs'), path.join(STAGE, '.work', 'sandbox-schema.mjs'));
copyRecursive(path.join(ROOT, 'models'), path.join(STAGE, 'models'));
copyRecursive(path.join(ROOT, 'desktop'), path.join(STAGE, 'desktop'));
copyRecursive(path.join(ROOT, 'node_modules'), path.join(STAGE, 'node_modules'));

// Prune optional DB drivers (desktop uses local SQLite only) and non-runtime docs/types/tests to speed up portable extraction
const PRUNE_NM_DIRS = new Set([
  'pg', 'pg-cloudflare', 'pg-connection-string', 'pg-int8', 'pg-pool', 'pg-protocol', 'pg-types', 'pgpass',
  'postgres-array', 'postgres-bytea', 'postgres-date', 'postgres-interval',
  'ioredis', '@ioredis', 'redis-errors', 'redis-parser', 'cluster-key-slot', 'standard-as-callback', 'denque', '.bin'
]);
for (const name of fs.readdirSync(path.join(STAGE, 'node_modules'))) {
  if (PRUNE_NM_DIRS.has(name)) {
    fs.rmSync(path.join(STAGE, 'node_modules', name), { recursive: true, force: true });
  }
}
function pruneNonRuntimeFiles(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (['test', 'tests', '__tests__', 'docs', 'doc', 'example', 'examples', '.github'].includes(ent.name.toLowerCase())) {
        fs.rmSync(full, { recursive: true, force: true });
      } else {
        pruneNonRuntimeFiles(full);
      }
    } else if (/\.(md|markdown|ts|tsx|map|flow)$/i.test(ent.name) || /^(license|licence|changelog|history|readme)/i.test(ent.name)) {
      fs.rmSync(full, { force: true });
    }
  }
}
pruneNonRuntimeFiles(path.join(STAGE, 'node_modules'));

// Copy server runtime excluding tests and user's local sandbox-saves.sqlite
fs.mkdirSync(path.join(STAGE, 'server', 'data'), { recursive: true });
for (const entry of fs.readdirSync(path.join(ROOT, 'server'))) {
  if (entry === 'tests') continue;
  const src = path.join(ROOT, 'server', entry);
  const dst = path.join(STAGE, 'server', entry);
  if (entry === 'data') {
    for (const d of fs.readdirSync(src)) {
      if (d.startsWith('sandbox-saves.sqlite') || d.startsWith('catalog.sqlite') || d === 'source-downloads') continue;
      const p = path.join(src, d);
      if (fs.statSync(p).isFile()) fs.copyFileSync(p, path.join(dst, d));
    }
  } else {
    copyRecursive(src, dst);
  }
}

const rootPkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const desktopDeps = Object.fromEntries(Object.entries(rootPkg.dependencies || {}).filter(([k]) => k !== 'pg' && k !== 'ioredis'));
const stagePkg = {
  name: 'cosmic-atlas-sandbox2',
  productName: '万象寰宇-宇宙沙盘2',
  version: '2.0.0',
  description: '万象寰宇 · 宇宙沙盘 2 & 25,262 条星海百科桌面独立版',
  author: 'Cosmic Atlas Studio',
  main: 'desktop/main.cjs',
  type: 'module',
  dependencies: desktopDeps,
  build: {
    appId: 'com.cosmicatlas.sandbox2',
    productName: '万象寰宇-宇宙沙盘2',
    electronVersion: '45.4.1',
    asar: false,
    npmRebuild: false,
    directories: {
      output: OUT
    },
    win: {
      target: [
        { target: 'portable', arch: ['x64'] },
        { target: 'dir', arch: ['x64'] }
      ],
      icon: 'desktop/cosmos.ico',
      artifactName: '万象寰宇-宇宙沙盘2-桌面独立版.${ext}'
    },
    portable: {
      artifactName: '万象寰宇-宇宙沙盘2-单文件直接运行版.${ext}'
    }
  }
};
fs.writeFileSync(path.join(STAGE, 'package.json'), JSON.stringify(stagePkg, null, 2), 'utf8');

console.log('3. Packaging Windows standalone full-screen .exe with electron-builder...');
const builderBin = path.join(TOOLS, 'node_modules', '.bin', 'electron-builder.cmd');
execSync(`"${builderBin}" --win --x64 --config.electronDist="${path.join(TOOLS, 'node_modules', 'electron', 'dist')}"`, {
  cwd: STAGE,
  stdio: 'inherit'
});

console.log('4. Desktop EXE build complete in:', OUT);
