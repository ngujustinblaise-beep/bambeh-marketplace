import { useLang, t } from "@/hooks/useAppLang";

import{useState}from'react';
import{useNavigate}from'react-router-dom';
import{ArrowLeft,TrendingUp,Lightbulb,Target,BarChart2,Star,Package,Users,DollarSign,ChevronRight}from'lucide-react';

interface Recommendation{id:string;title:string;description:string;impact:'high'|'medium'|'low';category:string;actionLabel:string;actionRoute:string;}
interface Metric{label:string;yourScore:number;industryAvg:number;topPerformers:number;unit:string;good:boolean;}

const RECOMMENDATIONS:Recommendation[]=[
  {id:'1',title:'Add More Product Photos',description:'Listings with 5+ photos get 3x more views. Your average is 1.8 photos per listing.',impact:'high',category:'Listings',actionLabel:'Update Listings',actionRoute:'/vendor/listings'},
  {id:'2',title:'Respond Faster to Messages',description:'Your average response time is 4 hours. Top sellers respond within 1 hour.',impact:'high',category:'Customer Service',actionLabel:'View Messages',actionRoute:'/vendor/messages'},
  {id:'3',title:'Enable Flash Deals',description:'Flash deals drive 40% more traffic. You have not run a deal in 30 days.',impact:'medium',category:'Marketing',actionLabel:'Create Deal',actionRoute:'/vendor/deals'},
  {id:'4',title:'Complete Your Profile',description:'Verified sellers with complete profiles earn 60% more.',impact:'medium',category:'Trust',actionLabel:'Edit Profile',actionRoute:'/vendor/profile'},
  {id:'5',title:'Add Business Hours',description:'Customers want to know when you are available.',impact:'low',category:'Settings',actionLabel:'Add Hours',actionRoute:'/vendor/settings/hours'},
];

const METRICS:Metric[]=[
  {label:'Profile Score',yourScore:65,industryAvg:72,topPerformers:95,unit:'%',good:false},
  {label:'Response Rate',yourScore:88,industryAvg:75,topPerformers:98,unit:'%',good:true},
  {label:'Avg Rating',yourScore:4.2,industryAvg:4.1,topPerformers:4.9,unit:'',good:true},
  {label:'Photos/Listing',yourScore:1.8,industryAvg:3.2,topPerformers:6.1,unit:'',good:false},
];

const impactColor={high:'bg-red-50 text-red-700',medium:'bg-orange-50 text-orange-700',low:'bg-gray-50 text-gray-600'};

export default function VendorRecommendations(){
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate=useNavigate();
  const[filter,setFilter]=useState<'all'|'high'|'medium'|'low'>('all');
  const filtered=RECOMMENDATIONS.filter(r=>filter==='all'||r.impact===filter);

  return(
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5"/></button>
        <h2 className="font-semibold text-gray-900 flex-1">Recommendations</h2>
        <Lightbulb className="w-5 h-5 text-yellow-500"/>
      </div>

      <div className="p-4 space-y-4">
        {/* Score overview */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 text-white">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><BarChart2 className="w-4 h-4"/>Your Performance vs Industry</h3>
          <div className="space-y-3">
            {METRICS.map(m=>(
              <div key={m.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-100">{m.label}</span>
                  <span className={`font-bold ${m.good?'text-green-300':'text-yellow-300'}`}>{m.yourScore}{m.unit}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-200">
                  <span>You: {m.yourScore}{m.unit}</span>
                  <span>Avg: {m.industryAvg}{m.unit}</span>
                  <span>Top: {m.topPerformers}{m.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(['all','high','medium','low'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${filter===f?'bg-blue-600 text-white':'bg-white border text-gray-600'}`}>{f}</button>
          ))}
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          {filtered.map(rec=>(
            <div key={rec.id} className="bg-white rounded-2xl p-4 shadow-sm border">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${impactColor[rec.impact]}`}>{rec.impact} impact</span>
                    <span className="text-xs text-gray-400">{rec.category}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{rec.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{rec.description}</p>
                </div>
                <Target className="w-5 h-5 text-blue-400 flex-shrink-0"/>
              </div>
              <button onClick={()=>navigate(rec.actionRoute)} className="flex items-center gap-1 text-blue-600 text-sm font-semibold mt-2">
                {rec.actionLabel}<ChevronRight className="w-4 h-4"/>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}





