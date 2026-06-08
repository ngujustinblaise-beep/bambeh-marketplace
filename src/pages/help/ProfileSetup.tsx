import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useLang, t } from "@/hooks/useAppLang";

export default function ProfileSetup() {
  const lang = useLang();
  const isRtl = lang === "ar";
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <User className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Profile Setup</h1>
              <p className="text-purple-100">Make a great first impression</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Complete Your Profile
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border-l-4 border-purple-600">
                <h3 className="font-bold text-gray-900 mb-2">
                  📸 Add a Profile Photo
                </h3>
                <p className="text-gray-700">
                  Profiles with photos get 5x more views!
                </p>
              </div>
              <div className="p-4 bg-purple-50 border-l-4 border-purple-600">
                <h3 className="font-bold text-gray-900 mb-2">
                  ✍️ Write Your Bio
                </h3>
                <p className="text-gray-700">Tell people about yourself</p>
              </div>
              <div className="p-4 bg-purple-50 border-l-4 border-purple-600">
                <h3 className="font-bold text-gray-900 mb-2">
                  ✅ Get Verified
                </h3>
                <p className="text-gray-700">
                  Verify your phone number for trust
                </p>
              </div>
            </div>
          </section>
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/help"
      className="text-teal-600 hover:text-teal-700 font-semibold"
          >
            ← Back to Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
