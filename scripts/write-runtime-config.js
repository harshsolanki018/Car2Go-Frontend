const fs = require('fs');
const path = require('path');

const fallbackApiBaseUrl = 'https://car2go-backend-zbum.onrender.com/api';
const apiBaseUrl = String(process.env.API_URL || process.env.API_BASE_URL || '').trim();

const config = {
  apiBaseUrl: apiBaseUrl || fallbackApiBaseUrl,
};

const outputDir = path.join(__dirname, '..', 'public');
const outputPath = path.join(outputDir, 'app-config.js');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const contents = `window.__APP_CONFIG__ = ${JSON.stringify(config)};\n`;
fs.writeFileSync(outputPath, contents);
