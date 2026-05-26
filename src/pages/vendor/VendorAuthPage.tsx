import{useState}from'react';
import{useNavigate,Link}from'react-router-dom';
import{Store,Mail,Lock,Eye,EyeOff,User,Phone,Check,AlertCircle}from'lucide-react';

type Mode='signin'|'register';

export default function VendorAuthPage(){
  const navigate=useNavigate();
  const[mode,setMode]=useState<Mode>('signin');
  const[email,setEmail]=useState('');
  const[password,setPassword]=useState('');
  const[name,setName]=useState('');
  const[phone,setPhone]=useState('');
  const[businessName,setBusinessName]=useState('');
  const[showPass,setShowPass]=useState(false);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState('');
  const[success,setSuccess]=useState('');

  async function handleSignIn(){
    if(!email||!password){setError('Please fill in all fields');return;}
    setLoading(true);setError('');
    try{
      const keys=['Bambeh_vendor','bambeh_vendor'];
      let found=false;
      for(const key of keys){
        const raw=localStorage.getItem(key);
        if(!raw)continue;
        const v=JSON.parse(raw);
        if(v.email===email){
          found=true;
          localStorage.setItem('Bambeh_vendor',JSON.stringify({...v,isVendor:true,lastLogin:new Date().toISOString()}));
          setSuccess('Welcome back! Redirecting...');
          setTimeout(()=>navigate('/vendor/dashboard'),1000);
          break;
        }
      }
      if(!found){
        // Auto-create vendor session for demo
        const vendorData={id:Date.now().toString(),email,businessName:email.split('@')[0],isVendor:true,role:'vendor',status:'active',createdAt:new Date().toISOString()};
        localStorage.setItem('Bambeh_vendor',JSON.stringify(vendorData));
        setSuccess('Signed in! Redirecting...');
        setTimeout(()=>navigate('/vendor/dashboard'),1000);
      }
    }catch(e){
      setError('Sign in failed. Please try again.');
    }finally{
      setLoading(false);
    }
  }

  async function handleRegister(){
    if(!email||!password||!name||!businessName){setError('Please fill in all required fields');return;}
    if(password.length<8){setError('Password must be at least 8 characters');return;}
    setLoading(true);setError('');
    try{
      const vendorData={
        id:Date.now().toString(),email,name,phone,businessName,
        isVendor:true,role:'vendor',status:'pending',
        createdAt:new Date().toISOString(),
      };
      localStorage.setItem('Bambeh_vendor',JSON.stringify(vendorData));
      setSuccess('Account created! Redirecting to dashboard...');
      setTimeout(()=>navigate('/vendor/dashboard'),1500);
    }catch(e){
      setError('Registration failed. Please try again.');
    }finally{
      setLoading(false);
    }
  }

  return(
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Store className="w-8 h-8 text-white"/>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Grow your business on Bambeh</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
            {(['signin','register'] as const).map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError('');setSuccess('');}} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode===m?'bg-white shadow-sm text-blue-600':'text-gray-500'}`}>
                {m==='signin'?'Sign In':'Register'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {mode==='register'&&(
              <>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400"/>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name *" className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
                <div className="relative">
                  <Store className="absolute left-3 top-3 w-4 h-4 text-gray-400"/>
                  <input value={businessName} onChange={e=>setBusinessName(e.target.value)} placeholder="Business Name *" className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400"/>
                  <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone Number" className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400"/>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email Address *" className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400"/>
              <input value={password} onChange={e=>setPassword(e.target.value)} type={showPass?'text':'password'} placeholder="Password *" className="w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
              <button onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-3">
                {showPass?<EyeOff className="w-4 h-4 text-gray-400"/>:<Eye className="w-4 h-4 text-gray-400"/>}
              </button>
            </div>
          </div>

          {error&&(
            <div className="flex items-start gap-2 mt-3 bg-red-50 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"/>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success&&(
            <div className="flex items-start gap-2 mt-3 bg-green-50 rounded-xl p-3">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"/>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <button
            onClick={mode==='signin'?handleSignIn:handleRegister}
            disabled={loading}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading?'Please wait...':(mode==='signin'?'Sign In':'Create Account')}
          </button>

          {mode==='signin'&&(
            <p className="text-center text-xs text-gray-500 mt-3">
              <Link to="/forgot-password" className="text-blue-600 font-medium">Forgot password?</Link>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          <Link to="/" className="text-blue-600 font-medium">Back to Bambeh</Link>
        </p>
      </div>
    </div>
  );
}
