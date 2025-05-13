// Use CommonJS syntax
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Serve static files
const distPath = path.join(__dirname, 'dist/public');
console.log('Serving static files from:', distPath);

// List directory contents to debug
try {
  const files = fs.readdirSync(distPath);
  console.log('Files in dist/public:', files);
  
  if (fs.existsSync(path.join(distPath, 'assets'))) {
    const assetFiles = fs.readdirSync(path.join(distPath, 'assets'));
    console.log('Files in assets directory:', assetFiles);
  }
} catch (error) {
  console.error('Error listing directory:', error);
}

app.use(express.static(distPath));

// Send index.html for any other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
