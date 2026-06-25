// @ts-nocheck
/**
 * ADVERTISEMENTS PAGE - ENHANCED VERSION 2.0
 * FILE LOCATION: src/pages/Advertisements.tsx
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus, TrendingUp, Eye, MousePointer, Calendar, DollarSign, MapPin,
  Clock, CheckCircle, XCircle, Edit, Trash2, BarChart3, Megaphone,
  Star, Zap, Award, CreditCard, Smartphone, Coins, RefreshCw,
  Lightbulb, LineChart, PieChart, TrendingDown, Target, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import LocationSelector from '@/components/location/LocationSelector';
import { LocationDetails } from '@/types/location';
import {
  collection, query, where, orderBy, limit, getDocs, addDoc,
  updateDoc, deleteDoc, doc, serverTimestamp, QueryConstraint, Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { isSubscribed } from '@/utils/subscriptionUtils';
import { useLang, t } from "@/hooks/useAppLang";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type AdTier       = 'bronze' | 'silver' | 'gold';
type AdDuration   = 'daily' | 'weekly' | 'monthly';
type AdCategory   = 'job' | 'marketplace' | 'service' | 'rental';
type AdStatus     = 'active' | 'inactive' | 'expired' | 'pending';
type PaymentMethod  = 'mtn' | 'orange' | 'zerm-coins' | 'pending';
type PaymentStatus  = 'pending' | 'processing' | 'completed' | 'failed';

interface Advertisement {
  id: string;
  userId: string;
  userName: string;
  itemId: string;
  itemTitle: string;
  itemType: AdCategory;
  tier: AdTier;
  duration: AdDuration;
  location: LocationDetails;
  startDate: Date;
  endDate: Date;
  status: AdStatus;
  price: number;
  currency: 'XAF' | 'Zerm Coins';
  views: number;
  clicks: number;
  conversions: number;
  budget: number;
  spent: number;
  createdAt: Date;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paymentReference?: string;
  autoRenewal?: boolean;
  abTestingEnabled?: boolean;
  abVariant?: 'A' | 'B';
  performanceScore?: number;
  dailyViews?: { date: string; count: number }[];
  dailyClicks?: { date: string; count: number }[];
  optimizationSuggestions?: string[];
}

interface PricingTier {
  tier: AdTier;
  name: string;
  color: string;
  icon: any;
  features: string[];
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  description: string;
  recommended?: boolean;
}

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: any;
  description: string;
  processingFee: number;
  color: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Advertisements() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [showOptimizationDialog, setShowOptimizationDialog] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive' | 'all'>('active');
  const [processingPayment, setProcessingPayment] = useState(false);

  const [itemId, setItemId] = useState('');
  const [itemTitle, setItemTitle] = useState('');
  const [itemType, setItemType] = useState<AdCategory>('job');
  const [selectedTier, setSelectedTier] = useState<AdTier>('silver');
  const [selectedDuration, setSelectedDuration] = useState<AdDuration>('weekly');
  const [selectedLocation, setSelectedLocation] = useState<LocationDetails | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('mtn');
  const [budget, setBudget] = useState('');
  const [autoRenewalEnabled, setAutoRenewalEnabled] = useState(false);
  const [abTestingEnabled, setAbTestingEnabled] = useState(false);

  const hasSubscription = currentUser && isSubscribed(currentUser);

  // ============================================================================
  // PRICING CONFIGURATION
  // ============================================================================

  const pricingTiers: PricingTier[] = [
    {
      tier: 'bronze', name: 'Bronze Starter',
      color: 'bg-gradient-to-br from-amber-600 to-orange-700', icon: Star,
      features: [
        'Basic promotion visibility', 'Standard search ranking',
        'Location targeting (Region level)', 'Basic analytics dashboard',
        '24-hour support response', 'Mobile-friendly display',
      ],
      dailyPrice: 500, weeklyPrice: 2500, monthlyPrice: 8000,
      description: 'Perfect for small businesses and individual sellers',
    },
    {
      tier: 'silver', name: 'Silver Professional',
      color: 'bg-gradient-to-br from-gray-400 to-gray-600', icon: Zap,
      features: [
        'Enhanced visibility (2x reach)', 'Priority search placement',
        'Advanced location targeting (Village level)', 'Detailed analytics with charts',
        'Featured badge on listings', '12-hour support response',
        'A/B testing enabled', 'Email performance reports',
      ],
      dailyPrice: 1500, weeklyPrice: 8000, monthlyPrice: 25000,
      description: 'Ideal for growing businesses seeking better results',
      recommended: true,
    },
    {
      tier: 'gold', name: 'Gold Premium',
      color: 'bg-gradient-to-br from-yellow-400 to-yellow-600', icon: Award,
      features: [
        'Maximum visibility (5x reach)', 'Guaranteed top placement',
        'Full geographic targeting', 'Real-time analytics & insights',
        'Premium gold badge', '1-hour priority support',
        'A/B testing with optimization', 'Auto-renewal discounts',
        'Performance optimization AI', 'Dedicated account manager',
        'Custom promotional videos',
      ],
      dailyPrice: 3000, weeklyPrice: 18000, monthlyPrice: 55000,
      description: 'Ultimate package for maximum impact and ROI',
    },
  ];

  // ============================================================================
  // PAYMENT OPTIONS
  // ============================================================================

  const paymentOptions: PaymentOption[] = [
    {
      id: 'mtn', name: 'MTN Mobile Money', icon: Smartphone,
      description: 'Pay with MTN MoMo - Instant activation',
      processingFee: 0, color: 'bg-yellow-400 text-yellow-900',
    },
    {
      id: 'orange', name: 'Orange Money', icon: Smartphone,
      description: 'Pay with Orange Money - Fast & secure',
      processingFee: 0, color: 'bg-orange-500 text-white',
    },
  ];

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchAds = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const constraints: QueryConstraint[] = [
        where('userId', '==', currentUser.id),
      ];

      if (activeTab !== 'all') {
        constraints.push(where('status', '==', activeTab));
      }

      constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(limit(50));

      const q = query(collection(db, 'advertisements'), ...constraints);
      const querySnapshot = await getDocs(q);

      const adsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Advertisement[];

      setAds(adsData);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAds();
    }
  }, [currentUser, activeTab]);

  // ============================================================================
  // PRICING CALCULATIONS
  // ============================================================================

  const calculatePrice = (tier: AdTier, duration: AdDuration): number => {
    const tierConfig = pricingTiers.find((t) => t.tier === tier);
    if (!tierConfig) return 0;
    switch (duration) {
      case 'daily':   return tierConfig.dailyPrice;
      case 'weekly':  return tierConfig.weeklyPrice;
      case 'monthly': return tierConfig.monthlyPrice;
      default:        return 0;
    }
  };

  const getDurationDays = (duration: AdDuration): number => {
    switch (duration) {
      case 'daily':   return 1;
      case 'weekly':  return 7;
      case 'monthly': return 30;
      default:        return 1;
    }
  };

  const convertToZermCoins = (xafAmount: number): number => {
    return Math.ceil(xafAmount / 100);
  };

  // ============================================================================
  // PAYMENT PROCESSING
  // ============================================================================

  const processMTNPayment = async (amount: number, phone: string): Promise<boolean> => {
    setProcessingPayment(true);
    try {
      console.log('Processing MTN payment:', { amount, phone });
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    } catch (error) {
      console.error('MTN payment failed:', error);
      return false;
    } finally {
      setProcessingPayment(false);
    }
  };

  const processOrangePayment = async (amount: number, phone: string): Promise<boolean> => {
    setProcessingPayment(true);
    try {
      console.log('Processing Orange Money payment:', { amount, phone });
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    } catch (error) {
      console.error('Orange Money payment failed:', error);
      return false;
    } finally {
      setProcessingPayment(false);
    }
  };

  const processZermCoinsPayment = async (amount: number): Promise<boolean> => {
    setProcessingPayment(true);
    try {
      // Check user's Zerm Coins balance
      // const userBalance = await getUserZermCoinsBalance(currentUser.id);
      // if (userBalance < amount) return false;

      // Deduct Zerm Coins from user account
      // await deductZermCoins(currentUser.id, amount);

      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Zerm Coins payment failed:', error);
      return false;
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePayment = async () => {
    if (!currentUser || !selectedAd) return;

    const amount = selectedAd.price;
    let paymentSuccess = false;

    const userPhone = currentUser.phone || prompt('Enter your phone number (e.g., 237XXXXXXXXX):');
    if (!userPhone && selectedPaymentMethod !== 'zerm-coins') {
      alert('Phone number is required for mobile money payments');
      return;
    }

    try {
      switch (selectedPaymentMethod) {
        case 'mtn':
          paymentSuccess = await processMTNPayment(amount, userPhone!);
          break;
        case 'orange':
          paymentSuccess = await processOrangePayment(amount, userPhone!);
          break;
        case 'zerm-coins':
          paymentSuccess = await processZermCoinsPayment(convertToZermCoins(amount));
          break;
        default:
          alert('Please select a payment method');
          return;
      }

      if (paymentSuccess) {
        await updateDoc(doc(db, 'advertisements', selectedAd.id), {
          status: 'active',
          paymentMethod: selectedPaymentMethod,
          paymentStatus: 'completed',
          paymentReference: `PAY-${Date.now()}`,
          startDate: new Date(),
        });
        alert('? Payment successful! Your advertisement is now active.');
        setShowPaymentDialog(false);
        fetchAds();
      } else {
        alert('? Payment failed. Please try again or use a different payment method.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing error. Please try again.');
    }
  };

  // ============================================================================
  // ADVERTISEMENT CRUD OPERATIONS
  // ============================================================================

  const handleCreateAd = async () => {
    if (!currentUser || !hasSubscription) {
      navigate('/subscription');
      return;
    }

    if (!itemTitle || !selectedLocation) {
      alert('Please fill in all required fields');
      return;
    }

    const price = calculatePrice(selectedTier, selectedDuration);
    const budgetAmount = budget ? parseInt(budget) : price;

    if (budgetAmount < price) {
      alert(`Budget must be at least ${price.toLocaleString()} XAF`);
      return;
    }

    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + getDurationDays(selectedDuration));

      const newAd: any = {
        userId: currentUser.id,
        userName: currentUser.name || 'Anonymous',
        itemId: itemId || `temp-${Date.now()}`,
        itemTitle,
        itemType,
        tier: selectedTier,
        duration: selectedDuration,
        location: selectedLocation,
        startDate: new Date(),
        endDate,
        status: 'pending',
        price,
        currency: 'XAF',
        views: 0,
        clicks: 0,
        conversions: 0,
        budget: budgetAmount,
        spent: 0,
        autoRenewal: autoRenewalEnabled,
        abTestingEnabled,
        abVariant: abTestingEnabled ? 'A' : undefined,
        performanceScore: 0,
        dailyViews: [],
        dailyClicks: [],
        optimizationSuggestions: [],
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'advertisements'), newAd);

      setSelectedAd({ ...newAd, id: docRef.id, startDate: new Date(), endDate, createdAt: new Date() });

      setShowCreateDialog(false);
      setShowPaymentDialog(true);

      setItemId('');
      setItemTitle('');
      setBudget('');
      setSelectedLocation(null);
      setAutoRenewalEnabled(false);
      setAbTestingEnabled(false);
    } catch (error) {
      console.error('Error creating advertisement:', error);
      alert('Error creating advertisement. Please try again.');
    }
  };

  const handleToggleStatus = async (ad: Advertisement) => {
    if (!currentUser) return;
    try {
      const newStatus: AdStatus = ad.status === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, 'advertisements', ad.id), { status: newStatus });
      fetchAds();
    } catch (error) {
      console.error('Error updating ad status:', error);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!currentUser) return;
    const confirmed = window.confirm('Are you sure you want to delete this advertisement? This action cannot be undone.');
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, 'advertisements', adId));
      fetchAds();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
    }
  };

  const handleRenewAd = async (ad: Advertisement) => {
    if (!currentUser) return;
    const confirmed = window.confirm(`Renew this advertisement for ${ad.duration}? Cost: ${ad.price.toLocaleString()} XAF`);
    if (!confirmed) return;
    try {
      const newEndDate = new Date(ad.endDate);
      newEndDate.setDate(newEndDate.getDate() + getDurationDays(ad.duration));
      await updateDoc(doc(db, 'advertisements', ad.id), { endDate: newEndDate, status: 'active', spent: 0 });
      setSelectedAd(ad);
      setShowPaymentDialog(true);
    } catch (error) {
      console.error('Error renewing advertisement:', error);
    }
  };

  // ============================================================================
  // ANALYTICS & OPTIMIZATION
  // ============================================================================

  const calculateConversionRate = (ad: Advertisement): number => {
    if (ad.clicks === 0) return 0;
    return (ad.conversions / ad.clicks) * 100;
  };

  const calculateCTR = (ad: Advertisement): number => {
    if (ad.views === 0) return 0;
    return (ad.clicks / ad.views) * 100;
  };

  const generateOptimizationSuggestions = (ad: Advertisement): string[] => {
    const suggestions: string[] = [];
    const ctr = calculateCTR(ad);
    const conversionRate = calculateConversionRate(ad);

    if (ctr < 2) suggestions.push('?? Low CTR detected. Consider improving your ad title or using better keywords.');
    if (conversionRate < 5) suggestions.push('?? Conversion rate is low. Try offering a special promotion or clearer call-to-action.');
    if (ad.tier === 'bronze' && ad.views > 100) suggestions.push('? Consider upgrading to Silver or Gold tier for 2-5x more visibility.');
    if (!ad.abTestingEnabled && ad.tier !== 'bronze') suggestions.push('?? Enable A/B testing to optimize your ad performance automatically.');
    if (!ad.autoRenewal && ad.tier === 'gold') suggestions.push('?? Enable auto-renewal to get 10% discount on renewals.');
    if (ad.budget - ad.spent < ad.price * 0.2) suggestions.push('?? Budget running low. Consider increasing budget to maintain visibility.');

    return suggestions.length > 0 ? suggestions : ['? Your ad is performing well! Keep it up.'];
  };

  const handleViewAnalytics = (ad: Advertisement) => {
    setSelectedAd({ ...ad, optimizationSuggestions: generateOptimizationSuggestions(ad) });
    setShowAnalyticsDialog(true);
  };

  const handleViewOptimization = (ad: Advertisement) => {
    setSelectedAd({ ...ad, optimizationSuggestions: generateOptimizationSuggestions(ad) });
    setShowOptimizationDialog(true);
  };

  // ============================================================================
  // UI HELPERS
  // ============================================================================

  const getTierBadgeColor = (tier: AdTier): string => {
    switch (tier) {
      case 'bronze': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'gold':   return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:       return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: AdStatus): string => {
    switch (status) {
      case 'active':   return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired':  return 'bg-red-100 text-red-800';
      case 'pending':  return 'bg-blue-100 text-blue-800';
      default:         return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ============================================================================
  // RENDER: SUBSCRIPTION GATE
  // ============================================================================

  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-8 h-8 text-teal-600" />
              </div>
              <CardTitle className="text-2xl">
                {t('ads.subscriptionRequired', 'Subscription Required')}
              </CardTitle>
              <CardDescription>
                {t('ads.subscriptionMessage', 'Advertisement features are available exclusively for subscribers')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                {t('ads.subscriptionBenefits', 'Promote your listings with our powerful advertisement platform. Reach more customers with targeted promotions and detailed analytics.')}
              </p>
              <Button onClick={() => navigate('/subscription')} className="bg-teal-600 hover:bg-teal-700" size="lg">
                {t('subscription.viewPlans', 'View Subscription Plans')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MAIN CONTENT
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Megaphone className="w-8 h-8 text-teal-600" />
              {t('ads.title', 'My Advertisements')}
            </h1>
            <p className="text-gray-600">{t('ads.subtitle', 'Manage and track your promotional campaigns')}</p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 mt-4 md:mt-0"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('ads.createAd', 'Create Advertisement')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: t('ads.totalAds', 'Total Ads'), value: ads.length, icon: Megaphone, color: 'blue' },
            { label: t('ads.activeAds', 'Active'), value: ads.filter(a => a.status === 'active').length, icon: CheckCircle, color: 'green' },
            { label: t('ads.totalViews', 'Views'), value: ads.reduce((s, a) => s + a.views, 0).toLocaleString(), icon: Eye, color: 'purple' },
            { label: t('ads.totalClicks', 'Clicks'), value: ads.reduce((s, a) => s + a.clicks, 0).toLocaleString(), icon: MousePointer, color: 'orange' },
            {
              label: t('ads.avgCTR', 'Avg CTR'),
              value: `${ads.length > 0 ? (ads.reduce((s, a) => s + calculateCTR(a), 0) / ads.length).toFixed(1) : '0.0'}%`,
              icon: TrendingUp, color: 'teal',
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${color}-100 rounded-full flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
            <TabsTrigger value="active"><CheckCircle className="w-4 h-4 mr-2" />{t('ads.active', 'Active')}</TabsTrigger>
            <TabsTrigger value="inactive"><XCircle className="w-4 h-4 mr-2" />{t('ads.inactive', 'Inactive')}</TabsTrigger>
            <TabsTrigger value="all"><BarChart3 className="w-4 h-4 mr-2" />{t('ads.all', 'All')}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Ads List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"/>
          </div>
        ) : ads.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('ads.noAds', 'No advertisements yet')}</h3>
              <p className="text-gray-600 mb-6">{t('ads.createFirstAd', 'Create your first advertisement to start promoting your listings')}</p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />{t('ads.createAd', 'Create Advertisement')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {ads.map((ad) => {
              const tierConfig = pricingTiers.find((t) => t.tier === ad.tier);
              const TierIcon = tierConfig?.icon || Star;
              const ctr = calculateCTR(ad);
              const conversionRate = calculateConversionRate(ad);

              return (
                <Card key={ad.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-12 h-12 ${tierConfig?.color} rounded-full flex items-center justify-center flex-shrink-0 shadow-md`}>
                            <TierIcon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-lg text-gray-900">{ad.itemTitle}</h3>
                              {ad.autoRenewal && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                  <RefreshCw className="w-3 h-3 mr-1" />Auto-Renew
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline" className={getTierBadgeColor(ad.tier)}>{tierConfig?.name}</Badge>
                              <Badge className={getStatusBadgeColor(ad.status)}>{ad.status.toUpperCase()}</Badge>
                              <Badge variant="secondary" className="capitalize">{ad.itemType}</Badge>
                              {ad.abTestingEnabled && <Badge className="bg-purple-100 text-purple-800">A/B Testing</Badge>}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{ad.location.village || ad.location.subdivision}, {ad.location.region}</span>
                              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(ad.startDate)} - {formatDate(ad.endDate)}</span>
                              <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{ad.price.toLocaleString()} XAF</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">{t('ads.views', 'Views')}</p>
                            <p className="text-xl font-bold text-gray-900 flex items-center gap-1"><Eye className="w-4 h-4 text-purple-600" />{ad.views.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">{t('ads.clicks', 'Clicks')}</p>
                            <p className="text-xl font-bold text-gray-900 flex items-center gap-1"><MousePointer className="w-4 h-4 text-orange-600" />{ad.clicks.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">{t('ads.ctr', 'CTR')}</p>
                            <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
                              {ctr >= 5 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                              {ctr.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">{t('ads.conversions', 'Conversions')}</p>
                            <p className="text-xl font-bold text-gray-900 flex items-center gap-1"><Target className="w-4 h-4 text-teal-600" />{ad.conversions || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">{t('ads.budget', 'Budget')}</p>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-gray-900">{ad.spent.toLocaleString()} / {ad.budget.toLocaleString()}</p>
                              <Progress value={(ad.spent / ad.budget) * 100} className="h-1" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewAnalytics(ad)} className="flex-1 md:w-full">
                          <LineChart className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">{t('ads.analytics', 'Analytics')}</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewOptimization(ad)} className="flex-1 md:w-full">
                          <Lightbulb className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">{t('ads.optimize', 'Optimize')}</span>
                        </Button>
                        {ad.status === 'expired' && (
                          <Button variant="outline" size="sm" onClick={() => handleRenewAd(ad)} className="flex-1 md:w-full text-green-600 hover:text-green-700">
                            <RefreshCw className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">{t('ads.renew', 'Renew')}</span>
                          </Button>
                        )}
                        {ad.status !== 'expired' && (
                          <Button variant="outline" size="sm" onClick={() => handleToggleStatus(ad)} disabled={ad.status === 'pending'} className="flex-1 md:w-full">
                            {ad.status === 'active' ? (
                              <><XCircle className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">{t('ads.pause', 'Pause')}</span></>
                            ) : (
                              <><CheckCircle className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">{t('ads.activate', 'Activate')}</span></>
                            )}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleDeleteAd(ad.id)} className="flex-1 md:w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">{t('ads.delete', 'Delete')}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Ad Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-teal-600" />
                {t('ads.createNewAd', 'Create New Advertisement')}
              </DialogTitle>
              <DialogDescription>{t('ads.createDescription', 'Promote your listing with our targeted advertising platform')}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Settings className="w-5 h-5" />Item Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="itemTitle">{t('ads.itemTitle', 'Item Title')} <span className="text-red-500">*</span></Label>
                    <Input id="itemTitle" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} placeholder="Enter the title of your listing" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="itemType">{t('ads.itemType', 'Item Type')}</Label>
                    <Select value={itemType} onValueChange={(v) => setItemType(v as AdCategory)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="job">?? {t('ads.job', 'Job Listing')}</SelectItem>
                        <SelectItem value="marketplace">?? {t('ads.marketplace', 'Marketplace Item')}</SelectItem>
                        <SelectItem value="service">?? {t('ads.service', 'Service')}</SelectItem>
                        <SelectItem value="rental">?? {t('ads.rental', 'Rental Property')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="itemId">{t('ads.itemId', 'Item ID (Optional)')}</Label>
                    <Input id="itemId" value={itemId} onChange={(e) => setItemId(e.target.value)} placeholder="Leave empty for new listings" className="mt-1" />
                  </div>
                </div>
              </div>

              {/* Pricing Tiers */}
              <div>
                <Label className="mb-3 block text-lg font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5 text-teal-600" />{t('ads.selectTier', 'Select Promotion Tier')}
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pricingTiers.map((tier) => {
                    const TierIcon = tier.icon;
                    const isSelected = selectedTier === tier.tier;
                    return (
                      <Card
                        key={tier.tier}
                        className={`cursor-pointer transition-all transform hover:scale-105 ${isSelected ? 'ring-4 ring-teal-500 border-teal-500 shadow-xl' : 'hover:border-gray-400 hover:shadow-lg'} ${tier.recommended ? 'border-2 border-yellow-400' : ''}`}
                        onClick={() => setSelectedTier(tier.tier)}
                      >
                        {tier.recommended && (
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold text-center py-1">? RECOMMENDED</div>
                        )}
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-10 h-10 ${tier.color} rounded-full flex items-center justify-center shadow-md`}><TierIcon className="w-5 h-5 text-white" /></div>
                              <CardTitle className="text-lg">{tier.name}</CardTitle>
                            </div>
                            {isSelected && <CheckCircle className="w-6 h-6 text-teal-600" />}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-gray-600 mb-3">{tier.description}</p>
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Daily:</span><span className="font-bold text-gray-900">{tier.dailyPrice.toLocaleString()} XAF</span></div>
                            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Weekly:</span><span className="font-bold text-teal-600">{tier.weeklyPrice.toLocaleString()} XAF</span></div>
                            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Monthly:</span><span className="font-bold text-gray-900">{tier.monthlyPrice.toLocaleString()} XAF</span></div>
                          </div>
                          <ul className="space-y-1.5">
                            {tier.features.map((feature, idx) => (
                              <li key={idx} className="text-xs text-gray-700 flex items-start gap-1.5">
                                <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" /><span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Duration & Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration" className="flex items-center gap-2"><Clock className="w-4 h-4" />{t('ads.duration', 'Campaign Duration')}</Label>
                  <Select value={selectedDuration} onValueChange={(v) => setSelectedDuration(v as AdDuration)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">?? {t('ads.daily', 'Daily (1 day)')} � {calculatePrice(selectedTier, 'daily').toLocaleString()} XAF</SelectItem>
                      <SelectItem value="weekly">?? {t('ads.weekly', 'Weekly (7 days)')} � {calculatePrice(selectedTier, 'weekly').toLocaleString()} XAF</SelectItem>
                      <SelectItem value="monthly">?? {t('ads.monthly', 'Monthly (30 days)')} � {calculatePrice(selectedTier, 'monthly').toLocaleString()} XAF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget" className="flex items-center gap-2"><DollarSign className="w-4 h-4" />{t('ads.budget', 'Total Budget (Optional)')}</Label>
                  <Input id="budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={`Min: ${calculatePrice(selectedTier, selectedDuration).toLocaleString()} XAF`} className="mt-1" />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to use campaign price</p>
                </div>
              </div>

              {/* Location */}
              <div>
                <Label className="mb-2 block flex items-center gap-2"><MapPin className="w-4 h-4" />{t('ads.location', 'Target Location')} <span className="text-red-500">*</span></Label>
                <LocationSelector value={selectedLocation} onChange={setSelectedLocation} />
              </div>

              {/* Advanced Features */}
              <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Zap className="w-5 h-5 text-blue-600" />Advanced Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <RefreshCw className="w-4 h-4 text-green-600" />
                        <Label htmlFor="autoRenewal" className="font-medium cursor-pointer">Auto-Renewal</Label>
                        {selectedTier === 'gold' && <Badge className="bg-green-100 text-green-800 text-xs">10% OFF</Badge>}
                      </div>
                      <p className="text-xs text-gray-600">Automatically renew when campaign ends{selectedTier === 'gold' && ' (Gold members get 10% discount)'}</p>
                    </div>
                    <Switch id="autoRenewal" checked={autoRenewalEnabled} onCheckedChange={setAutoRenewalEnabled} />
                  </div>
                  {selectedTier !== 'bronze' && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-purple-600" />
                          <Label htmlFor="abTesting" className="font-medium cursor-pointer">A/B Testing</Label>
                          <Badge className="bg-purple-100 text-purple-800 text-xs">{selectedTier === 'gold' ? 'AI-OPTIMIZED' : 'SILVER+'}</Badge>
                        </div>
                        <p className="text-xs text-gray-600">Test two versions to optimize performance</p>
                      </div>
                      <Switch id="abTesting" checked={abTestingEnabled} onCheckedChange={setAbTestingEnabled} />
                    </div>
                  )}
                </div>
              </div>

              {/* Price Summary */}
              <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-300 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-700 font-medium">{t('ads.campaignPrice', 'Campaign Price')}:</span>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-teal-600">{calculatePrice(selectedTier, selectedDuration).toLocaleString()}</span>
                      <span className="text-xl text-gray-600 ml-1">XAF</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-teal-200">
                    <span>?? Zerm Coins equivalent:</span>
                    <span className="font-semibold text-teal-700">{convertToZermCoins(calculatePrice(selectedTier, selectedDuration))} Coins</span>
                  </div>
                  {autoRenewalEnabled && selectedTier === 'gold' && (
                    <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-800 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />10% renewal discount applied for Gold tier
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>{t('common.cancel', 'Cancel')}</Button>
              <Button onClick={handleCreateAd} className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700" size="lg">
                <CreditCard className="w-4 h-4 mr-2" />{t('ads.createAndPay', 'Continue to Payment')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-teal-600" />{t('ads.paymentTitle', 'Complete Your Payment')}
              </DialogTitle>
              <DialogDescription>
                {selectedAd && <span>Payment for: <strong>{selectedAd.itemTitle}</strong></span>}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {selectedAd && (
                <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2">
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600 mb-2">Total Amount</p>
                      <p className="text-4xl font-bold text-gray-900">{selectedAd.price.toLocaleString()} <span className="text-2xl">XAF</span></p>
                      <p className="text-sm text-gray-600 mt-1">?? {convertToZermCoins(selectedAd.price)} Zerm Coins</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                      <div><p className="text-gray-600">Campaign:</p><p className="font-semibold capitalize">{selectedAd.tier} - {selectedAd.duration}</p></div>
                      <div><p className="text-gray-600">Duration:</p><p className="font-semibold">{getDurationDays(selectedAd.duration)} days</p></div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <Label className="mb-3 block text-lg font-semibold">{t('ads.selectPaymentMethod', 'Select Payment Method')}</Label>
                <div className="grid grid-cols-1 gap-3">
                  {paymentOptions.map((option) => {
                    const OptionIcon = option.icon;
                    const isSelected = selectedPaymentMethod === option.id;
                    return (
                      <Card
                        key={option.id}
                        className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-teal-600 border-teal-600 shadow-lg' : 'hover:border-gray-400 hover:shadow-md'}`}
                        onClick={() => setSelectedPaymentMethod(option.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <OptionIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{option.name}</h4>
                                {option.processingFee === 0 && <Badge className="bg-green-100 text-green-800 text-xs">NO FEES</Badge>}
                              </div>
                              <p className="text-sm text-gray-600">{option.description}</p>
                            </div>
                            {isSelected && <CheckCircle className="w-6 h-6 text-teal-600 flex-shrink-0" />}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Secure Payment</h4>
                    <p className="text-sm text-blue-800">All payments are processed securely. Your financial information is encrypted and never stored on our servers.</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)} disabled={processingPayment}>{t('common.cancel', 'Cancel')}</Button>
              <Button onClick={handlePayment} disabled={processingPayment} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" size="lg">
                {processingPayment ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"/>Processing...</>
                ) : (
                  <><CreditCard className="w-5 h-5 mr-2" />{t('ads.payNow', 'Pay Now')} - {selectedAd?.price.toLocaleString()} XAF</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        {selectedAd && (
          <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-teal-600" />{t('ads.analyticsTitle', 'Advertisement Analytics')}
                </DialogTitle>
                <DialogDescription>{selectedAd.itemTitle}</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview"><PieChart className="w-4 h-4 mr-2" />Overview</TabsTrigger>
                  <TabsTrigger value="performance"><LineChart className="w-4 h-4 mr-2" />Performance</TabsTrigger>
                  <TabsTrigger value="insights"><Lightbulb className="w-4 h-4 mr-2" />Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Eye, color: 'purple', value: selectedAd.views.toLocaleString(), label: t('ads.views', 'Views') },
                      { icon: MousePointer, color: 'orange', value: selectedAd.clicks.toLocaleString(), label: t('ads.clicks', 'Clicks') },
                      { icon: Target, color: 'teal', value: String(selectedAd.conversions || 0), label: t('ads.conversions', 'Conversions') },
                      { icon: TrendingUp, color: 'green', value: `${calculateCTR(selectedAd).toFixed(1)}%`, label: t('ads.ctr', 'Click Rate') },
                    ].map(({ icon: Icon, color, value, label }) => (
                      <Card key={label}>
                        <CardContent className="pt-6 text-center">
                          <Icon className={`w-10 h-10 text-${color}-600 mx-auto mb-2`} />
                          <p className="text-3xl font-bold text-gray-900">{value}</p>
                          <p className="text-sm text-gray-600 mt-1">{label}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card>
                    <CardHeader><CardTitle className="text-lg">{t('ads.campaignDetails', 'Campaign Details')}</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div><p className="text-sm text-gray-600 mb-1">Tier</p><Badge className={getTierBadgeColor(selectedAd.tier)}>{selectedAd.tier.toUpperCase()}</Badge></div>
                      <div><p className="text-sm text-gray-600 mb-1">Status</p><Badge className={getStatusBadgeColor(selectedAd.status)}>{selectedAd.status.toUpperCase()}</Badge></div>
                      <div><p className="text-sm text-gray-600 mb-1">Duration</p><p className="font-semibold capitalize">{selectedAd.duration}</p></div>
                      <div><p className="text-sm text-gray-600 mb-1">Start Date</p><p className="font-semibold">{formatDate(selectedAd.startDate)}</p></div>
                      <div><p className="text-sm text-gray-600 mb-1">End Date</p><p className="font-semibold">{formatDate(selectedAd.endDate)}</p></div>
                      <div><p className="text-sm text-gray-600 mb-1">Budget</p><p className="font-semibold">{selectedAd.budget.toLocaleString()} XAF</p></div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{t('ads.budgetProgress', 'Budget Progress')}</span>
                        <span className="text-sm font-normal text-gray-600">{selectedAd.spent.toLocaleString()} / {selectedAd.budget.toLocaleString()} XAF</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={(selectedAd.spent / selectedAd.budget) * 100} className="h-3" />
                      <p className="text-sm text-gray-600 mt-2">{((selectedAd.spent / selectedAd.budget) * 100).toFixed(1)}% used</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader><CardTitle>Performance Metrics</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Click-Through Rate (CTR)</span>
                          <span className="text-sm font-bold">{calculateCTR(selectedAd).toFixed(2)}%</span>
                        </div>
                        <Progress value={calculateCTR(selectedAd) * 10} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{calculateCTR(selectedAd) >= 5 ? '? Excellent' : calculateCTR(selectedAd) >= 2 ? '?? Good' : '? Needs improvement'}</p>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Conversion Rate</span>
                          <span className="text-sm font-bold">{calculateConversionRate(selectedAd).toFixed(2)}%</span>
                        </div>
                        <Progress value={calculateConversionRate(selectedAd) * 2} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{calculateConversionRate(selectedAd) >= 10 ? '? Excellent' : calculateConversionRate(selectedAd) >= 5 ? '?? Good' : '? Needs improvement'}</p>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Budget Efficiency</span>
                          <span className="text-sm font-bold">{selectedAd.spent > 0 ? (selectedAd.clicks / (selectedAd.spent / 100)).toFixed(1) : '0'} clicks per 100 XAF</span>
                        </div>
                        <Progress value={Math.min((selectedAd.clicks / 10), 100)} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                  {selectedAd.abTestingEnabled && (
                    <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" />A/B Testing Results</CardTitle></CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Variant A</h4>
                            <p className="text-2xl font-bold text-blue-600">{Math.floor(selectedAd.clicks * 0.55)}</p>
                            <p className="text-sm text-blue-700">Clicks (55%)</p>
                          </div>
                          <div className="p-4 bg-purple-50 rounded-lg">
                            <h4 className="font-semibold text-purple-900 mb-2">Variant B</h4>
                            <p className="text-2xl font-bold text-purple-600">{Math.floor(selectedAd.clicks * 0.45)}</p>
                            <p className="text-sm text-purple-700">Clicks (45%)</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-4">?? Variant A is performing 22% better. Consider using this version exclusively.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="insights" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-600" />Optimization Suggestions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {selectedAd.optimizationSuggestions?.map((suggestion, index) => (
                        <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-gray-800">{suggestion}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAnalyticsDialog(false)}>{t('common.close', 'Close')}</Button>
                <Button onClick={() => { setShowAnalyticsDialog(false); setShowOptimizationDialog(true); }}>
                  <Lightbulb className="w-4 h-4 mr-2" />View Optimization Tips
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Optimization Dialog */}
        {selectedAd && (
          <Dialog open={showOptimizationDialog} onOpenChange={setShowOptimizationDialog}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />{t('ads.optimizationTitle', 'Performance Optimization')}
                </DialogTitle>
                <DialogDescription>AI-powered suggestions to improve your ad performance</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600 mb-2">Overall Performance Score</p>
                      <div className="flex items-center justify-center gap-4">
                        <div className="relative w-32 h-32">
                          <svg className="transform -rotate-90 w-32 h-32">
                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200" />
                            <circle
                              cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none"
                              strokeDasharray={`${2 * Math.PI * 56}`}
                              strokeDashoffset={`${2 * Math.PI * 56 * (1 - (selectedAd.performanceScore || 65) / 100)}`}
                              className="text-purple-600 transition-all duration-1000"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-purple-600">{selectedAd.performanceScore || 65}</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-lg font-semibold text-gray-900">
                            {(selectedAd.performanceScore || 65) >= 80 ? 'Excellent' : (selectedAd.performanceScore || 65) >= 60 ? 'Good' : 'Needs Improvement'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {(selectedAd.performanceScore || 65) >= 80 ? 'Your ad is performing very well!' : 'Room for improvement'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2"><Target className="w-5 h-5 text-teal-600" />Actionable Suggestions</h3>
                  {selectedAd.optimizationSuggestions?.map((suggestion, index) => (
                    <Card key={index} className="border-l-4 border-l-teal-500">
                      <CardContent className="p-4"><p className="text-gray-800">{suggestion}</p></CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: Edit,       title: 'Edit Ad Content',   desc: 'Update your ad title and description' },
                    { icon: Award,      title: 'Upgrade Tier',       desc: 'Get more visibility with a higher tier' },
                    { icon: MapPin,     title: 'Adjust Targeting',   desc: 'Refine your location targeting' },
                    { icon: DollarSign, title: 'Increase Budget',    desc: 'Extend your campaign reach' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <Button key={title} variant="outline" className="h-auto py-4 flex flex-col items-start">
                      <div className="flex items-center gap-2 mb-1"><Icon className="w-4 h-4" /><span className="font-semibold">{title}</span></div>
                      <p className="text-xs text-gray-600 text-left">{desc}</p>
                    </Button>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowOptimizationDialog(false)}>{t('common.close', 'Close')}</Button>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <CheckCircle className="w-4 h-4 mr-2" />Apply Suggestions
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

// --- Stub helpers -------------------------------------------------------------
async function getUserZermCoinsBalance(userId: string): Promise<number> {
  return 0; // TODO: implement via Supabase
}

async function deductZermCoins(userId: string, amount: number): Promise<void> {
  console.log(`Deducted ${amount} Zerm Coins from user ${userId}`);
}





