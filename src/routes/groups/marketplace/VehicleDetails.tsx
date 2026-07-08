import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Share2, Heart, AlertCircle, Check, Car, Fuel, Gauge, Calendar, Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { getVehicleById } from '@/lib/firebaseQueries';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  negotiable: boolean;
  images: string[];
  mileage: number;
  fuelType: string; // petrol, diesel, electric, hybrid
  transmission: string; // manual, automatic
  condition: string; // new, used, certified
  color: string;
  engineSize: string;
  features: string[];
  description: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerPhone: string;
  sellerEmail: string;
  location: string;
  verified: boolean;
  postedDate: string;
  views: number;
  vehicleType: string; // sedan, suv, truck, motorcycle, etc.
}

export default function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchVehicleDetails();
  }, [id]);

  const fetchVehicleDetails = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Firebase query to get vehicle by ID
      const vehicleData = await getVehicleById(id);
      
      if (vehicleData) {
        setVehicle(vehicleData as Vehicle);
      } else {
        setVehicle(null);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      toast({
        title: t('error'),
        description: 'Failed to load vehicle details',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleContact = (method: 'phone' | 'email') => {
    if (!vehicle) return;

    if (method === 'phone') {
      window.location.href = `tel:${vehicle.sellerPhone}`;
    } else {
      window.location.href = `mailto:${vehicle.sellerEmail}?subject=Inquiry about ${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`,
          text: `Check out this vehicle: ${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link Copied',
          description: 'Vehicle link copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      description: isFavorite ? 'Vehicle removed from your favorites' : 'Vehicle saved to your favorites',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Vehicle Not Found</h2>
        <p className="text-muted-foreground mb-4">The vehicle you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/vehicles')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vehicles
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
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
            src={vehicle.images[currentImageIndex]}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {vehicle.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Condition Badge */}
        <div className="absolute top-4 left-4">
          <Badge variant="outline" className="bg-white/90 capitalize">
            {vehicle.condition}
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Vehicle Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <Badge variant="outline" className="mb-2 capitalize">{vehicle.vehicleType}</Badge>
              <h1 className="text-2xl font-bold">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
            </div>
            {vehicle.verified && (
              <Badge variant="default" className="bg-green-500">
                <Check className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          
          <div className="flex items-center text-muted-foreground mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            {vehicle.location}
          </div>

          <div className="text-3xl font-bold text-primary">
            {vehicle.price.toLocaleString()} {vehicle.currency}
            {vehicle.negotiable && (
              <Badge variant="outline" className="ml-3 text-sm">Negotiable</Badge>
            )}
          </div>
        </div>

        {/* Key Specifications */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Gauge className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="font-semibold">{vehicle.mileage.toLocaleString()} km</div>
              <div className="text-sm text-muted-foreground">Mileage</div>
            </div>
            <div className="text-center">
              <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="font-semibold">{vehicle.year}</div>
              <div className="text-sm text-muted-foreground">Year</div>
            </div>
            <div className="text-center">
              <Fuel className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="font-semibold capitalize">{vehicle.fuelType}</div>
              <div className="text-sm text-muted-foreground">Fuel Type</div>
            </div>
            <div className="text-center">
              <Cog className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="font-semibold capitalize">{vehicle.transmission}</div>
              <div className="text-sm text-muted-foreground">Transmission</div>
            </div>
          </div>
        </Card>

        {/* Additional Details */}
        <Card className="p-4 mb-6">
          <h2 className="font-semibold text-lg mb-3">Vehicle Details</h2>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Color:</span>
              <span className="ml-2 font-medium">{vehicle.color}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Engine Size:</span>
              <span className="ml-2 font-medium">{vehicle.engineSize}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Views:</span>
              <span className="ml-2 font-medium">{vehicle.views}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Posted:</span>
              <span className="ml-2 font-medium">
                {new Date(vehicle.postedDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="p-4 mb-6">
          <h2 className="font-semibold text-lg mb-3">Description</h2>
          <p className="text-muted-foreground whitespace-pre-line">{vehicle.description}</p>
        </Card>

        {/* Features */}
        <Card className="p-4 mb-6">
          <h2 className="font-semibold text-lg mb-3">Features</h2>
          <div className="grid md:grid-cols-2 gap-2">
            {vehicle.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Seller Information */}
        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-3">Seller Information</h2>
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={vehicle.sellerAvatar} alt={vehicle.sellerName} />
              <AvatarFallback>{vehicle.sellerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{vehicle.sellerName}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {vehicle.location}
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
            Call Seller
          </Button>
          <Button
            onClick={() => handleContact('email')}
            className="w-full"
          >
            <Mail className="mr-2 h-4 w-4" />
            Email Inquiry
          </Button>
        </div>
      </div>
    </div>
  );
}
