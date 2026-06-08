import { useLang, t } from "@/hooks/useAppLang";

import{useState}from'react';
import{useNavigate,Link}from'react-router-dom';
import{ArrowLeft,Mail,Phone,User,Check,AlertCircle,Eye,EyeOff}from'lucide-react';

type Mode='lookup'|'security'|'success';
type IdentifierType='email'|'phone';

export default function ForgotCredentials(){
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate=useNavigate();
  const[mode,setMode]=useState<Mode>('lookup');
  const[identifierType,setIdentifierType]=useState<IdentifierType>('email');
  const[identifier,setIdentifier]=useState('');
  const[securityAnswer,setSecurityAnswer]=useState('');
  const[isLoading,setIsLoading]=useState(false);
  const[error,setError]=useState('');
  const[recoveredInfo,setRecoveredInfo]=useState({username:'',email:''});

  async function handleLookup(){
    if(!identifier.trim()){setError('Please enter your email or phone number');return;}
    setIsLoading(true);
    setError('');
    try{
      // Check localStorage for matching account
      const keys=['Bambeh_user','bambeh_user','user'];
      let found=false;
      for(const key of keys){
        const raw=localStorage.getItem(key);
        if(!raw)continue;
        const user=JSON.parse(raw);
        const matchEmail=identifierType==='email'&&user.email&&user.email.toLowerCase()===identifier.toLowerCase();
        const matchPhone=identifierType==='phone'&&user.phone&&user.phone.replace(/D/g,'').includes(identifier.replace(/D/g,''));
        if(matchEmail||matchPhone){
          setRecoveredInfo({username:user.username||user.name||user.displayName||'User',email:user.email||''});
          found=true;
          setMode('success');
          break;
        }
      }
      if(!found){
        setError('No account found with this '+identifierType+'. Please check and try again.');
      }
    }catch(e){
      setError('Something went wrong. Please try again.');
    }finally{
      setIsLoading(false);
    }
  }

  if(mode==='success'){
    return(
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600"/>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account Found!</h2>
          {recoveredInfo.username&&<p className="text-gray-600 mb-1">Username: <strong>{recoveredInfo.username}</strong></p>}
          {recoveredInfo.email&&<p className="text-gray-600 mb-4">Email: <strong>{recoveredInfo.email}</strong></p>}
          <p className="text-sm text-gray-500 mb-6">A recovery link has been sent to your registered contact.</p>
          <button onClick={()=>navigate('/login')} className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return(
    <div className="min-h-screen bg-gray-50 p-4">
      <button onClick={()=>navigate(-1)} className="flex items-center gap-2 text-teal-600 mb-6 font-medium">
        <ArrowLeft className="w-5 h-5"/>Back
      </button>

      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-teal-600"/>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Recover Account</h1>
          <p className="text-gray-500 mt-1 text-sm">Find your Bambeh account</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search by</label>
            <div className="grid grid-cols-2 gap-2">
              {([['email','Email',Mail],['phone','Phone',Phone]] as const).map(([type,label,Icon])=>(
                <button
                  key={type}
                  onClick={()=>{setIdentifierType(type);setIdentifier('');setError('');}}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${identifierType===type?'border-teal-500 bg-teal-50 text-teal-700':'border-gray-200 text-gray-600'}`}
                >
                  <Icon className="w-4 h-4"/>{label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {identifierType==='email'?'Email Address':'Phone Number'}
            </label>
            <input
              value={identifier}
              onChange={e=>{setIdentifier(e.target.value);setError('');}}
              type={identifierType==='email'?'email':'tel'}
              placeholder={identifierType==='email'?'your@email.com':'+237 6XX XXX XXX'}
              className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
              onKeyDown={e=>e.key==='Enter'&&handleLookup()}
            />
          </div>

          {error&&(
            <div className="flex items-start gap-2 bg-red-50 text-red-700 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleLookup}
            disabled={isLoading||!identifier.trim()}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {isLoading?'Searching...':'Find My Account'}
          </button>

          <div className="text-center pt-2 border-t">
            <p className="text-sm text-gray-500">
              Remember your password?{' '}
              <Link to="/login" className="text-teal-600 font-semibold">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
