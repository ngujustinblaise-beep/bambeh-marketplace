/**
 * src/pages/SellVehicle.tsx — Bambeh Marketplace
 * Full vehicle listing form: multilingual, Supabase storage image upload,
 * category, price, location, phone, description — zero errors.
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Car, Loader2, CheckCircle2, ImagePlus,
  X, MapPin, Phone, AlignLeft, Tag, Gauge, Fuel,
  Cog, Calendar, Users, Palette, DollarSign, AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/hooks/useAppLang";

// ─────────────────────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────────────────────
const I18N: Record<string, Record<string, string>> = {
  en: {
    pageTitle: "Sell Your Vehicle",
    pageSubtitle: "Reach thousands of buyers across Cameroon",
    back: "Vehicles",
    photos: "Photos",
    photosHint: "Add up to 6 photos. First photo is the cover.",
    addPhoto: "Add Photo",
    title: "Title *",
    titlePlaceholder: "e.g. Toyota Camry 2020",
    category: "Category *",
    price: "Price (XAF) *",
    pricePlaceholder: "e.g. 8500000",
    location: "Location *",
    locationPlaceholder: "e.g. Yaoundé, Bastos",
    phone: "Contact Phone *",
    phonePlaceholder: "e.g. +237 6XX XXX XXX",
    description: "Description",
    descPlaceholder: "Describe your vehicle — condition, history, features, reason for selling…",
    year: "Year",
    yearPlaceholder: "e.g. 2020",
    mileage: "Mileage",
    mileagePlaceholder: "e.g. 45,000 km",
    fuel: "Fuel Type",
    transmission: "Transmission",
    color: "Colour",
    colorPlaceholder: "e.g. Silver",
    seats: "Seats",
    seatsPlaceholder: "e.g. 5",
    submit: "Post Listing",
    submitting: "Posting…",
    success: "Your vehicle has been listed!",
    successHint: "Buyers can now find and contact you.",
    viewListing: "View My Listing",
    postAnother: "Post Another",
    loginRequired: "You must be logged in to post a listing.",
    login: "Log In",
    errorGeneric: "Something went wrong. Please try again.",
    required: "Please fill in all required fields.",
    selectCategory: "Select category",
    selectFuel: "Select fuel type",
    selectTransmission: "Select transmission",
    petrol: "Petrol",
    diesel: "Diesel",
    electric: "Electric",
    hybrid: "Hybrid",
    automatic: "Automatic",
    manual: "Manual",
    vehicleDetails: "Vehicle Details",
    contactInfo: "Contact & Location",
    uploadingImages: "Uploading images…",
    imageError: "Failed to upload one or more images.",
  },
  fr: {
    pageTitle: "Vendre votre véhicule",
    pageSubtitle: "Atteignez des milliers d'acheteurs à travers le Cameroun",
    back: "Véhicules",
    photos: "Photos",
    photosHint: "Ajoutez jusqu'à 6 photos. La première est la couverture.",
    addPhoto: "Ajouter une photo",
    title: "Titre *",
    titlePlaceholder: "ex: Toyota Camry 2020",
    category: "Catégorie *",
    price: "Prix (XAF) *",
    pricePlaceholder: "ex: 8500000",
    location: "Localisation *",
    locationPlaceholder: "ex: Yaoundé, Bastos",
    phone: "Téléphone *",
    phonePlaceholder: "ex: +237 6XX XXX XXX",
    description: "Description",
    descPlaceholder: "Décrivez votre véhicule — état, historique, caractéristiques, raison de la vente…",
    year: "Année",
    yearPlaceholder: "ex: 2020",
    mileage: "Kilométrage",
    mileagePlaceholder: "ex: 45 000 km",
    fuel: "Carburant",
    transmission: "Transmission",
    color: "Couleur",
    colorPlaceholder: "ex: Argenté",
    seats: "Sièges",
    seatsPlaceholder: "ex: 5",
    submit: "Publier l'annonce",
    submitting: "Publication…",
    success: "Votre véhicule est maintenant en ligne!",
    successHint: "Les acheteurs peuvent vous trouver et vous contacter.",
    viewListing: "Voir mon annonce",
    postAnother: "Publier une autre",
    loginRequired: "Vous devez être connecté pour publier une annonce.",
    login: "Se connecter",
    errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
    required: "Veuillez remplir tous les champs obligatoires.",
    selectCategory: "Sélectionner une catégorie",
    selectFuel: "Sélectionner le carburant",
    selectTransmission: "Sélectionner la transmission",
    petrol: "Essence",
    diesel: "Diesel",
    electric: "Électrique",
    hybrid: "Hybride",
    automatic: "Automatique",
    manual: "Manuel",
    vehicleDetails: "Détails du véhicule",
    contactInfo: "Contact & Localisation",
    uploadingImages: "Chargement des images…",
    imageError: "Impossible de charger une ou plusieurs images.",
  },
  ha: {
    pageTitle: "Sayar da Abin Hawanku",
    pageSubtitle: "Kai ga dubun-dubun masu siya ko'ina a Kamaru",
    back: "Ababen Hawa",
    photos: "Hotuna",
    photosHint: "Ƙara zuwa hoto 6. Na farko shine murfin.",
    addPhoto: "Ƙara Hoto",
    title: "Take *",
    titlePlaceholder: "misali: Toyota Camry 2020",
    category: "Rukunin *",
    price: "Farashi (XAF) *",
    pricePlaceholder: "misali: 8500000",
    location: "Wurin *",
    locationPlaceholder: "misali: Yaoundé, Bastos",
    phone: "Waya *",
    phonePlaceholder: "misali: +237 6XX XXX XXX",
    description: "Bayanin",
    descPlaceholder: "Bayyana abin hawanka…",
    year: "Shekara",
    yearPlaceholder: "misali: 2020",
    mileage: "Nisan Tafiya",
    mileagePlaceholder: "misali: 45,000 km",
    fuel: "Nau'in Man Fetur",
    transmission: "Watsa Iko",
    color: "Launi",
    colorPlaceholder: "misali: Azurfa",
    seats: "Kujeru",
    seatsPlaceholder: "misali: 5",
    submit: "Buga Lissafin",
    submitting: "Ana buga…",
    success: "An lissafa abin hawanku!",
    successHint: "Masu siya yanzu za su iya samun ku.",
    viewListing: "Duba Lissafina",
    postAnother: "Buga Wani",
    loginRequired: "Dole ne ku shiga don buga lissafi.",
    login: "Shiga",
    errorGeneric: "Wani abu ya fita. Da fatan a sake gwadawa.",
    required: "Da fatan a cika duk filayen da ake bukata.",
    selectCategory: "Zaɓi rukuni",
    selectFuel: "Zaɓi nau'in man fetur",
    selectTransmission: "Zaɓi watsa iko",
    petrol: "Petrol",
    diesel: "Dizal",
    electric: "Lantarki",
    hybrid: "Hybrid",
    automatic: "Atomatik",
    manual: "Hannu",
    vehicleDetails: "Bayanan Abin Hawa",
    contactInfo: "Waya & Wuri",
    uploadingImages: "Ana loda hotuna…",
    imageError: "Kuskure wajen loda hotunan.",
  },
  ar: {
    pageTitle: "بيع مركبتك",
    pageSubtitle: "تواصل مع آلاÙ المشترين Ùي الكاميرون",
    back: "المركبات",
    photos: "الصور",
    photosHint: "أضÙ حتى 6 صور. الصورة الأولى هي الغلاÙ.",
    addPhoto: "إضاÙة صورة",
    title: "العنوان *",
    titlePlaceholder: "مثال: Toyota Camry 2020",
    category: "الÙئة *",
    price: "السعر (XAF) *",
    pricePlaceholder: "مثال: 8500000",
    location: "الموقع *",
    locationPlaceholder: "مثال: ياوندي، باستوس",
    phone: "رقم الهاتÙ *",
    phonePlaceholder: "مثال: +237 6XX XXX XXX",
    description: "الوصÙ",
    descPlaceholder: "صÙ مركبتك — الحالة، التاريخ، المميزات، سبب البيع…",
    year: "السنة",
    yearPlaceholder: "مثال: 2020",
    mileage: "عداد المساÙة",
    mileagePlaceholder: "مثال: 45,000 كم",
    fuel: "نوع الوقود",
    transmission: "ناقل الحركة",
    color: "اللون",
    colorPlaceholder: "مثال: Ùضي",
    seats: "المقاعد",
    seatsPlaceholder: "مثال: 5",
    submit: "نشر الإعلان",
    submitting: "جارÙ النشر…",
    success: "تم نشر مركبتك!",
    successHint: "يمكن للمشترين الآن الوصول إليك والتواصل معك.",
    viewListing: "عرض إعلاني",
    postAnother: "نشر إعلان آخر",
    loginRequired: "يجب تسجيل الدخول لنشر إعلان.",
    login: "تسجيل الدخول",
    errorGeneric: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    required: "يرجى ملء جميع الحقول المطلوبة.",
    selectCategory: "اختر الÙئة",
    selectFuel: "اختر نوع الوقود",
    selectTransmission: "اختر ناقل الحركة",
    petrol: "بنزين",
    diesel: "ديزل",
    electric: "كهربائي",
    hybrid: "هجين",
    automatic: "أوتوماتيك",
    manual: "يدوي",
    vehicleDetails: "تÙاصيل المركبة",
    contactInfo: "معلومات الاتصال والموقع",
    uploadingImages: "جارÙ رÙع الصور…",
    imageError: "Ùشل رÙع صورة واحدة أو أكثر.",
  },
  pcm: {
    pageTitle: "Sell Your Motor",
    pageSubtitle: "Reach plenty buyers all over Cameroon",
    back: "Motors",
    photos: "Photos",
    photosHint: "Add up to 6 photos. First photo na cover.",
    addPhoto: "Add Photo",
    title: "Title *",
    titlePlaceholder: "e.g. Toyota Camry 2020",
    category: "Category *",
    price: "Price (XAF) *",
    pricePlaceholder: "e.g. 8500000",
    location: "Location *",
    locationPlaceholder: "e.g. Yaoundé, Bastos",
    phone: "Phone Number *",
    phonePlaceholder: "e.g. +237 6XX XXX XXX",
    description: "Description",
    descPlaceholder: "Describe your motor — condition, story, features, why you dey sell…",
    year: "Year",
    yearPlaceholder: "e.g. 2020",
    mileage: "Mileage",
    mileagePlaceholder: "e.g. 45,000 km",
    fuel: "Fuel Type",
    transmission: "Transmission",
    color: "Colour",
    colorPlaceholder: "e.g. Silver",
    seats: "Seats",
    seatsPlaceholder: "e.g. 5",
    submit: "Post Ad",
    submitting: "Posting…",
    success: "Your motor don enter the platform!",
    successHint: "Buyers go see you now.",
    viewListing: "See My Post",
    postAnother: "Post Another",
    loginRequired: "You must log in before you post.",
    login: "Log In",
    errorGeneric: "Something go wrong. Try again.",
    required: "Fill all the required fields.",
    selectCategory: "Select category",
    selectFuel: "Select fuel type",
    selectTransmission: "Select transmission",
    petrol: "Petrol",
    diesel: "Diesel",
    electric: "Electric",
    hybrid: "Hybrid",
    automatic: "Automatic",
    manual: "Manual",
    vehicleDetails: "Motor Details",
    contactInfo: "Contact & Location",
    uploadingImages: "Uploading photos…",
    imageError: "Problem uploading photos.",
  },
  ff: {
    pageTitle: "Yillitu Laaɓal Maa",
    pageSubtitle: "Njangu tumaraneeɓe ko'e Kameruun",
    back: "Laaɓe",
    photos: "Sawru",
    photosHint: "Ɓeydu sawru haa 6. Adannde wonata koloore.",
    addPhoto: "Ɓeydu Sawru",
    title: "Tiitoonde *",
    titlePlaceholder: "Toyota Camry 2020",
    category: "Sifo *",
    price: "Njaru (XAF) *",
    pricePlaceholder: "8500000",
    location: "Wuro *",
    locationPlaceholder: "Yaoundé, Bastos",
    phone: "Wowloore *",
    phonePlaceholder: "+237 6XX XXX XXX",
    description: "Tinndi",
    descPlaceholder: "Tinndu laaɓal maa…",
    year: "Hitaande",
    yearPlaceholder: "2020",
    mileage: "Laawol",
    mileagePlaceholder: "45,000 km",
    fuel: "Susiyel",
    transmission: "Watse",
    color: "Ranynde",
    colorPlaceholder: "Haaɗdi",
    seats: "Tooɗe",
    seatsPlaceholder: "5",
    submit: "Jaɓdu Jaŋtere",
    submitting: "Yillitee…",
    success: "Laaɓal maa jaŋteraa!",
    successHint: "Soodotooɓe mbaawi yiytude maa.",
    viewListing: "Yiy Jaŋtere Am",
    postAnother: "Jaɓdu Goɗɗo",
    loginRequired: "Tiimto ko adii jaɓdude.",
    login: "Tiimto",
    errorGeneric: "Ko woɗɗaani hawi. Ngaloo kadi.",
    required: "Ɓeydu batu keeriiɗe.",
    selectCategory: "Suɓo sifo",
    selectFuel: "Suɓo susiyel",
    selectTransmission: "Suɓo watse",
    petrol: "Petrol",
    diesel: "Diesel",
    electric: "Elektrik",
    hybrid: "Hybrid",
    automatic: "Otomatik",
    manual: "Juuɗe",
    vehicleDetails: "Bayɗe Laaɓal",
    contactInfo: "Wowloore & Wuro",
    uploadingImages: "Sawruuje njilloyinee…",
    imageError: "Sawru ujaaki.",
  },
};

const CATEGORIES = ["Sedan", "SUV", "Pickup", "Motorcycle", "Van", "Minibus", "Truck", "Other"];

// ─────────────────────────────────────────────────────────────
// Form state shape
// ─────────────────────────────────────────────────────────────
interface FormState {
  title:        string;
  category:     string;
  price:        string;
  location:     string;
  phone:        string;
  description:  string;
  year:         string;
  mileage:      string;
  fuel:         string;
  transmission: string;
  color:        string;
  seats:        string;
}

const EMPTY_FORM: FormState = {
  title:"", category:"", price:"", location:"", phone:"",
  description:"", year:"", mileage:"", fuel:"", transmission:"",
  color:"", seats:"",
};

// ─────────────────────────────────────────────────────────────
// Upload images to Supabase Storage
// ─────────────────────────────────────────────────────────────
async function uploadImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const ext  = file.name.split(".").pop() || "jpg";
    const path = `vehicles/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("vehicle-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("vehicle-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const SellVehicle: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const lang     = (useLang() || "en") as string;
  const tr       = (key: string) => (I18N[lang] || I18N.en)[key] || I18N.en[key] || key;
  const isRtl    = lang === "ar";

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form,             setForm]             = useState<FormState>(EMPTY_FORM);
  const [imageFiles,       setImageFiles]       = useState<File[]>([]);
  const [imagePreviews,    setImagePreviews]    = useState<string[]>([]);
  const [submitting,       setSubmitting]       = useState(false);
  const [uploadingImgs,    setUploadingImgs]    = useState(false);
  const [error,            setError]            = useState<string | null>(null);
  const [successId,        setSuccessId]        = useState<string | null>(null);

  // ── Field update helper ─────────────────────────────────────
  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // ── Image picker ────────────────────────────────────────────
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 6 - imageFiles.length;
    const toAdd = files.slice(0, remaining);
    setImageFiles((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(f);
    });
    // reset input so same file can be re-picked
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (i: number) => {
    setImageFiles((prev)    => prev.filter((_, idx) => idx !== i));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title || !form.category || !form.price || !form.location || !form.phone) {
      setError(tr("required"));
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload images
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingImgs(true);
        try {
          imageUrls = await uploadImages(imageFiles);
        } catch (imgErr: any) {
          console.warn("[SellVehicle] image upload partial fail:", imgErr);
          setError(tr("imageError"));
          // continue without images rather than blocking the listing
        } finally {
          setUploadingImgs(false);
        }
      }

      // 2. Expire 30 days from now
      const expiresAt = new Date(Date.now() + 30 * 86_400_000).toISOString();

      // 3. Insert listing
      const { data, error: sbErr } = await supabase
        .from("listings")
        .insert({
          title:        form.title.trim(),
          type:         "vehicle",
          status:       "active",
          price:        parseInt(form.price.replace(/\D/g, ""), 10) || 0,
          location:     form.location.trim(),
          category:     form.category,
          images:       imageUrls,
          contact_phone:form.phone.trim(),
          contact_name: (user as any)?.user_metadata?.full_name || user?.email || "",
          user_id:      user!.id,
          description:  form.description.trim(),
          expires_at:   expiresAt,
          extra: {
            year:         form.year         ? parseInt(form.year, 10) : undefined,
            mileage:      form.mileage.trim()      || undefined,
            fuel:         form.fuel                || undefined,
            transmission: form.transmission        || undefined,
            color:        form.color.trim()        || undefined,
            seats:        form.seats ? parseInt(form.seats, 10) : undefined,
          },
        })
        .select("id")
        .single();

      if (sbErr) throw sbErr;
      setSuccessId(data.id);
    } catch (err: any) {
      console.error("[SellVehicle] submit error:", err);
      setError(err?.message || tr("errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Not logged in
  // ─────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center max-w-sm w-full">
          <Car className="w-14 h-14 text-green-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{tr("pageTitle")}</h2>
          <p className="text-gray-500 text-sm mb-6">{tr("loginRequired")}</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 active:scale-95 transition-all"
          >
            {tr("login")}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Success
  // ─────────────────────────────────────────────────────────────
  if (successId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center max-w-sm w-full">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{tr("success")}</h2>
          <p className="text-gray-500 text-sm mb-6">{tr("successHint")}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/vehicles/${successId}`)}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 active:scale-95 transition-all"
            >
              {tr("viewListing")}
            </button>
            <button
              onClick={() => { setSuccessId(null); setForm(EMPTY_FORM); setImageFiles([]); setImagePreviews([]); }}
              className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 active:scale-95 transition-all"
            >
              {tr("postAnother")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Form
  // ─────────────────────────────────────────────────────────────
  const inputClass = `w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none
    focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white placeholder-gray-400`;
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 pb-32" dir={isRtl ? "rtl" : "ltr"}>

      {/* ── Top bar ── */}
      <div className={`sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
        <button
          onClick={() => navigate("/vehicles")}
          className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          aria-label={tr("back")}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900">{tr("pageTitle")}</h1>
          <p className="text-xs text-gray-500">{tr("pageSubtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* ── Error banner ── */}
        {error && (
          <div className={`flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm ${isRtl ? "flex-row-reverse" : ""}`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* ── Photos ── */}
        <div>
          <p className={`text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <ImagePlus className="w-4 h-4 text-green-600" /> {tr("photos")}
          </p>
          <p className="text-xs text-gray-400 mb-3">{tr("photosHint")}</p>

          <div className="flex flex-wrap gap-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200">
                <img src={src} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-green-600/80 text-white text-[9px] text-center py-0.5">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {imageFiles.length < 6 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-[10px]">{tr("addPhoto")}</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImagePick}
          />
        </div>

        {/* ── Basic info ── */}
        <div className="bg-white rounded-2xl border p-4 space-y-4">

          {/* Title */}
          <div>
            <label className={labelClass}>
              <Tag className="w-3.5 h-3.5 inline mr-1.5 text-green-600" />{tr("title")}
            </label>
            <input className={inputClass} value={form.title} onChange={set("title")} placeholder={tr("titlePlaceholder")} required />
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>{tr("category")}</label>
            <select className={inputClass} value={form.category} onChange={set("category")} required>
              <option value="">{tr("selectCategory")}</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className={labelClass}>
              <DollarSign className="w-3.5 h-3.5 inline mr-1.5 text-green-600" />{tr("price")}
            </label>
            <input
              className={inputClass}
              value={form.price}
              onChange={set("price")}
              placeholder={tr("pricePlaceholder")}
              inputMode="numeric"
              required
            />
          </div>
        </div>

        {/* ── Vehicle details ── */}
        <div className="bg-white rounded-2xl border p-4 space-y-4">
          <p className={`text-sm font-bold text-gray-700 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Car className="w-4 h-4 text-green-600" /> {tr("vehicleDetails")}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Year */}
            <div>
              <label className={labelClass}>
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-green-600" />{tr("year")}
              </label>
              <input className={inputClass} value={form.year} onChange={set("year")} placeholder={tr("yearPlaceholder")} inputMode="numeric" />
            </div>

            {/* Seats */}
            <div>
              <label className={labelClass}>
                <Users className="w-3.5 h-3.5 inline mr-1 text-green-600" />{tr("seats")}
              </label>
              <input className={inputClass} value={form.seats} onChange={set("seats")} placeholder={tr("seatsPlaceholder")} inputMode="numeric" />
            </div>
          </div>

          {/* Mileage */}
          <div>
            <label className={labelClass}>
              <Gauge className="w-3.5 h-3.5 inline mr-1 text-green-600" />{tr("mileage")}
            </label>
            <input className={inputClass} value={form.mileage} onChange={set("mileage")} placeholder={tr("mileagePlaceholder")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fuel */}
            <div>
              <label className={labelClass}>
                <Fuel className="w-3.5 h-3.5 inline mr-1 text-green-600" />{tr("fuel")}
              </label>
              <select className={inputClass} value={form.fuel} onChange={set("fuel")}>
                <option value="">{tr("selectFuel")}</option>
                <option value="Petrol">{tr("petrol")}</option>
                <option value="Diesel">{tr("diesel")}</option>
                <option value="Electric">{tr("electric")}</option>
                <option value="Hybrid">{tr("hybrid")}</option>
              </select>
            </div>

            {/* Transmission */}
            <div>
              <label className={labelClass}>
                <Cog className="w-3.5 h-3.5 inline mr-1 text-green-600" />{tr("transmission")}
              </label>
              <select className={inputClass} value={form.transmission} onChange={set("transmission")}>
                <option value="">{tr("selectTransmission")}</option>
                <option value="Automatic">{tr("automatic")}</option>
                <option value="Manual">{tr("manual")}</option>
              </select>
            </div>
          </div>

          {/* Colour */}
          <div>
            <label className={labelClass}>
              <Palette className="w-3.5 h-3.5 inline mr-1 text-green-600" />{tr("color")}
            </label>
            <input className={inputClass} value={form.color} onChange={set("color")} placeholder={tr("colorPlaceholder")} />
          </div>
        </div>

        {/* ── Contact & location ── */}
        <div className="bg-white rounded-2xl border p-4 space-y-4">
          <p className={`text-sm font-bold text-gray-700 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Phone className="w-4 h-4 text-green-600" /> {tr("contactInfo")}
          </p>

          {/* Location */}
          <div>
            <label className={labelClass}>
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-green-600" />{tr("location")}
            </label>
            <input className={inputClass} value={form.location} onChange={set("location")} placeholder={tr("locationPlaceholder")} required />
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>
              <Phone className="w-3.5 h-3.5 inline mr-1 text-green-600" />{tr("phone")}
            </label>
            <input
              className={inputClass}
              value={form.phone}
              onChange={set("phone")}
              placeholder={tr("phonePlaceholder")}
              type="tel"
              required
            />
          </div>
        </div>

        {/* ── Description ── */}
        <div className="bg-white rounded-2xl border p-4">
          <label className={`${labelClass} flex items-center gap-2`}>
            <AlignLeft className="w-3.5 h-3.5 text-green-600" />{tr("description")}
          </label>
          <textarea
            className={`${inputClass} h-32 resize-none`}
            value={form.description}
            onChange={set("description")}
            placeholder={tr("descPlaceholder")}
          />
        </div>

        {/* ── Submit ── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 pt-3 pb-6 z-[60]">
          <div className="max-w-2xl mx-auto">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-base
                         hover:bg-green-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {uploadingImgs ? tr("uploadingImages") : tr("submitting")}
                </>
              ) : (
                <>
                  <Car className="w-5 h-5" />
                  {tr("submit")}
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default SellVehicle;




