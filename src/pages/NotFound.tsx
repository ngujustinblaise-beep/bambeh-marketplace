import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-6">
      <div className="text-center text-white">
        <div className="text-9xl mb-4">404</div>
        <h1 className="text-4xl font-bold mb-2">Page Not Found</h1>
        <p className="text-xl opacity-90 mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/20 backdrop-blur-lg text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-white/30 active:scale-95 transition-all"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="bg-white text-purple-600 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 active:scale-95 transition-all"
          >
            <Home size={20} />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );

}
export default NotFound;





