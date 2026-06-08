import { useLang, t } from "@/hooks/useAppLang";

import{useState,useEffect}from'react';
import{useNavigate}from'react-router-dom';
import{Gift,Users,Copy,Check,Share2,TrendingUp}from'lucide-react';

interface Referral{id:string;name:string;status:'pending'|'joined'|'active';joinedAt?:string;bonus:number;}

const TIERS=[
  {label:'Bronze',min:0,max:5,bonus:500,color:'text-amber-600',bg:'bg-amber-50'},
  {label:'Silver',min:5,max:20,bonus:750,color:'text-gray-600',bg:'bg-gray-50'},
  {label:'Gold',min:20,max:50,bonus:1000,color:'text-yellow-600',bg:'bg-yellow-50'},
  {label:'Platinum',min:50,max:Infinity,bonusRate:1.0,bonus:1500,color:'text-teal-600',bg:'bg-teal-50'},
];

export default function ReferralProgram(){
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate=useNavigate();
  const[code]=useState('BAMBEH-'+Math.random().toString(36).substr(2,6).toUpperCase());
  const[copied,setCopied]=useState(false);
  const[referrals]=useState<Referral[]>([
    {id:'1',name:'Alice M.',status:'active',joinedAt:new Date(Date.now()-86400000*5).toISOString(),bonus:500},
    {id:'2',name:'Bob K.',status:'joined',joinedAt:new Date(Date.now()-86400000*2).toISOString(),bonus:500},
    {id:'3',name:'Carol N.',status:'pending',bonus:0},
  ]);
  const totalEarned=referrals.filter(r=>r.status==='active').reduce((s,r)=>s+r.bonus,0);
  const activeCount=referrals.filter(r=>r.status==='active').length;
  const tier=TIERS.find(t=>activeCount>=t.min&&activeCount<t.max)||TIERS[0];

  function copyCode(){
    navigator.clipboard.writeText(code).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}).catch(()=>{});
  }

  return(
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Gift className="w-6 h-6 text-teal-600"/>Referral Program
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[['Referrals',referrals.length,''],['Active',activeCount,''],['Earned',totalEarned+' Z','']].map(([l,v,e])=>(
            <div key={String(l)} className="bg-white rounded-2xl p-3 shadow-sm border text-center">
              <div className="text-xl mb-1">{e}</div>
              <div className="text-lg font-bold text-gray-900">{v}</div>
              <div className="text-xs text-gray-500">{l}</div>
            </div>
          ))}
        </div>

        {/* Tier */}
        <div className={`${tier.bg} rounded-2xl p-4 mb-4 border`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-bold ${tier.color}`}>{tier.label} Tier</span>
            <span className="text-sm text-gray-600">{tier.bonus} Z per referral</span>
          </div>
          <div className="w-full bg-white/60 rounded-full h-2">
            <div className="bg-teal-600 h-2 rounded-full transition-all" style={{width:tier.max===Infinity?'100%':`${Math.min(100,(activeCount-tier.min)/(tier.max-tier.min)*100)}%`}}/>
          </div>
          {tier.max!==Infinity&&<p className="text-xs text-gray-500 mt-1">{activeCount}/{tier.max} to next tier</p>}
        </div>

        {/* Code */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Your Referral Code</h3>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 mb-3">
            <span className="flex-1 font-mono font-bold text-teal-600 text-lg tracking-wider">{code}</span>
            <button onClick={copyCode} className="p-2 bg-teal-600 text-white rounded-lg">
              {copied?<Check className="w-4 h-4"/>:<Copy className="w-4 h-4"/>}
            </button>
          </div>
          <button className="w-full border border-teal-600 text-teal-600 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4"/>Share with Friends
          </button>
        </div>

        {/* Referrals list */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Users className="w-4 h-4"/>Your Referrals</h3>
          {referrals.length===0?(
            <p className="text-center text-gray-500 py-6 text-sm">No referrals yet. Share your code!</p>
          ):(
            <div className="space-y-2">
              {referrals.map(r=>(
                <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.joinedAt?new Date(r.joinedAt).toLocaleDateString():'Pending'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.status==='active'?'bg-green-50 text-green-700':r.status==='joined'?'bg-blue-50 text-blue-700':'bg-gray-50 text-gray-500'}`}>{r.status}</span>
                    {r.bonus>0&&<p className="text-xs text-teal-600 font-semibold mt-0.5">+{r.bonus} Z</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
