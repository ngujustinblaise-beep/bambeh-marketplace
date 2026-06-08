import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Store,
  Package,
  CreditCard,
  Bell,
  Shield,
  ChevronRight,
  Award,
  Image,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useLang, t } from "@/hooks/useAppLang";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action: string;
  route: string;
  points: number;
}

export default function VendorOnboardingChecklist() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const [profileRes, productsRes] = await Promise.all([
          supabase.from("vendor_profiles").select("*").eq("user_id", user.id).single(),
          supabase.from("products").select("id", { count: "exact" }).eq("vendor_id", user.id),
        ]);
        if (profileRes.data) {
          setProfile({ ...profileRes.data, products_count: productsRes.count || 0 });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const checklist: ChecklistItem[] = profile
    ? [
        {
          id: "store_name",
          title: "Set Up Your Store",
          description: "Add store name, description and category",
          icon: <Store className="w-5 h-5" />,
          completed: Boolean(profile.store_name && profile.store_description),
          action: "Complete store info",
          route: "/vendor/settings/store",
          points: 20,
        },
        {
          id: "logo",
          title: "Add Logo & Banner",
          description: "Upload store logo and banner image",
          icon: <Image className="w-5 h-5" />,
          completed: Boolean(profile.logo_url && profile.banner_url),
          action: "Upload images",
          route: "/vendor/settings/store",
          points: 15,
        },
        {
          id: "location",
          title: "Add Your Location",
          description: "Enter your city and contact number",
          icon: <Store className="w-5 h-5" />,
          completed: Boolean(profile.phone_number && profile.city),
          action: "Add location",
          route: "/vendor/settings/store",
          points: 10,
        },
        {
          id: "payment",
          title: "Set Up Payments",
          description: "Add MTN MoMo, Orange Money or bank details",
          icon: <CreditCard className="w-5 h-5" />,
          completed: Boolean(
            profile.payment_settings &&
              Object.keys(profile.payment_settings).length > 0
          ),
          action: "Configure payments",
          route: "/vendor/settings/payment",
          points: 20,
        },
        {
          id: "product",
          title: "Add First Product",
          description: "List at least one product in your store",
          icon: <Package className="w-5 h-5" />,
          completed: (profile.products_count || 0) > 0,
          action: "Add a product",
          route: "/vendor/products/new",
          points: 25,
        },
        {
          id: "notifications",
          title: "Configure Notifications",
          description: "Set up how you want to be notified",
          icon: <Bell className="w-5 h-5" />,
          completed: Boolean(
            profile.notification_settings &&
              Object.keys(profile.notification_settings).length > 0
          ),
          action: "Set up notifications",
          route: "/vendor/settings/notifications",
          points: 10,
        },
        {
          id: "verification",
          title: "Verify Your Identity",
          description: "Complete identity verification",
          icon: <Shield className="w-5 h-5" />,
          completed: Boolean(profile.identity_verified),
          action: "Start verification",
          route: "/vendor/settings/verification",
          points: 30,
        },
      ]
    : [];

  const completedCount = checklist.filter((i) => i.completed).length;
  const totalPoints = checklist.reduce((s, i) => s + i.points, 0);
  const earnedPoints = checklist
    .filter((i) => i.completed)
    .reduce((s, i) => s + i.points, 0);
  const progress =
    checklist.length > 0
      ? Math.round((completedCount / checklist.length) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Store Setup Checklist
            </h1>
            <p className="text-xs text-gray-500">
              {completedCount} of {checklist.length} completed
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Progress card */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm">Overall Progress</p>
              <p className="text-3xl font-bold mt-0.5">{progress}%</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <Award className="w-5 h-5 text-yellow-300" />
                <p className="text-lg font-bold">
                  {earnedPoints}/{totalPoints}
                </p>
              </div>
              <p className="text-green-100 text-xs mt-0.5">Points earned</p>
            </div>
          </div>
          <div className="w-full bg-green-800/40 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${progress}%` }}/>
          </div>
          {progress === 100 && (
            <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4 text-yellow-300" />
              <p className="text-sm font-medium">Your store is fully set up!</p>
            </div>
          )}
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.route)}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.completed
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}>
                {item.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  item.icon
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-semibold ${
                      item.completed
                        ? "text-gray-400 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {item.title}
                  </p>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      item.completed
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    +{item.points}pts
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.description}
                </p>
                {!item.completed && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    {item.action}
                  </p>
                )}
              </div>
              {!item.completed ? (
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-green-500 flex-shrink-0 fill-green-500" />
              )}
            </button>
          ))}
        </div>

        {progress < 100 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
            <p className="text-sm text-blue-700 font-medium">
              Complete your setup to unlock full visibility on Bambeh
            </p>
            <p className="text-xs text-blue-500 mt-1">
              {checklist.length - completedCount} step
              {checklist.length - completedCount !== 1 ? "s" : ""} remaining
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
