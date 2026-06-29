/**
 * ADVERTISEMENTS PAGE
 * 
 * Page for managing user's advertisements
 * 
 * Features:
 * - View all user's ads
 * - Create new advertisements
 * - Manage existing ads (pause, resume, renew, delete)
 * - View ad statistics
 * - Filter by status
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, TrendingUp, BarChart3, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AdCreationForm from '@/components/ads/AdCreationForm';
import AdCard from '@/components/ads/AdCard';
import { Advertisement, AdStatus } from '@/types/ads';
import { AnyItem } from '@/types/items';
import { useAuth } from '@/contexts/AuthContext';

export default function Advertisements() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [userItems, setUserItems] = useState<AnyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<AdStatus | 'all'>('all');
  
  useEffect(() => {
    loadAdvertisements();
    loadUserItems();
  }, []);
  
  const loadAdvertisements = async () => {
    // TODO: Load from Firebase
    setIsLoading(false);
  };
  
  const loadUserItems = async () => {
    // TODO: Load user's items from Firebase
  };
  
  const handleCreateAd = async (data: any) => {
    // TODO: Create advertisement in Firebase
    console.log('Creating ad:', data);
    setShowCreateForm(false);
  };
  
  const handlePauseAd = async (adId: string) => {
    // TODO: Pause advertisement
  };
  
  const handleResumeAd = async (adId: string) => {
    // TODO: Resume advertisement
  };
  
  const handleRenewAd = async (adId: string) => {
    // TODO: Renew advertisement
  };
  
  const handleDeleteAd = async (adId: string) => {
    if (confirm(t('ads.confirmDelete'))) {
      // TODO: Delete advertisement
    }
  };
  
  const filteredAds = advertisements.filter(ad => 
    activeTab === 'all' ? true : ad.status === activeTab
  );
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('ads.myAdvertisements')}
        </h1>
        <p className="text-gray-600">
          {t('ads.manageDescription')}
        </p>
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('ads.createNew')}
          </Button>
        </div>
        
        <Button variant="outline">
          <BarChart3 className="w-4 h-4 mr-2" />
          {t('ads.viewAnalytics')}
        </Button>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">{t('ads.all')}</TabsTrigger>
          <TabsTrigger value="active">{t('ads.active')}</TabsTrigger>
          <TabsTrigger value="paused">{t('ads.paused')}</TabsTrigger>
          <TabsTrigger value="expired">{t('ads.expired')}</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Ad Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('ads.noAds')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('ads.createFirstAd')}
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            {t('ads.createNew')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad) => (
            <AdCard
              key={ad.id}
              advertisement={ad}
              isOwner
              onPause={handlePauseAd}
              onResume={handleResumeAd}
              onRenew={handleRenewAd}
              onDelete={handleDeleteAd}
            />
          ))}
        </div>
      )}
      
      {/* Create Ad Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('ads.createAdvertisement')}</DialogTitle>
          </DialogHeader>
          <AdCreationForm
            items={userItems}
            isSubscriber={currentUser?.isSubscribed || false}
            onSubmit={handleCreateAd}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
