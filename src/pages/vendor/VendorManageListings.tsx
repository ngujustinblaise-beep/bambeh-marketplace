import { useLang, t } from "@/hooks/useAppLang";

import{useState,useEffect}from'react';
import{useNavigate}from'react-router-dom';
import{ArrowLeft,Plus,Search,Package,Eye,Edit3,Trash2,ToggleLeft,ToggleRight,Filter,TrendingUp}from'lucide-react';

type ListingStatus='active'|'paused'|'sold'|'expired';
type ListingType='all'|'product'|'service'|'job'|'rental';

interface Listing{id:string;title:string;price:number;type:ListingType;status:ListingStatus;views:number;likes:number;createdAt:string;image?:string;category:string;}

const SAMPLE:Listing[]=[
  {id:'1',title:'iPhone 13 Pro Max 256GB',price:450000,type:'product',status:'active',views:234,likes:18,createdAt:new Date(Date.now()-86400000*10).toISOString(),category:'Electronics'},
  {id:'2',title:'Samsung 55" Smart TV',price:280000,type:'product',status:'active',views:189,likes:12,createdAt:new Date(Date.now()-86400000*15).toISOString(),category:'Electronics'},
  {id:'3',title:'Professional Cleaning Service',price:15000,type:'service',status:'active',views:95,likes:8,createdAt:new Date(Date.now()-86400000*5).toISOString(),category:'Services'},
  {id:'4',title:'Designer Handbag Collection',price:85000,type:'product',status:'paused',views:67,likes:5,createdAt:new Date(Date.now()-86400000*20).toISOString(),category:'Fashion'},
  {id:'5',title:'Software Developer - Remote',price:300000,type:'job',status:'active',views:412,likes:31,createdAt:new Date(Date.now()-86400000*3).toISOString(),category:'Technology'},
];

const STATUS_STYLES:Record<ListingStatus,string>={
  active:'bg-green-50 text-green-700',
  paused:'bg-yellow-50 text-yellow-700',
  sold:'bg-gray-50 text-gray-600',
  expired:'bg-red-50 text-red-700',
};

export default function VendorManageListings(){
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate=useNavigate();
  const[listings,setListings]=useState<Listing[]>(SAMPLE);
  const[search,setSearch]=useState('');
  const[tab,setTab]=useState<ListingType>('all');
  const[statusFilter,setStatusFilter]=useState<ListingStatus|'all'>('all');

  const filtered=listings.filter(l=>{
    const matchTab=tab==='all'||l.type===tab;
    const matchStatus=statusFilter==='all'||l.status===statusFilter;
    const matchSearch=!search||l.title.toLowerCase().includes(search.toLowerCase());
    return matchTab&&matchStatus&&matchSearch;
  });

  function toggleStatus(id:string){
    setListings(prev=>prev.map(l=>{
      if(l.id!==id)return l;
      return {...l,status:l.status==='active'?'paused':'active'};
    }));
  }

  function deleteListing(id:string){
    if(!window.confirm('Delete this listing?'))return;
    setListings(prev=>prev.filter(l=>l.id!==id));
  }

  const totalViews=listings.reduce((s,l)=>s+l.views,0);
  const activeCount=listings.filter(l=>l.status==='active').length;

  return(
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5"/></button>
        <h2 className="font-semibold text-gray-900 flex-1">My Listings</h2>
        <button onClick={()=>navigate('/post-item')} className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1">
          <Plus className="w-4 h-4"/>Add
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[[listings.length,'Total',Package],[activeCount,'Active',TrendingUp],[totalViews.toLocaleString(),'Views',Eye]].map(([v,l,Icon])=>(
            <div key={String(l)} className="bg-white rounded-xl p-3 shadow-sm border text-center">
              {/* @ts-ignore */}
              <Icon className="w-4 h-4 text-blue-600 mx-auto mb-1"/>
              <p className="font-bold text-gray-900 text-sm">{String(v)}</p>
              <p className="text-xs text-gray-500">{String(l)}</p>
            </div>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search listings..." className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all','product','service','job','rental'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize ${tab===t?'bg-blue-600 text-white':'bg-white border text-gray-600'}`}>{t}</button>
          ))}
        </div>

        <div className="flex gap-2">
          {(['all','active','paused','sold'] as const).map(s=>(
            <button key={s} onClick={()=>setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${statusFilter===s?'bg-gray-800 text-white':'bg-white border text-gray-600'}`}>{s}</button>
          ))}
        </div>

        {filtered.length===0?(
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300"/>
            <p className="font-medium">No listings found</p>
            <button onClick={()=>navigate('/post-item')} className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold">Add First Listing</button>
          </div>
        ):(
          <div className="space-y-2">
            {filtered.map(listing=>(
              <div key={listing.id} className="bg-white rounded-2xl p-4 shadow-sm border">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-gray-400"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{listing.title}</p>
                    <p className="text-xs text-gray-500">{listing.category}  {listing.type}</p>
                    <p className="text-teal-600 font-bold text-sm">{listing.price.toLocaleString()} XAF</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_STYLES[listing.status]}`}>{listing.status}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3"/>{listing.views}</span>
                  <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>toggleStatus(listing.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${listing.status==='active'?'bg-yellow-50 text-yellow-700':'bg-green-50 text-green-700'}`}>
                    {listing.status==='active'?<><ToggleRight className="w-3.5 h-3.5"/>Pause</>:<><ToggleLeft className="w-3.5 h-3.5"/>Activate</>}
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
                    <Edit3 className="w-3.5 h-3.5"/>Edit
                  </button>
                  <button onClick={()=>deleteListing(listing.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 ml-auto">
                    <Trash2 className="w-3.5 h-3.5"/>Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




