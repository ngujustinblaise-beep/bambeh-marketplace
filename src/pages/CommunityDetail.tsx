import { useLang, t } from "@/hooks/useAppLang";

import{useState,useEffect}from'react';
import{useParams,useNavigate}from'react-router-dom';
import{ArrowLeft,Users,MessageCircle,ThumbsUp,Share2,Send}from'lucide-react';

interface Post{id:string;author:string;content:string;likes:number;comments:number;time:string;liked?:boolean;}
interface Poll{id:string;question:string;options:{text:string;votes:number}[];voted?:number;}

const MOCK_POSTS:Post[]=[
  {id:'1',author:'Marie N.',content:'Exciting news! Bambeh just launched a new feature for vendors. Have you tried it yet?',likes:24,comments:8,time:'2h ago'},
  {id:'2',author:'Jean B.',content:'Looking for recommendations for good tech vendors in Yaounde. Who has experience?',likes:12,comments:15,time:'4h ago'},
  {id:'3',author:'Celine A.',content:'Great experience using Bambeh for my business! Customer support is excellent.',likes:31,comments:5,time:'1d ago'},
];
const MOCK_POLL:Poll={id:'1',question:'What feature do you want most?',options:[{text:'Better search',votes:45},{text:'Live chat',votes:38},{text:'Payment plans',votes:29},{text:'More categories',votes:22}]};

export default function CommunityDetail(){
  const lang = useLang();
  const isRtl = lang === "ar";
  const{id}=useParams();
  const navigate=useNavigate();
  const[posts,setPosts]=useState<Post[]>(MOCK_POSTS);
  const[poll,setPoll]=useState<Poll>(MOCK_POLL);
  const[comment,setComment]=useState('');
  const totalVotes=poll.options.reduce((s,o)=>s+o.votes,0);

  function like(postId:string){
    setPosts(prev=>prev.map(p=>p.id===postId?{...p,likes:p.liked?p.likes-1:p.likes+1,liked:!p.liked}:p));
  }
  function vote(idx:number){
    if(poll.voted!==undefined)return;
    setPoll(prev=>({...prev,voted:idx,options:prev.options.map((o,i)=>i===idx?{...o,votes:o.votes+1}:o)}));
  }
  function submitComment(){
    if(!comment.trim())return;
    const newPost:Post={id:Date.now().toString(),author:'You',content:comment.trim(),likes:0,comments:0,time:'Just now'};
    setPosts(prev=>[newPost,...prev]);
    setComment('');
  }

  return(
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5"/></button>
        <h2 className="font-semibold text-gray-900 flex-1">Community</h2>
        <button className="p-2 hover:bg-gray-100 rounded-xl"><Share2 className="w-5 h-5 text-gray-400"/></button>
      </div>

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
          <h1 className="text-xl font-bold mb-1">Bambeh Community</h1>
          <p className="text-teal-100 text-sm">Connect, share, and grow together</p>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-sm"><Users className="w-4 h-4"/>2,847 members</span>
            <span className="flex items-center gap-1 text-sm"><MessageCircle className="w-4 h-4"/>128 posts</span>
          </div>
        </div>

        {/* Poll */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-3"> {poll.question}</h3>
          <div className="space-y-2">
            {poll.options.map((opt,idx)=>{
              const pct=totalVotes>0?Math.round(opt.votes/totalVotes*100):0;
              return(
                <button key={idx} onClick={()=>vote(idx)} className={`w-full text-left rounded-xl overflow-hidden border transition-all ${poll.voted===idx?'border-teal-500':'border-gray-200 hover:border-teal-300'}`}>
                  <div className="relative p-3">
                    <div className="absolute inset-0 bg-teal-50 transition-all" style={{width:`${poll.voted!==undefined?pct:0}%`}}/>
                    <div className="relative flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{opt.text}</span>
                      {poll.voted!==undefined&&<span className="text-sm font-bold text-teal-600">{pct}%</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">{totalVotes} votes  {poll.voted===undefined?'Tap to vote':'You voted'}</p>
        </div>

        {/* Post input */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border flex gap-2">
          <input value={comment} onChange={e=>setComment(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submitComment()} placeholder="Share something with the community..." className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"/>
          <button onClick={submitComment} disabled={!comment.trim()} className="bg-teal-600 text-white p-2 rounded-xl disabled:opacity-50">
            <Send className="w-4 h-4"/>
          </button>
        </div>

        {/* Posts */}
        {posts.map(post=>(
          <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm">{post.author[0]}</div>
              <div><p className="font-semibold text-gray-900 text-sm">{post.author}</p><p className="text-xs text-gray-400">{post.time}</p></div>
            </div>
            <p className="text-gray-700 text-sm mb-3 leading-relaxed">{post.content}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <button onClick={()=>like(post.id)} className={`flex items-center gap-1 transition-colors ${post.liked?'text-teal-600':'hover:text-teal-600'}`}>
                <ThumbsUp className={`w-4 h-4 ${post.liked?'fill-teal-600':''}`}/>{post.likes}
              </button>
              <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4"/>{post.comments}</span>
              <button className="flex items-center gap-1 hover:text-teal-600 ml-auto"><Share2 className="w-4 h-4"/>Share</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




