const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// THE SURGICAL REGEX SUITE
const REPLACEMENTS = [
  {
    name: "Ghost Slash-One",
    regex: /\\1/g, 
    replace: "" 
  },
  {
    name: "JSX Tag Commas",
    // Matches <Button, or <input, or <Star,
    regex: /<([A-Z][a-zA-Z0-9]*|[a-z]+),(\s+)/g,
    replace: "<$1$2"
  },
  {
    name: "Attribute Commas",
    // Matches placeholder="...", or readOnly, or multiple,
    // where the comma is followed by a newline or space inside a tag
    regex: /([a-zA-Z]+="[^"]+"),(\s+)/g,
    replace: "$1$2"
  },
  {
    name: "Boolean Attribute Commas",
    // Matches standalone attributes like required, or readOnly,
    regex: /\s(required|readOnly|disabled|multiple|checked),(\s+)/g,
    replace: " $1$2"
  }
];

console.log("🛠️ Initializing Military-Grade Code Scrub...");

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx') || filePath.endsWith('.ts')) {
    let originalContent = fs.readFileSync(filePath, 'utf8');
    let updatedContent = originalContent;

    REPLACEMENTS.forEach(rule => {
      updatedContent = updatedContent.replace(rule.regex, rule.replace);
    });

    if (originalContent !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ SURGERY SUCCESSFUL: ${path.relative(__dirname, filePath)}`);
    }
  }
});

console.log("✨ Scrub complete. Proceeding to validation...");	
