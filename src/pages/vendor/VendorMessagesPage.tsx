import { useLang, t } from "@/hooks/useAppLang";

import{useState,useEffect,useRef}from'react';
import{useNavigate}from'react-router-dom';
import{ArrowLeft,Search,Send,MessageSquare,Circle}from'lucide-react';

interface Message{id:string;from:'vendor'|'customer';text:string;time:string;read:boolean;}
interface Chat{id:string;customerName:string;customerAvatar?:string;lastMessage:string;lastTime:string;unread:number;online:boolean;messages:Message[];}

const MOCK_CHATS:Chat[]=[
  {id:'1',customerName:'Alice Mbeki',lastMessage:'Is this still available?',lastTime:'2m ago',unread:2,online:true,messages:[
    {id:'1',from:'customer',text:'Hello, I am interested in your item.',time:'10:00',read:true},
    {id:'2',from:'vendor',text:'Yes it is available! How can I help?',time:'10:02',read:true},
    {id:'3',from:'customer',text:'Is this still available?',time:'10:05',read:false},
    {id:'4',from:'customer',text:'Can you do a small discount?',time:'10:05',read:false},
  ]},
  {id:'2',customerName:'Paul Njoya',lastMessage:'Thank you! I will pick it up tomorrow.',lastTime:'1h ago',unread:0,online:false,messages:[
    {id:'1',from:'customer',text:'I want to buy this item.',time:'09:00',read:true},
    {id:'2',from:'vendor',text:'Great! When can you come?',time:'09:05',read:true},
    {id:'3',from:'customer',text:'Thank you! I will pick it up tomorrow.',time:'09:10',read:true},
  ]},
  {id:'3',customerName:'Marie Fouda',lastMessage:'What is the condition?',lastTime:'3h ago',unread:1,online:false,messages:[
    {id:'1',from:'customer',text:'What is the condition?',time:'07:30',read:false},
  ]},
];

export default function VendorMessagesPage(){
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate=useNavigate();
  const[vendor,setVendor]=useState<any>(null);
  const[chats,setChats]=useState<Chat[]>(MOCK_CHATS);
  const[selectedChat,setSelectedChat]=useState<Chat|null>(null);
  const[search,setSearch]=useState('');
  const[newMsg,setNewMsg]=useState('');
  const msgEndRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    try{
      const vendorData=localStorage.getItem('Bambeh_vendor');
      const userData=localStorage.getItem('Bambeh_user');
      if(vendorData){
        setVendor(JSON.parse(vendorData));
      } else if(userData){
        const user=JSON.parse(userData);
        if(user.isVendor) setVendor(user);
      }
    }catch{}
  },[]);

  useEffect(()=>{
    msgEndRef.current?.scrollIntoView({behavior:'smooth'});
  },[selectedChat?.messages]);

  function sendMessage(){
    if(!newMsg.trim()||!selectedChat)return;
    const msg:Message={id:Date.now().toString(),from:'vendor',text:newMsg.trim(),time:new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'}),read:true};
    setChats(prev=>prev.map(c=>{
      if(c.id!==selectedChat.id)return c;
      const updated={...c,messages:[...c.messages,msg],lastMessage:msg.text,lastTime:'Just now'};
      setSelectedChat(updated);
      return updated;
    }));
    setNewMsg('');
  }

  function openChat(chat:Chat){
    // Mark all as read
    setChats(prev=>prev.map(c=>c.id===chat.id?{...c,unread:0,messages:c.messages.map(m=>({...m,read:true}))}:c));
    setSelectedChat({...chat,unread:0,messages:chat.messages.map(m=>({...m,read:true}))});
  }

  const filtered=chats.filter(c=>!search||c.customerName.toLowerCase().includes(search.toLowerCase()));
  const totalUnread=chats.reduce((s,c)=>s+c.unread,0);

  return(
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={()=>selectedChat?setSelectedChat(null):navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5"/>
        </button>
        <h2 className="font-semibold text-gray-900 flex-1">
          {selectedChat?selectedChat.customerName:'Messages'}
        </h2>
        {!selectedChat&&totalUnread>0&&(
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{totalUnread}</span>
        )}
      </div>

      {!selectedChat?(
        <div className="flex-1 p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations..." className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
          </div>
          {filtered.length===0?(
            <div className="text-center py-16">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300"/>
              <p className="text-gray-500">No messages yet</p>
            </div>
          ):(
            <div className="space-y-2">
              {filtered.map(chat=>(
                <button key={chat.id} onClick={()=>openChat(chat)} className="w-full bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 hover:shadow-md transition-shadow text-left">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {chat.customerName[0]}
                    </div>
                    {chat.online&&<div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-semibold text-gray-900 text-sm">{chat.customerName}</span>
                      <span className="text-xs text-gray-400">{chat.lastTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-sm truncate ${chat.unread>0?'text-gray-900 font-medium':'text-gray-500'}`}>{chat.lastMessage}</p>
                      {chat.unread>0&&<span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-2">{chat.unread}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ):(
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedChat.messages.map(msg=>(
              <div key={msg.id} className={`flex ${msg.from==='vendor'?'justify-end':'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.from==='vendor'?'bg-blue-600 text-white':'bg-white border shadow-sm text-gray-900'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.from==='vendor'?'text-blue-100':'text-gray-400'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
            <div  ref={msgEndRef}/>
          </div>
          <div className="bg-white border-t p-3 flex gap-2">
            <input
              value={newMsg}
              onChange={e=>setNewMsg(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&sendMessage()}
              placeholder="Type a message..."
              className="flex-1 border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button onClick={sendMessage} disabled={!newMsg.trim()} className="bg-blue-600 text-white p-2.5 rounded-xl disabled:opacity-50">
              <Send className="w-5 h-5"/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}




