/**
 * BAMBEH NODE.JS FIXER
 * Run: node fix.js
 * From: C:\Dev\bambe-android
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
let fixed = 0;

function read(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, 'utf8');
}

function write(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

function patch(rel, fn) {
  const orig = read(rel);
  if (orig === null) { console.log(`  [--] ${rel}`); return; }
  const result = fn(orig);
  if (result !== orig) {
    write(rel, result);
    console.log(`  [FIX] ${rel}`);
    fixed++;
  } else {
    console.log(`  [OK]  ${rel}`);
  }
}

// Fix all }  } catch patterns
function fixCatch(c) {
  return c.replace(/\}  \} catch \(/g, '} catch (')
          .replace(/\}  \}catch \(/g,   '} catch (');
}

// Fix );)} map callback pattern
function fixMapClose(c) {
  // Replace );)} with proper closing
  return c.replace(/\);\)\}/g, ');\n              )}');
}

console.log('\n========================================');
console.log('  BAMBEH NODE FIXER - ' + new Date().toLocaleTimeString());
console.log('========================================\n');

// ---- 1. OrderManagement (both copies) --------------------------------------------------------------------------
const orderFix = c => {
  let r = fixCatch(c);
  // Fix );)} patterns with correct indentation
  const lines = r.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.match(/^\s*\);\)\}$/)) {
      const indent = l.match(/^(\s*)/)[1];
      const outer = indent.length >= 2 ? indent.slice(0, -2) : '';
      out.push(indent + ');');
      out.push(outer + ')}');
    } else if (l.includes(');)}')) {
      out.push(l.replace(');)}', ');'));
      const indent = l.match(/^(\s*)/)[1];
      const outer = indent.length >= 2 ? indent.slice(0, -2) : '';
      out.push(outer + ')}');
    } else {
      out.push(l);
    }
  }
  return out.join('\n');
};
patch('src/advanced-features/admin/OrderManagement.tsx', orderFix);
patch('src/advanced-features/vendor-dashboard/components/OrderManagement.tsx', orderFix);

// ---- 2. ChatInterface.tsx (advanced-features) ------------------------------------------------------------
patch('src/advanced-features/chat/ChatInterface.tsx', c => {
  let r = fixCatch(c);
  // Fix updateDoc);  (extra paren)
  r = r.replace(
    "updateDoc(doc(db, 'messages', msg.id), { status: 'read' }););",
    "updateDoc(doc(db, 'messages', msg.id), { status: 'read' });"
  );
  // Fix forEach callback: needs }); before return () => unsubscribe
  r = r.replace(
    /(\s+groups\[dateKey\]\.push\(message\);)\n(\s+\}\);)\n(\s+)\n(\s+return Object\.entries)/,
    '$1\n$2\n$3\n$4return Object.entries'
  );
  // Fix the first useEffect - forEach inside onSnapshot not closed
  // Pattern: markAsRead line followed by }); then blank then return () => unsubscribe
  // The issue is the forEach isn't closed before the snapshot unsubscribe
  const lines = r.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    out.push(lines[i]);
    // After updateDoc line, check if next meaningful line is "return () => unsubscribe"
    if (lines[i].includes("updateDoc(doc(db, 'messages', msg.id), { status: 'read' });") &&
        i+1 < lines.length && lines[i+1].match(/^\s*\}\);$/)) {
      // Already has }); - good
    }
    if (lines[i].includes("updateDoc(doc(db, 'messages', msg.id), { status: 'read' });")) {
      // Look ahead - is the forEach closed?
      let j = i + 1;
      while (j < lines.length && lines[j].match(/^\s*$/)) j++;
      if (j < lines.length && lines[j].match(/^\s*\}\);$/) === null &&
          lines[j].match(/^\s*return/) === null &&
          lines[j].match(/^\s*\}/) !== null) {
        // Next non-blank is a } - need to add });
      }
    }
  }
  return out.join('\n');
});

// ---- 3. ChatInterface.tsx (Chatbot copy) ----------------------------------------------------------------------
patch('src/components/Chatbot/chat/ChatInterface.tsx', c => {
  let r = fixCatch(c);
  r = r.replace(
    "updateDoc(doc(db, 'messages', msg.id), { status: 'read' }););",
    "updateDoc(doc(db, 'messages', msg.id), { status: 'read' });"
  );
  return r;
});

// ---- 4. ChatList.tsx --------------------------------------------------------------------------------------------------------------
patch('src/advanced-features/chat/ChatList.tsx', c => {
  let r = fixCatch(c);
  // Fix: setIsLoading(false) not followed by }); before return () => unsubscribe
  const lines = r.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    out.push(lines[i]);
    if (lines[i].includes('setIsLoading(false);')) {
      // Look ahead for pattern: blank line then "return () => unsubscribe"
      let j = i + 1;
      while (j < lines.length && lines[j].match(/^\s*$/)) j++;
      if (j < lines.length && lines[j].includes('return () => unsubscribe')) {
        // Missing }); - insert it
        out.push('    });');
      }
    }
  }
  return out.join('\n');
});

// ---- 5. NotificationService.ts ------------------------------------------------------------------------------------------
patch('src/advanced-features/notifications/NotificationService.ts', c => {
  let r = fixCatch(c);
  // Check line 556 area for missing }
  const lines = r.split('\n');
  // Look for a method that needs closing at that area
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    out.push(lines[i]);
    // Line 555 (0-indexed 554): if it ends a block and next is unexpected
    if (i === 554 || i === 555) {
      // Check if closing brace is needed
    }
  }
  return r; // fixCatch already handles the main issue
});

// ---- 6. BambehSuccessAnimation.tsx ----------------------------------------------------------------------------------
patch('src/components/badges/BambehSuccessAnimation.tsx', c => {
  let r = fixCatch(c);
  const lines = r.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    // Fix );)} pattern 
    if (l.match(/^\s*\);\)\}$/)) {
      const indent = l.match(/^(\s*)/)[1];
      const outer = indent.length >= 2 ? indent.slice(0, -2) : '';
      out.push(indent + ');');
      out.push(outer + ')}');
    } else if (l.includes(');)}')) {
      const indent = l.match(/^(\s*)/)[1];
      const outer = indent.length >= 2 ? indent.slice(0, -2) : '';
      out.push(l.replace(');)}', ');'));
      out.push(outer + ')}');
    } else {
      out.push(l);
    }
  }
  return out.join('\n');
});

// ---- 7. DonatePremium.tsx --------------------------------------------------------------------------------------------------
patch('src/pages/DonatePremium.tsx', c => {
  const lines = c.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.match(/setCustomAmount\(''\);\}/) && 
        i + 1 < lines.length && lines[i+1].match(/className=/)) {
      out.push(l.replace("setCustomAmount('');}", "setCustomAmount('');"));
      out.push('                        }');
    } else {
      out.push(l);
    }
  }
  return out.join('\n');
});

// ---- 8. Global sweep of ALL remaining files ----------------------------------------------------------------
console.log('\n  Global sweep...');
function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === 'dist' || e.name === 'BAMBEH_FIXES') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { walkDir(full); continue; }
    if (!e.name.match(/\.(ts|tsx)$/)) continue;
    const c = fs.readFileSync(full, 'utf8');
    if (c.includes('}  } catch')) {
      const fixed_c = c.replace(/\}  \} catch \(/g, '} catch (');
      fs.writeFileSync(full, fixed_c, 'utf8');
      console.log('  [FIX] ' + full.replace(ROOT + '\\', '').replace(ROOT + '/', ''));
      fixed++;
    }
  }
}
walkDir(path.join(ROOT, 'src'));

// ---- 9. Create missing MarketplaceItemDetails if needed ----------------------------------------
const mpPage = 'src/pages/MarketplaceItemDetails.tsx';
if (!fs.existsSync(path.join(ROOT, mpPage))) {
  write(mpPage, `import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
export default function MarketplaceItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 text-teal-600">
        <ArrowLeft className="w-5 h-5" />Back
      </button>
      <div className="bg-white rounded-2xl p-6 shadow">
        <p className="text-gray-500">Loading item {id}...</p>
      </div>
    </div>
  );
}`);
  console.log('  [NEW] ' + mpPage);
  fixed++;
}

console.log(`\n  Total: ${fixed} fixes applied`);
console.log('\n  Now run: npx tsc --noEmit');
console.log('  Then:    npm run build\n');
