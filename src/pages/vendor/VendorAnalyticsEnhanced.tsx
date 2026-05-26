import{useState}from'react';
import{useNavigate}from'react-router-dom';
import{ArrowLeft,TrendingUp,TrendingDown,BarChart2,Users,DollarSign,Eye,ShoppingCart,Star,Package}from'lucide-react';

const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const REVENUE=[180000,220000,150000,310000,280000,350000,260000];
const ORDERS=[5,8,4,12,10,15,9];

export default function VendorAnalyticsEnhanced(){
  const navigate=useNavigate();
  const[period,setPeriod]=useState<'7d'|'30d'|'90d'>('7d');
  const maxRev=Math.max(...REVENUE);
  const maxOrd=Math.max(...ORDERS);
  const totalRev=REVENUE.reduce((a,b)=>a+b,0);
  const totalOrd=ORDERS.reduce((a,b)=>a+b,0);

  return(
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5"/></button>
        <h2 className="font-semibold text-gray-900 flex-1">Analytics</h2>
        <BarChart2 className="w-5 h-5 text-blue-600"/>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          {(['7d','30d','90d'] as const).map(p=>(
            <button key={p} onClick={()=>setPeriod(p)} className={`px-3 py-1.5 rounded-full text-sm font-medium ${period===p?'bg-blue-600 text-white':'bg-white border text-gray-600'}`}>{p}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[[totalRev.toLocaleString()+' XAF','Revenue',DollarSign,'text-green-600','+12.5%'],[totalOrd,'Orders',ShoppingCart,'text-blue-600','+8.3%'],['3,840','Views',Eye,'text-purple-600','-2.1%'],['127','Customers',Users,'text-orange-600','+15.7%']].map(([v,l,Icon,col,ch])=>(
            <div key={String(l)} className="bg-white rounded-2xl p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                {/* @ts-ignore */}
                <Icon className={`w-5 h-5 ${col}`}/>
                <span className={`text-xs font-semibold ${String(ch).startsWith('+')?'text-green-600':'text-red-500'}`}>{String(ch)}</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{String(v)}</p>
              <p className="text-xs text-gray-500">{String(l)}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-600"/>Daily Revenue</h3>
          <div className="flex items-end gap-2 h-32">
            {REVENUE.map((v,i)=>(
              <div key={DAYS[i]} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md"
                  style={{height:maxRev>0?Math.round((v/maxRev)*100)+'%':'4px',minHeight:'4px'}}
                />
                <span className="text-xs text-gray-500">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">Daily Orders</h3>
          <div className="flex items-end gap-2 h-24">
            {ORDERS.map((v,i)=>(
              <div key={DAYS[i]} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-md"
                  style={{height:maxOrd>0?Math.round((v/maxOrd)*100)+'%':'4px',minHeight:'4px'}}
                />
                <span className="text-xs text-gray-500">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-3">Top Listings</h3>
          {[['iPhone 13 Pro Max','234 views','12 sales'],['Samsung TV 55"','189 views','8 sales'],['Designer Bag','95 views','5 sales']].map(([n,v,s])=>(
            <div key={String(n)} className="flex items-center justify-between py-2.5 border-b last:border-0">
              <p className="text-sm font-medium text-gray-900">{String(n)}</p>
              <div className="flex gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3"/>{String(v)}</span>
                <span className="flex items-center gap-1"><ShoppingCart className="w-3 h-3"/>{String(s)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
