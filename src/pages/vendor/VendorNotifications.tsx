import{useState,useEffect}from'react';
import{useNavigate}from'react-router-dom';
import{ArrowLeft,Bell,BellOff,Check,Trash2,Package,MessageSquare,DollarSign,Star,AlertCircle,Settings}from'lucide-react';

interface VendorNotification{id:string;type:'order'|'message'|'payment'|'review'|'alert'|'system';title:string;body:string;time:string;read:boolean;actionUrl?:string;}

const SAMPLE:VendorNotification[]=[
  {id:'1',type:'order',title:'New Order Received',body:'Alice Mbeki ordered iPhone 13 Pro Max. Order #ORD-007',time:new Date(Date.now()-900000).toISOString(),read:false,actionUrl:'/vendor/orders'},
  {id:'2',type:'message',title:'New Message',body:'Paul Njoya: Is the Samsung TV still available?',time:new Date(Date.now()-3600000).toISOString(),read:false,actionUrl:'/vendor/messages'},
  {id:'3',type:'payment',title:'Payment Received',body:'450,000 XAF credited to your account for Order #ORD-005',time:new Date(Date.now()-7200000).toISOString(),read:true},
  {id:'4',type:'review',title:'New Review',body:'Marie Fouda gave you 5 stars: "Excellent product and fast delivery!"',time:new Date(Date.now()-86400000).toISOString(),read:true},
  {id:'5',type:'alert',title:'Low Stock Alert',body:'Samsung TV only 1 unit remaining. Consider restocking.',time:new Date(Date.now()-86400000*2).toISOString(),read:true},
  {id:'6',type:'system',title:'Verification Approved',body:'Your vendor account has been verified. Badge added to profile.',time:new Date(Date.now()-86400000*3).toISOString(),read:true},
];

const TYPE_ICONS={order:Package,message:MessageSquare,payment:DollarSign,review:Star,alert:AlertCircle,system:Bell};
const TYPE_COLORS={order:'bg-blue-50 text-blue-600',message:'bg-green-50 text-green-600',payment:'bg-teal-50 text-teal-600',review:'bg-yellow-50 text-yellow-600',alert:'bg-orange-50 text-orange-600',system:'bg-purple-50 text-purple-600'};

function timeAgo(iso:string):string{
  const diff=Date.now()-new Date(iso).getTime();
  const mins=Math.floor(diff/60000);
  if(mins<1)return'Just now';
  if(mins<60)return mins+'m ago';
  const hrs=Math.floor(mins/60);
  if(hrs<24)return hrs+'h ago';
  return Math.floor(hrs/24)+'d ago';
}

export default function VendorNotifications(){
  const navigate=useNavigate();
  const[notifs,setNotifs]=useState<VendorNotification[]>(SAMPLE);
  const[filter,setFilter]=useState<'all'|'unread'>('all');

  const unreadCount=notifs.filter(n=>!n.read).length;
  const displayed=filter==='unread'?notifs.filter(n=>!n.read):notifs;

  function markRead(id:string){setNotifs(prev=>prev.map(n=>n.id===id?{...n,read:true}:n));}
  function markAllRead(){setNotifs(prev=>prev.map(n=>({...n,read:true})));}
  function deleteNotif(id:string){setNotifs(prev=>prev.filter(n=>n.id!==id));}
  function handleClick(n:VendorNotification){
    markRead(n.id);
    if(n.actionUrl)navigate(n.actionUrl);
  }

  return(
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5"/></button>
        <h2 className="font-semibold text-gray-900 flex-1">Notifications</h2>
        {unreadCount>0&&<span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>}
        <button onClick={()=>navigate('/vendor/settings')} className="p-2 hover:bg-gray-100 rounded-xl"><Settings className="w-4 h-4 text-gray-400"/></button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['all','unread'] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${filter===f?'bg-blue-600 text-white':'bg-white border text-gray-600'}`}>
                {f}{f==='unread'&&unreadCount>0?<span className="ml-1">({unreadCount})</span>:null}
              </button>
            ))}
          </div>
          {unreadCount>0&&(
            <button onClick={markAllRead} className="text-xs text-blue-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5"/>Mark all read
            </button>
          )}
        </div>

        {displayed.length===0?(
          <div className="text-center py-16">
            <BellOff className="w-12 h-12 mx-auto mb-3 text-gray-300"/>
            <p className="text-gray-500 font-medium">No {filter==='unread'?'unread ':'' }notifications</p>
          </div>
        ):(
          <div className="space-y-2">
            {displayed.map(notif=>{
              const Icon=TYPE_ICONS[notif.type];
              const colorClass=TYPE_COLORS[notif.type];
              return(
                <div
                  key={notif.id}
                  onClick={()=>handleClick(notif)}
                  className={`bg-white rounded-2xl p-4 shadow-sm border flex gap-3 cursor-pointer hover:shadow-md transition-shadow ${!notif.read?'border-blue-200 bg-blue-50/30':''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold text-gray-900 text-sm ${!notif.read?'':'font-medium'}`}>{notif.title}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(notif.time)}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notif.body}</p>
                    {!notif.read&&<div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"/>}
                  </div>
                  <button
                    onClick={e=>{e.stopPropagation();deleteNotif(notif.id);}}
                    className="p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0 self-center"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-400"/>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
