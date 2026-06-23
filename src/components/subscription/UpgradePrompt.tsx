/**
 * UPGRADE PROMPT
 * FILE LOCATION: src/components/subscription/UpgradePrompt.tsx
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Crown, Zap, Star, Check, ArrowRight, Sparkles, TrendingUp, Shield } from "lucide-react";

interface UpgradePromptProps {
  isOpen?: boolean; onClose?: () => void;
  userTier?: "free" | "basic" | "premium" | "gold";
  showOnLogin?: boolean;
}

const PROMPT_SHOWN_KEY     = "bambeh_upgrade_prompt_shown";
const PROMPT_DISMISSED_KEY = "bambeh_upgrade_prompt_dismissed";

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  isOpen: controlledIsOpen, onClose, userTier = "free", showOnLogin = true,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen]           = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
      return;
    }
    if (userTier !== "free") { setIsOpen(false); return; }
    const dismissedAt = localStorage.getItem(PROMPT_DISMISSED_KEY);
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      if (Date.now() - dismissedDate.getTime() < 24 * 60 * 60 * 1000) { return; }
    }
    if (showOnLogin) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem(PROMPT_SHOWN_KEY, new Date().toISOString());
      }, 2000);
      return () => { clearTimeout(timer); };
    }
  }, [controlledIsOpen, userTier, showOnLogin]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(PROMPT_DISMISSED_KEY, new Date().toISOString());
    onClose?.();
  };

  const handleUpgrade = () => {
    handleClose();
    navigate("/subscription");
  };

  const handleMaybeLater = () => { handleClose(); };

  const slides = [
    { icon: Crown,   title: "Unlock Premium Features",  description: "Get access to advanced tools, unlimited listings, and priority support.", color: "from-yellow-400 to-orange-500" },
    { icon: Zap,     title: "Boost Your Visibility",    description: "Your listings appear higher in search results and get more views.",         color: "from-blue-400 to-purple-500" },
    { icon: Shield,  title: "Verified Badge",           description: "Build trust with buyers through our verification system.",                   color: "from-teal-400 to-green-500" },
  ];

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => { setCurrentSlide(prev => (prev + 1) % slides.length); }, 3000);
    return () => { clearInterval(timer); };
  }, [isOpen, slides.length]);

  if (!isOpen) return null;

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full z-10">
          <X className="w-5 h-5" />
        </button>

        {/* Animated header */}
        <div className={`bg-gradient-to-r ${slides[currentSlide].color} p-8 text-white text-center relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-20 h-20 bg-white rounded-full blur-2xl" />
            <div className="absolute bottom-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CurrentIcon className="w-10 h-10" />
            </div>
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">ðŸŽ Special Offer!</div>
          </div>
          <h2 className="text-2xl font-bold mb-2">{slides[currentSlide].title}</h2>
          <p className="text-white/90">{slides[currentSlide].description}</p>
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, index) => (
              <button key={index} onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-6' : 'bg-white/50 w-2'}`} />
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Sparkles className="w-5 h-5 text-yellow-500" />Premium Benefits Include:</h3>
            <ul className="space-y-2">
              {['Unlimited product listings','Priority customer support','Advanced analytics dashboard','Featured placement in search','Verified seller badge','Lower commission rates'].map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" /><span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Starting from just</p>
                <p className="text-2xl font-bold text-teal-600">100 XAF<span className="text-sm font-normal text-gray-500">/day</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 line-through">500 XAF/day</p>
                <p className="text-sm font-semibold text-red-500">80% OFF!</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={handleUpgrade}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-teal-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              <Crown className="w-5 h-5" />Upgrade Now<ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={handleMaybeLater} className="w-full py-3 text-gray-500 hover:text-gray-700 text-sm font-medium">Maybe Later</button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-1 text-xs text-gray-400"><Shield className="w-3 h-3" />Secure Payment</div>
            <div className="flex items-center gap-1 text-xs text-gray-400"><TrendingUp className="w-3 h-3" />Cancel Anytime</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UpgradeBanner: React.FC<{ onUpgrade?: () => void }> = ({ onUpgrade }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate("/subscription");
    }
  };

  return (
    <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg"><Crown className="w-5 h-5" /></div>
          <div>
            <p className="font-semibold">Upgrade to Premium</p>
            <p className="text-sm text-white/80">Unlock all features</p>
          </div>
        </div>
        <button onClick={handleClick} className="px-4 py-2 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Upgrade
        </button>
      </div>
    </div>
  );
};

export default UpgradePrompt;






