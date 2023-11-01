import { readFileSync } from 'node:fs';

// read package.json at runtime instead of compile time so that we keep rootDir as-is in tsconfig
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
export const noirWasmVersion = pkg.dependencies['@noir-lang/noir_wasm'];
