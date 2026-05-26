import{useState}from'react';
import{useNavigate}from'react-router-dom';
import{ArrowLeft,Briefcase}from'lucide-react';
const TYPES=['Full-time','Part-time','Contract','Internship','Remote','Freelance'];
const CATS=['Technology','Healthcare','Education','Finance','Marketing','Construction','Transport','Hospitality','Other'];
export default function PostJobPage(){
  const navigate=useNavigate();
  const[form,setForm]=useState({title:'',company:'',type:'Full-time',category:'Technology',location:'Yaounde',salary:'',description:'',requirements:'',deadline:''});
  const[done,setDone]=useState(false);
  function submit(){
    if(!form.title||!form.company||!form.description)return;
    try{
      const jobs=JSON.parse(localStorage.getItem('bambeh_posted_jobs')||'[]');
      jobs.unshift({...form,id:Date.now().toString(),postedAt:new Date().toISOString()});
      localStorage.setItem('bambeh_posted_jobs',JSON.stringify(jobs));
    }catch{}
    setDone(true);
    setTimeout(()=>navigate('/jobs'),1500);
  }
  if(done)return<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><div className="text-5xl mb-4"></div><h2 className="text-xl font-bold">Job Posted!</h2></div></div>;
  return(
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <button onClick={()=>navigate(-1)} className="flex items-center gap-2 text-teal-600 mb-4"><ArrowLeft className="w-5 h-5"/>Back</button>
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6"><Briefcase className="w-6 h-6 text-teal-600"/>Post a Job</h1>
      <div className="bg-white rounded-2xl p-5 shadow-sm border space-y-4">
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Job Title *</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Software Engineer" className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none text-sm"/></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Company *</label><input value={form.company} onChange={e=>setForm({...form,company:e.target.value})} placeholder="Company name" className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none text-sm"/></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Type</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm">{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm">{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
        </div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Location</label><input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none text-sm"/></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Salary (XAF)</label><input value={form.salary} onChange={e=>setForm({...form,salary:e.target.value})} placeholder="e.g. 150,000 - 300,000 XAF" className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none text-sm"/></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={4} placeholder="Describe the role, responsibilities..." className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none resize-none text-sm"/></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Requirements</label><textarea value={form.requirements} onChange={e=>setForm({...form,requirements:e.target.value})} rows={3} placeholder="List requirements, one per line..." className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none resize-none text-sm"/></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Application Deadline</label><input type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none text-sm"/></div>
        <button onClick={submit} disabled={!form.title||!form.company||!form.description} className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50">Post Job</button>
      </div>
    </div>
  );
}
