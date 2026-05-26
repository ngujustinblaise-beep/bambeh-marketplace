#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAMBÉ USER PROPERTY AUTO-FIXER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Automatically fixes all User property mismatches across the codebase:
 * - fullName → username
 * - .name → .username (when accessing User properties)
 * - .uid → .id
 * - .phone → .phoneNumber
 * - phoneNumberNumber → phoneNumber
 * - .privilege → .role
 * 
 * © 2025 Bambé. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

console.log('🔧 Bambé User Property Auto-Fixer\n');
console.log('═══════════════════════════════════════════════════════════════════════════');

// Create backup
console.log('📦 Creating backup...');
try {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  execSync(`git add -A && git commit -m "Backup before User property fixes" || echo "No changes to commit"`);
  console.log('✅ Backup created via Git commit\n');
} catch (error) {
  console.log('⚠️  Could not create Git backup. Proceeding anyway...\n');
}

// File extensions to process
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Directories to process
const directories = ['src/components', 'src/pages', 'src/contexts', 'src/utils', 'src/services', 'src/hooks'];

// Replacement rules
const replacements = [
  // User property replacements
  { pattern: /\.fullName\b/g, replacement: '.username', description: '.fullName → .username' },
  { pattern: /\bcurrentUser\?\.name\b/g, replacement: 'currentUser?.username', description: 'currentUser?.name → currentUser?.username' },
  { pattern: /\bcurrentUser!\.name\b/g, replacement: 'currentUser!.username', description: 'currentUser!.name → currentUser!.username' },
  { pattern: /\buser\?\.name\b/g, replacement: 'user?.username', description: 'user?.name → user?.username' },
  { pattern: /\buser\.name\b/g, replacement: 'user.username', description: 'user.name → user.username' },
  { pattern: /\.uid\b/g, replacement: '.id', description: '.uid → .id' },
  { pattern: /\bphoneNumberNumber\b/g, replacement: 'phoneNumber', description: 'phoneNumberNumber → phoneNumber' },
  { pattern: /\.phone\b(?!Number)/g, replacement: '.phoneNumber', description: '.phone → .phoneNumber' },
  { pattern: /\.privilege\b/g, replacement: '.role', description: '.privilege → .role' },
  { pattern: /\buserPrivilege\b/g, replacement: 'user?.role || \'free\'', description: 'userPrivilege → user?.role || \'free\'' },
];

let totalFiles = 0;
let totalChanges = 0;
const changedFiles = [];

/**
 * Recursively process files in a directory
 */
function processDirectory(dir) {
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!entry.startsWith('.') && entry !== 'node_modules') {
          processDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        // Process file if it has a valid extension
        const ext = entry.substring(entry.lastIndexOf('.'));
        if (extensions.includes(ext)) {
          processFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.log(`⚠️  Error processing directory ${dir}: ${error.message}`);
  }
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let fileChanged = false;
    let changeCount = 0;
    
    // Apply all replacements
    for (const { pattern, replacement, description } of replacements) {
      const before = content;
      content = content.replace(pattern, replacement);
      
      if (content !== before) {
        fileChanged = true;
        // Count occurrences
        const matches = (before.match(pattern) || []).length;
        changeCount += matches;
      }
    }
    
    // Write back if changed
    if (fileChanged) {
      writeFileSync(filePath, content, 'utf-8');
      changedFiles.push({ path: filePath, changes: changeCount });
      totalChanges += changeCount;
      console.log(`✅ Fixed ${changeCount} issues in ${filePath.replace(process.cwd() + '\\', '')}`);
    }
    
    totalFiles++;
  } catch (error) {
    console.log(`⚠️  Error processing file ${filePath}: ${error.message}`);
  }
}

// Process all directories
console.log('🔍 Scanning files...\n');
for (const dir of directories) {
  const fullDir = join(process.cwd(), dir);
  try {
    processDirectory(fullDir);
  } catch (error) {
    console.log(`⚠️  Directory ${dir} not found, skipping...`);
  }
}

// Summary
console.log('\n═══════════════════════════════════════════════════════════════════════════');
console.log('📊 SUMMARY\n');
console.log(`Total files processed: ${totalFiles}`);
console.log(`Files changed: ${changedFiles.length}`);
console.log(`Total fixes applied: ${totalChanges}`);
console.log('\n═══════════════════════════════════════════════════════════════════════════');

if (changedFiles.length > 0) {
  console.log('\n📝 Changed files:');
  for (const { path, changes } of changedFiles.slice(0, 20)) {
    console.log(`   ${path.replace(process.cwd() + '\\', '')} (${changes} changes)`);
  }
  if (changedFiles.length > 20) {
    console.log(`   ... and ${changedFiles.length - 20} more files`);
  }
}

console.log('\n✅ User property fixes complete!');
console.log('💡 Next step: Run "npx tsc --noEmit" to check remaining errors\n');
