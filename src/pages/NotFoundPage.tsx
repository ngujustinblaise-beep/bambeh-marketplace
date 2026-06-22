import React from 'react';
import { Link } from 'react-router-dom';
import { useLang, t } from "@/hooks/useAppLang";

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 py-12 px-4">
    <div className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-md">
      <div className="text-8xl font-bold text-teal-600 mb-4">404</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-8">Sorry, we could not find the page you are looking for.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-all"
        >
          Go Back
        </button>
        <Link
          to="/"
      className="inline-block px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg font-bold shadow-lg transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;




