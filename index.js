// index.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const { exec } = require('child_process');

// Kill any process running on port 3000
try {
  if (process.platform === 'win32') {
    exec('netstat -ano | findstr :3000', (error, stdout) => {
      if (stdout) {
        const match = stdout.match(/LISTENING\s+(\d+)/);
        if (match && match[1]) {
          exec(`taskkill /F /PID ${match[1]}`);
          console.log(`Killed process on port 3000 with PID ${match[1]}`);
        }
      }
    });
  } else {
    exec('lsof -i :3000 -t', (error, stdout) => {
      if (stdout.trim()) {
        exec(`kill -9 ${stdout.trim()}`);
        console.log(`Killed process on port 3000 with PID ${stdout.trim()}`);
      }
    });
  }
} catch (err) {
  console.log('No process to kill on port 3000');
}

// Serverless function part removed as it's not used by vercel.json configuration
// and could potentially conflict.
// The primary Vercel API entry point is vercel-entry.js
// and static site is built via @vercel/static-build.