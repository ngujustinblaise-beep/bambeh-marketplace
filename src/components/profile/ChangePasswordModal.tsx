/**
 * src/components/profile/ChangePasswordModal.tsx
 * © 2026 Bambeh Marketplace. All rights reserved.
 */
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

interface ChangePasswordModalProps {
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPass.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (newPass !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: newPass });
      if (err) { setError(err.message); return; }
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }: { show: boolean }) => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {show ? (
        <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></>
      ) : (
        <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
      )}
    </svg>
  );

  const PasswordField = ({
    label, value, onChange, showPass, onToggle, placeholder,
  }: { label: string; value: string; onChange: (v: string) => void; showPass: boolean; onToggle: () => void; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={showPass ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "••••••••"}
          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <EyeIcon show={showPass} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Changer le mot de passe</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">
          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold text-gray-900">Mot de passe modifié !</p>
              <p className="text-sm text-gray-500 mt-1">Redirection en cours...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordField label="Mot de passe actuel" value={current} onChange={setCurrent} showPass={show.current} onToggle={() => setShow((s) => ({ ...s, current: !s.current }))} />
              <PasswordField label="Nouveau mot de passe" value={newPass} onChange={setNewPass} showPass={show.new} onToggle={() => setShow((s) => ({ ...s, new: !s.new }))} placeholder="8+ caractères" />
              <PasswordField label="Confirmer le nouveau mot de passe" value={confirm} onChange={setConfirm} showPass={show.confirm} onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))} />

              {newPass && (
                <div className="flex gap-1">
                  {[1,2,3,4].map((level) => (
                    <div key={level} className={`h-1 flex-1 rounded-full ${newPass.length >= level * 2 ? level <= 2 ? "bg-orange-400" : "bg-green-500" : "bg-gray-200"}`} />
                  ))}
                </div>
              )}

              {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 text-sm">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 text-sm disabled:opacity-60">
                  {loading ? "Modification..." : "Modifier"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;




