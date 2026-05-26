#!/usr/bin/env node
/**
 * Quick fix for userPrivilege destructuring syntax errors
 */

import { readFileSync, writeFileSync } from 'fs';

console.log('🔧 Fixing userPrivilege syntax errors...\n');

const files = [
  'src/components/auth/PrivilegeGuard.tsx',
  'src/components/common/SubscriptionBanner.tsx',
  'src/pages/Cart up dec27.tsx',
  'src/pages/Cart.tsx',
  'src/pages/Notifications.tsx'
];

let fixedCount = 0;

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf-8');
    const original = content;
    
    // Fix the broken destructuring
    // Pattern: const { ...., user?.role || 'free' } = useAuth();
    // Should be: const { user } = useAuth();
    //            const userPrivilege = user?.role || 'free';
    
    // Find and fix lines like: const { isAuthenticated, user?.role || 'free' } = useAuth();
    content = content.replace(
      /const\s+{\s*([^}]*?),?\s*user\?\.(role|privilege)\s*\|\|\s*['"]free['"]\s*}\s*=\s*useAuth\(\);?/g,
      (match, otherProps) => {
        const props = otherProps.trim();
        if (props) {
          return `const { ${props}, user } = useAuth();\n  const userPrivilege = user?.role || 'free';`;
        } else {
          return `const { user } = useAuth();\n  const userPrivilege = user?.role || 'free';`;
        }
      }
    );
    
    // Also fix similar patterns with currentUser
    content = content.replace(
      /const\s+userPrivilege\s*=\s*\(currentUser\?\.(tier|role)\s*\|\|\s*currentUser\?\.(user\?\.(role|privilege)\s*\|\|\s*['"]free['"])\)/g,
      "const userPrivilege = (currentUser?.tier || currentUser?.role)?.toLowerCase() || 'free'"
    );
    
    if (content !== original) {
      writeFileSync(file, content, 'utf-8');
      console.log(`✅ Fixed ${file}`);
      fixedCount++;
    }
  } catch (error) {
    console.log(`⚠️  Could not fix ${file}: ${error.message}`);
  }
}

console.log(`\n✅ Fixed ${fixedCount} files!`);
console.log('💡 Run "npx tsc --noEmit" to verify\n');
