import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, X, Download, Package, Loader2, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useLang, t } from "@/hooks/useAppLang";

interface ParsedProduct{name:string;description:string;price:number;category:string;stock:number;image_url?:string;status:"valid"|"error";errors:string[];}
interface UploadResult{success:number;failed:number;errors:string[];}
const HEADERS=["name","description","price","category","stock","image_url"];
const SAMPLES=[["iPhone 14 Case","Protective case","2500","Electronics","50",""],["Ankara Dress","Traditional dress","15000","Fashion","20",""],["Fresh Tomatoes 1kg","Farm tomatoes","800","Food & Groceries","100",""]];
function genCSV(){return[HEADERS,...SAMPLES].map(r=>r.join(",")).join("\n");}
  const lang = useLang();
  const isRtl = lang === "ar";
function parseRow(row:string):string[]{const r:string[]=[],cur={v:""};let q=false;for(const c of row){if(c==='"'){q=!q;}else if(c===","&&!q){r.push(cur.v.trim());cur.v="";}else{cur.v+=c;}}r.push(cur.v.trim());return r;}
function validate(fields:string[]):ParsedProduct{
  const[name,description,priceStr,category,stockStr,image_url]=fields,errors:string[]=[];
  if(!name?.trim())errors.push("Name required");
  if(!description?.trim())errors.push("Description required");
  const price=parseFloat(priceStr);if(isNaN(price)||price<0)errors.push("Invalid price");
  if(!category?.trim())errors.push("Category required");
  const stock=parseInt(stockStr,10);if(isNaN(stock)||stock<0)errors.push("Invalid stock");
  return{name:name?.trim()??"",description:description?.trim()??"",price:isNaN(price)?0:price,category:category?.trim()??"",stock:isNaN(stock)?0:stock,image_url:image_url?.trim()||undefined,status:errors.length===0?"valid":"error",errors};
}

