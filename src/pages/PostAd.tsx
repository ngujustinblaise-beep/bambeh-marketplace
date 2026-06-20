import { useLang, t } from "@/hooks/useAppLang";

import{useState}from'react';
import{useNavigate}from'react-router-dom';
import{ArrowLeft,Megaphone}from'lucide-react';
export default function PostAd(){
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate=useNavigate();
  const[form,setForm]=useState({title:'',description:'',budget:'',duration:'7',contact:'',category:'General'});
  const[done,setDone]=useState(false);
  function submit(){
    if(!form.title||!form.description)return;
    try{const ads=JSON.parse(localStorage.getItem('bambeh_ads')||'[]');ads.unshift({...form,id:Date.now().toString(),postedAt:new Date().toISOString()});localStorage.setItem('bambeh_ads',JSON.stringify(ads));}catch{}
    setDone(true);setTimeout(()=>navigate('/'),1500);
  }
  if(done)return<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><div className="text-5xl mb-4"></div><h2 className="text-xl font-bold">Ad Posted!</h2></div></div>;
  return(
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <button onClick={()=>navigate(-1)} className="flex items-center gap-2 text-teal-600 mb-4"><ArrowLeft className="w-5 h-5"/>Back</button>
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6"><Megaphone className="w-6 h-6 text-teal-600"/>Post Advertisement</h1>
      <div className="bg-white rounded-2xl p-5 shadow-sm border space-y-4">
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Ad title" className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none text-sm"/></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={4} placeholder="Describe your ad..." className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none resize-none text-sm"/></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Budget (XAF)</label><input type="number" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} placeholder="e.g. 50000" className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none text-sm"/></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label><select value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm">{['7','14','30','60','90'].map(d=><option key={d} value={d}>{d} days</option>)}</select></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Contact</label><input value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} placeholder="Phone or email" className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none text-sm"/></div>
        <button onClick={submit} disabled={!form.title||!form.description} className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50">Submit Ad</button>
      </div>
    </div>
  );
}


