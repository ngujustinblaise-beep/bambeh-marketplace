import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, copyFileSync } from "fs";
import { join, extname, dirname } from "path";
const ROOT="src", BAK=".mojibake-bak";
const CP=new Map([[0x20AC,0x80],[0x201A,0x82],[0x0192,0x83],[0x201E,0x84],[0x2026,0x85],[0x2020,0x86],[0x2021,0x87],[0x02C6,0x88],[0x2030,0x89],[0x0160,0x8A],[0x2039,0x8B],[0x0152,0x8C],[0x017D,0x8E],[0x2018,0x91],[0x2019,0x92],[0x201C,0x93],[0x201D,0x94],[0x2022,0x95],[0x2013,0x96],[0x2014,0x97],[0x02DC,0x98],[0x2122,0x99],[0x0161,0x9A],[0x203A,0x9B],[0x0153,0x9C],[0x017E,0x9E],[0x0178,0x9F]]);
const RUN=/[\u00C2-\u00F4][\u00A0-\u00BF\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u0192\u02C6\u02DC\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2026\u2030\u2039\u203A\u20AC\u2122]{1,3}/g;
function toBytes(run){const a=[];for(const ch of run){const c=ch.codePointAt(0);if(c<=0xFF)a.push(c);else if(CP.has(c))a.push(CP.get(c));else return null;}return Buffer.from(a);}
function repair(t){let n=0;const o=t.replace(RUN,(m)=>{const by=toBytes(m);if(!by)return m;const d=by.toString("utf8");if(d.includes("\uFFFD"))return m;if(!Buffer.from(d,"utf8").equals(by))return m;n++;return d;});return{o,n};}
let files=0,fixes=0;
function walk(d){for(const e of readdirSync(d)){const p=join(d,e);const st=statSync(p);if(st.isDirectory()){if(e!=="node_modules")walk(p);}else if([".ts",".tsx",".js",".jsx"].includes(extname(p))){const src=readFileSync(p,"utf8");const{o,n}=repair(src);if(n>0&&o!==src){const bak=join(BAK,p);mkdirSync(dirname(bak),{recursive:true});copyFileSync(p,bak);writeFileSync(p,o,"utf8");console.log("  "+String(n).padStart(3)+" run(s)  "+p);files++;fixes+=n;}}}}
walk(ROOT);
console.log("\n[done] repaired "+fixes+" run(s) in "+files+" file(s); backups in "+BAK+"/");
console.log("Any text still showing a literal '?' had bytes destroyed and must be re-authored.");
