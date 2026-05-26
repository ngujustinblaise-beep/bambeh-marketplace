import{useState}from'react';
import{useNavigate}from'react-router-dom';
import{Heart,Star,Zap,Shield,ArrowLeft}from'lucide-react';

const AMOUNTS=[1000,2500,5000,10000,25000,50000];
const PERKS=[
  {icon:'',title:'Priority Support',desc:'Get help faster than regular users'},
  {icon:'',title:'No Ads',desc:'Enjoy Bambeh without interruptions'},
  {icon:'',title:'Premium Badge',desc:'Stand out with a verified badge'},
  {icon:'',title:'Advanced Filters',desc:'Find exactly what you need'},
];

export default function DonatePremium(){
  const navigate=useNavigate();
  const[amount,setAmount]=useState('5000');
  const[custom,setCustom]=useState('');
  const[method,setMethod]=useState<'mtn'|'orange'>('mtn');
  const[done,setDone]=useState(false);

  const finalAmount=custom?+custom:+amount;

  function pay(){
    if(!finalAmount||finalAmount<500)return;
    setDone(true);
  }

  if(done){
    return(
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="text-6xl mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-500 mb-6">Your premium support means everything to us.</p>
          <button onClick={()=>navigate('/')} className="bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold">Back to App</button>
        </div>
      </div>
    );
  }

  return(
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 px-4 pt-8 pb-12">
        <button onClick={()=>navigate(-1)} className="text-white/80 flex items-center gap-1 mb-6 text-sm"><ArrowLeft className="w-4 h-4"/>Back</button>
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white fill-white"/>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">Support Bambeh</h1>
          <p className="text-purple-100 text-sm">Help us build a better marketplace for Cameroon</p>
        </div>
      </div>

      <div className="px-4 -mt-6">
        {/* Perks */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500"/>Premium Perks</h3>
          <div className="grid grid-cols-2 gap-2">
            {PERKS.map(p=>(
              <div key={p.title} className="bg-purple-50 rounded-xl p-3">
                <div className="text-xl mb-1">{p.icon}</div>
                <p className="font-semibold text-gray-900 text-xs">{p.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Choose Amount (XAF)</h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {AMOUNTS.map(amt=>(
              <button
                key={amt}
                onClick={()=>{setAmount(amt.toString());setCustom('');}}
                className={`px-4 py-4 rounded-2xl font-bold transition-all ${amount===amt.toString()&&!custom?'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105':'bg-gray-50 text-gray-700 hover:bg-purple-50'}`}
              >
                {(amt/1000).toFixed(amt<1000?2:0)}k
              </button>
            ))}
          </div>
          <input
            type="number"
            value={custom}
            onChange={e=>setCustom(e.target.value)}
            placeholder="Custom amount..."
            className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
          />
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            {([['mtn',' MTN MoMo'],['orange',' Orange Money']] as const).map(([m,l])=>(
              <button key={m} onClick={()=>setMethod(m)} className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${method===m?'border-purple-500 bg-purple-50 text-purple-700':'border-gray-200 text-gray-600'}`}>{l}</button>
            ))}
          </div>
        </div>

        <button onClick={pay} disabled={!finalAmount||finalAmount<500} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
          <Heart className="w-5 h-5 fill-white"/>Support with {finalAmount.toLocaleString()} XAF
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">Minimum 500 XAF  Secure payment</p>
      </div>
    </div>
  );
}
