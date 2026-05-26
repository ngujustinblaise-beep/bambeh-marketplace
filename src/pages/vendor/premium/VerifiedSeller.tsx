import{useState}from'react';
import{useNavigate}from'react-router-dom';
import{ArrowLeft,Shield,Check,Upload,FileText,Camera,AlertCircle,Clock}from'lucide-react';

interface Document{id:string;name:string;required:boolean;status:'pending'|'uploaded'|'verified'|'rejected';hint:string;}

const REQUIRED_DOCS:Document[]=[
  {id:'id',name:'National ID / Passport',required:true,status:'pending',hint:'Front and back of your national ID or passport'},
  {id:'business',name:'Business Registration',required:true,status:'pending',hint:'Certificate of incorporation or business license'},
  {id:'address',name:'Proof of Address',required:false,status:'pending',hint:'Utility bill or bank statement (last 3 months)'},
  {id:'photo',name:'Profile Photo',required:true,status:'pending',hint:'Clear photo of your face for identity verification'},
];

const BENEFITS=[
  {icon:'',title:'Verified Badge',desc:'Blue checkmark on your profile and listings'},
  {icon:'',title:'Higher Visibility',desc:'Verified sellers appear higher in search results'},
  {icon:'',title:'Trust Signal',desc:'Customers trust verified sellers 3x more'},
  {icon:'',title:'Better Sales',desc:'Verified sellers earn 40% more on average'},
  {icon:'',title:'Account Protection',desc:'Enhanced security for your vendor account'},
  {icon:'',title:'Priority Support',desc:'Dedicated support queue for verified sellers'},
];

export default function VerifiedSeller(){
  const navigate=useNavigate();
  const[docs,setDocs]=useState<Document[]>(REQUIRED_DOCS);
  const[submitted,setSubmitted]=useState(false);
  const[activeTab,setActiveTab]=useState<'benefits'|'docs'>('benefits');

  function handleUpload(docId:string, file:File){
    if(!file)return;
    if(file.size>5*1024*1024){alert('File too large. Maximum 5MB.');return;}
    if(!['image/jpeg','image/png','application/pdf'].includes(file.type)){alert('Invalid file type. Use JPG, PNG or PDF.');return;}
    setDocs(prev=>prev.map(d=>d.id===docId?{...d,status:'uploaded'}:d));
  }

  function submit(){
    const missingRequired=docs.filter(d=>d.required&&d.status==='pending');
    if(missingRequired.length>0){
      alert('Please upload all required documents: '+missingRequired.map(d=>d.name).join(', '));
      return;
    }
    setSubmitted(true);
    try{
      const raw=localStorage.getItem('Bambeh_vendor');
      if(raw){
        const v=JSON.parse(raw);
        localStorage.setItem('Bambeh_vendor',JSON.stringify({...v,verificationStatus:'pending'}));
      }
    }catch{}
  }

  if(submitted){
    return(
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-teal-600"/>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Submitted!</h2>
          <p className="text-gray-500 mb-2">Your documents are under review.</p>
          <p className="text-sm text-gray-400 mb-6">This usually takes 1-3 business days. We will notify you by email.</p>
          <div className="bg-teal-50 rounded-2xl p-4 mb-6 text-left">
            <p className="font-semibold text-teal-800 text-sm mb-2">What happens next?</p>
            <ul className="text-sm text-teal-700 space-y-1">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5"/>Documents reviewed by our team</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5"/>Email notification sent</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5"/>Verified badge added to profile</li>
            </ul>
          </div>
          <button onClick={()=>navigate(-1)} className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const uploadedCount=docs.filter(d=>d.status!=='pending').length;
  const requiredCount=docs.filter(d=>d.required).length;
  const uploadedRequired=docs.filter(d=>d.required&&d.status!=='pending').length;

  return(
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5"/>
        </button>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">Verified Seller</h2>
          <p className="text-xs text-gray-500">{uploadedRequired}/{requiredCount} required docs</p>
        </div>
        <Shield className="w-6 h-6 text-teal-600"/>
      </div>

      <div className="bg-gradient-to-br from-teal-600 to-teal-700 px-4 py-6 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <Shield className="w-8 h-8 text-white"/>
        </div>
        <h1 className="text-white text-xl font-bold mb-1">Get Verified</h1>
        <p className="text-teal-100 text-sm">Build trust and increase your sales</p>
      </div>

      <div className="px-4 pt-4">
        <div className="flex gap-2 mb-4">
          {(['benefits','docs'] as const).map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm ${activeTab===tab?'bg-teal-600 text-white':'bg-white border text-gray-600'}`}>
              {tab==='benefits'?'Benefits':'Documents'}
            </button>
          ))}
        </div>

        {activeTab==='benefits'&&(
          <div className="grid grid-cols-2 gap-3 mb-6">
            {BENEFITS.map(b=>(
              <div key={b.title} className="bg-white rounded-2xl p-4 shadow-sm border">
                <span className="text-2xl mb-2 block">{b.icon}</span>
                <p className="font-semibold text-gray-900 text-sm">{b.title}</p>
                <p className="text-xs text-gray-500 mt-1">{b.desc}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab==='docs'&&(
          <div className="space-y-3 mb-4">
            {docs.map(doc=>(
              <div key={doc.id} className="bg-white rounded-2xl p-4 shadow-sm border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{doc.name}</h3>
                      {doc.required&&<span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">Required</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{doc.hint}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-2 ${doc.status==='uploaded'||doc.status==='verified'?'bg-green-100':'bg-gray-100'}`}>
                    {doc.status==='uploaded'||doc.status==='verified'
                      ?<Check className="w-4 h-4 text-green-600"/>
                      :<FileText className="w-4 h-4 text-gray-400"/>}
                  </div>
                </div>
                {doc.status==='pending'?(
                  <label className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-teal-300 rounded-xl text-teal-600 text-sm font-medium cursor-pointer hover:bg-teal-50 transition-colors">
                    <Upload className="w-4 h-4"/>Upload {doc.name}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={e=>{
                        const file=e.target.files?.[0];
                        if(file) handleUpload(doc.id, file);
                      }}
                    />
                  </label>
                ):(
                  <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
                    <Check className="w-4 h-4 text-green-600"/>
                    <span className="text-sm text-green-700 font-medium">Uploaded successfully</span>
                    <button onClick={()=>setDocs(prev=>prev.map(d=>d.id===doc.id?{...d,status:'pending'}:d))} className="ml-auto text-xs text-red-500">Remove</button>
                  </div>
                )}
              </div>
            ))}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"/>
              <p className="text-xs text-blue-700">All documents are encrypted and stored securely. They are only used for verification and never shared with third parties.</p>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={submit}
          disabled={uploadedRequired<requiredCount}
          className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Shield className="w-5 h-5"/>
          Submit for Verification ({uploadedRequired}/{requiredCount} required)
        </button>
      </div>
    </div>
  );
}
