import { Link } from "react-router-dom";
import { Video } from "lucide-react";
import { useLang, t } from "@/hooks/useAppLang";

export default function VideoTutorials() {
  const lang = useLang();
  const isRtl = lang === "ar";
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <Video className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Video Tutorials</h1>
              <p className="text-purple-100">Watch and learn</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
              <Video className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Getting Started</h3>
            <p className="text-sm text-gray-600">5 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
