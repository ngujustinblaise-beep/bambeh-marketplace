const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// Precision Regex: Finds a tag name followed immediately by a comma
// Matches: <button, or <div, etc.
const jsxCommaRegex = /<([a-zA-Z0-9]+),/g;

console.log("🚀 Starting surgical precision scan of /src...");

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (jsxCommaRegex.test(content)) {
      // Replace "<tag," with "<tag "
      const newContent = content.replace(jsxCommaRegex, '<$1 ');
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed accidental comma in: ${filePath}`);
    }
  }
});

console.log("✨ Scan complete. Ready for build.");			
