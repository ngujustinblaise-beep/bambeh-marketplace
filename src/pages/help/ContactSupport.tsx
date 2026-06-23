/**
 * CONTACT SUPPORT - HELP PAGE
 */

import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Phone, Clock } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

export default function ContactSupport() {
  const lang = useLang();
  const isRtl = lang === "ar";
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Contact Support</h1>
              <p className="text-blue-100">We're here to help you!</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          
          <div className="space-y-6">
            {/* Email */}
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-700 mb-2">bambetheapp@gmail.com</p>
                <p className="text-sm text-gray-600">We typically respond within 24 hours</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Call Us</h3>
                <p className="text-gray-700 mb-2">+237 652 953 607</p>
                <p className="text-sm text-gray-600">Monday - Friday, 9am - 6pm WAT</p>
              </div>
            </div>

            {/* Live Chat */}
            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-gray-700 mb-2">Chat with our support team</p>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Start Chat
                </button>
              </div>
            </div>

            {/* Office Hours */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Office Hours</h3>
                <p className="text-gray-700">Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p className="text-gray-700">Saturday: 10:00 AM - 4:00 PM</p>
                <p className="text-gray-700">Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">💡 Before You Contact Us</h3>
          <p className="text-gray-700 mb-4">
            Check our Help Center for quick answers to common questions!
          </p>
          <Link
            to="/help"
      className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold"
          >
            Browse Help Articles
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link to="/help" className="text-teal-600 hover:text-teal-700 font-semibold">
            ← Back to Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}






