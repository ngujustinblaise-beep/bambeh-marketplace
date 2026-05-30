const fs = require('fs');
const path = require('path');

const fixes = [
  {
    // Fix currentUser.tier access
    find: /currentUser\?\.tier/g,
    replace: '(currentUser?.tier || currentUser?.privilege)'
  },
  {
    // Fix currentUser.uid
    find: /currentUser\.uid/g,
    replace: '(currentUser.uid || currentUser.id)'
  },
  {
    // Fix currentUser.displayName
    find: /currentUser\.displayName/g,
    replace: '(currentUser.displayName || currentUser.fullName)'
  },
  {
    // Fix currentUser.name
    find: /currentUser\.name/g,
    replace: 'currentUser.fullName'
  },
  {
    // Fix currentUser.phone
    find: /currentUser\.phone/g,
    replace: 'currentUser.phoneNumber'
  },
  {
    // Fix currentUser.image
    find: /currentUser\.image/g,
    replace: 'currentUser.profileImage'
  }
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  fixes.forEach(fix => {
    const newContent = content.replace(fix.find, fix.replace);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixFile(filePath);
    }
  });
}

walkDir('./src');
console.log('Phase 2 fixes applied!');
