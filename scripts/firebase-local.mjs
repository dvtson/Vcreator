import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// Keep CLI credentials, caches and temporary files inside this project.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const state = path.join(root, 'artifacts', 'firebase-cli');
for (const name of ['config', 'cache', 'tmp']) fs.mkdirSync(path.join(state, name), { recursive: true });
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/firebase-tools/lib/bin/firebase.js'), ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, XDG_CONFIG_HOME: path.join(state, 'config'), XDG_CACHE_HOME: path.join(state, 'cache'), TEMP: path.join(state, 'tmp'), TMP: path.join(state, 'tmp') },
});
if (result.error) { console.error('Không mở được công cụ Firebase:', result.error.message); process.exitCode = 1; }
else process.exitCode = result.status ?? 1;
