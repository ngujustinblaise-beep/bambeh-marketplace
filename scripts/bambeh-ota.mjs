// BAMBEH_DEPLOY_TOKEN__OTA_FIX979_CLEAN
/**
 * scripts/bambeh-ota.mjs - FIX979 (Package 18, Big 2 Nov 2026: phones with the APK were missing Packages 11 to 17)
 *
 * After every "vite build" - on Netlify and on Big's computer alike (vite.config.ts, FIX981) - this writes what the
 * Android app needs to keep itself up to date without a new APK (src/lib/appUpdate.ts, FIX977):
 *
 *   dist/bambeh-build.json   this build's id: a fingerprint of every file of the build. The app reads its own.
 *   dist/ota/version.json    the newest build's id, its size, and the oldest Android app that can run it. A few
 *                            hundred bytes: the app asks for it at most every few hours.
 *   dist/ota/manifest.json   every file of the build with its SHA-256 and size. The phone downloads ONLY the files it
 *                            does not have yet (usually a few hundred kB for a package), each one checked against its
 *                            SHA-256 before it is used.
 *
 * Left out of both: dist/ota/ itself, dist/download/ (the APK file and its page) and hidden files.
 * The same build gives the same id on any computer (the id ignores the time of the build), so a phone whose APK was
 * built from the commit that is live downloads nothing.
 * If anything here fails, the website build still succeeds - the website must always go out - and dist/ota/ is
 * removed, so no phone ever reads half a list.
 * Plain Node (fs, path, crypto): nothing to install. Run by hand: node scripts/bambeh-ota.mjs dist
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The oldest Android app (its versionCode) that can run today's web build. 0 = any app that keeps itself up to date.
 * Raise it only when the web code starts to need something new in the app's native part (a new plugin or permission):
 * older apps then keep their version and show "a newer Bambeh app is ready" (FIX978) instead of taking the update.
 */
export const OTA_MIN_NATIVE = 0;

const SKIP_TOP = new Set(['ota', 'download']);

function walk(root, rel, out) {
  const here = rel ? path.join(root, ...rel.split('/')) : root;
  for (const e of fs.readdirSync(here, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) {
      if (!rel && SKIP_TOP.has(e.name)) continue;
      walk(root, r, out);
    } else if (e.isFile()) {
      out.push(r);
    }
  }
  return out;
}

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function byName(a, b) {
  return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
}

/** Writes bambeh-build.json and ota/ into outDir (a finished build). Returns what ota/version.json says. */
export function writeOta(outDir, now) {
  const when = (now instanceof Date ? now : new Date()).toISOString();
  if (!fs.existsSync(path.join(outDir, 'index.html'))) throw new Error('no index.html in ' + outDir);
  const rows = walk(outDir, '', [])
    .filter((f) => f !== 'bambeh-build.json')
    .map((f) => {
      const b = fs.readFileSync(path.join(outDir, ...f.split('/')));
      return [f, sha256(b), b.length];
    })
    .sort(byName);
  const id = sha256(Buffer.from(rows.map((r) => r[0] + ' ' + r[1]).join('\n'), 'utf8')).slice(0, 20);
  const bytes = rows.reduce((s, r) => s + r[2], 0);

  const build = Buffer.from(JSON.stringify({ id, built_at: when, files: rows.length + 1, bytes }) + '\n', 'utf8');
  fs.writeFileSync(path.join(outDir, 'bambeh-build.json'), build);
  rows.push(['bambeh-build.json', sha256(build), build.length]);
  rows.sort(byName);

  const ota = path.join(outDir, 'ota');
  fs.rmSync(ota, { recursive: true, force: true });
  fs.mkdirSync(ota, { recursive: true });
  const total = bytes + build.length;
  fs.writeFileSync(path.join(ota, 'manifest.json'),
    JSON.stringify({ id, built_at: when, min_native: OTA_MIN_NATIVE, files: rows }) + '\n');
  const version = { id, built_at: when, min_native: OTA_MIN_NATIVE, files: rows.length, bytes: total, manifest: 'ota/manifest.json' };
  // version.json last: a phone that reads it finds the list already there
  fs.writeFileSync(path.join(ota, 'version.json'), JSON.stringify(version) + '\n');
  return version;
}

/** The Vite plugin (vite.config.ts): runs once the build is written; never fails the build. */
export default function bambehOta() {
  let outDir = '';
  return {
    name: 'bambeh-ota',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      if (!outDir || !fs.existsSync(path.join(outDir, 'index.html'))) return;
      try {
        const v = writeOta(outDir);
        console.log('[bambeh-ota] FIX979: build ' + v.id + ' - ' + v.files + ' files, ' + Math.round(v.bytes / 1024) +
          ' kB - dist/ota written (the Android app updates itself from it)');
      } catch (e) {
        try { fs.rmSync(path.join(outDir, 'ota'), { recursive: true, force: true }); } catch { /* nothing more to do */ }
        console.warn('[bambeh-ota] FIX979: dist/ota NOT written (the website itself is fine): ' + (e && e.message ? e.message : e));
      }
    },
  };
}

// by hand: node scripts/bambeh-ota.mjs dist
let self = '';
try { self = process.argv[1] ? path.resolve(process.argv[1]) : ''; } catch { self = ''; }
if (self && self === path.resolve(fileURLToPath(import.meta.url))) {
  const dir = path.resolve(process.argv[2] || 'dist');
  const v = writeOta(dir);
  console.log(JSON.stringify(v));
}
// BAMBEH_END_TOKEN__OTA_FIX979__COMPLETE
