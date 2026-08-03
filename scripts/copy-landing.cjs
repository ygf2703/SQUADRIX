const fs = require('node:fs');
const path = require('node:path');

const source = path.join(__dirname, '..', 'landing');
const destination = path.join(__dirname, '..', 'dist', 'landing');

fs.cpSync(source, destination, { recursive: true, force: true });
fs.copyFileSync(path.join(source, 'privacy.html'), path.join(__dirname, '..', 'dist', 'privacy.html'));
