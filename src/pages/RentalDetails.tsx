import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Bed, Bath, Home, Phone, Mail, Share2, Heart, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

interface RentalProperty {
  id: string;
  title: string;
  type: string; // apartment, house, studio, commercial,
  price: number;
  currency: string;
  period: string; // monthly, yearly,
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number; // in square meters,
  description: string;
  images: string[];
  amenities: string[];
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  verified: boolean;
  available: boolean;
  postedDate: string;
  deposit: number;
  furnished: boolean;
}

export default function RentalDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [rental, setRental] = useState<RentalProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchRentalDetails();
  }, [id]);

  const fetchRentalDetails = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with your Firebase query
      // Example: const doc = await getDoc(doc(db, 'rentals', id));
      
      // MOCK DATA for demonstration - Replace with Firebase call
      const mockRental: RentalProperty = {
        id: id || '1',
        title: 'Luxury 3 Bedroom Apartment in Bastos',
        type: 'apartment',
        price: 350000,
        currency: 'XAF',
        period: 'monthly',
        location: 'Bastos, Yaoundé',
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        description: 'Beautiful modern apartment in the heart of Bastos. Features include modern kitchen, spacious living room, balcony with city views, 24/7 security, backup generator, and parking space. Close to international schools, restaurants, and shopping centers.',
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        ],
        amenities: ['Air Conditioning', 'WiFi', 'Parking', 'Security', 'Generator', 'Kitchen', 'Balcony'],
        ownerName: 'Emilia Monica Fen',
        ownerPhone: '+237 670 757 326',
        ownerEmail: 'emimonifen@example.com',
        verified: true,
        available: true,
        postedDate: '2024-12-01',
        deposit: 700000,
        furnished: true,
      };

      setRental(mockRental);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rental details:', error);
      toast({ title: t('error'), description: 'Failed to load rental details', variant: 'destructive' });
      setLoading(false);
    }
  };

  const handleContact = (method: 'phone' | 'email') => {
    if (!rental) return;

    if (method === 'phone') {
      window.location.href = `tel:${rental.ownerPhone}`;
    } else {
      window.location.href = `mailto:${rental.ownerEmail}?subject=Inquiry about ${rental.title}`;
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: rental?.title,
          text: `Check out this rental: ${rental?.title}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link Copied', description: 'Link copied to clipboard' });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({ title: isFavorite ? 'Removed from favorites' : 'Added to favorites', description: isFavorite ? 'Property removed from your favorites' : 'Property added to your favorites' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Rental Not Found</h2>
        <p className="text-muted-foreground mb-4">The rental property you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/rentals')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Rentals
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost" 
              size="icon"
              onClick={toggleFavorite}
              className={isFavorite ? 'text-red-500' : ''}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-video bg-muted">
          <img
            src={rental.images[currentImageIndex]}
            alt={rental.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Image Navigation Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {rental.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Availability Badge */}
        {!rental.available && (
          <div className="absolute top-4 right-4">
            <Badge variant="destructive">Not Available</Badge>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Title and Price */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-bold flex-1">{rental.title}</h1>
            {rental.verified && (
              <Badge variant="default" className="bg-green-500">
                <Check className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center text-muted-foreground mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {rental.location}
          </div>
          <div className="text-3xl font-bold text-primary">
            {rental.price.toLocaleString()} {rental.currency}
            <span className="text-base font-normal text-muted-foreground">/{rental.period}</span>
          </div>
        </div>

        {/* Property Features */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Bed className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="font-semibold">{rental.bedrooms}</div>
              <div className="text-sm text-muted-foreground">Bedrooms</div>
            </div>
            <div>
              <Bath className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="font-semibold">{rental.bathrooms}</div>
              <div className="text-sm text-muted-foreground">Bathrooms</div>
            </div>
            <div>
              <Home className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="font-semibold">{rental.area} m²</div>
              <div className="text-sm text-muted-foreground">Area</div>
            </div>
          </div>
        </Card>

        {/* Property Details */}
        <Card className="p-4 mb-6">
          <h2 className="font-semibold text-lg mb-3">Property Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span>
              <span className="ml-2 font-medium capitalize">{rental.type}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Furnished:</span>
              <span className="ml-2 font-medium">{rental.furnished ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Deposit:</span>
              <span className="ml-2 font-medium">{rental.deposit.toLocaleString()} XAF</span>
            </div>
            <div>
              <span className="text-muted-foreground">Posted:</span>
              <span className="ml-2 font-medium">
                {new Date(rental.postedDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="p-4 mb-6">
          <h2 className="font-semibold text-lg mb-3">Description</h2>
          <p className="text-muted-foreground whitespace-pre-line">{rental.description}</p>
        </Card>

        {/* Amenities */}
        <Card className="p-4 mb-6">
          <h2 className="font-semibold text-lg mb-3">Amenities</h2>
          <div className="grid grid-cols-2 gap-2">
            {rental.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">{amenity}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Owner Information */}
        <Card className="p-4 mb-6">
          <h2 className="font-semibold text-lg mb-3">Contact Owner</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <span className="font-semibold text-primary">
                  {rental.ownerName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <div className="font-medium">{rental.ownerName}</div>
                <div className="text-sm text-muted-foreground">Property Owner</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleContact('phone')}
            className="w-full"
          >
            <Phone className="mr-2 h-4 w-4" />
            Call
          </Button>
          <Button
            onClick={() => handleContact('email')}
            className="w-full"
            disabled={!rental.available}
          >
            <Mail className="mr-2 h-4 w-4" />
            {rental.available ? 'Email Inquiry' : 'Not Available'}
          </Button>
        </div>
      </div>
    </div>
  );
}