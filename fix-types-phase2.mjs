/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PHASE 2 TYPE FIXES - ES MODULE VERSION
 * ═══════════════════════════════════════════════════════════════════════════
 * Batch fix script for common type issues
 * © 2025 Bambé. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const fixes = [
  {
    // Fix currentUser.tier access
    find: /currentUser\?\.tier(?!\s*\|\|)/g,
    replace: '(currentUser?.tier || currentUser?.privilege)'
  },
  {
    // Fix currentUser.uid
    find: /(?<!currentUser\?\.)(currentUser\.uid)(?!\s*\|\|)/g,
    replace: '(currentUser.uid || currentUser.id)'
  },
  {
    // Fix currentUser.displayName
    find: /(?<!currentUser\?\.)(currentUser\.displayName)(?!\s*\|\|)/g,
    replace: '(currentUser.displayName || currentUser.fullName)'
  },
  {
    // Fix currentUser.name (not fullName)
    find: /(?<!currentUser\?\.)(currentUser\.name)(?!\s*\|\|)/g,
    replace: 'currentUser.fullName'
  },
  {
    // Fix currentUser.phone
    find: /(?<!currentUser\?\.)(currentUser\.phone)(?!\s*\|\|)/g,
    replace: 'currentUser.phoneNumber'
  },
  {
    // Fix currentUser.image
    find: /(?<!currentUser\?\.)(currentUser\.image)(?!\s*\|\|)/g,
    replace: 'currentUser.profileImage'
  }
];

function fixFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    let modified = false;

    fixes.forEach(fix => {
      const newContent = content.replace(fix.find, fix.replace);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

function walkDir(dir) {
  try {
    const files = readdirSync(dir);
    
    files.forEach(file => {
      const filePath = join(dir, file);
      
      try {
        const stat = statSync(filePath);
        
        if (stat.isDirectory()) {
          // Skip node_modules, build, dist directories
          if (!['node_modules', 'build', 'dist', '.git'].includes(file)) {
            walkDir(filePath);
          }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          fixFile(filePath);
        }
      } catch (error) {
        console.error(`❌ Error accessing ${filePath}:`, error.message);
      }
    });
  } catch (error) {
    console.error(`❌ Error reading directory ${dir}:`, error.message);
  }
}

console.log('🚀 Starting Phase 2 fixes...\n');
walkDir('./src');
console.log('\n✅ Phase 2 fixes complete!');
