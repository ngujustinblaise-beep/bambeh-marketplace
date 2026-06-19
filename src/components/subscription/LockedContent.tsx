import React, { ReactNode } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from '@/contexts/SubscriptionContext';

interface LockedContentProps {
  children: ReactNode;
  preview?: ReactNode;
  message?: string;
  onUnlockClick?: () => void;
  category?: 'jobs' | 'marketplace' | 'services' | 'rentals';
}

export const LockedContent: React.FC<LockedContentProps> = ({
  children,
  preview,
  message = "Subscribe to unlock this content",
  onUnlockClick,
  category
}) => {
  const { hasAccess, subscription } = useSubscription();
  const canViewFull = hasAccess('canViewFullDetails');

  if (canViewFull) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      {preview && (
        <div className="relative">
          <div className="blur-sm pointer-events-none select-none opacity-50">
            {preview}
          </div>
        </div>
      )}

      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-2 border-indigo-200 dark:border-indigo-800">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-50 rounded-full" />
            <div className="relative bg-white dark:bg-gray-900 p-4 rounded-full border-2 border-indigo-500">
              <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Premium Content Locked
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md">
              {message}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current Plan: <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
                {subscription.tier}
              </span>
            </p>
          </div>

          <Button
            onClick={onUnlockClick}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Unlock with Premium
          </Button>

          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>? Unlimited views in all categories</p>
            <p>? Contact sellers and employers directly</p>
            <p>? Priority listings & ad-free experience</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
