import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Square,
  Phone, MessageCircle, CheckCircle, Calendar, Home as HomeIcon
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  type: string;
  price: number;
  currency: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  landlord: string;
  phone: string;
  email: string;
  images: string[];
  amenities: string[];
  description: string;
  available: boolean;
  availableDate: string;
}

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const property: Property = {
    id: id || '1',
    title: 'Modern 2BR Pent House in Bafutchu',
    type: '2BR',
    price: 150000,
    currency: 'XAF',
    location: 'Bamenda, Bafutchu',
    bedrooms: 2,
    bathrooms: 2,
    area: 80,
    landlord: 'B Zerm',
    phone: '+237670757326',
    email: 'nguzerm@premiumhomes.cm',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800',
    ],
    amenities: ['Wi-Fi', 'AC', 'Generator', 'Security', 'Parking', 'Kitchen', 'Balcony'],
    description: 'Beautiful modern apartment in the heart of Bafuytchu. Features spacious living room, modern kitchen, master bedroom with ensuite, guest bedroom, and balcony with city views. Secure compound with 24/7 security and generator backup.',
    available: true,
    availableDate: '2024-06-15',
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favoriteProperties') || '[]');
    setIsFavorite(favorites.includes(id));
  }, [id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteProperties') || '[]');
    const newFavorites = isFavorite
      ? favorites.filter((favId: string) => favId !== id)
      : [...favorites, id];
    localStorage.setItem('favoriteProperties', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: 'Check out this property: ' + property.title,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Message sent!');
    setShowContactForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-40 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/rentals')}
          className="p-2 hover:bg-gray-100 rounded-full active:scale-95 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFavorite}
            className="p-2 hover:bg-gray-100 rounded-full active:scale-95 transition-all"
          >
            <Heart
              size={24}
              className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}
            />
          </button>
          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 rounded-full active:scale-95 transition-all"
          >
            <Share2 size={24} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="relative h-80 bg-gray-200 mt-14">
        <img
          src={property.images[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover"
        />

        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full hover:bg-white active:scale-95 transition-all text-xl font-bold"
            >
              â†
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full hover:bg-white active:scale-95 transition-all text-xl font-bold"
            >
              â†’
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {property.images.map((_, index) => (
                <div
                  key={index}
                  className={'h-2 rounded-full transition-all ' + (index === currentImageIndex ? 'w-8 bg-white' : 'w-2 bg-white/50')}
                />
              ))}
            </div>
          </>
        )}

        {property.available && (
          <div className="absolute top-3 left-3 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
            Available Now
          </div>
        )}
      </div>

      <div className="bg-white px-4 py-3 flex gap-2 overflow-x-auto">
        {property.images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ' + (index === currentImageIndex ? 'border-orange-500' : 'border-transparent')}
          >
            <img src={image} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{property.title}</h1>
          <p className="text-3xl font-bold text-orange-600">
            {formatPrice(property.price)} {property.currency}
            <span className="text-base text-gray-500 font-normal">/month</span>
          </p>
          <div className="flex items-center gap-2 mt-2 text-gray-600">
            <MapPin size={18} />
            <span>{property.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-100 rounded-lg">
          <div className="text-center">
            <Bed size={24} className="mx-auto mb-1 text-gray-600" />
            <p className="text-sm text-gray-500">Bedrooms</p>
            <p className="font-bold text-gray-800">{property.bedrooms}</p>
          </div>
          <div className="text-center">
            <Bath size={24} className="mx-auto mb-1 text-gray-600" />
            <p className="text-sm text-gray-500">Bathrooms</p>
            <p className="font-bold text-gray-800">{property.bathrooms}</p>
          </div>
          <div className="text-center">
            <Square size={24} className="mx-auto mb-1 text-gray-600" />
            <p className="text-sm text-gray-500">Area</p>
            <p className="font-bold text-gray-800">{property.area}mÂ²</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Description</h2>
          <p className="text-gray-600 leading-relaxed">{property.description}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Amenities</h2>
          <div className="grid grid-cols-2 gap-3">
            {property.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-700">
                <CheckCircle size={18} className="text-green-500" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <Calendar size={20} />
            <span className="font-medium">Available from: {property.availableDate}</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Location</h2>
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin size={48} className="mx-auto mb-2" />
              <p>Map View</p>
              <p className="text-sm">{property.location}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-white border rounded-lg">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Property Manager</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <HomeIcon size={24} className="text-indigo-600" />
            </div>
            <div>
              <p className="font-bold text-gray-800">{property.landlord}</p>
              <p className="text-sm text-gray-500">Verified Manager</p>
            </div>
          </div>
        </div>
      </div>

      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Contact Landlord</h2>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                âœ•
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="+237 6XX XXX XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="I'm interested in this property..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 active:scale-95 transition-all"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-30">
        <div className="grid grid-cols-2 gap-3 max-w-4xl mx-auto">
          <a
            href={'tel:' + property.phone}
            className="bg-white border-2 border-orange-600 text-orange-600 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-50 active:scale-95 transition-all"
          >
            <Phone size={20} />
            <span>Call Now</span>
          </a>
          <button
            onClick={() => setShowContactForm(true)}
            className="bg-orange-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-700 active:scale-95 transition-all"
          >
            <MessageCircle size={20} />
            <span>Message</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;






