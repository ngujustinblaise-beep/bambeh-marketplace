import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Smartphone, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useLang, t } from "@/hooks/useAppLang";

interface PasswordForm { current_password:string; new_password:string; confirm_password:string; }
const defaultForm: PasswordForm = { current_password:"", new_password:"", confirm_password:"" };

export default function VendorSettingsSecurity() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [form, setForm] = useState<PasswordForm>(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [show, setShow] = useState({current:false,new:false,confirm:false});
  const [saveStatus, setSaveStatus] = useState<"idle"|"success"|"error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleChange = (field:keyof PasswordForm, value:string) => { setForm(p=>({...p,[field]:value})); setSaveStatus("idle"); setErrorMessage(""); };

  const validate = ():string|null => {
    if (!form.current_password) return "Current password is required.";
    if (!form.new_password) return "New password is required.";
    if (form.new_password.length<8) return "New password must be at least 8 characters.";
    if (form.new_password!==form.confirm_password) return "Passwords do not match.";
    if (form.current_password===form.new_password) return "New password must differ from current.";
    return null;
  };

  const handleSave = async () => {
    const err=validate(); if (err){setErrorMessage(err);setSaveStatus("error");return;}
    setIsSaving(true); setSaveStatus("idle"); setErrorMessage("");
    try {
      const {error}=await supabase.auth.updateUser({password:form.new_password});
      if (error) throw error;
      setSaveStatus("success"); setForm(defaultForm); setTimeout(()=>setSaveStatus("idle"),3000);
    } catch(e:any){setErrorMessage(e.message||"Failed to update.");setSaveStatus("error");}
    finally{setIsSaving(false);}
  };

  const handleSignOutAll = async () => {
    setIsSigningOut(true);
    try { await supabase.auth.signOut({scope:"global"}); if(signOut)signOut(); navigate("/login"); }
    catch(e:any){setErrorMessage(e.message||"Failed to sign out.");setSaveStatus("error");}
    finally{setIsSigningOut(false);}
  };

  const strength = (()=>{
    const p=form.new_password; if(!p)return{label:"",color:"",width:"0%"};
    let s=0; if(p.length>=8)s++;if(p.length>=12)s++;if(/[A-Z]/.test(p))s++;if(/[0-9]/.test(p))s++;if(/[^A-Za-z0-9]/.test(p))s++;
    if(s<=1)return{label:"Weak",color:"bg-red-500",width:"20%"};
    if(s===2)return{label:"Fair",color:"bg-orange-500",width:"40%"};
    if(s===3)return{label:"Good",color:"bg-yellow-500",width:"60%"};
    if(s===4)return{label:"Strong",color:"bg-blue-500",width:"80%"};
    return{label:"Very Strong",color:"bg-green-500",width:"100%"};
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-600"/></button>
            <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-green-600"/><h1 className="text-lg font-semibold text-gray-900">Security Settings</h1></div>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors">
            {isSaving?<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Save className="w-4 h-4"/>}
            {isSaving?"Saving...":"Save"}
          </button>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {saveStatus==="success"&&<div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"><CheckCircle className="w-5 h-5"/><span>Password updated!</span></div>}
        {saveStatus==="error"&&<div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"><AlertCircle className="w-5 h-5"/><span>{errorMessage}</span></div>}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Account</h2>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><span className="text-green-700 font-bold text-sm">{user?.email?.charAt(0).toUpperCase()||"V"}</span></div>
            <div><p className="text-sm font-medium text-gray-900">{user?.email}</p><p className="text-xs text-gray-500">Signed in</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4"><Lock className="w-5 h-5 text-green-600"/><h2 className="text-base font-semibold text-gray-900">Change Password</h2></div>
          <div className="space-y-4">
            {([["current_password","Current Password","current"],["new_password","New Password","new"],["confirm_password","Confirm Password","confirm"]] as [keyof PasswordForm,string,keyof typeof show][]).map(([field,label,key])=>(
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="relative">
                  <input type={show[key]?"text":"password"} value={form[field]} onChange={e=>handleChange(field,e.target.value)} className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/>
                  <button type="button" onClick={()=>setShow(p=>({...p,[key]:!p[key]}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{show[key]?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>
                </div>
                {field==="new_password"&&form.new_password.length>0&&<div className="mt-2"><div className="w-full bg-gray-200 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${strength.color}`} style={{width:strength.width}}/></div><p className="text-xs mt-1 text-gray-500">{strength.label}</p></div>}
                {field==="confirm_password"&&form.confirm_password.length>0&&(form.new_password===form.confirm_password?<p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3"/>Passwords match</p>:<p className="text-xs text-red-500 mt-1">Passwords do not match</p>)}
              </div>
            ))}
          </div>
          <div className="mt-5"><button onClick={handleSave} disabled={isSaving} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors">{isSaving?<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Save className="w-4 h-4"/>}{isSaving?"Updating...":"Update Password"}</button></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3"><div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"><Smartphone className="w-5 h-5 text-blue-600"/></div><div><p className="text-sm font-semibold text-gray-900">Two-Factor Authentication</p><p className="text-xs text-gray-500 mt-0.5">Extra security via SMS OTP</p></div></div>
            <button onClick={()=>setTwoFactor(p=>!p)} className={`relative w-11 h-6 rounded-full transition-colors ${twoFactor?"bg-green-500":"bg-gray-300"}`}><span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${twoFactor?"translate-x-6":"translate-x-1"}`}/></button>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3"><LogOut className="w-5 h-5 text-red-500"/><h2 className="text-base font-semibold text-gray-900">Active Sessions</h2></div>
          <p className="text-sm text-gray-600 mb-4">Sign out from all other devices.</p>
          <button onClick={handleSignOutAll} disabled={isSigningOut} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors">{isSigningOut?<span className="w-4 h-4 border-2 border-red-400/30 border-t-red-500 rounded-full animate-spin"/>:<LogOut className="w-4 h-4"/>}{isSigningOut?"Signing out...":"Sign Out All Devices"}</button>
        </div>
        <div className="pb-8"/>
      </div>
    </div>
  );
}




