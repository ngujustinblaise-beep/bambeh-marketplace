import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang, t } from "@/hooks/useAppLang";

export default function SplashScreen() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(progressInterval); return 100; }
        return prev + 2;
      });
    }, 30);

    const timeout = setTimeout(() => {
      const termsAccepted = localStorage.getItem('Bambeh_terms_accepted');
      const onboardingCompleted = localStorage.getItem('Bambeh_onboarding_completed');
      if (!termsAccepted) {
        navigate('/terms-acceptance');
      } else if (!onboardingCompleted) {
        navigate('/language');
      } else {
        navigate('/');
      }
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-500 rounded-full opacity-20 animate-pulse"/>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-teal-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}/>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '0.5s' }}/>
      </div>

      <div className="relative z-10 animate-fade-in">
        <div className="relative mb-8 animate-bounce-slow">
          <div className="w-48 h-48 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-6 left-6 w-32 h-32 bg-white rounded-full opacity-30 blur-2xl"/>
            </div>
            <div className="relative z-10">
              <span className="text-8xl font-bold text-white drop-shadow-lg">B</span>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent opacity-20"/>
          </div>
          <div className="absolute inset-0 bg-teal-400 rounded-full blur-xl opacity-50 animate-pulse"/>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-3 drop-shadow-lg animate-fade-in-up">Bambeh</h1>
          <p className="text-xl text-teal-100 drop-shadow animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Online Marketplace
          </p>
        </div>

        <div className="w-64 h-2 bg-teal-900 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-white to-teal-200 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}/>
        </div>
        <p className="text-center text-teal-100 text-sm animate-pulse">Loading your marketplace experience...</p>
      </div>

      <div className="absolute bottom-8 text-center">
        <p className="text-teal-200 text-sm">by BAMBEH SARL</p>
        <p className="text-teal-300 text-xs mt-1">Version 1.0.0</p>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        .animate-fade-in       { animation: fade-in 0.8s ease-out; }
        .animate-fade-in-up    { animation: fade-in-up 0.8s ease-out; }
        .animate-bounce-slow   { animation: bounce-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}







