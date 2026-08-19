// BAMBEH_DEPLOY_TOKEN__PROFILE_FIX354_CLEAN
/**
 * src/pages/Profile.tsx — Bambeh Marketplace
 *
 * i18n: all visible strings live in the local S table below, keyed by the live
 * language (EN / FR / Pidgin / Arabic / Fulfulde). The language code comes from
 * useLang() (@/hooks/useAppLang), which reacts to the same "bambeh:langchange"
 * event the real LanguageProvider (in @/App) fires — so this page re-renders
 * and re-translates the instant the user switches language anywhere.
 *
 * Behaviour unchanged: avatar upload (base64, max 3MB), Supabase + localStorage
 * load/save, logout clears session + local keys, Quick Links routes.
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, MapPin, Edit2, Save,
  X, LogOut, Camera, AlertCircle, Wallet, CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
// FIX354 - the SAME prefix tables the payments Edge Function uses, so the
// browser can never accept a number CamPay would refuse to pay.
import { checkMomoPhone, momoOperatorLabel, momoError } from "@/lib/momoPhone";
import { useLang } from "@/hooks/useAppLang";
import { useLanguage } from "@/context/LanguageContext";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

interface UserProfile {
  id:       string;
  name:     string;
  email:    string;
  phone:    string;
  payoutPhone: string;   // FIX354 - where sale money is sent
  location: string;
  bio:      string;
  avatar?:  string;  // base64 or URL
  joinedAt: string;
}

// ── i18n strings (local; keyed by live language) ──────────────────────────
const S: Record<Lang, {
  imgTypeErr: string; imgTooLarge: (mb: string) => string;
  myProfile: string; logout: string; memberSince: string;
  tapCamera: string; changePhotoAria: string; personalInfo: string;
  saving: string; save: string; edit: string;
  fullName: string; email: string; phone: string; location: string; bio: string;
  payoutTitle: string; payoutLabel: string; payoutHelp: string; payoutSame: string;
  payoutMissing: string; payoutReady: (op: string) => string; saveFailed: string;
  notSet: string; locationPh: string; bioPh: string;
  quickLinks: string; qlCoins: string; qlListings: string; qlOrders: string;
  qlSaved: string; qlSettings: string; qlFarmFresh: string; qlPostAd: string; qlVoice: string;
  account: string; signOut: string;
}> = {
  en: {
    imgTypeErr: "Only JPG, PNG or WebP images allowed.",
    imgTooLarge: (mb) => "Image too large (max 3 MB). Got " + mb + " MB.",
    myProfile: "My Profile",
    logout: "Logout",
    memberSince: "Member since",
    tapCamera: "Tap the camera icon to change your photo",
    changePhotoAria: "Change profile photo",
    personalInfo: "Personal Information",
    saving: "Saving...",
    save: "Save",
    edit: "Edit",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    location: "Location",
    bio: "Bio",
    notSet: "Not set",
    locationPh: "e.g. Yaoundé, Centre",
    bioPh: "Tell buyers and sellers a little about yourself...",
    quickLinks: "Quick Links",
    qlCoins: "Zerm Coins",
    qlListings: "My Listings",
    qlOrders: "My Orders",
    qlSaved: "Saved Items",
    qlSettings: "Settings",
    qlFarmFresh: "Farm Fresh",
    qlPostAd: "Post an Ad",
    qlVoice: "Share My Voice",
    payoutTitle: "Where your money arrives",
    payoutLabel: "Mobile Money payout number",
    payoutHelp: "When someone buys from you, Bambeh sends your money to this number. MTN Mobile Money or Orange Money only.",
    payoutSame: "Same as my phone",
    payoutMissing: "Not set — Bambeh cannot pay you yet",
    payoutReady: (op) => "Confirmed: " + op,
    saveFailed: "Could not save your changes:",
    account: "Account",
    signOut: "Sign Out",
  },
  fr: {
    imgTypeErr: "Seules les images JPG, PNG ou WebP sont autorisées.",
    imgTooLarge: (mb) => "Image trop volumineuse (max 3 Mo). Reçu " + mb + " Mo.",
    myProfile: "Mon profil",
    logout: "Déconnexion",
    memberSince: "Membre depuis",
    tapCamera: "Touchez l'icône de l'appareil photo pour changer votre photo",
    changePhotoAria: "Changer la photo de profil",
    personalInfo: "Informations personnelles",
    saving: "Enregistrement...",
    save: "Enregistrer",
    edit: "Modifier",
    fullName: "Nom complet",
    email: "E-mail",
    phone: "Téléphone",
    location: "Localisation",
    bio: "Bio",
    notSet: "Non défini",
    locationPh: "ex. Yaoundé, Centre",
    bioPh: "Présentez-vous brièvement aux acheteurs et vendeurs...",
    quickLinks: "Liens rapides",
    qlCoins: "Pièces Zerm",
    qlListings: "Mes annonces",
    qlOrders: "Mes commandes",
    qlSaved: "Articles enregistrés",
    qlSettings: "Paramètres",
    qlFarmFresh: "Ferme Fraîche",
    qlVoice: "Donnez votre avis",
    qlPostAd: "Publier une annonce",
    payoutTitle: "Où votre argent arrive",
    payoutLabel: "Numéro Mobile Money pour vos paiements",
    payoutHelp: "Quand quelqu'un vous achète un article, Bambeh envoie votre argent à ce numéro. Uniquement MTN Mobile Money ou Orange Money.",
    payoutSame: "Identique à mon téléphone",
    payoutMissing: "Non défini — Bambeh ne peut pas encore vous payer",
    payoutReady: (op) => "Confirmé : " + op,
    saveFailed: "Impossible d'enregistrer vos modifications :",
    account: "Compte",
    signOut: "Se déconnecter",
  },
  pidgin: {
    imgTypeErr: "Na only JPG, PNG or WebP image dem dey allow.",
    imgTooLarge: (mb) => "Image too big (max 3 MB). Na " + mb + " MB you bring.",
    myProfile: "My Profile",
    logout: "Comot",
    memberSince: "Member since",
    tapCamera: "Press di camera icon to change your photo",
    changePhotoAria: "Change profile photo",
    personalInfo: "Your Personal Info",
    saving: "E dey save...",
    save: "Save",
    edit: "Edit",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    location: "Wia You Dey",
    bio: "Bio",
    notSet: "You never set am",
    locationPh: "e.g. Yaoundé, Centre",
    bioPh: "Talk small about yourself make buyers and sellers know you...",
    quickLinks: "Quick Links",
    qlCoins: "Zerm Coins",
    qlListings: "My Listings",
    qlOrders: "My Orders",
    qlSaved: "Things Wey I Save",
    qlSettings: "Settings",
    qlFarmFresh: "Farm Fresh",
    qlPostAd: "Post Ad",
    qlVoice: "Talk Your Mind",
    payoutTitle: "Wia your money go enter",
    payoutLabel: "Mobile Money number for your payment",
    payoutHelp: "When person buy something from you, Bambeh go send your money go dis number. Na only MTN Mobile Money or Orange Money.",
    payoutSame: "Same as my phone",
    payoutMissing: "You never set am — Bambeh no fit pay you yet",
    payoutReady: (op) => "E don confirm: " + op,
    saveFailed: "E no fit save wetin you change:",
    account: "Account",
    signOut: "Comot",
  },
  ar: {
    imgTypeErr: "يُسمح فقط بصور JPG أو PNG أو WebP.",
    imgTooLarge: (mb) => "الصورة كبيرة جدًا (الحد الأقصى 3 ميغابايت). الحجم " + mb + " ميغابايت.",
    myProfile: "ملفي الشخصي",
    logout: "تسجيل الخروج",
    memberSince: "عضو منذ",
    tapCamera: "اضغط على أيقونة الكاميرا لتغيير صورتك",
    changePhotoAria: "تغيير صورة الملف الشخصي",
    personalInfo: "المعلومات الشخصية",
    saving: "جارٍ الحفظ...",
    save: "حفظ",
    edit: "تعديل",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    location: "الموقع",
    bio: "نبذة",
    notSet: "غير محدد",
    locationPh: "مثال: ياوندي، الوسطى",
    bioPh: "عرّف بنفسك قليلًا للمشترين والبائعين...",
    quickLinks: "روابط سريعة",
    qlCoins: "عملات زيرم",
    qlListings: "إعلاناتي",
    qlOrders: "طلباتي",
    qlSaved: "العناصر المحفوظة",
    qlSettings: "الإعدادات",
    qlFarmFresh: "طازج من المزرعة",
    qlVoice: "شارك رأيك",
    qlPostAd: "نشر إعلان",
    payoutTitle: "أين تصل أموالك",
    payoutLabel: "رقم المحفظة الإلكترونية لاستلام أموالك",
    payoutHelp: "عندما يشتري أحد منك، ترسل Bambeh أموالك إلى هذا الرقم. MTN Mobile Money أو Orange Money فقط.",
    payoutSame: "نفس رقم هاتفي",
    payoutMissing: "غير محدد — لا تستطيع Bambeh الدفع لك بعد",
    payoutReady: (op) => "تم التأكيد: " + op,
    saveFailed: "تعذّر حفظ التغييرات:",
    account: "الحساب",
    signOut: "تسجيل الخروج",
  },
  ff: {
    imgTypeErr: "Ko natal JPG, PNG walla WebP tan yamiraa.",
    imgTooLarge: (mb) => "Natal mawni no feewi (haa 3 MB). Hewtii " + mb + " MB.",
    myProfile: "Profil am",
    logout: "Yaltude",
    memberSince: "Tuugnoode gila",
    tapCamera: "Meem ikon kamera ndee ngam waylude natal maa",
    changePhotoAria: "Waylu natal profil",
    personalInfo: "Kabaruuji maa",
    saving: "Ɗon danee...",
    save: "Dannu",
    edit: "Taƴto",
    fullName: "Innde timmunde",
    email: "Iimeel",
    phone: "Telefoŋ",
    location: "Nokku",
    bio: "Faltaade",
    notSet: "Teelaaka",
    locationPh: "misal: Yaoundé, Centre",
    bioPh: "Falto hoore maa seeɗa fayde soodooɓe e njeeyooɓe...",
    quickLinks: "Jokkorɗe yaawɗe",
    qlCoins: "Ceede Zerm",
    qlListings: "Ko njeeyetee am",
    qlOrders: "Sarwiiji am",
    qlSaved: "Kuuje danaaɗe",
    qlSettings: "Teelte",
    qlFarmFresh: "Ko hecci diga ngesa",
    qlVoice: "Hollu Ko Aɗa Sema",
    qlPostAd: "Fewtu njeeyannde",
    payoutTitle: "Ɗo ceede maa njippotoo",
    payoutLabel: "Limngal Mobile Money ngal njobeteɗaa",
    payoutHelp: "So neɗɗo soodii e maa, Bambeh neldan ceede maa e ngal limngal. Ko MTN Mobile Money walla Orange Money tan.",
    payoutSame: "Wano telefoŋ am",
    payoutMissing: "Teelaaka — Bambeh waawaa yobde ma tawo",
    payoutReady: (op) => "Teeŋtinaama: " + op,
    saveFailed: "Waawaa danndude ko waylu-ɗaa:",
    account: "Konto",
    signOut: "Yaltude",
  },
};

const LOCALE_MAP: Record<Lang, string> = {
  en: "en-GB", fr: "fr-FR", pidgin: "en-GB", ar: "ar", ff: "en-GB",
};

const ALLOWED_IMG  = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR   = 3 * 1024 * 1024; // 3MB — keeps localStorage manageable

export default function Profile() {
  const lang = useLang();
  const { setLanguage } = useLanguage(); // FIX130: app-wide language setter
  const l: Lang = (lang in S ? lang : "en") as Lang;
  const s = S[l];
  const isRtl = l === "ar";
  const navigate  = useNavigate();
  const fileRef   = useRef<HTMLInputElement>(null);

  const [profile,     setProfile]     = useState<UserProfile | null>(null);
  const [editing,     setEditing]     = useState(false);
  const [form,        setForm]        = useState<Partial<UserProfile>>({});
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [saving,      setSaving]      = useState(false);
  // FIX354 - the old code swallowed every save failure in a bare catch {} and
  // still closed the editor, so a seller could "save" a payout number that was
  // never stored. Both of these are now shown.
  const [saveError,   setSaveError]   = useState<string | null>(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);

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
            // FIX354 - select("*") on purpose. Naming a column that does not
            // exist makes PostgREST reject the ENTIRE query, which would blank
            // the whole profile page if payout_phone has not been added yet.
            const { data } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", u.id)
              .single();
            if (data) extra = data;
          } catch { /* profiles table may not exist — that's fine */ }

          const p: UserProfile = {
            id:       u.id,
            name:     extra.display_name ?? u.user_metadata?.full_name ?? u.email?.split("@")[0] ?? "Bambeh User",
            email:    u.email ?? "",
            phone:    extra.phone ?? u.user_metadata?.phone ?? "",
            payoutPhone: extra.payout_phone ?? extra.momo_phone ?? "",
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
                payoutPhone: data.payoutPhone ?? data.payout_phone ?? "",
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
        payoutPhone: "",
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
      setAvatarError(s.imgTypeErr);
      return;
    }
    if (file.size > MAX_AVATAR) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      setAvatarError(s.imgTooLarge(mb));
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
    setSaveError(null);
    setPayoutError(null);

    // FIX354 - REFUSE TO SAVE A PAYOUT NUMBER CAMPAY WOULD REJECT.
    // Leaving it blank is allowed (a buyer never needs one); typing a wrong one
    // is not, because the failure would otherwise surface weeks later as an
    // unpaid seller and money parked with Bambeh.
    const rawPayout = String(form.payoutPhone ?? "").trim();
    let normalisedPayout = "";
    if (rawPayout) {
      const check = checkMomoPhone(rawPayout);
      if (!check.valid) {
        setPayoutError(momoError(check.reason, l));
        return;
      }
      normalisedPayout = check.normalized;
    }

    setSaving(true);
    const updated: UserProfile = { ...profile, ...form, payoutPhone: normalisedPayout };
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
        const { error } = await supabase
          .from("profiles")
          .upsert({
            id:           session.user.id,
            display_name: updated.name,
            phone:        updated.phone,
            payout_phone: normalisedPayout || null,
            location:     updated.location,
            bio:          updated.bio,
          });
        if (error) {
          // FIX354 - never again close the editor on a failed write.
          console.error("[profile] save failed:", error.message, error.details ?? "", error.hint ?? "");
          setSaveError(s.saveFailed + " " + error.message);
          setSaving(false);
          return;
        }
      }
    } catch (e) {
      console.error("[profile] save threw:", e);
      setSaveError(s.saveFailed + " " + (e instanceof Error ? e.message : String(e)));
      setSaving(false);
      return;
    }

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
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full"/>
      </div>
    );
  }

  const memberSince = (() => {
    try {
      return new Date(profile.joinedAt).toLocaleDateString(LOCALE_MAP[l] ?? "en-GB", { month: "long", year: "numeric" });
    } catch { return ""; }
  })();

  const quickLinks: [string, string][] = [
    ["⚡  " + s.qlCoins,     "/coins"],
    ["🛍️  " + s.qlListings,  "/my-listings"],
    ["📦  " + s.qlOrders,    "/orders"],
    ["❤️   " + s.qlSaved,     "/favorites"],
    ["⚙️   " + s.qlSettings,  "/settings"],
    ["🌿  " + s.qlFarmFresh, "/farm-fresh"],
    ["\u{1F4AC}  " + s.qlVoice,     "/feedback"],  ];

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 pb-20">

      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 pt-8 pb-16 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white font-bold text-xl">{s.myProfile}</h1>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-teal-100 text-sm hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
            {s.logout}
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

            {/* Camera button — wired to file input */}
            <button
              type="button"
              onClick={handleAvatarClick}
              aria-label={s.changePhotoAria}
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
            <p className="text-teal-200 text-xs mt-1">{s.memberSince} {memberSince}</p>
          )}

          {/* Tap hint */}
          <p className="text-teal-200 text-xs mt-2 opacity-70">
            {s.tapCamera}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 space-y-4">

        {/* Personal info card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{s.personalInfo}</h3>
            {editing ? (
              <div className="flex gap-3">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center gap-1 text-teal-600 text-sm font-semibold disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {saving ? s.saving : s.save}
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
                <Edit2 className="w-4 h-4" />{s.edit}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <User className="w-3 h-3" />{s.fullName}
              </label>
              {editing
                ? <input
                    value={form.name ?? ""}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors" />
                : <p className="text-gray-900 font-medium text-sm">{profile.name}</p>
              }
            </div>

            {/* FIX354 — a failed write is never silent again */}
            {saveError && (
              <div className="flex items-start gap-1.5 rounded-xl bg-red-50 border-2 border-red-200 px-3 py-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 font-medium break-words">{saveError}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <Mail className="w-3 h-3" />{s.email}
              </label>
              {editing
                ? <input
                    type="email"
                    value={form.email ?? ""}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors" />
                : <p className="text-gray-900 font-medium text-sm">{profile.email || s.notSet}</p>
              }
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <Phone className="w-3 h-3" />{s.phone}
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
                : <p className="text-gray-900 font-medium text-sm">{profile.phone || s.notSet}</p>
              }
            </div>

            {/* FIX354 — PAYOUT NUMBER. Deliberately a card, not another grey
                row: this is the one field that decides whether a seller ever
                sees their money, and it was being ignored as a result. */}
            <div className="rounded-xl border-2 border-teal-100 bg-teal-50/60 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Wallet className="w-4 h-4 text-teal-700 flex-shrink-0" />
                <span className="text-sm font-semibold text-teal-900">{s.payoutTitle}</span>
              </div>
              <p className="text-[11px] leading-snug text-teal-800/80 mb-2">{s.payoutHelp}</p>

              <label className="block text-xs text-gray-600 mb-1">{s.payoutLabel}</label>
              {editing
                ? <>
                    <div className="flex">
                      <span className="border-2 border-r-0 border-teal-200 rounded-l-xl px-3 py-2.5 text-sm bg-white text-gray-600 flex-shrink-0">
                        🇨🇲 +237
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={(form.payoutPhone ?? "").replace(/^\+?237/, "")}
                        onChange={e => {
                          setPayoutError(null);
                          setForm({ ...form, payoutPhone: "+237" + e.target.value.replace(/\D/g, "").slice(0, 9) });
                        }}
                        placeholder="6XX XXX XXX"
                        className="flex-1 border-2 border-teal-200 focus:border-teal-500 rounded-r-xl px-3 py-2.5 text-sm outline-none transition-colors bg-white" />
                    </div>

                    {/* live operator confirmation — the seller sees it is right BEFORE saving */}
                    {(() => {
                      const raw = String(form.payoutPhone ?? "").trim();
                      if (!raw.replace(/\D/g, "").replace(/^237/, "")) return null;
                      const c = checkMomoPhone(raw);
                      return c.valid
                        ? <p className="flex items-center gap-1 text-[11px] text-teal-700 mt-1.5 font-medium">
                            <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                            {s.payoutReady(momoOperatorLabel(c.operator))}
                          </p>
                        : <p className="flex items-start gap-1 text-[11px] text-amber-700 mt-1.5">
                            <AlertCircle className="w-3 h-3 flex-shrink-0 mt-px" />
                            <span>{momoError(c.reason, l)}</span>
                          </p>;
                    })()}

                    {form.phone && form.phone !== form.payoutPhone && (
                      <button
                        type="button"
                        onClick={() => { setPayoutError(null); setForm({ ...form, payoutPhone: form.phone ?? "" }); }}
                        className="mt-2 text-[11px] text-teal-700 underline underline-offset-2">
                        {s.payoutSame}
                      </button>
                    )}

                    {payoutError && (
                      <p className="flex items-start gap-1 text-[11px] text-red-600 mt-1.5 font-medium">
                        <AlertCircle className="w-3 h-3 flex-shrink-0 mt-px" />
                        <span>{payoutError}</span>
                      </p>
                    )}
                  </>
                : (() => {
                    const c = checkMomoPhone(profile.payoutPhone ?? "");
                    return c.valid
                      ? <p className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                          {profile.payoutPhone}
                          <span className="text-[11px] text-teal-700 font-normal">
                            · {momoOperatorLabel(c.operator)}
                          </span>
                        </p>
                      : <p className="flex items-start gap-1 text-sm text-amber-700 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <span>{s.payoutMissing}</span>
                        </p>;
                  })()
              }
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <MapPin className="w-3 h-3" />{s.location}
              </label>
              {editing
                ? <input
                    value={form.location ?? ""}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder={s.locationPh}
                    className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors" />
                : <p className="text-gray-900 font-medium text-sm">{profile.location || s.notSet}</p>
              }
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">{s.bio}</label>
              {editing
                ? <textarea
                    value={form.bio ?? ""}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    rows={2}
                    placeholder={s.bioPh}
                    className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-colors" />
                : <p className="text-gray-900 font-medium text-sm">{profile.bio}</p>
              }
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">{s.quickLinks}</h3>
          <div className="space-y-1">
            {quickLinks.map(([label, route]) => (
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

        {/* Language selector (FIX130 — replaces the removed Post an Ad link) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            {({ en: '\u{1F310} Language', fr: '\u{1F310} Langue', pidgin: '\u{1F310} Language', ar: '\u{1F310} \u0627\u0644\u0644\u063A\u0629', ff: '\u{1F310} \u0110emngal' } as Record<string, string>)[lang] ?? '\u{1F310} Language'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {([
              { set: 'en',  match: 'en',     label: 'English' },
              { set: 'fr',  match: 'fr',     label: 'Fran\u00E7ais' },
              { set: 'pcm', match: 'pidgin', label: 'Pidgin' },
              { set: 'ar',  match: 'ar',     label: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629' },
              { set: 'ff',  match: 'ff',     label: 'Fulfulde' },
            ] as Array<{ set: string; match: string; label: string }>).map((L) => (
              <button
                key={L.set}
                onClick={() => setLanguage(L.set as Parameters<typeof setLanguage>[0])}
                className={`px-3 py-3 rounded-xl text-sm font-semibold border-2 transition-colors ${
                  lang === L.match
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}>
                {L.label}
              </button>
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">{s.account}</h3>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-3 text-red-600 text-sm font-medium hover:bg-red-50 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" />
            {s.signOut}
          </button>
        </div>

      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__PROFILE__COMPLETE
// BAMBEH_END_TOKEN__PROFILE_FIX354__COMPLETE
