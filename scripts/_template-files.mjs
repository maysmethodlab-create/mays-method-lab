import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const TEMPLATES_ROOT = path.resolve(
  __dirname,
  '..',
  'apps',
  'Annual Evaluation Letters',
  'Template Letters',
);

let _index = null;
function buildIndex() {
  if (_index) return _index;
  _index = new Map();
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else _index.set(entry.name, full);
    }
  }
  walk(TEMPLATES_ROOT);
  return _index;
}

/** Resolve a template file by basename, walking the organized nested folders. */
export function templateFile(basename) {
  const idx = buildIndex();
  const full = idx.get(basename);
  if (!full) {
    throw new Error(
      `Template file not found in ${TEMPLATES_ROOT}: ${basename}`,
    );
  }
  return full;
}
