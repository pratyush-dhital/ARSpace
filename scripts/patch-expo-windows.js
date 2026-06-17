/**
 * Expo SDK 50 on Windows: Node 22+ lists builtins like "node:sea".
 * Metro tries to mkdir that path, which fails because ":" is illegal on Windows.
 * Re-apply this filter after every npm install.
 */
const fs = require('fs');
const path = require('path');

const externalsPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@expo',
  'cli',
  'build',
  'src',
  'start',
  'server',
  'metro',
  'externals.js'
);

const PATCH_MARKER = '!/[:*?"<>|]/.test(x)';
const PATCH_SNIPPET =
  ').filter((x)=>!/^_|^(internal|v8|node-inspect)\\/|\\//.test(x) && ![\n            "sys"\n        ].includes(x) && !/[:*?"<>|]/.test(x)\n    ), ';

const ORIGINAL_SNIPPET =
  ').filter((x)=>!/^_|^(internal|v8|node-inspect)\\/|\\//.test(x) && ![\n            "sys"\n        ].includes(x)\n    ), ';

if (!fs.existsSync(externalsPath)) {
  console.warn('[patch-expo-windows] @expo/cli not installed, skipping.');
  process.exit(0);
}

let source = fs.readFileSync(externalsPath, 'utf8');

if (source.includes(PATCH_MARKER)) {
  console.log('[patch-expo-windows] Already patched.');
  process.exit(0);
}

if (!source.includes(ORIGINAL_SNIPPET)) {
  console.warn(
    '[patch-expo-windows] externals.js format changed; patch manually or upgrade Expo SDK.'
  );
  process.exit(0);
}

source = source.replace(ORIGINAL_SNIPPET, PATCH_SNIPPET);
fs.writeFileSync(externalsPath, source);
console.log('[patch-expo-windows] Patched Metro externals for Windows.');