export default function BulkUpload(){
  const navigate=useNavigate();
  const{user}=useAuthStore();
  const fileRef=useRef<HTMLInputElement>(null);
  const[dragActive,setDragActive]=useState(false);
  const[products,setProducts]=useState<ParsedProduct[]>([]);
  const[fileName,setFileName]=useState("");
  const[isUploading,setIsUploading]=useState(false);
  const[result,setResult]=useState<UploadResult|null>(null);
  const[step,setStep]=useState<"upload"|"preview"|"done">("upload");

  const handleDrag=(e:React.DragEvent)=>{e.preventDefault();e.stopPropagation();if(e.type==="dragenter"||e.type==="dragover")setDragActive(true);else if(e.type==="dragleave")setDragActive(false);};
  const handleDrop=(e:React.DragEvent)=>{e.preventDefault();e.stopPropagation();setDragActive(false);const f=e.dataTransfer.files?.[0];if(f)processFile(f);};
  const handleInput=(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(f)processFile(f);};
  const processFile=(file:File)=>{
    if(!file.name.endsWith(".csv")){alert("Please upload a CSV file.");return;}
    setFileName(file.name);
    const r=new FileReader();
    r.onload=e=>{const text=e.target?.result as string;const lines=text.split("\n").filter(l=>l.trim());if(lines.length<2){alert("CSV needs a header and at least one row.");return;}setProducts(lines.slice(1).filter(l=>l.trim()).map(l=>validate(parseRow(l))));setStep("preview");};
    r.readAsText(file);
  };
  const handleUpload=async()=>{
    if(!user?.id)return;const valid=products.filter(p=>p.status==="valid");if(!valid.length)return;
    setIsUploading(true);let success=0;const errors:string[]=[];
    for(const p of valid){try{const{error}=await supabase.from("products").insert({vendor_id:user.id,name:p.name,description:p.description,price:p.price,category:p.category,stock:p.stock,image_url:p.image_url??null,status:"active",created_at:new Date().toISOString()});if(error)throw error;success++;}catch(err:any){errors.push(`${p.name}: ${err.message}`);}}
    setResult({success,failed:valid.length-success,errors});setIsUploading(false);setStep("done");
  };
  const downloadTemplate=()=>{const b=new Blob([genCSV()],{type:"text/csv"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="bambeh_template.csv";a.click();URL.revokeObjectURL(u);};
  const reset=()=>{setProducts([]);setFileName("");setResult(null);setStep("upload");if(fileRef.current)fileRef.current.value="";};
  const validCount=products.filter(p=>p.status==="valid").length;
  const errorCount=products.filter(p=>p.status==="error").length;

  return(
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10"><div className="flex items-center gap-3 px-4 py-3"><button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-700 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-400"/></button><div className="flex items-center gap-2"><Upload className="w-5 h-5 text-green-400"/><h1 className="text-lg font-semibold">Bulk Upload Products</h1></div></div></header>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {step==="upload"&&<><div className="bg-gray-800 rounded-xl border border-gray-700 p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-white mb-1">Step 1 — Download Template</p><p className="text-xs text-gray-400">Fill the CSV then upload below.</p></div><button onClick={downloadTemplate} className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium flex-shrink-0"><Download className="w-4 h-4"/>Template</button></div><div className="mt-3 flex flex-wrap gap-2">{HEADERS.map(h=><span key={h} className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">{h}</span>)}</div></div>
        <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={()=>fileRef.current?.click()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragActive?"border-green-500 bg-green-500/10":"border-gray-600 hover:border-gray-500"}`}><input ref={fileRef} type="file" accept=".csv" onChange={handleInput} className="hidden"/><FileText className="w-12 h-12 text-gray-500 mx-auto mb-3"/><p className="text-gray-300 font-medium mb-1">{dragActive?"Drop your CSV here":"Drag & drop your CSV"}</p><p className="text-gray-500 text-sm">or click to browse</p></div></>}
        {step==="preview"&&<>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5"><div className="flex items-center justify-between mb-4"><div><p className="text-sm font-semibold text-white">{fileName}</p><p className="text-xs text-gray-400">{products.length} rows</p></div><button onClick={reset} className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400"><X className="w-4 h-4"/></button></div><div className="grid grid-cols-2 gap-3"><div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center"><p className="text-xl font-bold text-green-400">{validCount}</p><p className="text-xs text-gray-400">Ready</p></div><div className={`rounded-lg p-3 text-center border ${errorCount>0?"bg-red-500/10 border-red-500/20":"bg-gray-700/50 border-gray-700"}`}><p className={`text-xl font-bold ${errorCount>0?"text-red-400":"text-gray-500"}`}>{errorCount}</p><p className="text-xs text-gray-400">Errors</p></div></div></div>
          <div className="space-y-2 max-h-80 overflow-y-auto">{products.map((p,i)=><div key={i} className={`bg-gray-800 rounded-xl border p-4 ${p.status==="valid"?"border-gray-700":"border-red-500/30"}`}><div className="flex items-start gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${p.status==="valid"?"bg-green-500/20":"bg-red-500/20"}`}>{p.status==="valid"?<CheckCircle className="w-4 h-4 text-green-400"/>:<AlertCircle className="w-4 h-4 text-red-400"/>}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{p.name||`Row ${i+2}`}</p><div className="flex gap-3 mt-0.5 text-xs text-gray-400">{p.price>0&&<span>{p.price.toLocaleString()} FCFA</span>}{p.category&&<span>{p.category}</span>}</div>{p.errors.map((e,j)=><p key={j} className="text-xs text-red-400 mt-0.5">• {e}</p>)}</div></div></div>)}</div>
          {validCount>0&&<button onClick={handleUpload} disabled={isUploading} className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl font-semibold">{isUploading?<Loader2 className="w-5 h-5 animate-spin"/>:<Upload className="w-5 h-5"/>}{isUploading?"Uploading...":`Upload ${validCount} Product${validCount!==1?"s":""}`}</button>}
        </>}
        {step==="done"&&result&&<div className="space-y-4"><div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">{result.success>0?<CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3"/>:<AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3"/>}<p className="text-lg font-bold text-white mb-1">{result.success>0?"Upload Complete!":"Upload Failed"}</p><p className="text-sm text-gray-400">{result.success} added{result.failed>0?`, ${result.failed} failed`:""}</p></div>{result.errors.length>0&&<div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"><p className="text-sm font-semibold text-red-400 mb-2">Failed Items</p>{result.errors.map((e,i)=><p key={i} className="text-xs text-red-300">• {e}</p>)}</div>}<div className="grid grid-cols-2 gap-3"><button onClick={reset} className="flex items-center justify-center gap-2 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium"><Upload className="w-4 h-4"/>Upload More</button><button onClick={()=>navigate("/vendor/products")} className="flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium"><Eye className="w-4 h-4"/>View Products</button></div></div>}
      </div>
    </div>
  );
}




