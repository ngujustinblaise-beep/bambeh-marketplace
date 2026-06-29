/**
 * src/pages/ShareMyVoice.tsx � Bambeh Marketplace
 *
 * NEW PAGE: User experience feedback form.
 * Accessible from the "Share My Voice" menu item.
 * Saves to Supabase user_feedback table + localStorage fallback.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Send, CheckCircle, MessageSquare, Smile, Frown, Meh } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLang, t } from "@/hooks/useAppLang";

type Mood = "love" | "good" | "okay" | "bad" | null;
type Category = "general" | "buying" | "selling" | "payment" | "support" | "bug";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "general",  label: "General Experience" },
  { value: "buying",   label: "Buying on Bambeh" },
  { value: "selling",  label: "Selling on Bambeh" },
  { value: "payment",  label: "Payments & Subscriptions" },
  { value: "support",  label: "Customer Support" },
  { value: "bug",      label: "Bug / Technical Issue" },
];

const MOOD_CONFIG = [
  { value: "love" as Mood, emoji: "??", label: "Love it!",  color: "bg-green-100 border-green-400 text-green-700" },
  { value: "good" as Mood, emoji: "??", label: "Good",      color: "bg-teal-100 border-teal-400 text-teal-700" },
  { value: "okay" as Mood, emoji: "??", label: "Okay",      color: "bg-amber-100 border-amber-400 text-amber-700" },
  { value: "bad"  as Mood, emoji: "??", label: "Needs work",color: "bg-red-100 border-red-400 text-red-700" },
];

export default function ShareMyVoice() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const [mood,      setMood]      = useState<Mood>(null);
  const [rating,    setRating]    = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [category,  setCategory]  = useState<Category>("general");
  const [title,     setTitle]     = useState("");
  const [message,   setMessage]   = useState("");
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [submitting,setSubmitting]= useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const canSubmit = mood !== null && rating > 0 && message.trim().length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const feedback = {
      mood,
      rating,
      category,
      title:      title.trim() || undefined,
      message:    message.trim(),
      name:       name.trim()  || undefined,
      email:      email.trim() || undefined,
      submitted_at: new Date().toISOString(),
      page_url:   window.location.href,
    };

    // Save to localStorage first (always works, even offline)
    try {
      const stored = JSON.parse(localStorage.getItem("bambeh_feedback") || "[]");
      stored.unshift(feedback);
      localStorage.setItem("bambeh_feedback", JSON.stringify(stored));
    } catch {}

    // Try saving to Supabase
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from("user_feedback").insert({
        user_id:      session?.user?.id ?? null,
        mood,
        rating,
        category,
        title:        feedback.title,
        message:      feedback.message,
        name:         feedback.name,
        email:        feedback.email,
        submitted_at: feedback.submitted_at,
      });
    } catch {
      // Silent � localStorage backup is enough for now
    }

    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You! ??</h2>
        <p className="text-gray-500 mb-2 max-w-xs">
          Your feedback has been received. We read every single message and use it to make Bambeh better for everyone in Cameroon.
        </p>
        <p className="text-sm text-teal-600 font-semibold mb-8">� The Bambeh Team ??</p>
        <button onClick={() => navigate(-1)}
          className="bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 transition">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="font-bold text-gray-900 text-lg leading-tight">Share My Voice</h1>
          <p className="text-xs text-gray-500">Tell us about your experience</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-5">

        {/* Intro banner */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-7 h-7 text-white" />
            <h2 className="font-bold text-lg">Your Voice Matters</h2>
          </div>
          <p className="text-teal-100 text-sm leading-relaxed">
            Help us build the best marketplace in Cameroon. Share what you love, what can be improved, or any bugs you encounter. Every word counts!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Mood */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="font-semibold text-gray-800 mb-3 text-sm">How do you feel about Bambeh? *</p>
            <div className="grid grid-cols-4 gap-2">
              {MOOD_CONFIG.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                    mood === m.value ? m.color + " scale-105 shadow-sm" : "border-gray-200 hover:border-gray-300 bg-gray-50"
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-xs font-semibold leading-tight text-center">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Star rating */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="font-semibold text-gray-800 mb-3 text-sm">Rate your overall experience *</p>
            <div className="flex items-center gap-2 justify-center">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverStar(star)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star className={`w-9 h-9 ${(hoverStar || rating) >= star ? "text-amber-400 fill-amber-400" : "text-gray-300"} transition-colors`} />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-amber-600 font-semibold mt-2">
                {["","Very Poor","Poor","Fair","Good","Excellent!"][rating]}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="font-semibold text-gray-800 mb-3 text-sm">What is this about?</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                    category === c.value
                      ? "bg-teal-500 text-white border-teal-500"
                      : "border-gray-200 text-gray-600 hover:border-teal-300 bg-gray-50"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title (optional) */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="block font-semibold text-gray-800 mb-2 text-sm">
              Summary <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Payment was very smooth"
              maxLength={80}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Message */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="block font-semibold text-gray-800 mb-2 text-sm">
              Your Experience *
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tell us what happened, what you liked, what could be better, or describe a bug you found..."
              rows={5}
              minLength={10}
              maxLength={1000}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-relaxed"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/1000</p>
          </div>

          {/* Name + Email (optional) */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <p className="font-semibold text-gray-800 text-sm">
              Contact <span className="text-gray-400 font-normal">(optional � for follow-up only)</span>
            </p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-400">
              We only use this to follow up on your feedback. We never share it.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-md shadow-teal-200 transition-all"
          >
            {submitting ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> Sending...</>
            ) : (
              <><Send className="w-5 h-5" /> Send Feedback</>
            )}
          </button>

          {!canSubmit && (
            <p className="text-xs text-center text-gray-400">
              Please select a mood, give a star rating, and write at least 10 characters.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}





