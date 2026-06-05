/**
 * LOGIN PAGE — Bambeh Marketplace
 * FILE LOCATION: src/pages/auth/Login.tsx
 *
 * FIXES FROM ORIGINAL:
 * 1. Login now works with Supabase (real accounts), not just the 3 hardcoded
 *    master accounts. The master accounts still work as before.
 * 2. When user types a username or phone, we look up their email in the
 *    "profiles" table in Supabase, then sign in with email+password.
 * 3. Input label now clearly says: Username, Phone Number, or Email
 * 4. Logout works correctly — Supabase clears the session, user is taken
 *    to login page and can log back in as many times as they want.
 *
 * HOW IT WORKS:
 *   User types "jean_mbarga" → we query profiles table for username = "jean_mbarga"
 *   → we get their email → we call supabase.auth.signInWithPassword(email, password)
 *   → logged in ✅
 *
 *   User types "+237612345678" → we query profiles table for phone = "+237612345678"
 *   → we get their email → sign in with email+password → logged in ✅
 *
 *   User types "jean@gmail.com" → we sign in directly with email+password → logged in ✅
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LogIn, User, Lock, Eye, EyeOff, AlertCircle,
  Shield, Clock, Store, Building, ArrowRight,
  HelpCircle, KeyRound, UserPlus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { registerFCM } from "@/lib/fcm";

const MAX_ATTEMPTS      = 5;
const LOCKOUT_DURATION  = 5 * 60 * 1000; // 5 minutes in milliseconds

// ── Master / demo accounts (still work as before) ──────────────────────────
const MASTER_ACCOUNTS = {
  zerm: {
    username: "zerm", password: "1234",
    user: {
      id: "master_zerm_001", username: "zerm", email: "zerm@bambeh.com",
      displayName: "Zerm Master - Gold Tier", name: "Zerm Master",
      phone: "+237680000000", role: "Gold", tier: "Gold",
      subscriptionTier: "Gold", isSubscribed: true,
      canUpload: true, canPostJobs: true, canPostItems: true,
      canPostServices: true, canPostProperties: true,
      photoURL: "https://ui-avatars.com/api/?name=Zerm+Master&background=FFD700&color=000",
      createdAt: new Date("2024-01-01").toISOString(),
    },
  },
  premium: {
    username: "premium", password: "2222",
    user: {
      id: "master_premium_002", username: "premium", email: "premium@bambeh.com",
      displayName: "Premium User", name: "Premium User",
      phone: "+237690000000", role: "Premium", tier: "Premium",
      subscriptionTier: "Premium", isSubscribed: true,
      canUpload: true, canPostJobs: true, canPostItems: true,
      photoURL: "https://ui-avatars.com/api/?name=Premium+User&background=2196F3&color=fff",
      createdAt: new Date("2024-03-01").toISOString(),
    },
  },
  ngu: {
    username: "ngu", password: "0000",
    user: {
      id: "master_ngu_003", username: "ngu", email: "ngu@bambeh.com",
      displayName: "Ngu User - Basic", name: "Ngu User",
      phone: "+237670000000", role: "Basic", tier: "Basic",
      subscriptionTier: "Basic", isSubscribed: false,
      canUpload: true, canPostJobs: true, canPostItems: true,
      photoURL: "https://ui-avatars.com/api/?name=Ngu+User&background=4CAF50&color=fff",
      createdAt: new Date("2024-06-01").toISOString(),
    },
  },
};

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [formData,      setFormData]      = useState({ identifier: "", password: "" });
  const [showPassword,  setShowPassword]  = useState(false);
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [failedAttempts,setFailedAttempts]= useState(0);
  const [lockoutEndTime,setLockoutEndTime]= useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isLocked,      setIsLocked]      = useState(false);

  const from = (location.state as any)?.from?.pathname || "/";

  // ── Restore lockout state from localStorage on page load ───────────────
  useEffect(() => {
    const storedLockout = localStorage.getItem("Bambeh_login_lockout");
    if (storedLockout) {
      try {
        const { endTime } = JSON.parse(storedLockout);
        if (endTime > Date.now()) {
          setLockoutEndTime(endTime);
          setIsLocked(true);
          setFailedAttempts(MAX_ATTEMPTS);
        } else {
          localStorage.removeItem("Bambeh_login_lockout");
          localStorage.removeItem("Bambeh_failed_attempts");
        }
      } catch { localStorage.removeItem("Bambeh_login_lockout"); }
    }
    const storedAttempts = localStorage.getItem("Bambeh_failed_attempts");
    if (storedAttempts) {
      try {
        const { count, timestamp } = JSON.parse(storedAttempts);
        if (Date.now() - timestamp < LOCKOUT_DURATION) setFailedAttempts(count);
        else { localStorage.removeItem("Bambeh_failed_attempts"); setFailedAttempts(0); }
      } catch { localStorage.removeItem("Bambeh_failed_attempts"); }
    }
  }, []);

  // ── Countdown timer while locked ───────────────────────────────────────
  useEffect(() => {
    if (!lockoutEndTime) return;
    const interval = setInterval(() => {
      const timeLeft = lockoutEndTime - Date.now();
      if (timeLeft <= 0) {
        setIsLocked(false); setLockoutEndTime(null); setFailedAttempts(0);
        localStorage.removeItem("Bambeh_login_lockout");
        localStorage.removeItem("Bambeh_failed_attempts");
      } else {
        setRemainingTime(Math.ceil(timeLeft / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutEndTime]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleFailedAttempt = () => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);
    localStorage.setItem("Bambeh_failed_attempts", JSON.stringify({ count: newAttempts, timestamp: Date.now() }));
    if (newAttempts >= MAX_ATTEMPTS) {
      const endTime = Date.now() + LOCKOUT_DURATION;
      setLockoutEndTime(endTime); setIsLocked(true);
      localStorage.setItem("Bambeh_login_lockout", JSON.stringify({ endTime }));
      setErrors({ login: "Too many failed attempts. Account locked for 5 minutes." });
    } else {
      setErrors({ login: `Incorrect credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.` });
    }
  };

  // ── CORE: resolve identifier → email, then sign in ─────────────────────
  const authenticateUser = async (identifier: string, password: string) => {
    const input = identifier.toLowerCase().trim();

    // 1. Check master accounts first (demo / admin accounts)
    const master = Object.values(MASTER_ACCOUNTS).find(
      acc => acc.username === input && acc.password === password
    );
    if (master) return { success: true, user: master.user, isMaster: true };

    // 2. Determine what the user typed
    const isEmail = input.includes("@");
    const isPhone = /^\+?[0-9]{8,15}$/.test(input.replace(/\s/g, ""));

    let emailToUse = isEmail ? input : null;

    // 3. If NOT an email, look up the email in Supabase profiles table
    if (!emailToUse) {
      const column = isPhone ? "phone" : "username";
      const { data, error } = await supabase
        .from("profiles")
        .select("email")
        .eq(column, input)
        .maybeSingle();

      if (error) {
        console.error("Profile lookup error:", error.message);
        return { success: false, error: "Login service error. Please try again." };
      }
      if (!data?.email) {
        return { success: false, error: `No account found with that ${isPhone ? "phone number" : "username"}.` };
      }
      emailToUse = data.email;
    }

    // 4. Sign in with Supabase using the resolved email + password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (authError) {
      console.error("Supabase auth error:", authError.message);
      return { success: false, error: "Incorrect password. Please try again." };
    }

    return { success: true, user: authData.user, isMaster: false };
  };

  // ── Submit handler ──────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const newErrors: Record<string, string> = {};
    if (!formData.identifier.trim()) newErrors.identifier = "Please enter your username, phone, or email";
    if (!formData.password.trim())   newErrors.password   = "Password is required";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await authenticateUser(formData.identifier.trim(), formData.password.trim());

      if (result.success) {
        // Clear lockout data on success
        localStorage.removeItem("Bambeh_failed_attempts");
        localStorage.removeItem("Bambeh_login_lockout");
        setFailedAttempts(0);

        // If it's a master account, use the custom login function
        // If it's a real Supabase user, Supabase session is already set
        if (result.isMaster && login) {
          await login(result.user.username, formData.password);
        }

        // ✅ Register this device for push notifications
        // Saves the FCM token to Supabase so the backend can send push alerts
        try {
          const userId = result.user?.id ?? (await supabase.auth.getUser()).data.user?.id;
          if (userId) {
            await registerFCM(userId);
          }
        } catch (fcmErr) {
          // Never block login if FCM fails
          console.warn("FCM registration skipped:", fcmErr);
        }

        setTimeout(() => {
          navigate(from === "/login" ? "/" : from, { replace: true });
        }, 100);

      } else {
        handleFailedAttempt();
        if (result.error) setErrors({ login: result.error });
      }
    } catch (err: any) {
      handleFailedAttempt();
      setErrors({ login: err?.message || "Login failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <LogIn className="w-12 h-12" />
              <h1 className="text-3xl font-bold">Welcome Back</h1>
            </div>
            <p className="text-center text-teal-100">Sign in to your Bambeh account</p>
          </div>

          {/* Lockout warning */}
          {isLocked && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 mb-2">Account Temporarily Locked</h3>
                  <p className="text-sm text-red-700 mb-3">Too many failed login attempts.</p>
                  <div className="flex items-center gap-2 bg-red-100 px-4 py-3 rounded-lg">
                    <Clock className="w-5 h-5 text-red-700" />
                    <span className="text-red-900 font-bold">Unlocks in: {formatTime(remainingTime)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attempts warning */}
          {!isLocked && failedAttempts > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  <strong>{MAX_ATTEMPTS - failedAttempts} attempts remaining</strong> before lockout
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">

              {/* ── Identifier field ────────────────────────────────── */}
              {/*
                This single field accepts THREE things:
                  1. Username  (e.g. jean_mbarga)
                  2. Phone     (e.g. +237612345678)
                  3. Email     (e.g. jean@gmail.com)
                The authenticateUser function figures out which one it is.
              */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username, Phone Number, or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    disabled={isLocked}
                    placeholder="Username, +237..., or email"
                    autoComplete="username"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.identifier ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.identifier && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.identifier}
                  </p>
                )}
              </div>

              {/* ── Password ────────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLocked}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLocked}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.password}
                  </p>
                )}
              </div>

              {/* ── Login error ─────────────────────────────────────── */}
              {errors.login && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">{errors.login}</p>
                </div>
              )}

              {/* ── Submit button ───────────────────────────────────── */}
              <button
                type="submit"
                disabled={isSubmitting || isLocked}
                className="w-full px-6 py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Signing In...
                  </span>
                ) : isLocked ? "Account Locked" : "Sign In"}
              </button>
            </form>

            {/* ── Recovery links ─────────────────────────────────────── */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600 text-sm mb-3">Trouble signing in?</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/forgot-credentials?mode=username"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 font-medium text-sm transition-colors"
                >
                  <User className="w-4 h-4" /> Forgot Username
                </Link>
                <Link
                  to="/forgot-credentials?mode=password"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm transition-colors"
                >
                  <KeyRound className="w-4 h-4" /> Forgot Password
                </Link>
              </div>
              <Link
                to="/forgot-credentials"
                className="block text-center mt-3 text-sm text-gray-500 hover:text-teal-600 transition-colors"
              >
                <HelpCircle className="w-4 h-4 inline mr-1" />
                Account Recovery Center
              </Link>
            </div>
          </div>

          {/* Vendor portal link */}
          <div className="border-t-4 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6">
            <Link to="/vendor/signin" className="block w-full">
              <div className="bg-white rounded-xl border-2 border-purple-300 p-4 hover:border-purple-500 hover:shadow-lg transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Vendor Portal</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Building className="w-4 h-4" /> For Businesses & Enterprises
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* Register link */}
          <div className="p-8 bg-gray-50 border-t border-gray-200">
            <div className="text-center space-y-3">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-teal-600 font-semibold hover:underline inline-flex items-center gap-1">
                  Create Account <UserPlus className="w-4 h-4" />
                </Link>
              </p>
              <p className="text-sm text-gray-500">or</p>
              <Link to="/vendor/register" className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:underline">
                <Store className="w-4 h-4" /> Register as Vendor
              </Link>
            </div>
          </div>
        </div>

        {/* Security notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Security Notice</p>
              <p>After {MAX_ATTEMPTS} failed attempts, login will be blocked for 5 minutes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
