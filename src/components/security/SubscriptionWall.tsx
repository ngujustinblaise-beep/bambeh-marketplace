/**
 * ---------------------------------------------------------------------------
 * SUBSCRIPTION WALL - UPGRADE PROMPT
 * ---------------------------------------------------------------------------
 * 
 * ? Shows when free users try to access premium content
 * ? Beautiful upgrade prompt
 * ? Direct link to subscription plans
 * ? Context-aware messaging
 * 
 * © 2025 Bambeh. All rights reserved.
 * ---------------------------------------------------------------------------
 */

import { Link } from 'react-router-dom';
import { Lock, Zap, Shield, Crown } from 'lucide-react';

interface SubscriptionWallProps {
  action: 'location' | 'contact' | 'apply' | 'buy' | 'details' | 'post';
  message?: string;
  compact?: boolean;
}

export default function SubscriptionWall({ action, message, compact = false }: SubscriptionWallProps) {
  const messages = {
    location: {
      icon: <Lock className="w-12 h-12 text-purple-500" />,
      title: '?? Location Hidden',
      description: message || 'Unlock exact location details with any subscription plan!'
    },
    contact: {
      icon: <Shield className="w-12 h-12 text-purple-500" />,
      title: '?? Contact Locked',
      description: message || 'Subscribe to contact sellers and start conversations!'
    },
    apply: {
      icon: <Zap className="w-12 h-12 text-purple-500" />,
      title: '?? Application Locked',
      description: message || 'Get a subscription to apply for jobs and connect with employers!'
    },
    buy: {
      icon: <Crown className="w-12 h-12 text-purple-500" />,
      title: '?? Purchase Locked',
      description: message || 'Unlock purchasing power with a subscription plan!'
    },
    details: {
      icon: <Lock className="w-12 h-12 text-purple-500" />,
      title: '?? Full Details Locked',
      description: message || 'Subscribe to see complete information and all details!'
    },
    post: {
      icon: <Zap className="w-12 h-12 text-purple-500" />,
      title: '?? Posting Locked',
      description: message || 'Get a subscription to post your own ads and reach buyers!'
    }
  };

  const content = messages[action];

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-purple-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-purple-900">{content.title}</p>
            <p className="text-xs text-purple-700">{content.description}</p>
          </div>
          <Link
            to="/subscription-plans"
      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 text-sm font-bold transition-all whitespace-nowrap"
          >
            Upgrade
          </Link>
        </div>
      </div>
    );

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200 rounded-2xl p-8 text-center">
      <div className="flex justify-center mb-4">
        {content.icon}
      </div>
      
      <h3 className="text-2xl font-bold text-purple-900 mb-2">
        {content.title}
      </h3>
      
      <p className="text-purple-700 mb-6 max-w-md mx-auto">
        {content.description}
      </p>

      <div className="bg-white rounded-xl p-6 mb-6 max-w-md mx-auto">
        <h4 className="font-bold text-gray-900 mb-3">? Unlock Premium Features:</h4>
        <ul className="text-left text-sm text-gray-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">?</span>
            <span>View exact locations of all listings</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">?</span>
            <span>Contact sellers directly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">?</span>
            <span>Apply for jobs instantly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">?</span>
            <span>Buy items and complete purchases</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">?</span>
            <span>Post unlimited ads</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">?</span>
            <span>Access full details and descriptions</span>
          </li>
        </ul>
      </div>

      <Link
        to="/subscription-plans"
      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-bold text-lg shadow-lg transition-all"
      >
        <Crown className="w-5 h-5" />
        View Subscription Plans
      </Link>

      <p className="text-xs text-gray-500 mt-4">
        Plans start from as low as 500 XAF per day
      </p>
    </div>
  );
}
}


