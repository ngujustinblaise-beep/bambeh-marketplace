// @ts-nocheck
/**
 * Register.tsx â€” Bambeh Marketplace
 * FILE LOCATION: src/pages/auth/Register.tsx
 *
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 *
 * âœ… ADDED: Welcome message + notification sent on every new account creation
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Eye, EyeOff, Mail, User, Lock, Phone,
  AtSign, ArrowRight, CheckCircle, AlertCircle, Info
} from "lucide-react";
import { useLang, t } from "@/hooks/useAppLang";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// âœ… BAMBEH WELCOME MESSAGE CONFIG
// Fill in the correct values for your Supabase tables below.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const BAMBEH_CONFIG = {
  // The UUID of the Bambeh system/admin account that sends the welcome message.
  // Get it from: Supabase â†’ Authentication â†’ Users â†’ find "Bambeh Team" or admin user
  // Then paste the UUID here:
  SYSTEM_USER_ID: "00000000-0000-0000-0000-000000000001", // â† REPLACE with real admin UUID

  // Your messages table name (check Supabase â†’ Table Editor)
  MESSAGES_TABLE: "messages",         // common options: "messages", "chats", "direct_messages"

  // Your notifications table name
  NOTIFICATIONS_TABLE: "notifications", // common options: "notifications", "alerts"

  // Column names in your messages table
  MSG_COLUMNS: {
    sender_id:   "sender_id",         // who sent it
    receiver_id: "receiver_id",       // who receives it (new user)
    content:     "content",           // message body column name â€” may be "body", "text", "message"
    created_at:  "created_at",
  },

  // Column names in your notifications table
  NOTIF_COLUMNS: {
    user_id:     "user_id",           // who the notification is for
    title:       "title",
    body:        "body",              // may be "message", "content", "description"
    type:        "type",              // notification category
    is_read:     "is_read",
    created_at:  "created_at",
  },
};
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Send a welcome message + notification to the newly registered user. Non-fatal. */
async function sendWelcomeMessageAndNotification(
  userId: string,
  fullName: string,
): Promise<void> {
  const firstName = fullName.trim().split(" ")[0] || "there";

  const welcomeText =
    `ðŸŽ‰ Welcome to Bambeh, ${firstName}! ` +
    `We're so glad you're here.\n\n` +
    `Bambeh is the pulse of African commerce â€” you can buy and sell anything, ` +
    `discover Farm Fresh produce, join Group Buying deals, and much more.\n\n` +
    `Here's how to get started:\n` +
    `â€¢ ðŸ›ï¸ Browse listings on the home page\n` +
    `â€¢ ðŸ“¦ Post your first listing â€” it takes 2 minutes\n` +
    `â€¢ ðŸŒ¿ Check out Farm Fresh for fresh produce\n` +
    `â€¢ ðŸ¤ Join a Group Buy and save more\n\n` +
    `If you ever need help, tap the chat bubble or visit our Help Centre.\n\n` +
    `Happy trading! ðŸŒ\nâ€” The Bambeh Team`;

  const now = new Date().toISOString();

  // â”€â”€ 1. Insert welcome message into the chat/messages table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  try {
    const { MESSAGES_TABLE, SYSTEM_USER_ID, MSG_COLUMNS: c } = BAMBEH_CONFIG;

    await supabase.from(MESSAGES_TABLE).insert({
      [c.sender_id]:   SYSTEM_USER_ID,
      [c.receiver_id]: userId,
      [c.content]:     welcomeText,
      [c.created_at]:  now,
      // Extra columns your table may have â€” safe to leave if they have defaults:
      is_read:         false,
      message_type:    "welcome",
    });
  } catch (msgErr) {
    // Non-fatal â€” log and continue
    console.warn("[Register] Welcome message insert failed:", msgErr);
  }

  // â”€â”€ 2. Insert welcome notification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  try {
    const { NOTIFICATIONS_TABLE, NOTIF_COLUMNS: c } = BAMBEH_CONFIG;

    await supabase.from(NOTIFICATIONS_TABLE).insert({
      [c.user_id]:    userId,
      [c.title]:      "Welcome to Bambeh! ðŸŽ‰",
      [c.body]:       `Hi ${firstName}! Your account is ready. Tap to see your welcome message.`,
      [c.type]:       "welcome",
      [c.is_read]:    false,
      [c.created_at]: now,
      // Extra fields your table may have:
      link:           "/chat",        // where tapping the notification goes
      icon:           "ðŸŽ‰",
    });
  } catch (notifErr) {
    console.warn("[Register] Welcome notification insert failed:", notifErr);
  }
}

