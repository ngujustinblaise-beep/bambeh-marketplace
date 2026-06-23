/**
 * LOGIN PAGE
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LogIn,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  Clock,
  Store,
  Building,
  ArrowRight,
  HelpCircle,
  KeyRound,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000;



export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    usernameOrPhone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/";

  useEffect(() => {
    const storedLockout = localStorage.getItem("Bambeh_login_lockout");
    if (storedLockout) {
      try {
        const lockoutData = JSON.parse(storedLockout);
        const now = Date.now();
        if (lockoutData.endTime > now) {
          setLockoutEndTime(lockoutData.endTime);
          setIsLocked(true);
          setFailedAttempts(MAX_ATTEMPTS);
        } else {
          localStorage.removeItem("Bambeh_login_lockout");
          localStorage.removeItem("Bambeh_failed_attempts");
        }
      } catch (e) {
        console.error("Error parsing lockout data:", e);
        localStorage.removeItem("Bambeh_login_lockout");
      }
    }

    const storedAttempts = localStorage.getItem("Bambeh_failed_attempts");
    if (storedAttempts) {
      try {
        const attemptData = JSON.parse(storedAttempts);
        const now = Date.now();
        if (
          attemptData.timestamp &&
          now - attemptData.timestamp < LOCKOUT_DURATION
        ) {
          setFailedAttempts(attemptData.count);
        } else {
          localStorage.removeItem("Bambeh_failed_attempts");
          setFailedAttempts(0);
        }
      } catch (e) {
        console.error("Error parsing attempts data:", e);
        localStorage.removeItem("Bambeh_failed_attempts");
      }
    }
  }, []);

  useEffect(() => {
    if (lockoutEndTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const timeLeft = lockoutEndTime - now;

        if (timeLeft <= 0) {
          setIsLocked(false);
          setLockoutEndTime(null);
          setFailedAttempts(0);
          localStorage.removeItem("Bambeh_login_lockout");
          localStorage.removeItem("Bambeh_failed_attempts");
        } else {
          setRemainingTime(Math.ceil(timeLeft / 1000));
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lockoutEndTime]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFailedAttempt = () => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);

    const attemptData = { count: newAttempts, timestamp: Date.now() };
    localStorage.setItem("Bambeh_failed_attempts", JSON.stringify(attemptData));

    if (newAttempts >= MAX_ATTEMPTS) {
      const endTime = Date.now() + LOCKOUT_DURATION;
      setLockoutEndTime(endTime);
      setIsLocked(true);
      localStorage.setItem("Bambeh_login_lockout", JSON.stringify({ endTime }));
      setErrors({
        login: `Too many failed attempts. Account locked for 5 minutes.`,
      });
    } else {
      setErrors({
        login: `Incorrect credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`,
      });
    }
  };

  const authenticateUser = async (
    usernameOrPhone: string,
    password: string,
  ) => {
    if (!usernameOrPhone || !password) {
      console.error("âŒ Authentication failed: Missing credentials");
      return { success: false, error: "Username and password are required" };
    }

    const inputLowerCase = usernameOrPhone.toLowerCase().trim();
    console.log("ðŸ”‘ Attempting authentication for:", inputLowerCase);

    

    try {
      const storedUsers = localStorage.getItem("Bambeh_users");
      if (storedUsers) {
        const users = JSON.parse(storedUsers);

        for (const user of users) {
          const matchesPhone = user.phone?.toLowerCase?.() === inputLowerCase;
          const matchesUsername =
            user.username?.toLowerCase?.() === inputLowerCase;
          const matchesEmail = user.email?.toLowerCase?.() === inputLowerCase;

          if (matchesPhone || matchesUsername || matchesEmail) {
            if (user.password === password) {
              console.log(
                "âœ… Local user authenticated:",
                user.username || user.phone,
              );
              return {
                success: true,
                user: {
                  id: user.id,
                  username: user.username || user.phone,
                  fullName:
                    user.fullName ||
                    user.name ||
                    `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                  phoneNumber: user.phone || user.phoneNumber,
                  email: user.email,
                  displayName:
                    user.displayName || user.fullName || user.username,
                  tier: user.tier || user.role || "Basic",
                  role: user.role || user.tier || "Basic",
                  subscriptionTier:
                    user.subscriptionTier || user.tier || "Basic",
                  isSubscribed: user.tier !== "Basic",
                  ...user,
                },
              };
            }
          }
        }
      }
    } catch (err) {
      console.error("Error checking local users:", err);
    }

    console.error("âŒ Authentication failed: Invalid credentials");
    return { success: false, error: "Invalid username or password" };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("ðŸ” Login form submitted");

    if (isLocked) {
      console.warn("âš Ã¯Â¸Â Login blocked: Account locked");
      return;
    }

    const newErrors: Record<string, string> = {};

    if (!formData.usernameOrPhone || !formData.usernameOrPhone.trim()) {
      newErrors.usernameOrPhone = "Username or phone is required";
    }

    if (!formData.password || !formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.error("âŒ Validation failed:", newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const authResult = await authenticateUser(
        formData.usernameOrPhone.trim(),
        formData.password.trim(),
      );

      if (authResult.success && authResult.user) {
        localStorage.removeItem("Bambeh_failed_attempts");
        localStorage.removeItem("Bambeh_login_lockout");
        setFailedAttempts(0);

        console.log("âœ… Login successful:", authResult.user.username);

        if (login) {
          await login(authResult.user.username, formData.password);
        }

        console.log("ðŸ‘¤ User authenticated, redirecting to:", from);

        setTimeout(() => {
          navigate(from === "/login" ? "/" : from, { replace: true });
        }, 100);
      } else {
        console.error("âŒ Authentication failed");
        handleFailedAttempt();
      }
    } catch (err) {
      console.error("âŒ Login exception:", err);
      handleFailedAttempt();
      setErrors({ login: "Login failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <LogIn className="w-12 h-12" />
              <h1 className="text-3xl font-bold">Welcome Back</h1>
            </div>
            <p className="text-center text-teal-100">
              Sign in to your Bambeh account
            </p>
          </div>

          {isLocked && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 mb-2">
                    Account Temporarily Locked
                  </h3>
                  <p className="text-sm text-red-700 mb-3">
                    Too many failed login attempts.
                  </p>
                  <div className="flex items-center gap-2 bg-red-100 px-4 py-3 rounded-lg">
                    <Clock className="w-5 h-5 text-red-700" />
                    <span className="text-red-900 font-bold">
                      Unlocks in: {formatTime(remainingTime)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLocked && failedAttempts > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  <strong>
                    {MAX_ATTEMPTS - failedAttempts} attempts remaining
                  </strong>{" "}
                  before lockout
                </p>
              </div>
            </div>
          )}

          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username or Phone Number
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="usernameOrPhone"
                    value={formData.usernameOrPhone}
                    onChange={handleChange}
                    disabled={isLocked}
                    placeholder="Enter username or phone"
                    autoComplete="username"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.usernameOrPhone
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.usernameOrPhone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.usernameOrPhone}
                  </p>
                )}
              </div>

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
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {errors.login && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">{errors.login}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isLocked}
                className="w-full px-6 py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Signing In...
                  </span>
                ) : isLocked ? (
                  "Account Locked"
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600 text-sm mb-3">
                Trouble signing in?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/forgot-credentials?mode=username"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 font-medium text-sm transition-colors"
                >
                  <User className="w-4 h-4" />
                  Forgot Username
                </Link>
                <Link
                  to="/forgot-credentials?mode=password"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                  Forgot Password
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

          <div className="border-t-4 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6">
            <Link to="/vendor/signin" className="block w-full">
              <div className="bg-white rounded-xl border-2 border-purple-300 p-4 hover:border-purple-500 hover:shadow-lg transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        Vendor Portal
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        For Businesses & Enterprises
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          <div className="p-8 bg-gray-50 border-t border-gray-200">
            <div className="text-center space-y-3">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-teal-600 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  Create Account
                  <UserPlus className="w-4 h-4" />
                </Link>
              </p>
              <p className="text-sm text-gray-500">or</p>
              <Link
                to="/vendor/register"
                className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:underline"
              >
                <Store className="w-4 h-4" />
                Register as Vendor
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Security Notice</p>
              <p>
                After {MAX_ATTEMPTS} failed attempts, your account will be
                locked for 5 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}







