// Custom entry point for Vercel deployment
// Patches problematic modules before they're loaded
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Patch Rollup's native module before it's imported
try {
  const modulePath = path.join(__dirname, 'node_modules/rollup/dist/native.js');
  console.log('Checking for Rollup native module at:', modulePath);
  
  if (fs.existsSync(modulePath)) {
    console.log('Patching Rollup native module');
    
    const patchContent = `
// Patched version for Vercel deployment
export function getDefaultRollupOptions() { return {}; }
export function getAugmentedNamespace() { return {}; }
export function installGlobals() {}
export function create() { return null; }
export function parse() { return { program: { body: [] } }; }
export const EMPTY_AST = { type: 'Program', body: [] };
`;
    
    fs.writeFileSync(modulePath, patchContent);
    console.log('Successfully patched Rollup native module');
  } else {
    console.log('Rollup native module not found at expected path');
  }
} catch (err) {
  console.error('Error patching Rollup:', err);
}

// Now import and re-export the actual server
export { app } from './server.js'; 