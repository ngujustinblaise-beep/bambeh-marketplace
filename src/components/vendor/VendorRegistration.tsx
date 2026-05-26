/**
 * src/components/vendor/VendorRegistration.tsx
 * Bambeh Marketplace — Vendor Registration Form
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useCallback } from "react";
import { Store, MapPin, Phone, Mail, Tag, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { createVendorProfile } from "@/services/vendor.service";

interface VendorRegistrationProps {
  userId: string;
  onSuccess?: (vendorId: string) => void;
  onCancel?: () => void;
  className?: string;
}

interface FormState {
  storeName: string;
  storeDescription: string;
  category: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  website: string;
}

const CATEGORIES = [
  "Électronique", "Mode & Vêtements", "Alimentation", "Agriculture",
  "Meubles", "Santé & Beauté", "Sports", "Livres", "Services",
  "Véhicules", "Immobilier", "Autre",
];

const CAMEROON_CITIES = [
  "Yaoundé", "Douala", "Garoua", "Bamenda", "Maroua",
  "Bafoussam", "Ngaoundéré", "Kumba", "Nkongsamba", "Limbe",
];

const VendorRegistration: React.FC<VendorRegistrationProps> = ({
  userId,
  onSuccess,
  onCancel,
  className = "",
}) => {
  const [form, setForm] = useState<FormState>({
    storeName: "",
    storeDescription: "",
    category: "",
    city: "",
    region: "",
    phone: "",
    email: "",
    website: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  const updateField = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setError(null);
      },
    []
  );

  const validateStep1 = (): string | null => {
    if (!form.storeName.trim()) return "Le nom de la boutique est obligatoire";
    if (form.storeName.trim().length < 3) return "Le nom doit contenir au moins 3 caractères";
    if (!form.category) return "Veuillez sélectionner une catégorie";
    return null;
  };

  const validateStep2 = (): string | null => {
    if (!form.city) return "Veuillez sélectionner votre ville";
    if (!form.phone.trim()) return "Le numéro de téléphone est obligatoire";
    if (!form.email.trim()) return "L'email est obligatoire";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return "Email invalide";
    return null;
  };

  const handleNext = useCallback(() => {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setStep(2);
  }, [form]);

  const handleSubmit = useCallback(async () => {
    const err = validateStep2();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { success: ok, id, error: apiError } = await createVendorProfile(userId, {
        storeName: form.storeName.trim(),
        storeDescription: form.storeDescription.trim(),
        category: form.category,
        city: form.city,
        region: form.region || form.city,
        country: "Cameroon",
        phone: form.phone.trim(),
        email: form.email.trim(),
        website: form.website.trim() || undefined,
      });

      if (!ok || apiError) {
        setError(apiError ?? "Erreur lors de la création de la boutique");
        return;
      }

      setSuccess(true);
      if (id) onSuccess?.(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }, [form, userId, onSuccess]);

  if (success) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Boutique créée avec succès!</h2>
        <p className="text-sm text-gray-500">
          Votre boutique Bambeh est maintenant active. Commencez à ajouter vos produits!
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              {s}
            </div>
            {s < 2 && (
              <div className={`flex-1 h-0.5 ${step > s ? "bg-teal-600" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Store Info */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Créer votre boutique</h2>
            <p className="text-sm text-gray-500">Étape 1: Informations de la boutique</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la boutique *
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
              <div className="px-3 py-2.5 bg-gray-50 border-r border-gray-300">
                <Store className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={form.storeName}
                onChange={updateField("storeName")}
                placeholder="Ma Boutique Bambeh"
                className="flex-1 px-3 py-2.5 outline-none text-sm bg-white"
                maxLength={60}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie *
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-teal-500">
              <div className="px-3 py-2.5 bg-gray-50 border-r border-gray-300">
                <Tag className="w-4 h-4 text-gray-400" />
              </div>
              <select
                value={form.category}
                onChange={updateField("category")}
                className="flex-1 px-3 py-2.5 outline-none text-sm bg-white"
              >
                <option value="">Sélectionner une catégorie</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description de la boutique
            </label>
            <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:border-teal-500">
              <div className="flex items-start px-3 pt-2.5 bg-gray-50 border-b border-gray-200">
                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
              </div>
              <textarea
                value={form.storeDescription}
                onChange={updateField("storeDescription")}
                placeholder="Décrivez votre boutique, vos produits et services..."
                rows={3}
                className="w-full px-3 py-2.5 outline-none text-sm resize-none"
                maxLength={300}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">
              {form.storeDescription.length}/300
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Contact Info */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Informations de contact</h2>
            <p className="text-sm text-gray-500">Étape 2: Localisation et contact</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-teal-500">
              <div className="px-3 py-2.5 bg-gray-50 border-r border-gray-300">
                <MapPin className="w-4 h-4 text-gray-400" />
              </div>
              <select
                value={form.city}
                onChange={updateField("city")}
                className="flex-1 px-3 py-2.5 outline-none text-sm bg-white"
              >
                <option value="">Sélectionner votre ville</option>
                {CAMEROON_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-teal-500">
              <div className="px-3 py-2.5 bg-gray-50 border-r border-gray-300">
                <Phone className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="tel"
                value={form.phone}
                onChange={updateField("phone")}
                placeholder="+237 6XX XXX XXX"
                className="flex-1 px-3 py-2.5 outline-none text-sm bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-teal-500">
              <div className="px-3 py-2.5 bg-gray-50 border-r border-gray-300">
                <Mail className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="email"
                value={form.email}
                onChange={updateField("email")}
                placeholder="boutique@example.com"
                className="flex-1 px-3 py-2.5 outline-none text-sm bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={loading}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Retour
          </button>
        )}

        {step === 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors"
          >
            Continuer
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Création..." : "Créer ma boutique"}
          </button>
        )}
      </div>

      {onCancel && step === 1 && (
        <button
          type="button"
          onClick={onCancel}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
        >
          Annuler
        </button>
      )}
    </div>
  );
};

export default VendorRegistration;
