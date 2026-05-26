/**
 * src/components/BookingModal.tsx
 * Bambeh Marketplace — Booking Modal
 * © 2026 Bambeh Marketplace. All rights reserved.
 */
import React, { useState } from "react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId?: string;
  itemTitle?: string;
  itemType?: "service" | "rental" | "vehicle";
  priceXAF?: number;
  sellerId?: string;
  onConfirm?: (data: BookingData) => Promise<void>;
}

interface BookingData {
  itemId: string;
  startDate: string;
  endDate?: string;
  notes: string;
  phoneNumber: string;
  totalXAF: number;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  itemId = "",
  itemTitle = "Article",
  itemType = "service",
  priceXAF = 0,
  onConfirm,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
    : 1;
  const total = itemType === "rental" ? priceXAF * days : priceXAF;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !phone) { setError("Veuillez remplir tous les champs obligatoires."); return; }
    setLoading(true);
    setError("");
    try {
      await onConfirm?.({
        itemId,
        startDate,
        endDate: endDate || startDate,
        notes,
        phoneNumber: phone,
        totalXAF: total,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Réserver</h2>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{itemTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            {itemType === "rental" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+237 6XX XXX XXX"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Précisez vos besoins..."
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Price summary */}
          <div className="bg-teal-50 rounded-xl p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {itemType === "rental" ? `${priceXAF.toLocaleString("fr-CM")} FCFA × ${days} jour(s)` : "Prix"}
              </span>
              <span className="font-bold text-teal-700 text-lg">
                {total.toLocaleString("fr-CM")} FCFA
              </span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "En cours..." : "Confirmer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
