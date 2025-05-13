// index.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

module.exports = async (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'dist/public/index.html');
    const content = await readFile(indexPath, 'utf8');
    res.status(200).send(content);
  } catch (error) {
    res.status(500).send('Error serving the application');
  }
};