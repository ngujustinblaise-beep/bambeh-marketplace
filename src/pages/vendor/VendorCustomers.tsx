import { useLang, t } from "@/hooks/useAppLang";

import{useState,useEffect}from'react';
import{useNavigate}from'react-router-dom';
import{ArrowLeft,Users,Search,Phone,Mail,Star,ShoppingBag,TrendingUp,ChevronRight}from'lucide-react';

interface Customer{id:string;name:string;email:string;phone:string;totalOrders:number;totalSpent:number;lastOrder:string;rating:number;location:string;}

const SAMPLE:Customer[]=[
  {id:'1',name:'Alice Mbeki',email:'alice@email.cm',phone:'+237 677 123 456',totalOrders:8,totalSpent:680000,lastOrder:new Date(Date.now()-86400000*2).toISOString(),rating:5.0,location:'Yaounde'},
  {id:'2',name:'Paul Njoya',email:'paul@email.cm',phone:'+237 698 456 789',totalOrders:5,totalSpent:425000,lastOrder:new Date(Date.now()-86400000*5).toISOString(),rating:4.8,location:'Douala'},
  {id:'3',name:'Marie Fouda',email:'marie@email.cm',phone:'+237 655 789 012',totalOrders:12,totalSpent:1250000,lastOrder:new Date(Date.now()-86400000).toISOString(),rating:4.9,location:'Yaounde'},
  {id:'4',name:'Jean Biya',email:'jean@email.cm',phone:'+237 677 345 678',totalOrders:2,totalSpent:85000,lastOrder:new Date(Date.now()-86400000*14).toISOString(),rating:4.5,location:'Bafoussam'},
];

export default function VendorCustomers(){
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate=useNavigate();
  const[customers,setCustomers]=useState<Customer[]>(SAMPLE);
  const[search,setSearch]=useState('');
  const[selected,setSelected]=useState<Customer|null>(null);
  const[sortBy,setSortBy]=useState<'spent'|'orders'|'recent'>('spent');

  const sorted=[...customers].sort((a,b)=>{
    if(sortBy==='spent')return b.totalSpent-a.totalSpent;
    if(sortBy==='orders')return b.totalOrders-a.totalOrders;
    return new Date(b.lastOrder).getTime()-new Date(a.lastOrder).getTime();
  });

  const filtered=sorted.filter(c=>!search||c.name.toLowerCase().includes(search.toLowerCase())||c.phone.includes(search));
  const totalRevenue=customers.reduce((s,c)=>s+c.totalSpent,0);
  const avgOrderValue=customers.length>0?Math.round(totalRevenue/customers.reduce((s,c)=>s+c.totalOrders,0)):0;

  if(selected){
    return(
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button onClick={()=>setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5"/></button>
          <h2 className="font-semibold text-gray-900 flex-1">{selected.name}</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">{selected.name[0]}</div>
            <h3 className="font-bold text-lg">{selected.name}</h3>
            <p className="text-blue-100 text-sm">{selected.location}</p>
            <div className="flex items-center justify-center gap-1 mt-1"><Star className="w-4 h-4 fill-yellow-300 text-yellow-300"/><span className="text-sm font-semibold">{selected.rating}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[[selected.totalOrders,'Orders',ShoppingBag],[selected.totalSpent.toLocaleString()+' XAF','Total Spent',TrendingUp]].map(([v,l,Icon])=>(
              <div key={String(l)} className="bg-white rounded-2xl p-4 shadow-sm border text-center">
                {/* @ts-ignore */}
                <Icon className="w-5 h-5 text-blue-600 mx-auto mb-2"/>
                <p className="font-bold text-gray-900">{String(v)}</p>
                <p className="text-xs text-gray-500">{String(l)}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border space-y-3">
            <h3 className="font-semibold text-gray-900">Contact</h3>
            <a href={`tel:${selected.phone}`} className="flex items-center gap-3 text-sm text-gray-700 py-2 border-b">
              <Phone className="w-4 h-4 text-blue-600"/>{selected.phone}
            </a>
            <a href={`mailto:${selected.email}`} className="flex items-center gap-3 text-sm text-gray-700 py-2">
              <Mail className="w-4 h-4 text-blue-600"/>{selected.email}
            </a>
          </div>
          <p className="text-xs text-gray-400 text-center">Last order: {new Date(selected.lastOrder).toLocaleDateString()}</p>
        </div>
      </div>
    );
  }

  return(
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5"/></button>
        <h2 className="font-semibold text-gray-900 flex-1">Customers</h2>
        <span className="text-xs text-gray-500">{customers.length} total</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[[customers.length,'Customers'],[totalRevenue.toLocaleString(),'Revenue'],[avgOrderValue.toLocaleString(),'Avg Order']].map(([v,l])=>(
            <div key={String(l)} className="bg-white rounded-xl p-3 shadow-sm border text-center">
              <p className="font-bold text-gray-900 text-sm">{String(v)}</p>
              <p className="text-xs text-gray-500">{String(l)}</p>
            </div>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search customers..." className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
        </div>
        <div className="flex gap-2">
          {(['spent','orders','recent'] as const).map(s=>(
            <button key={s} onClick={()=>setSortBy(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${sortBy===s?'bg-blue-600 text-white':'bg-white border text-gray-600'}`}>{s==='spent'?'Top Spenders':s==='orders'?'Most Orders':'Recent'}</button>
          ))}
        </div>
        {filtered.length===0?(
          <div className="text-center py-12 text-gray-500"><Users className="w-12 h-12 mx-auto mb-3 text-gray-300"/><p>No customers found</p></div>
        ):(
          <div className="space-y-2">
            {filtered.map(customer=>(
              <button key={customer.id} onClick={()=>setSelected(customer)} className="w-full bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 hover:shadow-md transition-shadow text-left">
                <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center text-lg font-bold text-blue-700 flex-shrink-0">{customer.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{customer.name}</p>
                  <p className="text-xs text-gray-500">{customer.totalOrders} orders  {customer.totalSpent.toLocaleString()} XAF</p>
                  <p className="text-xs text-gray-400">{customer.location}  Last: {new Date(customer.lastOrder).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/><span className="text-xs">{customer.rating}</span></div>
                  <ChevronRight className="w-4 h-4 text-gray-400"/>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




