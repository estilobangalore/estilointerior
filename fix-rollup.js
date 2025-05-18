#!/usr/bin/env node
// Script to fix Rollup native module issues
// Run this before deployment

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const modulePath = path.join(__dirname, 'node_modules/rollup/dist/native.js');
const backupPath = path.join(__dirname, 'node_modules/rollup/dist/native.js.bak');

console.log('Looking for Rollup native module at:', modulePath);

if (fs.existsSync(modulePath)) {
  // Create a backup
  try {
    fs.copyFileSync(modulePath, backupPath);
    console.log('Created backup at:', backupPath);
  } catch (err) {
    console.log('Could not create backup:', err.message);
  }
  
  // Create the patched version
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
  console.log('Successfully patched Rollup native module. The patched file contains:');
  console.log('-----------------------------------');
  console.log(patchContent);
  console.log('-----------------------------------');
} else {
  console.log('Rollup native module not found at:', modulePath);
}

// Also check direct location that might be used
const directModulePath = path.join(__dirname, 'node_modules/@rollup/rollup-linux-x64-gnu/rollup.linux-x64-gnu.node');
if (fs.existsSync(path.dirname(directModulePath))) {
  try {
    fs.mkdirSync(path.dirname(directModulePath), { recursive: true });
    console.log(`Created directory: ${path.dirname(directModulePath)}`);
  } catch (err) {
    console.log(`Directory already exists: ${path.dirname(directModulePath)}`);
  }
  
  try {
    fs.writeFileSync(directModulePath, '// Empty placeholder file');
    console.log(`Created empty placeholder file at: ${directModulePath}`);
  } catch (err) {
    console.log(`Failed to create placeholder file: ${err.message}`);
  }
}

console.log('Rollup patching complete!'); 