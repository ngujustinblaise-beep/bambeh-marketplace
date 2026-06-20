import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
const ROOT="src"; const bad=[];
function walk(d){for(const e of readdirSync(d)){const p=join(d,e);const st=statSync(p);
  if(st.isDirectory()){if(e!=="node_modules")walk(p);}
  else if([".ts",".tsx"].includes(extname(p))){
    readFileSync(p,"utf8").split(/\r?\n/).forEach((ln,i)=>{
      if(/^\s{0,1}use[A-Z]\w*\s*\(/.test(ln)) bad.push(p+":"+(i+1)+":  "+ln.trim().slice(0,60));
    });
  }
}}
walk(ROOT);
if(bad.length){console.error("\n[BLOCKED] Hook(s) called at module scope (this blanks the app):");
  bad.forEach(o=>console.error("  "+o));
  console.error("\nMove each inside a component or custom-hook function.\n");process.exit(1);}
else console.log("[OK] No module-scope hooks.");
