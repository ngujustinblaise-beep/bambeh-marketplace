import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones, MessageSquare, Clock, CheckCircle, AlertCircle, ChevronRight, Plus, Star, Zap, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useLang, t } from "@/hooks/useAppLang";

type TicketStatus="open"|"in_progress"|"resolved"|"closed";
type TicketPriority="low"|"medium"|"high"|"urgent";
type TicketCategory="billing"|"technical"|"account"|"orders"|"products"|"other";
interface SupportTicket{id:string;subject:string;message:string;category:TicketCategory;priority:TicketPriority;status:TicketStatus;created_at:string;updated_at:string;response?:string;response_at?:string;}
const STATUS={open:{label:"Open",color:"text-blue-400",bg:"bg-blue-500/10"},in_progress:{label:"In Progress",color:"text-yellow-400",bg:"bg-yellow-500/10"},resolved:{label:"Resolved",color:"text-green-400",bg:"bg-green-500/10"},closed:{label:"Closed",color:"text-gray-500",bg:"bg-gray-700/50"}};
const PRIORITY={low:{label:"Low",color:"text-gray-400"},medium:{label:"Medium",color:"text-blue-400"},high:{label:"High",color:"text-orange-400"},urgent:{label:"Urgent",color:"text-red-400"}};
const CATEGORIES=[{value:"billing" as const,label:"Billing & Payments"},{value:"technical" as const,label:"Technical Issue"},{value:"account" as const,label:"Account & Profile"},{value:"orders" as const,label:"Orders & Deliveries"},{value:"products" as const,label:"Products & Listings"},{value:"other" as const,label:"Other"}];

