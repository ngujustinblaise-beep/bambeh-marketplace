import { useLang, t } from "@/hooks/useAppLang";

import{useState}from'react';
import{useNavigate}from'react-router-dom';
import{ArrowLeft,AlertTriangle,Check,Shield,Phone,Mail}from'lucide-react';

const ISSUE_TYPES=[
  {id:'scam',label:'Scam / Fraud',icon:'',desc:'Seller asking for payment without delivering'},
  {id:'fake',label:'Fake Product',icon:'',desc:'Item does not match description'},
  {id:'harassment',label:'Harassment',icon:'',desc:'Abusive or threatening behavior'},
  {id:'inappropriate',label:'Inappropriate Content',icon:'',desc:'Offensive or illegal content'},
  {id:'spam',label:'Spam',icon:'',desc:'Repeated unwanted messages'},
  {id:'other',label:'Other Issue',icon:'',desc:'Report a different problem'},
];

export default function ReportIssuePage(){
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate=useNavigate();
  const[issueType,setIssueType]=useState('');
  const[description,setDescription]=useState('');
  const[contactEmail,setContactEmail]=useState('');
  const[submitted,setSubmitted]=useState(false);
  const[step,setStep]=useState(0);

  function submit(){
    if(!issueType||!description.trim())return;
    try{
      const reports=JSON.parse(localStorage.getItem('bambeh_reports')||'[]');
      reports.unshift({
        id:Date.now().toString(),
        type:issueType,
        description:description.trim(),
        contactEmail:contactEmail.trim(),
        status:'pending',
        submittedAt:new Date().toISOString(),
      });
      localStorage.setItem('bambeh_reports',JSON.stringify(reports));
    }catch{}
    setSubmitted(true);
  }

  if(submitted){
    return(
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600"/>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Report Submitted</h2>
          <p className="text-gray-500 mb-2">Thank you for helping keep Bambeh safe.</p>
          <p className="text-sm text-gray-400 mb-6">Our team will review your report within 24 hours.</p>
          <div className="bg-blue-50 rounded-xl p-3 mb-6 text-left">
            <p className="text-xs text-blue-700 font-semibold mb-1">What happens next?</p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li> Our safety team reviews the report</li>
              <li> Action taken within 24-48 hours</li>
              <li> We may contact you for more info</li>
            </ul>
          </div>
          <button onClick={()=>navigate(-1)} className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold">
            Back to App
          </button>
        </div>
      </div>
    );
  }

  return(
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={()=>step>0?setStep(0):navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5"/>
        </button>
        <h2 className="font-semibold text-gray-900 flex-1">Report an Issue</h2>
        <Shield className="w-5 h-5 text-teal-600"/>
      </div>

      <div className="p-4">
        {step===0&&(
          <>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5"/>
              <p className="text-xs text-orange-700">For emergencies, contact local authorities. Bambeh is not a law enforcement agency.</p>
            </div>
            <h3 className="font-semibold text-gray-900 mb-3">What are you reporting?</h3>
            <div className="space-y-2">
              {ISSUE_TYPES.map(type=>(
                <button
                  key={type.id}
                  onClick={()=>{setIssueType(type.id);setStep(1);}}
                  className={`w-full bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 hover:border-teal-400 transition-colors text-left ${issueType===type.id?'border-teal-500 bg-teal-50':''}`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{type.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step===1&&(
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
              <p className="text-sm text-gray-500 mb-1">Reporting:</p>
              <p className="font-semibold text-gray-900">{ISSUE_TYPES.find(t=>t.id===issueType)?.label}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Describe the issue *</label>
                <textarea
                  value={description}
                  onChange={e=>setDescription(e.target.value)}
                  rows={5}
                  placeholder="Please provide as much detail as possible  what happened, when, who was involved, any evidence..."
                  className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none resize-none text-sm"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-400 mt-1">{description.length}/1000</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your email (optional)</label>
                <input
                  value={contactEmail}
                  onChange={e=>setContactEmail(e.target.value)}
                  type="email"
                  placeholder="For follow-up from our team"
                  className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                />
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Reports are confidential. False reports may result in account action.</p>
              </div>
              <button
                onClick={submit}
                disabled={!description.trim()||description.length<20}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4"/>Submit Report
              </button>
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t p-3">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Phone className="w-3 h-3"/>+237 XXX XXX XXX</span>
          <span className="flex items-center gap-1"><Mail className="w-3 h-3"/>safety@bambeh.cm</span>
        </div>
      </div>
    </div>
  );
}


