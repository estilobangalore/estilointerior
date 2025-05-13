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

module.exports = async (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'dist/public/index.html');
    const content = await readFile(indexPath, 'utf8');
    res.status(200).send(content);
  } catch (error) {
    res.status(500).send('Error serving the application');
  }
};