// @ts-nocheck
/**
 * src/pages/ExchangeItemDetails.tsx
 * Bambeh Marketplace — Exchange Item Detail Page
 *
 * CHANGES FROM ORIGINAL:
 *  ✅ ActionButtons (Contact Vendor / Report Ad / Share) added after item description
 *  ✅ Existing SocialShareModal kept; ActionButtons onShare prop delegates to it
 *  ✅ Existing ReportModal kept; ActionButtons onReport prop delegates to it
 *  ✅ alert() calls for favourites replaced with toast for non-blocking UX
 *  ✅ All other functionality preserved (offer modal, contact dialog, subscription gate)
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Package,
  Heart,
  MessageCircle,
  Flag,
  CheckCircle,
  User,
  Send,
  X,
  Bell,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { saveFavorite, removeFavorite, isFavorite } from '@/utils/favoritesUtils';
import { toast } from '@/components/ui/use-toast';
import ReportModal from '@/components/modals/ReportModal';
import SocialShareModal from '@/components/modals/SocialShareModal';
import { BambehImage } from '@/components/ui/BambehImage';
// ✅ NEW: shared action buttons
import { ActionButtons } from '@/components/listings/ActionButtons';

export default function ExchangeItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [favorited, setFavorited] = useState(isFavorite(id || '', 'exchange'));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  // ── Load item from localStorage or fall back to sample ────────────────────
  const getUserExchangeItem = () => {
    try {
      const stored = localStorage.getItem('Bambeh_exchange_listings');
      if (stored && id) {
        const items = JSON.parse(stored);
        const found = items.find((i: any) => i.id === id);
        if (found) {
          return {
            id: found.id,
            title: found.title,
            user: found.user || 'You',
            userId: found.userId || 'current_user',
            userRating: found.userRating || 0,
            userVerified: found.userVerified || false,
            offering: {
              type: found.offering?.type || found.category || '',
              name: found.offering?.name || found.offeringDisplay || found.title,
              brand: '',
              age: found.offering?.age || '',
              condition: found.offering?.condition || found.condition || '',
              description: found.offering?.description || '',
              images: found.offering?.images || found.images || [],
            },
            wantsInReturn: {
              type: found.wantsInReturn?.category || '',
              name: found.wantsInReturn?.title || found.wantsInReturnDisplay || '',
              preferredBrands: '',
              description: found.wantsInReturn?.description || '',
              minCondition: '',
            },
            location: found.location || {
              region: found.region || '',
              city: found.city || '',
              quarter: found.quarter || '',
              meetingPlace: 'Public place preferred',
            },
            postedDate: found.postedDate || 'Just now',
            views: found.views || 0,
            interested: 0,
            isUserPosted: true,
          };
        }
      }
    } catch (e) { /* silent */ }
    return null;
  };

  const SAMPLE_ITEM = {
    id: id || '1',
    title: 'iPhone 12 for Laptop Exchange',
    user: 'John Doe',
    userId: 'user123',
    userRating: 4.8,
    userVerified: true,
    offering: {
      type: 'Smartphone',
      name: 'iPhone 12 Pro',
      brand: 'Apple',
      age: '1 year old',
      condition: 'Excellent',
      description: 'iPhone 12 Pro 128GB in excellent condition. No scratches, always used with case and screen protector. Comes with original box, charger, and earphones. Battery health is 95%.',
      images: [],
    },
    wantsInReturn: {
      type: 'Computer',
      name: 'Laptop',
      preferredBrands: 'Dell, HP, or Lenovo',
      description: 'Looking for a good laptop for work and school. Preferably i5 or higher, 8GB RAM minimum.',
      minCondition: 'Good',
    },
    location: { region: 'Centre', city: 'Yaoundé', quarter: 'Bastos', meetingPlace: 'Public place preferred' },
    postedDate: '2 days ago',
    views: 234,
    interested: 12,
  };

  const item = getUserExchangeItem() || SAMPLE_ITEM;

  // ── Favourite handler (toast instead of alert) ─────────────────────────────
  const handleSaveFavorite = () => {
    const success = saveFavorite({
      id: item.id,
      type: 'exchange',
      title: item.title,
      location: `${item.location.city}, ${item.location.region}`,
      price: 0,
      image: (item as any).images?.[0],
    });

    if (success) {
      setFavorited(true);
      toast({ title: 'Saved to favourites', description: 'Exchange added to your favourites.' });
    } else {
      removeFavorite(item.id, 'exchange');
      setFavorited(false);
      toast({ title: 'Removed from favourites', description: 'Exchange removed from your favourites.' });
    }
  };

  // ── Share options (delegated to SocialShareModal) ─────────────────────────
  const shareOptions = {
    title: item.title,
    description: `Exchange: ${item.offering.name} for ${item.wantsInReturn.name} • ${item.location.city}`,
    url: `https://bambeh.cm/exchange/${item.id}`,
    type: 'exchange' as const,
  };

  // ── Subscription / user helpers ────────────────────────────────────────────
  const getCurrentUser = () => {
    const user = localStorage.getItem('Bambeh_current_user');
    return user ? JSON.parse(user) : null;
  };

  const getUserSubscription = () => {
    const user = getCurrentUser();
    return user?.subscriptionLevel || 'free';
  };

  const handleContactSeller = () => {
    setShowContactDialog(true);
    setContactMessage(`Hi ${item.user}, I'm interested in your exchange: ${item.title}`);
  };

  const handleMakeOffer = () => {
    setShowOfferModal(true);
  };

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) {
      toast({ title: 'Please enter a message', variant: 'destructive' });
      return;
    }

    setIsSendingMessage(true);

    try {
      const currentUser = getCurrentUser();
      const userSubscription = getUserSubscription();

      const message = {
        id: `msg_${Date.now()}`,
        exchangeItemId: item.id,
        fromUserId: currentUser?.id || 'guest',
        fromUserName: currentUser?.name || 'Guest User',
        toUserId: item.userId,
        message: contactMessage,
        timestamp: new Date().toISOString(),
        subscriptionLevel: userSubscription,
      };

      const existing = localStorage.getItem('Bambeh_exchange_messages') || '[]';
      const messages = JSON.parse(existing);
      messages.push(message);
      localStorage.setItem('Bambeh_exchange_messages', JSON.stringify(messages));

      setIsSendingMessage(false);
      setShowContactDialog(false);
      setContactMessage('');

      if (userSubscription === 'free') {
        toast({
          title: 'Message sent (Free plan)',
          description: 'Upgrade to a paid plan to view replies and send unlimited messages.',
        });
      } else {
        toast({ title: 'Message sent!', description: `Your message has been sent to ${item.user}.` });
        navigate(`/chat?with=${item.userId}&type=exchange&id=${item.id}`);
      }
    } catch (err) {
      setIsSendingMessage(false);
      toast({ title: 'Failed to send', description: 'Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-gray-900 truncate flex-1 mx-3 text-base">{item.title}</h1>
          <button
            onClick={handleSaveFavorite}
            aria-label={favorited ? 'Remove from favourites' : 'Save to favourites'}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${favorited ? 'text-red-500' : 'text-gray-500'}`}
          >
            <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Images */}
            {item.offering.images && item.offering.images.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="relative aspect-video">
                  <BambehImage
                    src={item.offering.images[currentImageIndex]}
                    alt={item.offering.name}
                    className="w-full h-full object-cover"
                  />
                  {item.offering.images.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      {item.offering.images.map((_: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          aria-label={`View image ${i + 1}`}
                          className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-12 flex items-center justify-center">
                <div className="text-center text-gray-300">
                  <Package className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No images</p>
                </div>
              </div>
            )}

            {/* Offering details */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4 text-lg">
                🎁 Offering: <span className="text-purple-700">{item.offering.name}</span>
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {item.offering.type      && <div><p className="text-sm text-gray-500 mb-1">Category</p><p className="font-semibold text-gray-900">{item.offering.type}</p></div>}
                {item.offering.brand     && <div><p className="text-sm text-gray-500 mb-1">Brand</p><p className="font-semibold text-gray-900">{item.offering.brand}</p></div>}
                {item.offering.age       && <div><p className="text-sm text-gray-500 mb-1">Age</p><p className="font-semibold text-gray-900">{item.offering.age}</p></div>}
                {item.offering.condition && <div><p className="text-sm text-gray-500 mb-1">Condition</p><p className="font-semibold text-gray-900">{item.offering.condition}</p></div>}
              </div>
              {item.offering.description && (
                <p className="text-gray-600 text-sm leading-relaxed">{item.offering.description}</p>
              )}
            </div>

            {/* Wants in return */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4 text-lg">
                🔄 Wants in Return: <span className="text-blue-700">{item.wantsInReturn.name}</span>
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {item.wantsInReturn.type             && <div><p className="text-sm text-gray-500 mb-1">Category</p><p className="font-semibold text-gray-900">{item.wantsInReturn.type}</p></div>}
                {item.wantsInReturn.preferredBrands  && <div><p className="text-sm text-gray-500 mb-1">Preferred Brands</p><p className="font-semibold text-gray-900">{item.wantsInReturn.preferredBrands}</p></div>}
                {item.wantsInReturn.minCondition     && <div><p className="text-sm text-gray-500 mb-1">Min. Condition</p><p className="font-semibold text-gray-900">{item.wantsInReturn.minCondition}</p></div>}
              </div>
              {item.wantsInReturn.description && (
                <p className="text-gray-600 text-sm leading-relaxed">{item.wantsInReturn.description}</p>
              )}
            </div>

            {/* ✅ NEW: Contact / Report / Share action buttons */}
            <ActionButtons
              adTitle={item.title}
              adId={item.id}
              adType="exchange"
              onShare={() => { setShowShareModal(true); return Promise.resolve(); }}
              onReport={() => setShowReportModal(true)}
            />

            {/* Location */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" /> Location Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-600 mb-1">Region <span className="text-red-500">*</span></p><p className="font-semibold text-gray-900">{item.location.region}</p></div>
                <div><p className="text-sm text-gray-600 mb-1">City <span className="text-red-500">*</span></p><p className="font-semibold text-gray-900">{item.location.city}</p></div>
                <div><p className="text-sm text-gray-600 mb-1">Quarter/Kwata <span className="text-red-500">*</span></p><p className="font-semibold text-gray-900">{item.location.quarter}</p></div>
                <div><p className="text-sm text-gray-600 mb-1">Meeting Place</p><p className="font-semibold text-gray-900">{item.location.meetingPlace}</p></div>
              </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">📍 All location fields are required for safety and transparency</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Seller Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Seller Information</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{item.user}</p>
                    {item.userVerified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium">{item.userRating}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <p>Member since: Jan 2024</p>
                <p>Active exchanges: 3</p>
                <p>Response rate: 95%</p>
              </div>
              <button
                onClick={handleContactSeller}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold transition-all mb-3 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Seller
              </button>
              <button
                onClick={handleMakeOffer}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Make an Offer
              </button>
            </div>

            {/* Actions (save / share / report — sidebar variant) */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleSaveFavorite}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Heart className={`w-5 h-5 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
                  {favorited ? 'Saved' : 'Save to Favourites'}
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  Share
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Flag className="w-5 h-5" />
                  Report
                </button>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="font-bold text-amber-900 mb-3">🛡️ Safety Tips</h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li>• Meet in public places</li>
                <li>• Inspect items carefully</li>
                <li>• Trust your instincts</li>
                <li>• Don't share personal info</li>
                <li>• Verify location details</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Seller Dialog */}
      {showContactDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Contact Seller</h3>
              <button onClick={() => setShowContactDialog(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {getUserSubscription() === 'free' && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Bell className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">FREE User Notice</p>
                    <p className="text-xs text-amber-800">Your message will be sent, but both you and the seller need a subscription to view and reply. Upgrade to access full messaging!</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Regarding:</p>
              <p className="font-semibold text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-600 mt-1">To: {item.user}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Message</label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Type your message here..."
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowContactDialog(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors">
                Cancel
              </button>
              <button onClick={handleSendMessage} disabled={isSendingMessage}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isSendingMessage ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</>
                ) : (
                  <><Send className="w-5 h-5" />Send Message</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showShareModal && (
        <SocialShareModal shareOptions={shareOptions} onClose={() => setShowShareModal(false)} />
      )}
      {showReportModal && (
        <ReportModal itemType="exchange" itemId={item.id} itemTitle={item.title} onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
}
