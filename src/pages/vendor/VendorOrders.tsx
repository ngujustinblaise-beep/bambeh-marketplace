import{useState,useEffect}from'react';
import{useNavigate}from'react-router-dom';
import{ArrowLeft,Package,Clock,Check,X,ChevronRight,Search,Filter}from'lucide-react';

interface Order{id:string;orderNum:string;customer:string;items:string;total:number;status:'pending'|'processing'|'shipped'|'delivered'|'cancelled';date:string;phone:string;}

const SAMPLE:Order[]=[
  {id:'1',orderNum:'ORD-001',customer:'Alice Mbeki',items:'iPhone 13 Pro Max x1',total:450000,status:'delivered',date:new Date(Date.now()-86400000*3).toISOString(),phone:'+237 677 123 456'},
  {id:'2',orderNum:'ORD-002',customer:'Paul Njoya',items:'Samsung TV x1',total:280000,status:'shipped',date:new Date(Date.now()-86400000).toISOString(),phone:'+237 698 456 789'},
  {id:'3',orderNum:'ORD-003',customer:'Marie Fouda',items:'Designer Bag x2',total:170000,status:'processing',date:new Date(Date.now()-3600000*5).toISOString(),phone:'+237 655 789 012'},
  {id:'4',orderNum:'ORD-004',customer:'Jean Biya',items:'Blender Pro x1',total:45000,status:'pending',date:new Date().toISOString(),phone:'+237 677 345 678'},
  {id:'5',orderNum:'ORD-005',customer:'Celine Ateba',items:'School Books x3',total:22500,status:'cancelled',date:new Date(Date.now()-86400000*7).toISOString(),phone:'+237 698 901 234'},
];

const STATUS_CONFIG={
  pending:{label:'Pending',color:'bg-yellow-50 text-yellow-700',icon:Clock},
  processing:{label:'Processing',color:'bg-blue-50 text-blue-700',icon:Package},
  shipped:{label:'Shipped',color:'bg-purple-50 text-purple-700',icon:ChevronRight},
  delivered:{label:'Delivered',color:'bg-green-50 text-green-700',icon:Check},
  cancelled:{label:'Cancelled',color:'bg-red-50 text-red-700',icon:X},
};

export default function VendorOrders(){
  const navigate=useNavigate();
  const[orders,setOrders]=useState<Order[]>(SAMPLE);
  const[filter,setFilter]=useState<'all'|Order['status']>('all');
  const[search,setSearch]=useState('');
  const[selected,setSelected]=useState<Order|null>(null);

  const filtered=orders.filter(o=>{
    const matchFilter=filter==='all'||o.status===filter;
    const matchSearch=!search||o.customer.toLowerCase().includes(search.toLowerCase())||o.orderNum.toLowerCase().includes(search.toLowerCase());
    return matchFilter&&matchSearch;
  });

  function updateStatus(orderId:string,newStatus:Order['status']){
    setOrders(prev=>prev.map(o=>o.id===orderId?{...o,status:newStatus}:o));
    if(selected?.id===orderId) setSelected(prev=>prev?{...prev,status:newStatus}:null);
  }

  const counts={all:orders.length,pending:orders.filter(o=>o.status==='pending').length,processing:orders.filter(o=>o.status==='processing').length,shipped:orders.filter(o=>o.status==='shipped').length,delivered:orders.filter(o=>o.status==='delivered').length,cancelled:orders.filter(o=>o.status==='cancelled').length};

  if(selected){
    const cfg=STATUS_CONFIG[selected.status];
    const Icon=cfg.icon;
    return(
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button onClick={()=>setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5"/></button>
          <h2 className="font-semibold text-gray-900 flex-1">{selected.orderNum}</h2>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${cfg.color}`}>{cfg.label}</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border space-y-3">
            <h3 className="font-semibold text-gray-900">Order Details</h3>
            {[['Customer',selected.customer],['Phone',selected.phone],['Items',selected.items],['Total',selected.total.toLocaleString()+' XAF'],['Date',new Date(selected.date).toLocaleDateString()]].map(([k,v])=>(
              <div key={String(k)} className="flex justify-between text-sm py-1.5 border-b last:border-0">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium text-gray-900">{String(v)}</span>
              </div>
            ))}
          </div>
          {selected.status!=='delivered'&&selected.status!=='cancelled'&&(
            <div className="bg-white rounded-2xl p-4 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['processing','shipped','delivered','cancelled'] as const).filter(s=>s!==selected.status).map(s=>{
                  const c=STATUS_CONFIG[s];
                  return(
                    <button key={s} onClick={()=>updateStatus(selected.id,s)} className={`py-2.5 rounded-xl text-sm font-semibold border-2 ${c.color} border-current`}>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return(
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5"/></button>
        <h2 className="font-semibold text-gray-900 flex-1">Orders</h2>
        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{counts.pending} new</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search orders..." className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all','pending','processing','shipped','delivered','cancelled'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${filter===f?'bg-blue-600 text-white':'bg-white border text-gray-600'}`}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
              {counts[f]>0&&<span className={`${filter===f?'bg-white/20':'bg-gray-100'} px-1.5 py-0.5 rounded-full text-xs`}>{counts[f]}</span>}
            </button>
          ))}
        </div>
        {filtered.length===0?(
          <div className="text-center py-12 text-gray-500"><Package className="w-12 h-12 mx-auto mb-3 text-gray-300"/><p>No orders found</p></div>
        ):(
          <div className="space-y-2">
            {filtered.map(order=>{
              const cfg=STATUS_CONFIG[order.status];
              const Icon=cfg.icon;
              return(
                <button key={order.id} onClick={()=>setSelected(order)} className="w-full bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 hover:shadow-md transition-shadow text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                    <Icon className="w-5 h-5"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-semibold text-gray-900 text-sm">{order.orderNum}</span>
                      <span className="font-bold text-sm text-gray-900">{order.total.toLocaleString()} XAF</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{order.customer}  {order.items}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
