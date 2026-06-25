// @ts-nocheck
/**
 * SERVICE LIST PAGE � BAMBEH MARKETPLACE
 * FILE LOCATION: src/components/listings/ServiceList.tsx
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, DollarSign, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setMainOrigin } from '@/utils/navigationOrigin';
import { BambehImage } from '@/components/ui/BambehImage';

interface Service {
  id: string; title: string; category?: string; description?: string;
  price?: number; priceType?: string; provider?: string; contactName?: string;
  location?: string; quarter?: string; city?: string; region?: string;
  image?: string; rating?: number; reviewCount?: number; duration?: string;
  verified?: boolean; languages?: string[]; experience?: string; createdAt?: string;
}

const ServiceList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = () => {
    setLoading(true);
    try {
      const stored = JSON.parse(localStorage.getItem('Bambeh_service_listings') || '[]');
      setServices(stored);
    } catch (err) {
      console.error('Failed to load services:', err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
    const handler = () => loadServices();
    window.addEventListener('bambeh_listings_updated', handler);
    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'Bambeh_service_listings') loadServices();
    };
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('bambeh_listings_updated', handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  const formatPrice = (service: Service) => {
    if (!service.price && service.priceType !== 'negotiable') return null;
    if (service.priceType === 'negotiable') return 'Negotiable';
    const typeLabel: Record<string, string> = { fixed: '', hourly: '/hr', daily: '/day' };
    return `${service.price?.toLocaleString()} FCFA${typeLabel[service.priceType || 'fixed'] || ''}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="h-48 bg-gray-200 rounded-xl mb-4" />
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('services', 'Services')}</h1>
        <button onClick={loadServices} className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} onClick={() => navigate(`/services/${service.id}`)}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gray-100">
              <BambehImage src={service.image || '/placeholder-service.jpg'} alt={service.title}
                width={400} height={192} objectFit="cover" />
              {service.verified && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2 line-clamp-2">{service.title}</h3>
              <p className="text-gray-600 font-medium mb-2 text-sm">by {service.provider || service.contactName || 'Anonymous'}</p>
              {service.category && <Badge variant="secondary" className="mb-3">{service.category}</Badge>}
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm line-clamp-1">
                  {service.location || [service.quarter, service.city, service.region].filter(Boolean).join(', ')}
                </span>
              </div>
              {service.rating ? (
                <div className="flex items-center gap-1 mb-3">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">{service.rating}</span>
                  {service.reviewCount && <span className="text-xs text-gray-500">({service.reviewCount} reviews)</span>}
                </div>
              ) : null}
              <div className="space-y-1 mb-3">
                {service.duration && (
                  <div className="flex items-center text-sm text-gray-700">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{service.duration}</span>
                  </div>
                )}
                {formatPrice(service) && (
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="font-bold text-primary">{formatPrice(service)}</span>
                  </div>
                )}
              </div>
              {service.description && <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>}
            </div>
          </Card>
        ))}
      </div>

      {services.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">??</div>
          <p className="text-gray-500 text-lg mb-4">{t('noServicesFound', 'No services found yet')}</p>
          <p className="text-gray-400 mb-6">Be the first to offer a service!</p>
          <Button onClick={() => { setMainOrigin(); navigate('/offer-service'); }}>Offer a Service</Button>
        </div>
      )}
    </div>
  );
};

export default ServiceList;





