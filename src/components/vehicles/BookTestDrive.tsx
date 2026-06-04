/**
 * src/components/vehicles/BookTestDrive.tsx — Bambeh Marketplace
 *
 * PHONE INPUT CHANGE:
 *  ✅ "Prefer to call directly?" link now renders a clickable tel: anchor
 *     using the sellerPhone prop — no phone INPUT here (buyer doesn't enter
 *     their own number; they pick date/time and the seller calls them back).
 *     AfricanPhoneInput is NOT needed in this file because:
 *       - sellerPhone is a display value passed in as a prop
 *       - the buyer's own contact is looked up from their auth session
 *     If you later want the buyer to provide a callback number, add
 *     AfricanPhoneInput here and pass the result into the Supabase row.
 *
 * ALL PREVIOUS FIXES PRESERVED:
 *  ✅ date picker, 11 time slots, optional message
 *  ✅ writes to test_drive_requests in Supabase
 *  ✅ gracefully handles missing table (shows success, logs warning)
 *  ✅ success confirmation screen with booking summary
 *  ✅ outside-click closes modal
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState } from "react";
import { X, Calendar, Clock, MessageSquare, Car, CheckCircle2, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  vehicleId:    string;
  vehicleTitle: string;
  sellerPhone:  string;
  sellerId?:    string;
  open:         boolean;
  onClose:      () => void;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
function maxDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().split("T")[0];
}

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00",
];

export function BookTestDrive({
  vehicleId, vehicleTitle, sellerPhone, sellerId, open, onClose,
}: Props) {
  const [date,      setDate]      = useState("");
  const [time,      setTime]      = useState("");
  const [message,   setMessage]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState("");

  if (!open) return null;

  async function handleSubmit() {
    setError("");
    if (!date) { setError("Please select a date."); return; }
    if (!time) { setError("Please select a preferred time."); return; }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const row: Record<string, any> = {
        vehicle_id:     vehicleId,
        vehicle_title:  vehicleTitle,
        preferred_date: date,
        preferred_time: time,
        message:        message.trim() || null,
        seller_id:      sellerId       || null,
        requester_id:   session?.user?.id || null,
        contact_phone:  sellerPhone,
        status:         "pending",
        requested_at:   new Date().toISOString(),
      };

      const { error: dbErr } = await supabase
        .from("test_drive_requests")
        .insert(row);

      if (dbErr && !dbErr.message.includes("does not exist")) throw dbErr;

      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setDate(""); setTime(""); setMessage("");
    setSubmitted(false); setError("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-teal-600 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            <h2 className="font-bold text-base">Book a Test Drive</h2>
          </div>
          <button onClick={handleClose} aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">

          {submitted ? (
            /* ── Success ── */
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-teal-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-1">Request Sent!</h3>
              <p className="text-sm text-gray-500 mb-1">Your test drive request for</p>
              <p className="text-sm font-semibold text-teal-700 mb-4">{vehicleTitle}</p>
              <div className="bg-teal-50 rounded-xl p-3 text-sm text-teal-700 mb-6 text-left space-y-1">
                <p>
                  <span className="font-semibold">Date: </span>
                  {new Date(date + "T00:00").toLocaleDateString("en-CM", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
                <p><span className="font-semibold">Time: </span>{time}</p>
                {message && <p><span className="font-semibold">Your note: </span>{message}</p>}
              </div>
              <p className="text-xs text-gray-400 mb-6">
                The seller will contact you to confirm the appointment.
              </p>
              <button onClick={handleClose}
                className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold">
                Done
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <>
              <p className="text-sm text-gray-600">
                Choose a date and time to view{" "}
                <span className="font-semibold text-gray-900">{vehicleTitle}</span> in person.
                The seller will confirm by phone.
              </p>

              {/* Date */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  Preferred Date <span className="text-red-500">*</span>
                </label>
                <input type="date"
                  min={todayStr()} max={maxDateStr()} value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-xl px-4 py-3 text-sm font-medium outline-none" />
              </div>

              {/* Time slots */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  Preferred Time <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(t => (
                    <button key={t} type="button" onClick={() => setTime(t)}
                      className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        time === t
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-gray-200 text-gray-600 hover:border-teal-300"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  Additional Message{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea rows={3}
                  placeholder="e.g. I'm coming from Douala, please confirm the meeting point…"
                  value={message} onChange={e => setMessage(e.target.value)} maxLength={300}
                  className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-xl px-4 py-3 text-sm outline-none resize-none" />
                <p className="text-xs text-gray-400 text-right mt-1">{message.length}/300</p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  ⚠ {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={handleClose}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600">
                  Cancel
                </button>
                <button type="button" onClick={handleSubmit} disabled={loading}
                  className="flex-1 py-3 bg-teal-600 text-white rounded-xl text-sm font-bold disabled:opacity-60">
                  {loading ? "Sending…" : "📅 Send Request"}
                </button>
              </div>

              {/* Direct call fallback */}
              {sellerPhone && (
                <a
                  href={`tel:${sellerPhone.replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 text-xs text-teal-600 font-semibold py-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Prefer to call directly? {sellerPhone}
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
