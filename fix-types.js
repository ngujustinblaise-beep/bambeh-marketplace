const fs = require('fs');
const path = require('path');

// Fix all .tsx and .ts files
const fixes = [
  {
    // Fix tier access on User
    find: /currentUser\?\.tier/g,
    replace: '(currentUser?.tier || currentUser?.privilege)'
  },
  {
    // Fix uid access
    find: /currentUser\.uid/g,
    replace: '(currentUser.uid || currentUser.id)'
  },
  {
    // Fix displayName
    find: /currentUser\.displayName/g,
    replace: '(currentUser.displayName || currentUser.fullName)'
  }
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  fixes.forEach(fix => {
    if (fix.find.test(content)) {
      content = content.replace(fix.find, fix.replace);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

// Run on src directory
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixFile(filePath);
    }
  });
}

walkDir('./src');
console.log('Type fixes applied!');