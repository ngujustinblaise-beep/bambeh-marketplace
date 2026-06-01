/**
 * src/pages/Profile.tsx — Bambeh Marketplace
 *
 * FIXED in this version:
 *  ✅ Avatar upload WORKS — Camera button now opens file picker
 *  ✅ Photo stored as base64 in localStorage (no Supabase storage needed)
 *  ✅ Image validation: JPG/PNG/WebP, max 3MB
 *  ✅ Reads real user data from Supabase auth session first,
 *     then falls back to localStorage keys for legacy data
 *  ✅ Profile save updates localStorage
 *  ✅ Logout clears auth session + all localStorage keys
 *  ✅ Quick Links section with correct routes
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, MapPin, Edit2, Save,
  X, LogOut, Camera, AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id:       string;
  name:     string;
  email:    string;
  phone:    string;
  location: string;
  bio:      string;
  avatar?:  string;  // base64 or URL
  joinedAt: string;
}

const ALLOWED_IMG  = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR   = 3 * 1024 * 1024; // 3MB — keeps localStorage manageable

export default function Profile() {
  const navigate  = useNavigate();
  const fileRef   = useRef<HTMLInputElement>(null);

  const [profile,     setProfile]     = useState<UserProfile | null>(null);
  const [editing,     setEditing]     = useState(false);
  const [form,        setForm]        = useState<Partial<UserProfile>>({});
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [saving,      setSaving]      = useState(false);

  // ── Load profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      // 1. Try Supabase auth session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const u = session.user;

          // Try to fetch extended profile from profiles table
          let extra: Record<string, any> = {};
          try {
            const { data } = await supabase
              .from("profiles")
              .select("display_name, phone, location, bio, avatar_url")
              .eq("id", u.id)
              .single();
            if (data) extra = data;
          } catch { /* profiles table may not exist — that's fine */ }

          const p: UserProfile = {
            id:       u.id,
            name:     extra.display_name ?? u.user_metadata?.full_name ?? u.email?.split("@")[0] ?? "Bambeh User",
            email:    u.email ?? "",
            phone:    extra.phone ?? u.user_metadata?.phone ?? "",
            location: extra.location ?? u.user_metadata?.location ?? "",
            bio:      extra.bio ?? "Bambeh Marketplace member",
            avatar:   extra.avatar_url ?? u.user_metadata?.avatar_url,
            joinedAt: u.created_at ?? new Date().toISOString(),
          };
          setProfile(p);
          setForm(p);
          return;
        }
      } catch { /* no session */ }

      // 2. Fallback: localStorage (legacy keys)
      const keys = ["Bambeh_user", "bambeh_user", "user"];
      for (const key of keys) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data = JSON.parse(raw);
            if (data?.id || data?.email) {
              const p: UserProfile = {
                id:       data.id ?? data.uid ?? "user1",
                name:     data.name ?? data.displayName ?? "Bambeh User",
                email:    data.email ?? "",
                phone:    data.phone ?? data.phoneNumber ?? "",
                location: data.location ?? "",
                bio:      data.bio ?? "Bambeh Marketplace member",
                avatar:   data.avatar ?? data.photoURL,
                joinedAt: data.joinedAt ?? data.createdAt ?? new Date().toISOString(),
              };
              setProfile(p);
              setForm(p);
              return;
            }
          }
        } catch {}
      }

      // 3. Guest fallback
      const guest: UserProfile = {
        id:       "guest",
        name:     "Guest User",
        email:    "",
        phone:    "",
        location: "",
        bio:      "Welcome to Bambeh!",
        joinedAt: new Date().toISOString(),
      };
      setProfile(guest);
      setForm(guest);
    }

    void load();
  }, []);

  // ── Avatar upload ─────────────────────────────────────────────────────────
  function handleAvatarClick() {
    setAvatarError(null);
    fileRef.current?.click();
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMG.includes(file.type)) {
      setAvatarError("Only JPG, PNG or WebP images allowed.");
      return;
    }
    if (file.size > MAX_AVATAR) {
      setAvatarError(`Image too large (max 3 MB). Got ${(file.size / 1024 / 1024).toFixed(1)} MB.`);
      return;
    }

    // Convert to base64
    const base64 = await new Promise<string>(resolve => {
      const reader = new FileReader();
      reader.onload = ev => resolve(ev.target?.result as string);
      reader.readAsDataURL(file);
    });

    // Update profile immediately (optimistic)
    setProfile(prev => prev ? { ...prev, avatar: base64 } : prev);
    setForm(prev => ({ ...prev, avatar: base64 }));

    // Persist
    try {
      const raw = localStorage.getItem("Bambeh_user");
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem("Bambeh_user", JSON.stringify({ ...existing, avatar: base64 }));
    } catch {}

    // Try to update Supabase storage if user is logged in
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.auth.updateUser({ data: { avatar_url: base64 } });
        // Also try profiles table
        await supabase
          .from("profiles")
          .update({ avatar_url: base64 })
          .eq("id", session.user.id);
      }
    } catch { /* Storage not configured — localStorage saved above is enough */ }
  }

  // ── Save profile edits ────────────────────────────────────────────────────
  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    const updated: UserProfile = { ...profile, ...form };
    setProfile(updated);

    // Persist to localStorage
    try {
      const raw = localStorage.getItem("Bambeh_user");
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem("Bambeh_user", JSON.stringify({ ...existing, ...updated }));
    } catch {}

    // Try Supabase
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.auth.updateUser({
          data: { full_name: updated.name, phone: updated.phone, location: updated.location },
        });
        await supabase
          .from("profiles")
          .upsert({
            id:           session.user.id,
            display_name: updated.name,
            phone:        updated.phone,
            location:     updated.location,
            bio:          updated.bio,
          });
      }
    } catch { /* offline or profiles table doesn't exist — localStorage saved */ }

    setSaving(false);
    setEditing(false);
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  async function logout() {
    try { await supabase.auth.signOut(); } catch {}
    ["Bambeh_user","bambeh_user","Bambeh_vendor","Bambeh_cart","Bambeh_language","Bambeh_terms_accepted","Bambeh_welcome_shown"]
      .forEach(k => { try { localStorage.removeItem(k); } catch {} });
    navigate("/login");
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const memberSince = (() => {
    try {
      return new Date(profile.joinedAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    } catch { return ""; }
  })();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 pt-8 pb-16 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white font-bold text-xl">My Profile</h1>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-teal-100 text-sm hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="flex flex-col items-center">
          {/* Avatar with clickable camera overlay */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/40 overflow-hidden">
              {profile.avatar
                ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                : <User className="w-12 h-12 text-white" />
              }
            </div>

            {/* Camera button — now WIRED to file input */}
            <button
              type="button"
              onClick={handleAvatarClick}
              aria-label="Change profile photo"
              className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 active:scale-95 transition-all border-2 border-teal-600">
              <Camera className="w-4 h-4 text-teal-600" />
            </button>

            {/* Hidden file input */}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange} />
          </div>

          {/* Avatar error */}
          {avatarError && (
            <div className="flex items-center gap-1.5 mt-2 bg-red-500/20 text-red-100 text-xs px-3 py-1.5 rounded-full">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {avatarError}
            </div>
          )}

          <h2 className="text-white font-bold text-lg mt-3">{profile.name}</h2>
          {profile.location && (
            <p className="text-teal-100 text-sm flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />{profile.location}
            </p>
          )}
          {memberSince && (
            <p className="text-teal-200 text-xs mt-1">Member since {memberSince}</p>
          )}

          {/* Tap hint */}
          <p className="text-teal-200 text-xs mt-2 opacity-70">
            Tap the camera icon to change your photo
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 space-y-4">

        {/* Personal info card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Personal Information</h3>
            {editing ? (
              <div className="flex gap-3">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center gap-1 text-teal-600 text-sm font-semibold disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => { setEditing(false); setForm(profile); }}
                  className="flex items-center gap-1 text-gray-400 text-sm">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-teal-600 text-sm font-semibold">
                <Edit2 className="w-4 h-4" />Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <User className="w-3 h-3" />Full Name
              </label>
              {editing
                ? <input
                    value={form.name ?? ""}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors" />
                : <p className="text-gray-900 font-medium text-sm">{profile.name}</p>
              }
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <Mail className="w-3 h-3" />Email
              </label>
              {editing
                ? <input
                    type="email"
                    value={form.email ?? ""}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors" />
                : <p className="text-gray-900 font-medium text-sm">{profile.email || "Not set"}</p>
              }
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <Phone className="w-3 h-3" />Phone
              </label>
              {editing
                ? <div className="flex">
                    <span className="border-2 border-r-0 border-gray-200 rounded-l-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-600 flex-shrink-0">
                      🇨🇲 +237
                    </span>
                    <input
                      type="tel"
                      value={(form.phone ?? "").replace(/^\+?237/, "")}
                      onChange={e => setForm({ ...form, phone: "+237" + e.target.value.replace(/\D/g, "").slice(0, 9) })}
                      placeholder="6XX XXX XXX"
                      className="flex-1 border-2 border-gray-200 focus:border-teal-500 rounded-r-xl px-3 py-2.5 text-sm outline-none transition-colors" />
                  </div>
                : <p className="text-gray-900 font-medium text-sm">{profile.phone || "Not set"}</p>
              }
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <MapPin className="w-3 h-3" />Location
              </label>
              {editing
                ? <input
                    value={form.location ?? ""}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Yaoundé, Centre"
                    className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors" />
                : <p className="text-gray-900 font-medium text-sm">{profile.location || "Not set"}</p>
              }
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bio</label>
              {editing
                ? <textarea
                    value={form.bio ?? ""}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    rows={2}
                    placeholder="Tell buyers and sellers a little about yourself..."
                    className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-colors" />
                : <p className="text-gray-900 font-medium text-sm">{profile.bio}</p>
              }
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
          <div className="space-y-1">
            {[
              ["🛍️  My Listings",    "/marketplace"],
              ["📦  My Orders",      "/orders"],
              ["❤️   Saved Items",    "/favorites"],
              ["⚙️   Settings",       "/settings"],
              ["🌿  Farm Fresh",     "/farm-fresh"],
              ["📢  Post an Ad",     "/post-ad"],
            ].map(([label, route]) => (
              <button
                key={route}
                onClick={() => navigate(route)}
                className="w-full text-left px-3 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 text-sm text-gray-700 flex items-center justify-between transition-colors">
                <span>{label}</span>
                <span className="text-gray-400 text-base">›</span>
              </button>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Account</h3>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-3 text-red-600 text-sm font-medium hover:bg-red-50 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
