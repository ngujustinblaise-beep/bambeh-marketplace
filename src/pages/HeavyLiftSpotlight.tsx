import { useLang, t } from "@/hooks/useAppLang";

import{useState,useEffect}from'react';
import{useNavigate}from'react-router-dom';
import{ArrowLeft,Star,MapPin,Briefcase,TrendingUp,Award,ChevronRight,Share2}from'lucide-react';

type Category='entrepreneur'|'farmer'|'artisan'|'tech'|'all';
interface StoryEntry{id:string;name:string;location:string;category:Category;headline:string;story:string;impact:string;revenue:string;imageInitial:string;featured:boolean;rating:number;}

const STORIES:StoryEntry[]=[
  {id:'1',name:'Marie-Claire Fotso',location:'Bafoussam',category:'farmer',headline:'From 2 acres to 50: How Bambeh changed everything',story:'I started selling my vegetables locally and could barely make ends meet. After joining Bambeh FarmFresh, I now supply to 200+ families across .',impact:'200+ families fed weekly',revenue:'2.4M XAF/month',imageInitial:'M',featured:true,rating:4.9},
  {id:'2',name:'Emmanuel Nkeng',location:'Yaounde',category:'tech',headline:'Built a tech empire from a single laptop',story:'I used to repair phones in Nlongkak market. Bambeh gave me a platform to showcase my skills. I now run a team of 12 developers.',impact:'12 jobs created',revenue:'8M XAF/month',imageInitial:'E',featured:true,rating:4.8},
  {id:'3',name:'Precious Akwa',location:'Douala',category:'artisan',headline:'Traditional crafts reaching the world via Bambeh',story:'My grandmother taught me weaving. I thought it was a dying art. Bambeh helped me sell to buyers across Africa and Europe.',impact:'Preserved cultural heritage',revenue:'1.8M XAF/month',imageInitial:'P',featured:false,rating:4.7},
  {id:'4',name:'Jean-Paul Beti',location:'Ngaoundere',category:'entrepreneur',headline:'Cattle to commerce: A northern success story',story:'I started with 10 cows and used Bambeh to sell livestock and products online. Now I manage a full agribusiness operation.',impact:'50+ herders partnered',revenue:'5.2M XAF/month',imageInitial:'J',featured:false,rating:4.6},
];

const CATEGORIES:{key:Category|'all';label:string}[]=[
  {key:'all',label:'All Stories'},{key:'farmer',label:'Farmers'},{key:'tech',label:'Tech'},{key:'artisan',label:'Artisans'},{key:'entrepreneur',label:'Entrepreneurs'},
];

export default function HeavyLiftSpotlight(){
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate=useNavigate();
  const[stories,setStories]=useState<StoryEntry[]>([]);
  const[filter,setFilter]=useState<Category|'all'>('all');
  const[selected,setSelected]=useState<StoryEntry|null>(null);

  useEffect(()=>{
    setStories(STORIES);
  },[]);

  const filtered=filter==='all'?stories:stories.filter(s=>s.category===filter);
  const featured=stories.find(s=>s.featured);

  if(selected){
    return(
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button onClick={()=>setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5"/></button>
          <h2 className="font-semibold text-gray-900 flex-1 truncate">{selected.name}</h2>
          <button className="p-2 hover:bg-gray-100 rounded-xl"><Share2 className="w-5 h-5 text-gray-400"/></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mb-3">{selected.imageInitial}</div>
            <h1 className="text-xl font-bold mb-0.5">{selected.name}</h1>
            <p className="text-teal-100 text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/>{selected.location}</p>
            <div className="flex items-center gap-1 mt-2"><Star className="w-4 h-4 fill-yellow-300 text-yellow-300"/><span className="text-sm font-semibold">{selected.rating}</span></div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2 text-lg">"{selected.headline}"</h3>
            <p className="text-gray-700 leading-relaxed text-sm">{selected.story}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
              <TrendingUp className="w-5 h-5 text-green-600 mb-2"/>
              <p className="text-lg font-bold text-green-700">{selected.revenue}</p>
              <p className="text-xs text-green-600">Monthly Revenue</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <Award className="w-5 h-5 text-blue-600 mb-2"/>
              <p className="text-sm font-bold text-blue-700">{selected.impact}</p>
              <p className="text-xs text-blue-600">Impact</p>
            </div>
          </div>
          <button onClick={()=>navigate('/marketplace')} className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold">Start Your Journey on Bambeh</button>
        </div>
      </div>
    );
  }

  return(
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5"/></button>
        <h2 className="font-semibold text-gray-900 flex-1">Heavy Lift Spotlight</h2>
        <Award className="w-5 h-5 text-teal-600"/>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
          <p className="text-teal-100 text-xs uppercase tracking-wide mb-1">Success Stories</p>
          <h1 className="text-xl font-bold mb-2">Real people. Real results.</h1>
          <p className="text-teal-100 text-sm">See how Bambeh is transforming lives and businesses across .</p>
        </div>
        {featured&&(
          <button onClick={()=>setSelected(featured)} className="w-full bg-white rounded-2xl shadow-sm border overflow-hidden text-left hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2">
              <span className="text-white text-xs font-bold uppercase tracking-wide flex items-center gap-1"><Star className="w-3 h-3 fill-white"/>Featured Story</span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-lg font-bold text-teal-700">{featured.imageInitial}</div>
                <div>
                  <p className="font-bold text-gray-900">{featured.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3"/>{featured.location}</p>
                </div>
              </div>
              <p className="font-semibold text-gray-900 text-sm mb-1">"{featured.headline}"</p>
              <p className="text-xs text-gray-500 line-clamp-2">{featured.story}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-green-600 font-bold text-sm">{featured.revenue}</span>
                <span className="text-teal-600 text-xs font-semibold flex items-center gap-1">Read more<ChevronRight className="w-3 h-3"/></span>
              </div>
            </div>
          </button>
        )}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(c=>(
            <button key={c.key} onClick={()=>setFilter(c.key)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${filter===c.key?'bg-teal-600 text-white':'bg-white border text-gray-600'}`}>{c.label}</button>
          ))}
        </div>
        <div className="space-y-3">
          {filtered.map(story=>(
            <button key={story.id} onClick={()=>setSelected(story)} className="w-full bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 hover:shadow-md transition-shadow text-left">
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-lg font-bold text-teal-700 flex-shrink-0">{story.imageInitial}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{story.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><MapPin className="w-3 h-3"/>{story.location}</p>
                <p className="text-xs text-gray-700 line-clamp-1">"{story.headline}"</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-green-600 font-bold text-xs">{story.revenue}</span>
                <div className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/><span className="text-xs text-gray-600">{story.rating}</span></div>
                <ChevronRight className="w-4 h-4 text-gray-400"/>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

