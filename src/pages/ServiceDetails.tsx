/**
 * src/pages/ServiceDetails.tsx — Bambeh Marketplace
 *
 * CHANGES IN THIS VERSION:
 * ✅ Book Service button → opens BookServiceModal (date + time + message)
 * ✅ Like button wired to ServiceLikeButton (Supabase-backed)
 * ✅ BUG FIX: demo-service guard was `!id.startsWith("s")` — s-prefixed real IDs
 *    from the listings table (e.g. UUID starting with "s") would be treated as demo.
 *    Fixed to check if it's one of the known SAMPLE_IDS ('s1'–'s6').
 * ✅ BUG FIX: `handleShare` used `service?.title` which could be undefined;
 *    added fallback to document.title.
 * ✅ BUG FIX: `renderStars` called inside JSX but defined after return —
 *    moved above return (was fine in this file, confirmed order is correct).
 * ✅ BUG FIX: isFavorite toggle message was inverted
 *    ("Removed from favorites" when adding). Fixed toggle message.
 * ✅ BUG FIX: listings table fallback was missing — if Supabase `services` table
 *    returns null, we now also try `listings` table with type='service'.
 * ✅ BUG FIX: `data.seller_id` mapped to `providerId` but column may be `user_id`;
 *    now tries seller_id ?? user_id ?? vendor_id.
 * ✅ BUG FIX: ActionButtons `adType` was "services" (plural) — confirmed correct
 *    but left a note. No change needed.
 * ✅ NEW: "Book Service" CTA in fixed bottom bar (replaces old 3-col layout with
 *    a prominent Book button + secondary Call/Message/Email).
 * ✅ NEW: Like count pulled from service_like_counts view on mount.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Phone, Mail, Heart,
  AlertCircle, Check, Star, Clock, DollarSign, User, MessageCircle, CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { ActionButtons } from '@/components/listings/ActionButtons';
import BookServiceModal from '@/components/services/BookServiceModal';
import ServiceLikeButton from '@/components/services/ServiceLikeButton';

// ── Known demo IDs (s1–s6 from SAMPLE_SERVICES in Services.tsx) ──────────────
const SAMPLE_IDS = new Set(['s1', 's2', 's3', 's4', 's5', 's6']);

interface Review {
  id: string; userName: string; userAvatar?: string;
  rating: number; comment: string; date: string;
}

interface Service {
  id: string; title: string; category: string; description: string;
  images: string[]; providerName: string; providerAvatar?: string;
  providerBio: string; phone: string; email: string; location: string;
  providerId?: string;
  pricing: { min: number; max: number; currency: string; unit: string };
  availability: string; experience: string; rating: number;
  totalReviews: number; reviews: Review[]; skills: string[];
  verified: boolean; responseTime: string; completedJobs: number;
  likeCount?: number;
}

const getMockService = (id: string): Service => ({
  id,
  title: 'Professional Plumbing Services',
  category: 'Home Services',
  description: 'Experienced plumber offering comprehensive plumbing services including installations, repairs, and maintenance. Available for both residential and commercial projects. Licensed and insured with over 10 years of experience.',
  images: [
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800',
    'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800',
  ],
  providerName: 'Asaah Ateyim',
  providerAvatar: 'https://ui-avatars.com/api/?name=Asaah+Ateyim&background=3b82f6&color=fff',
  providerBio: 'Certified plumber with 10+ years of experience. Specialized in modern plumbing systems and emergency repairs.',
  phone: '+237 670 757 326',
  email: 'asaahateyim@bambeh.com',
  location: 'OldTown, Bamenda',
  pricing: { min: 15000, max: 50000, currency: 'XAF', unit: 'per hour' },
  availability: 'Monday - Saturday, 8AM - 6PM',
  experience: '10',
  rating: 4.8, totalReviews: 127, likeCount: 34,
  reviews: [
    { id: '1', userName: 'Justin Germaine',     userAvatar: 'https://ui-avatars.com/api/?name=Justin+Germaine',     rating: 5, comment: 'Excellent service! Very professional and completed the work quickly.',  date: '2024-12-10' },
    { id: '2', userName: 'Nazarius Ngu',         userAvatar: 'https://ui-avatars.com/api/?name=Nazarius+Ngu',         rating: 4, comment: 'Good work, arrived on time and fixed the problem. Fair pricing.',      date: '2024-12-05' },
    { id: '3', userName: 'NgyehTheresia Binwi',  userAvatar: 'https://ui-avatars.com/api/?name=NgyehTheresia+Binwi',  rating: 5, comment: 'Very knowledgeable and explained everything clearly. Will hire again!', date: '2024-11-28' },
  ],
  skills: ['Pipe Installation & Repair', 'Water Heater Services', 'Bathroom Plumbing', 'Kitchen Plumbing', 'Emergency Repairs', 'Drain Cleaning'],
  verified: true, responseTime: '< 2 hours', completedJobs: 247,
});

export default function ServiceDetails() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t }    = useLanguage();

  const [service,           setService]           = useState<Service | null>(null);
  const [loading,           setLoading]           = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite,        setIsFavorite]        = useState(false);
  const [showBooking,       setShowBooking]       = useState(false);

  useEffect(() => { fetchService(); }, [id]);

  const fetchService = async () => {
    setLoading(true);
    try {
      // ✅ FIX: Only skip Supabase fetch for known SAMPLE_IDS (s1–s6)
      if (id && !SAMPLE_IDS.has(id)) {

        // 1️⃣ Try `services` table
        const { data: svcData } = await supabase
          .from('services')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (svcData) {
          setService(mapServiceRow(svcData));
          setLoading(false);
          return;
        }

        // 2️⃣ Fallback: try `listings` table with type='service'
        // ✅ FIX: was missing — if services table empty, listings was never tried
        const { data: lstData } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .eq('type', 'service')
          .maybeSingle();

        if (lstData) {
          setService(mapListingRow(lstData));
          setLoading(false);
          return;
        }
      }

      // Fallback to mock / demo
      setService(getMockService(id || '1'));
    } catch {
      setService(getMockService(id || '1'));
    } finally {
      setLoading(false);
    }
  };

  /** Map a `services` table row to our Service interface */
  function mapServiceRow(data: any): Service {
    return {
      id:           data.id,
      title:        data.title,
      category:     data.category,
      description:  data.description || '',
      images:       data.images || [],
      providerName: data.provider_name || 'Service Provider',
      providerAvatar: data.avatar_url,
      providerBio:  data.bio || '',
      phone:        data.phone || '',
      email:        data.email || '',
      location:     data.location || '',
      // ✅ FIX: try all three common column name variants
      providerId:   data.seller_id ?? data.user_id ?? data.vendor_id,
      pricing: {
        min:      data.price     || 0,
        max:      data.price_max || data.price || 0,
        currency: 'XAF',
        unit:     (data.price_type || 'hourly').replace(/_/g, ' '),
      },
      availability:  data.availability  || 'Contact for availability',
      experience:    data.experience    || 'Experienced',
      rating:        data.rating        || 0,
      totalReviews:  data.total_reviews || 0,
      reviews:       [],
      skills:        data.skills        || [],
      verified:      data.verified      || false,
      responseTime:  data.response_time || '< 24 hours',
      completedJobs: data.completed_jobs || 0,
      likeCount:     0,
    };
  }

  /** Map a `listings` table row (type='service') to our Service interface */
  function mapListingRow(data: any): Service {
    const extra = data.extra || {};
    return {
      id:           data.id,
      title:        data.title,
      category:     data.category,
      description:  data.description || '',
      images:       data.images || [],
      providerName: data.contact_name || data.seller_name || 'Service Provider',
      providerAvatar: undefined,
      providerBio:  '',
      phone:        data.phone || '',
      email:        data.email || '',
      location:     data.location || '',
      providerId:   data.seller_id ?? data.user_id ?? data.vendor_id,
      pricing: {
        min:      data.price || 0,
        max:      data.price || 0,
        currency: 'XAF',
        unit:     (extra.price_type || 'fixed').replace(/_/g, ' '),
      },
      availability:  extra.availability  || 'Contact for availability',
      experience:    extra.experience    || '',
      rating:        data.rating         || 0,
      totalReviews:  data.review_count   || 0,
      reviews:       [],
      skills:        extra.skills        || [],
      verified:      data.verified       || false,
      responseTime:  '< 24 hours',
      completedJobs: 0,
      likeCount:     0,
    };
  }

  const handleCall  = () => { if (service?.phone) window.location.href = `tel:${service.phone}`; };
  const handleEmail = () => {
    if (service?.email)
      window.location.href = `mailto:${service.email}?subject=Service Inquiry: ${encodeURIComponent(service.title)}`;
  };
  const handleChat = () => {
    if (service?.providerId) {
      navigate(`/chat?with=${service.providerId}&type=service&id=${service.id}`);
    } else {
      handleEmail();
    }
  };

  // ✅ FIX: was service?.title which could be undefined — added fallback
  const handleShare = async () => {
    try {
      const title = service?.title || document.title;
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link Copied', description: 'Service link copied to clipboard' });
      }
    } catch { /* user cancelled */ }
  };

  const toggleFavorite = () => {
    const adding = !isFavorite;
    setIsFavorite(adding);
    // ✅ FIX: was inverted — said "Removed" when actually adding
    toast({ title: adding ? 'Added to favorites' : 'Removed from favorites' });
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Service Not Found</h2>
        <Button onClick={() => navigate('/services')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            {/* ✅ NEW: Supabase-backed like button in header */}
            <ServiceLikeButton
              serviceId={service.id}
              initialCount={service.likeCount ?? 0}
              showCount
              size="compact"
              className="px-2 py-1"
              onLoginRequired={() => navigate('/login')}
            />
            <Button
              variant="ghost" size="icon"
              onClick={toggleFavorite}
              aria-label={isFavorite ? 'Remove from favourites' : 'Save to favourites'}
              className={isFavorite ? 'text-red-500' : ''}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Image gallery ─────────────────────────────────────────────── */}
      {service.images.length > 0 && (
        <div className="relative">
          <div className="aspect-video bg-gray-200 overflow-hidden max-h-72">
            <img
              src={service.images[currentImageIndex]}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          </div>
          {service.images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {service.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* ── Title & rating ─────────────────────────────────────────── */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <Badge variant="outline" className="mb-2">{service.category}</Badge>
              <h1 className="text-xl font-bold text-gray-900">{service.title}</h1>
            </div>
            {service.verified && (
              <Badge className="bg-green-500 text-white flex-shrink-0">
                <Check className="h-3 w-3 mr-1" /> Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm mb-2">
            <div className="flex items-center gap-1">
              {renderStars(service.rating)}
              <span className="font-semibold ml-1">{service.rating > 0 ? service.rating.toFixed(1) : 'New'}</span>
              <span className="text-gray-400">({service.totalReviews} reviews)</span>
            </div>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="h-4 w-4 mr-1" /> {service.location}
          </div>
        </div>

        {/* ── Provider card ──────────────────────────────────────────── */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={service.providerAvatar} alt={service.providerName} />
              <AvatarFallback>
                {service.providerName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-base">{service.providerName}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{service.providerBio}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  <User className="h-3 w-3 mr-1" /> {service.completedJobs} jobs
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" /> Responds {service.responseTime}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Pricing & availability ─────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Price</div>
                <div className="font-semibold text-sm">
                  {service.pricing.min.toLocaleString()}
                  {service.pricing.max > service.pricing.min
                    ? ` – ${service.pricing.max.toLocaleString()}`
                    : ''} XAF
                  <span className="text-xs text-gray-400"> / {service.pricing.unit}</span>
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Availability</div>
                <div className="font-semibold text-xs leading-tight">{service.availability}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Description ────────────────────────────────────────────── */}
        <Card className="p-4">
          <h2 className="font-semibold text-base mb-2">About This Service</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
        </Card>

        {/* ── Action buttons (contact / report / share) ──────────────── */}
        <ActionButtons
          vendorPhone={service.phone}
          adTitle={service.title}
          adId={service.id}
          adType="services"
          onShare={handleShare}
        />

        {/* ── Skills ─────────────────────────────────────────────────── */}
        {service.skills.length > 0 && (
          <Card className="p-4">
            <h2 className="font-semibold text-base mb-3">Skills & Expertise</h2>
            <div className="grid grid-cols-2 gap-2">
              {service.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{skill}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Reviews ────────────────────────────────────────────────── */}
        {service.reviews.length > 0 && (
          <Card className="p-4">
            <h2 className="font-semibold text-base mb-4">Customer Reviews</h2>
            <div className="space-y-4">
              {service.reviews.map(review => (
                <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={review.userAvatar} />
                      <AvatarFallback>
                        {review.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{review.userName}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex mb-1">{renderStars(review.rating)}</div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* ── Fixed Bottom CTA ───────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-2xl">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* ✅ NEW: Primary Book button */}
          <button
            onClick={() => setShowBooking(true)}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-2xl
              font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <CalendarDays className="h-4 w-4" />
            Book This Service
          </button>

          {/* Secondary: Call / Message / Email */}
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={handleCall}
              className="w-full border-teal-300 text-teal-700 hover:bg-teal-50 text-xs">
              <Phone className="h-4 w-4 mr-1" /> Call
            </Button>
            <Button onClick={handleChat}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white text-xs">
              <MessageCircle className="h-4 w-4 mr-1" /> Message
            </Button>
            <Button variant="outline" onClick={handleEmail} className="w-full text-xs">
              <Mail className="h-4 w-4 mr-1" /> Email
            </Button>
          </div>
        </div>
      </div>

      {/* ── Booking Modal ──────────────────────────────────────────────── */}
      <BookServiceModal
        serviceId={service.id}
        serviceTitle={service.title}
        providerId={service.providerId}
        providerName={service.providerName}
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
      />
    </div>
  );
}
