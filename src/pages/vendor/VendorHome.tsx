import{useState,useEffect}from'react';
import{useNavigate}from'react-router-dom';
import{BarChart2,Package,MessageSquare,Star,TrendingUp,Plus,Bell,Settings,Eye,ShoppingBag,Users,DollarSign}from'lucide-react';

interface Listing{id:string;title:string;price:number;category:string;views:number;status:'active'|'paused';image?:string;}
interface VendorStats{totalSales:number;monthlyRevenue:number;activeListings:number;totalViews:number;rating:number;reviews:number;}

const sampleListings:Listing[]=[
  {id:'1',title:'iPhone 13 Pro Max',price:450000,category:'Electronics',views:234,status:'active'},
  {id:'2',title:'Samsung 55" TV',price:280000,category:'Electronics',views:189,status:'active'},
  {id:'3',title:'Designer Handbag',price:85000,category:'Fashion',views:95,status:'paused'},
];

export default function VendorHome(){
  const navigate=useNavigate();
  const[vendor,setVendor]=useState<any>(null);
  const[listings,setListings]=useState<Listing[]>(sampleListings);
  const[stats,setStats]=useState<VendorStats>({totalSales:45,monthlyRevenue:1250000,activeListings:12,totalViews:3840,rating:4.8,reviews:127});
  const[searchQuery,setSearchQuery]=useState('');

  useEffect(()=>{
    try{
      const raw=localStorage.getItem('Bambeh_vendor');
      if(raw)setVendor(JSON.parse(raw));
      const savedListings=localStorage.getItem('bambeh_vendor_listings');
      if(savedListings)setListings(JSON.parse(savedListings));
    }catch{}
  },[]);

  const filtered=listings.filter(l=>!searchQuery||l.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return(
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 pt-8 pb-16">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-bold text-xl">Vendor Dashboard</h1>
            <p className="text-blue-100 text-sm">{vendor?.businessName||'My Store'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>navigate('/vendor/notifications')} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-white"/>
            </button>
            <button onClick={()=>navigate('/vendor/settings')} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-white"/>
            </button>
          </div>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[[stats.monthlyRevenue.toLocaleString()+' XAF','Revenue',DollarSign],[stats.activeListings,'Listings',Package],[stats.rating+' ','Rating',Star]].map(([v,l,Icon])=>(
            <div key={String(l)} className="bg-white/10 rounded-xl p-2.5 text-center">
              <p className="text-white font-bold text-sm">{String(v)}</p>
              <p className="text-blue-100 text-xs mt-0.5">{String(l)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-4">
        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2">
          {[
            ['Add Listing',Plus,'/vendor/listings/new','bg-blue-600'],
            ['Analytics',BarChart2,'/vendor/analytics','bg-purple-600'],
            ['Messages',MessageSquare,'/vendor/messages','bg-green-600'],
            ['Orders',ShoppingBag,'/vendor/orders','bg-orange-600'],
          ].map(([label,Icon,route,bg])=>(
            <button key={String(label)} onClick={()=>navigate(String(route))} className="bg-white rounded-2xl p-3 shadow-sm border flex flex-col items-center gap-1">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                {/* @ts-ignore */}
                <Icon className="w-4 h-4 text-white"/>
              </div>
              <span className="text-xs text-gray-600 font-medium text-center leading-tight">{String(label)}</span>
            </button>
          ))}
        </div>

        {/* Performance card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-600"/>This Month</h3>
            <button onClick={()=>navigate('/vendor/analytics')} className="text-xs text-blue-600 font-semibold">View All</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['Total Views',stats.totalViews.toLocaleString(),Eye,'text-purple-600'],['Total Sales',stats.totalSales,ShoppingBag,'text-green-600'],['Customers',stats.reviews,Users,'text-blue-600'],['Revenue',Math.round(stats.monthlyRevenue/1000)+'k XAF',DollarSign,'text-orange-600']].map(([l,v,Icon,col])=>(
              <div key={String(l)} className="bg-gray-50 rounded-xl p-3">
                {/* @ts-ignore */}
                <Icon className={`w-4 h-4 ${col} mb-1`}/>
                <p className="text-lg font-bold text-gray-900">{String(v)}</p>
                <p className="text-xs text-gray-500">{String(l)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Listings */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">My Listings</h3>
            <button onClick={()=>navigate('/vendor/listings')} className="text-xs text-blue-600 font-semibold">Manage All</button>
          </div>
          <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search listings..." className="w-full border rounded-xl px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-blue-500 outline-none"/>
          <div className="space-y-2">
            {filtered.slice(0,5).map(listing=>(
              <div key={listing.id} onClick={()=>navigate('/vendor/listings/'+listing.id)} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-blue-400"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{listing.title}</p>
                  <p className="text-xs text-gray-500">{listing.price.toLocaleString()} XAF  {listing.views} views</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${listing.status==='active'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>
                  {listing.status}
                </span>
              </div>
            ))}
          </div>
          <button onClick={()=>navigate('/vendor/listings/new')} className="w-full mt-3 border-2 border-dashed border-blue-200 text-blue-600 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            <Plus className="w-4 h-4"/>Add New Listing
          </button>
        </div>
      </div>
    </div>
  );
}
