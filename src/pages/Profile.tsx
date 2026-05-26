import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Edit2, Save, X, LogOut, Camera } from 'lucide-react';
import { AvatarImage } from '@/components/ui/BambehImage';

interface UserProfile {
  id: string; name: string; email: string; phone: string;
  location: string; bio: string; avatar?: string; joinedAt: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    try {
      const keys = ['Bambeh_user', 'bambeh_user', 'user'];
      for (const key of keys) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw);
          if (data?.id || data?.email) {
            const p: UserProfile = {
              id: data.id || data.uid || 'user1',
              name: data.name || data.displayName || 'Bambeh User',
              email: data.email || '',
              phone: data.phone || data.phoneNumber || '',
              location: data.location || 'Cameroon',
              bio: data.bio || 'Bambeh Marketplace member',
              avatar: data.avatar || data.photoURL,
              joinedAt: data.joinedAt || data.createdAt || new Date().toISOString(),
            };
            setProfile(p);
            setForm(p);
            return;
          }
        }
      }
    } catch {}
    const guest: UserProfile = {
      id: 'guest', name: 'Guest User', email: '', phone: '',
      location: 'Cameroon', bio: 'Welcome to Bambeh!', joinedAt: new Date().toISOString(),
    };
    setProfile(guest);
    setForm(guest);
  }, []);

  function saveProfile() {
    if (!profile) return;
    const updated = { ...profile, ...form };
    setProfile(updated);
    try {
      const raw = localStorage.getItem('Bambeh_user');
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem('Bambeh_user', JSON.stringify({ ...existing, ...updated }));
    } catch {}
    setEditing(false);
  }

  function logout() {
    ['Bambeh_user','bambeh_user','Bambeh_vendor','Bambeh_cart'].forEach(k => {
      try { localStorage.removeItem(k); } catch {}
    });
    navigate('/login');
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 pt-8 pb-16 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white font-bold text-xl">My Profile</h1>
          <button onClick={logout} className="flex items-center gap-1 text-teal-100 text-sm">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
              {profile.avatar ? <AvatarImage src={profile.avatar} alt={profile.name} size={80} /> : <User className="w-10 h-10 text-white" />}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
              <Camera className="w-3.5 h-3.5 text-teal-600" />
            </button>
          </div>
          <h2 className="text-white font-bold text-lg mt-3">{profile.name}</h2>
          <p className="text-teal-100 text-sm">{profile.location}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Personal Info</h3>
            {editing ? (
              <div className="flex gap-2">
                <button onClick={saveProfile} className="flex items-center gap-1 text-teal-600 text-sm font-semibold"><Save className="w-4 h-4" />Save</button>
                <button onClick={() => { setEditing(false); setForm(profile); }} className="flex items-center gap-1 text-gray-400 text-sm"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-teal-600 text-sm font-semibold"><Edit2 className="w-4 h-4" />Edit</button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1"><User className="w-3 h-3" />Full Name</label>
              {editing ? <input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" /> : <p className="text-gray-900 font-medium text-sm">{profile.name}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" />Email</label>
              {editing ? <input value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" /> : <p className="text-gray-900 font-medium text-sm">{profile.email || 'Not set'}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1"><Phone className="w-3 h-3" />Phone</label>
              {editing ? <input value={form.phone||''} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" /> : <p className="text-gray-900 font-medium text-sm">{profile.phone || 'Not set'}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" />Location</label>
              {editing ? <input value={form.location||''} onChange={e=>setForm({...form,location:e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" /> : <p className="text-gray-900 font-medium text-sm">{profile.location}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bio</label>
              {editing ? <textarea value={form.bio||''} onChange={e=>setForm({...form,bio:e.target.value})} rows={2} className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none" /> : <p className="text-gray-900 font-medium text-sm">{profile.bio}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
          <div className="space-y-1">
            {[['My Listings', '/my-listings'], ['Orders', '/orders'], ['Favorites', '/favorites'], ['Settings', '/settings']].map(([label, route]) => (
              <button key={route} onClick={() => navigate(route)} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700 flex items-center justify-between">
                {label}<span className="text-gray-400"></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