// â”€â”€ Friendly error messages for common Supabase errors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function friendlyError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Try signing in instead.";
  if (m.includes("duplicate") && m.includes("username"))
    return "That username is already taken. Please choose a different one.";
  if (m.includes("duplicate") && m.includes("phone"))
    return "That phone number is already linked to an account. Try signing in instead.";
  if (m.includes("password should be at least"))
    return "Your password must be at least 8 characters long.";
  if (m.includes("unable to validate email"))
    return "Please enter a valid email address.";
  if (m.includes("email rate limit") || m.includes("too many requests"))
    return "Too many attempts. Please wait a few minutes and try again.";
  if (m.includes("database error") || m.includes("saving new user"))
    return "We had trouble saving your account. Please try again â€” if this keeps happening, contact support.";
  return msg;
}

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName:        "",
    username:        "",
    phone:           "",
    email:           "",
    password:        "",
    confirmPassword: "",
  });

  const [showPassword,  setShowPassword]  = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);
  const [error,         setError]         = useState("");
  const [success,       setSuccess]       = useState(false);
  const [emailSent,     setEmailSent]     = useState(false);

  const autoUsername = (name: string) =>
    name.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 20);

  const handleFullNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      fullName: name,
      username: prev.username === "" || prev.username === autoUsername(prev.fullName)
        ? autoUsername(name)
        : prev.username,
    }));
    setError("");
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  // â”€â”€ Validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const validate = () => {
    if (!formData.fullName.trim())          return "Full name is required.";
    if (!formData.username.trim())          return "Username is required.";
    if (formData.username.length < 3)       return "Username must be at least 3 characters.";
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username))
      return "Username can only contain letters, numbers, and underscores â€” no spaces.";
    if (!formData.phone.trim())             return "Phone number is required.";
    if (!/^\+?[0-9]{8,15}$/.test(formData.phone.replace(/\s/g, "")))
      return "Enter a valid phone number (e.g. +237612345678).";
    if (!formData.email.includes("@"))      return "A valid email address is required.";
    if (formData.password.length < 8)       return "Password must be at least 8 characters.";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
    return null;
  };

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSubmit = async () => {
    setError("");
    const validationError = validate();
    if (validationError) return setError(validationError);

    setIsLoading(true);
    try {
      // Step 1: Create the auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email:    formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            username:  formData.username.trim().toLowerCase(),
            phone:     formData.phone.trim(),
          },
        },
      });

      if (signUpError) throw new Error(friendlyError(signUpError.message));

      const user = data?.user;
      if (!user) throw new Error("Account could not be created. Please try again.");

      // Step 2: Belt-and-suspenders profile upsert
      try {
        await supabase.from("profiles").upsert({
          id:         user.id,
          full_name:  formData.fullName.trim(),
          username:   formData.username.trim().toLowerCase(),
          phone:      formData.phone.trim(),
          email:      formData.email.trim().toLowerCase(),
          created_at: new Date().toISOString(),
          avatar_url: null,
        }, { onConflict: "id" });
      } catch (profileErr) {
        console.warn("[Register] Profile upsert skipped:", profileErr);
      }

      // âœ… Step 3: Send welcome message + notification (non-fatal)
      // Fire-and-forget â€” we don't await or block on this
      sendWelcomeMessageAndNotification(user.id, formData.fullName.trim())
        .catch(e => console.warn("[Register] Welcome send failed silently:", e));

      const needsConfirmation = !data.session && data.user?.identities?.length === 0;
      setEmailSent(needsConfirmation);
      setSuccess(true);

      if (!needsConfirmation) {
        setTimeout(() => navigate("/"), 2500);
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // â”€â”€ Success screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            {emailSent ? "Check your email!" : "Welcome to Bambeh!"}
          </h2>
          {emailSent ? (
            <>
              <p className="text-gray-500 mb-2">
                We sent a confirmation link to <strong>{formData.email}</strong>.
              </p>
              <p className="text-gray-400 text-sm mb-4">
                Click the link in the email to activate your account, then come back to sign in.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-teal-600 text-white font-bold py-3 rounded-2xl"
              >
                Go to Login
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-2">Account created successfully.</p>
              <p className="text-gray-400 text-sm">
                Check your <strong>Messages</strong> for a welcome note from the Bambeh Team! ðŸŽ‰
              </p>
              <p className="text-gray-400 text-sm mt-1">Taking you to the marketplaceâ€¦</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // â”€â”€ Password strength indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const pwStrength = (() => {
    const p = formData.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8)  score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    if (score <= 1) return { label: "Weak",   color: "bg-red-400",    width: "w-1/4" };
    if (score <= 3) return { label: "Fair",   color: "bg-yellow-400", width: "w-2/4" };
    if (score === 4) return { label: "Good",  color: "bg-blue-400",   width: "w-3/4" };
    return              { label: "Strong", color: "bg-green-500",  width: "w-full" };
  })();

  // â”€â”€ Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-teal-400 to-blue-500"/>

        <div className="p-7">
          {/* Branding */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-200">
              <span className="text-white text-2xl font-black">B</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">Join Bambeh</h1>
            <p className="text-gray-500 text-sm mt-1">Bambeh Marketplace â€” The Pulse of African Commerce</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleFullNameChange}
                  placeholder="e.g. Jean Paul Mbarga"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Username */}
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
                  placeholder="e.g. jean_mbarga"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Letters, numbers, underscores only. Used to log in.
              </p>
            </div>

            {/* Phone */}
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
                  placeholder="+237 6XX XXX XXX"
                  autoComplete="tel"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" />
                You can also use this to log in.
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address <span className="text-red-400">*</span>
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

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password <span className="text-red-400">*</span>
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
              {pwStrength && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pwStrength.color} ${pwStrength.width}`}/>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Password strength: <span className="font-semibold">{pwStrength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm Password <span className="text-red-400">*</span>
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
                  className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white ${
                    formData.confirmPassword && formData.confirmPassword !== formData.password
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : formData.confirmPassword && formData.confirmPassword === formData.password
                      ? "border-green-400 focus:border-green-500 focus:ring-green-100"
                      : "border-gray-200 focus:border-teal-500 focus:ring-teal-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 disabled:opacity-50 text-white font-bold rounded-2xl py-3.5 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-200 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"/>
                  Creating Accountâ€¦
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


