/**
 * Inlines partials into HTML files. Run: node build.js
 * Replaces <!-- INCLUDE: path/to/partial.html --> with file contents.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname);
const includeRegex = /<!--\s*INCLUDE:\s*([^\s]+)\s*-->/g;

function processFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  html = html.replace(includeRegex, (match, includePath) => {
    const partialPath = path.join(root, includePath);
    if (fs.existsSync(partialPath)) {
      changed = true;
      return fs.readFileSync(partialPath, 'utf8').trim();
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, html);
    console.log('Built:', path.relative(root, filePath));
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
      walk(fullPath);
    } else if (file.endsWith('.html') && !dir.includes('partials')) {
      processFile(fullPath);
    }
  }
}

walk(root);
console.log('Done.');
