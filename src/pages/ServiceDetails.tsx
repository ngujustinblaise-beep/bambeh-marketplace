import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Share2, Heart, AlertCircle, Check, Star, Clock, DollarSign, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  images: string[];
  providerName: string;
  providerAvatar?: string;
  providerBio: string;
  phone: string;
  email: string;
  location: string;
  pricing: {
    min: number;
    max: number;
    currency: string;
    unit: string; // per hour, per day, per project
  };
  availability: string;
  experience: string; // years,
  rating: number;
  totalReviews: number;
  reviews: Review[];
  skills: string[];
  verified: boolean;
  responseTime: string;
  completedJobs: number;
}

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with your Firebase query
      // Example: const doc = await getDoc(doc(db, 'services', id));
      
      // MOCK DATA for demonstration - Replace with Firebase call
      const mockService: Service = {
        id: id || '1',
        title: 'Professional Plumbing Services',
        category: 'Home Services',
        description: 'Experienced plumber offering comprehensive plumbing services including installations, repairs, and maintenance. Available for both residential and commercial projects. Licensed and insured with over 10 years of experience in Yaoundé.',
        images: [
          'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800',
          'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800',
          'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800',
        ],
        providerName: 'Asaah Ateyim',
        providerAvatar: 'https://ui-avatars.com/api/?name=Samuel+Mbah&background=3b82f6&color=fff',
        providerBio: 'Certified plumber with 10+ years of experience. Specialized in modern plumbing systems, water heater installations, and emergency repairs.',
        phone: '+237 670 757 326',
        email: 'asaahateyim@bigblaisezerm.com',
        location: 'OldTown, Bamenda',
        pricing: {
          min: 15000,
          max: 50000,
          currency: 'XAF',
          unit: 'per hour',
        },
        availability: 'Monday - Saturday, 8AM - 6PM',
        experience: '10',
        rating: 4.8,
        totalReviews: 127,
        reviews: [
          {
            id: '1',
            userName: 'Justin Germaine',
            userAvatar: 'https://ui-avatars.com/api/?name=Justin+Germaine',
            rating: 5,
            comment: 'Excellent service! Very professional and completed the work quickly. Highly recommended!',
            date: '2024-12-10',
          },
          {
            id: '2',
            userName: 'Nazarius Ngu',
            userAvatar: 'https://ui-avatars.com/api/?name=Jean+Kamga',
            rating: 4,
            comment: 'Good work, arrived on time and fixed the problem. Fair pricing.',
            date: '2024-12-05',
          },
          {
            id: '3',
            userName: 'NgyehTheresia Binwi',
            userAvatar: 'https://ui-avatars.com/api/?name=NgyehTheresia+Binwi',
            rating: 5,
            comment: 'Big Blaise is very knowledgeable and explained everything clearly. Will definitely hire again!',
            date: '2024-11-28',
          },
        ],
        skills: [
          'Pipe Installation & Repair',
          'Water Heater Services',
          'Bathroom Plumbing',
          'Kitchen Plumbing',
          'Emergency Repairs',
          'Drain Cleaning',
        ],
        verified: true,
        responseTime: '< 2 hours',
        completedJobs: 247,
      };

      setService(mockService);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching service details:', error);
      toast({
        title: t('error'),
        description: 'Failed to load service details',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleContact = (method: 'phone' | 'email') => {
    if (!service) return;

    if (method === 'phone') {
      window.location.href = `tel:${service.phone}`;
    } else {
      window.location.href = `mailto:${service.email}?subject=Service Inquiry: ${service.title}`;
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: service?.title,
          text: `Check out this service: ${service?.title}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link Copied',
          description: 'Service link copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({ title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      description: isFavorite ? 'Service removed from your favorites' : 'Service saved to your favorites',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Service Not Found</h2>
        <p className="text-muted-foreground mb-4">The service you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/services')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
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
            src={service.images[currentImageIndex]}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {service.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Service Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <Badge variant="outline" className="mb-2">{service.category}</Badge>
              <h1 className="text-2xl font-bold">{service.title}</h1>
            </div>
            {service.verified && (
              <Badge variant="default" className="bg-green-500">
                <Check className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center">
              {renderStars(service.rating)}
              <span className="ml-2 font-semibold">{service.rating}</span>
              <span className="ml-1 text-muted-foreground">({service.totalReviews} reviews)</span>
            </div>
          </div>

          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            {service.location}
          </div>
        </div>

        {/* Provider Info */}
        <Card className="p-4 mb-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={service.providerAvatar} alt={service.providerName} />
              <AvatarFallback>{service.providerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{service.providerName}</h3>
              <p className="text-sm text-muted-foreground mb-2">{service.providerBio}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  {service.completedJobs} jobs completed
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Responds in {service.responseTime}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Pricing & Availability */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Pricing</div>
                <div className="font-semibold">
                  {service.pricing.min.toLocaleString()} - {service.pricing.max.toLocaleString()} {service.pricing.currency}
                  <span className="text-sm text-muted-foreground"> {service.pricing.unit}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Availability</div>
                <div className="font-semibold">{service.availability}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Description */}
        <Card className="p-4 mb-6">
          <h2 className="font-semibold text-lg mb-3">About This Service</h2>
          <p className="text-muted-foreground whitespace-pre-line">{service.description}</p>
        </Card>

        {/* Skills */}
        <Card className="p-4 mb-6">
          <h2 className="font-semibold text-lg mb-3">Skills & Expertise</h2>
          <div className="grid md:grid-cols-2 gap-2">
            {service.skills.map((skill, index) => (
              <div key={index} className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">{skill}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Reviews */}
        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-4">Customer Reviews</h2>
          <div className="space-y-4">
            {service.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={review.userAvatar} alt={review.userName} />
                    <AvatarFallback>{review.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{review.userName}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex mb-2">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
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
          >
            <Mail className="mr-2 h-4 w-4" />
            Message
          </Button>
        </div>
      </div>
    </div>
  );
}