export default function PrioritySupport() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket|null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type:"success"|"error";text:string}|null>(null);
  const [form, setForm] = useState({subject:"",message:"",category:"technical" as TicketCategory,priority:"medium" as TicketPriority});

  useEffect(()=>{loadTickets();},[user?.id]);
  const loadTickets = async () => {
    if (!user?.id) return; setIsLoading(true);
    try{const{data,error}=await supabase.from("support_tickets").select("*").eq("vendor_id",user.id).order("created_at",{ascending:false});if(error)throw error;setTickets(data??[]);}
    catch(err){console.error(err);}finally{setIsLoading(false);}
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    if (!form.subject.trim()){setStatusMsg({type:"error",text:"Please enter a subject."});return;}
    if (!form.message.trim()){setStatusMsg({type:"error",text:"Please describe your issue."});return;}
    setIsSaving(true); setStatusMsg(null);
    try{
      const{error}=await supabase.from("support_tickets").insert({vendor_id:user.id,subject:form.subject.trim(),message:form.message.trim(),category:form.category,priority:form.priority,status:"open"});
      if(error)throw error;
      setStatusMsg({type:"success",text:"Ticket submitted! We will respond within 2 hours."});setShowForm(false);setForm({subject:"",message:"",category:"technical",priority:"medium"});await loadTickets();
    }catch(err:any){setStatusMsg({type:"error",text:err.message||"Failed to submit."});}
    finally{setIsSaving(false);}
  };

  const openTickets=tickets.filter(t=>t.status==="open"||t.status==="in_progress");
  const resolvedTickets=tickets.filter(t=>t.status==="resolved"||t.status==="closed");

  if(isLoading)return<div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/></div>;

  if(selectedTicket){
    const sc=STATUS[selectedTicket.status],pc=PRIORITY[selectedTicket.priority];
    return(
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10"><div className="flex items-center gap-3 px-4 py-3"><button onClick={()=>setSelectedTicket(null)} className="p-2 hover:bg-gray-700 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-400"/></button><h1 className="text-base font-semibold">Ticket Details</h1></div></header>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-start justify-between gap-3 mb-3"><h2 className="text-base font-semibold">{selectedTicket.subject}</h2><span className={`text-xs px-2 py-1 rounded-full font-medium ${sc.bg} ${sc.color}`}>{sc.label}</span></div>
            <div className="flex items-center gap-3 mb-4 text-xs text-gray-400"><span className={pc.color}>{pc.label} Priority</span><span>·</span><span className="capitalize">{selectedTicket.category}</span><span>·</span><span>{new Date(selectedTicket.created_at).toLocaleDateString()}</span></div>
            <div className="bg-gray-700/50 rounded-lg p-4"><p className="text-sm font-medium text-gray-300 mb-1">Your Message</p><p className="text-sm text-gray-400">{selectedTicket.message}</p></div>
            {selectedTicket.response?<div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"><div className="flex items-center gap-2 mb-2"><Headphones className="w-4 h-4 text-blue-400"/><p className="text-sm font-medium text-blue-400">Support Response</p></div><p className="text-sm text-gray-300">{selectedTicket.response}</p></div>:<div className="mt-4 flex items-center gap-2 text-sm text-gray-500"><Clock className="w-4 h-4"/><span>Awaiting response — within 2 hours</span></div>}
          </div>
        </div>
      </div>
    );
  }

  return(
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3"><button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-700 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-400"/></button><div className="flex items-center gap-2"><Headphones className="w-5 h-5 text-blue-400"/><h1 className="text-lg font-semibold">Priority Support</h1></div></div>
          <button onClick={()=>setShowForm(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm"><Plus className="w-4 h-4"/>New Ticket</button>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {statusMsg&&<div className={`flex items-center gap-2 p-4 rounded-lg border ${statusMsg.type==="success"?"bg-green-500/10 border-green-500/20 text-green-400":"bg-red-500/10 border-red-500/20 text-red-400"}`}>{statusMsg.type==="success"?<CheckCircle className="w-5 h-5"/>:<AlertCircle className="w-5 h-5"/>}<span className="text-sm">{statusMsg.text}</span></div>}
        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl border border-blue-500/20 p-5">
          <p className="text-sm font-semibold text-blue-300 mb-3">Your Priority Support Benefits</p>
          {[{icon:<Zap className="w-5 h-5 text-yellow-400"/>,title:"< 2 Hour Response",desc:"Priority vendors get fast responses"},{icon:<Shield className="w-5 h-5 text-blue-400"/>,title:"Dedicated Agent",desc:"A dedicated agent handles your account"},{icon:<Star className="w-5 h-5 text-purple-400"/>,title:"Premium Queue",desc:"Your tickets go to the front"}].map((f,i)=>(
            <div key={i} className="flex items-start gap-3 mb-3 last:mb-0"><div className="mt-0.5 flex-shrink-0">{f.icon}</div><div><p className="text-sm font-medium text-white">{f.title}</p><p className="text-xs text-gray-400">{f.desc}</p></div></div>
          ))}
        </div>
        {openTickets.length>0&&<div><h2 className="text-sm font-semibold text-gray-300 mb-3">Open Tickets ({openTickets.length})</h2><div className="space-y-2">{openTickets.map(t=>{const sc=STATUS[t.status],pc=PRIORITY[t.priority];return(<button key={t.id} onClick={()=>setSelectedTicket(t)} className="w-full bg-gray-800 rounded-xl border border-gray-700 p-4 text-left hover:border-gray-600 transition-colors"><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3 flex-1 min-w-0"><MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0"/><div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{t.subject}</p><div className="flex items-center gap-2 mt-1"><span className={`text-xs ${pc.color}`}>{pc.label}</span><span className="text-gray-600">·</span><span className="text-xs text-gray-500 capitalize">{t.category}</span></div></div></div><div className="flex items-center gap-2 flex-shrink-0"><span className={`text-xs px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span><ChevronRight className="w-4 h-4 text-gray-600"/></div></div></button>);})}</div></div>}
        {tickets.length===0&&<div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center"><Headphones className="w-12 h-12 text-gray-600 mx-auto mb-3"/><p className="text-gray-300 font-medium mb-1">No support tickets yet</p><p className="text-gray-500 text-sm mb-4">Submit a ticket and get a response within 2 hours</p><button onClick={()=>setShowForm(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm">Submit First Ticket</button></div>}
        {resolvedTickets.length>0&&<div><h2 className="text-sm font-semibold text-gray-500 mb-3">Resolved ({resolvedTickets.length})</h2><div className="space-y-2">{resolvedTickets.map(t=><button key={t.id} onClick={()=>setSelectedTicket(t)} className="w-full bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 text-left opacity-70"><div className="flex items-center justify-between gap-3"><p className="text-sm text-gray-400 truncate">{t.subject}</p><div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/><ChevronRight className="w-4 h-4 text-gray-600"/></div></div></button>)}</div></div>}
      </div>
      {showForm&&<div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 px-4 pb-4"><div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto"><div className="p-5"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold">New Support Ticket</h2><button onClick={()=>setShowForm(false)} className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400">✕</button></div><div className="space-y-4"><div><label className="block text-sm font-medium text-gray-300 mb-1">Subject</label><input type="text" value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))} placeholder="Brief description" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/></div><div><label className="block text-sm font-medium text-gray-300 mb-1">Category</label><select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value as TicketCategory}))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">{CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-300 mb-2">Priority</label><div className="grid grid-cols-4 gap-2">{(["low","medium","high","urgent"] as TicketPriority[]).map(p=><button key={p} onClick={()=>setForm(prev=>({...prev,priority:p}))} className={`py-2 rounded-lg border text-xs font-medium capitalize transition-colors ${form.priority===p?"border-blue-500 bg-blue-500/20 text-blue-300":"border-gray-600 text-gray-400 hover:border-gray-500"}`}>{p}</button>)}</div></div><div><label className="block text-sm font-medium text-gray-300 mb-1">Describe Your Issue</label><textarea value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} rows={5} placeholder="Please provide as much detail as possible..." className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/></div></div><button onClick={handleSubmit} disabled={isSaving} className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors">{isSaving?<span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Headphones className="w-5 h-5"/>}{isSaving?"Submitting...":"Submit Ticket"}</button></div></div></div>}
    </div>
  );
}
