// @ts-nocheck
/**
 * Register.tsx — Bambeh Marketplace
 * FILE LOCATION: src/pages/auth/Register.tsx
 *
 * FIXES FROM ORIGINAL:
 * 1. Added "username" field — users can now log in with username
 * 2. Added "phone number" field — users can now log in with phone
 * 3. After Supabase creates the auth user, we also write a row to
 *    the "profiles" table with username + phone so Login can find them
 * 4. Username validation: no spaces, min 3 chars, only letters/numbers/_
 * 5. Phone validation: must start with + or digits, min 8 digits
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  Eye, EyeOff, Mail, User, Lock, Phone,
  AtSign, ArrowRight, CheckCircle, AlertCircle
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // ── Form state ──────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    fullName:        "",
    username:        "",   // ← NEW
    phone:           "",   // ← NEW
    email:           "",
    password:        "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    if (!formData.fullName.trim())
      return "Full name is required";

    if (!formData.username.trim())
      return "Username is required";
    if (formData.username.length < 3)
      return "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username))
      return "Username can only contain letters, numbers, and underscores (no spaces)";

    if (!formData.phone.trim())
      return "Phone number is required";
    if (!/^\+?[0-9]{8,15}$/.test(formData.phone.replace(/\s/g, "")))
      return "Enter a valid phone number (e.g. +237612345678)";

    if (!formData.email.includes("@"))
      return "A valid email address is required";

    if (formData.password.length < 8)
      return "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match";

    return null; // no error
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError("");
    const validationError = validate();
    if (validationError) return setError(validationError);

    setIsLoading(true);
    try {
      // STEP 1 — Create the Supabase auth user (email + password)
      const result = await register(
        formData.email.trim(),
        formData.password,
        formData.fullName.trim()
      );
      if (result?.error) throw new Error(result.error);

      // STEP 2 — Get the newly created user's ID
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // STEP 3 — Write extra fields (username, phone) to the profiles table
        // This is what makes login-by-username and login-by-phone work.
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id:           user.id,
            full_name:    formData.fullName.trim(),
            username:     formData.username.trim().toLowerCase(),
            phone:        formData.phone.trim(),
            email:        formData.email.trim().toLowerCase(),
            created_at:   new Date().toISOString(),
            avatar_url:   null,
          });

        if (profileError) {
          // Profile write failed — log but don't block the user
          console.error("Profile save error:", profileError.message);
        }
      }

      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Welcome to Bambeh!</h2>
          <p className="text-gray-500 mb-2">Account created successfully.</p>
          <p className="text-gray-400 text-sm">
            You can log in with your <strong>username</strong>, <strong>phone number</strong>, or <strong>email</strong>.
          </p>
          <p className="text-gray-400 text-sm mt-1">Taking you to the marketplace...</p>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-teal-400 to-blue-500" />

        <div className="p-7">
          {/* Branding */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-200">
              <span className="text-white text-2xl font-black">B</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">Join Bambeh</h1>
            <p className="text-gray-500 text-sm mt-1">Cameroon's #1 Marketplace</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">

            {/* ── Full Name ──────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Jean Paul Mbarga"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* ── Username ───────────────────────────────────────── */}
            {/*
              NEW FIELD — this is what users will type when they log in.
              No spaces allowed. Only letters, numbers, underscores.
              Example: jean_mbarga or jpmbarga99
            */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Username <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. jean_mbarga (no spaces)"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Used to log in. Letters, numbers, underscores only. No spaces.
              </p>
            </div>

            {/* ── Phone Number ───────────────────────────────────── */}
            {/*
              NEW FIELD — users can also use their phone number to log in.
              Format: +237612345678 or 0612345678
            */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +237612345678"
                  autoComplete="tel"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                You can also use this number to log in.
              </p>
            </div>

            {/* ── Email ──────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* ── Password ───────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-gray-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ── Confirm Password ───────────────────────────────── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-gray-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ── Submit button ─────────────────────────────────── */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 disabled:opacity-50 text-white font-bold rounded-2xl py-3.5 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-200 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>
        </div>

        {/* Bottom link */}
        <div className="border-t border-gray-100 px-7 py-4 bg-gray-50 rounded-b-3xl">
          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
