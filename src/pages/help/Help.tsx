/**
 * HELP CENTER - MAIN PAGE
 */

import { Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  Video,
  MessageCircle,
  FileText,
  Shield,
  ShoppingBag
} from "lucide-react";
import { useLang, t } from "@/hooks/useAppLang";

export default function Help() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const categories = [
    {
      title: "Getting Started",
      icon: BookOpen,
      color: "from-blue-500 to-blue-700",
      links: [
        { name: "Creating an Account", path: "/help/creating-account" },
        { name: "Profile Setup", path: "/help/profile-setup" }, ],
    },
    {
      title: "Buying & Selling",
      icon: ShoppingBag,
      color: "from-green-500 to-green-700",
      links: [
        { name: "How to Post an Ad", path: "/help/how-to-post-ad" },
        { name: "Setting the Right Price", path: "/help/setting-right-price" },
        { name: "Payment Methods", path: "/help/payment-methods" },
      ],
    },
    {
      title: "Safety & Security",
      icon: Shield,
      color: "from-red-500 to-red-700",
      links: [
        { name: "Avoiding Scams", path: "/help/avoiding-scams" },
        { name: "Meeting Safely", path: "/help/meeting-safely" },
        { name: "Reporting Issues", path: "/help/reporting-issues" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-2xl p-8 mb-8">
          <h1 className="text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-teal-100 mb-6">
            Find answers to your questions
          </p>
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search help articles..."
      className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            to="/help/contact"
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-center group"
          >
            <MessageCircle className="w-12 h-12 text-teal-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Contact Support</h3>
          </Link>
          <Link
            to="/help/video-tutorials"
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-center group"
          >
            <Video className="w-12 h-12 text-teal-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Video Tutorials</h3>
          </Link>
          <Link
            to="/help/guides"
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-center group"
          >
            <FileText className="w-12 h-12 text-teal-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Browse Guides</h3>
          </Link>
        </div>

        <div className="space-y-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div
                  className={`bg-gradient-to-r ${category.color} text-white p-6`}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">{category.title}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {category.links.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg"
                      >
                        <span className="text-gray-700">{link.name}</span>
                        <span className="ml-auto text-gray-400">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}




