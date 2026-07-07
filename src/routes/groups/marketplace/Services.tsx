import React, { useState } from 'react';
import { Search, Star, MapPin, Clock, Phone, Plus } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

interface Service {
  id: string;
  name: string;
  provider: string;
  category: string;
  rating: number;
  reviews: number;
  price: string;
  location: string;
  availability: string;
  icon: string;
}

const Services = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Cleaning', 'Plumbing', 'Electrical', 'Tutoring', 'Beauty', 'IT'];

  const services: Service[] = [
    {
      id: '1',
      name: 'Professional House Cleaning',
      provider: 'CleanPro Services',
      category: 'Cleaning',
      rating: 4.9,
      reviews: 156,
      price: '15,000 - 35,000 XAF',
      location: 'Douala',
      availability: 'Available Today',
      icon: '🧹',
    },
    {
      id: '2',
      name: 'Emergency Plumbing Repair',
      provider: 'QuickFix Plumbing',
      category: 'Plumbing',
      rating: 4.7,
      reviews: 89,
      price: '20,000 - 50,000 XAF',
      location: 'Yaoundé',
      availability: '24/7 Available',
      icon: '🔧',
    },
    {
      id: '3',
      name: 'Electrical Installation',
      provider: 'PowerTech Solutions',
      category: 'Electrical',
      rating: 4.8,
      reviews: 134,
      price: '25,000 - 75,000 XAF',
      location: 'Douala',
      availability: 'Next Day',
      icon: '⚡',
    },
    {
      id: '4',
      name: 'Math & Science Tutoring',
      provider: 'EduMasters',
      category: 'Tutoring',
      rating: 5.0,
      reviews: 203,
      price: '10,000 - 20,000 XAF/hr',
      location: 'Yaoundé',
      availability: 'Flexible',
      icon: '📚',
    },
    {
      id: '5',
      name: 'Hair Styling & Makeup',
      provider: 'Glamour Studio',
      category: 'Beauty',
      rating: 4.9,
      reviews: 178,
      price: '15,000 - 45,000 XAF',
      location: 'Douala',
      availability: 'Book Appointment',
      icon: '💇',
    },
    {
      id: '6',
      name: 'Computer Repair & Support',
      provider: 'TechHelp IT',
      category: 'IT',
      rating: 4.6,
      reviews: 92,
      price: '15,000 - 40,000 XAF',
      location: 'Yaoundé',
      availability: 'Same Day',
      icon: '💻',
    },
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Professional Services</h1>
        <p className="opacity-90">Book trusted service providers</p>
      </div>

      {/* Search & Filter */}
      <div className="px-6 py-4 bg-white border-b">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all active:scale-95 ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Offer Service Button */}
      <div className="px-6 py-4">
        <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg active:scale-95 transition-all">
          <Plus size={20} />
          Offer Your Service
        </button>
      </div>

      {/* Service Listings */}
      <div className="px-6 pb-4">
        <p className="text-gray-600 mb-4">{filteredServices.length} services found</p>

        <div className="space-y-4">
          {filteredServices.map((service) => (
            <button
              key={service.id}
              className="w-full bg-white rounded-xl p-5 shadow hover:shadow-md transition-all active:scale-98 text-left"
            >
              {/* Service Header */}
              <div className="flex items-start gap-4 mb-3">
                <div className="text-5xl">{service.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{service.name}</h3>
                  <p className="text-gray-600">{service.provider}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-2">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-gray-800">{service.rating}</span>
                    <span className="text-sm text-gray-500">({service.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span className="text-sm">{service.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span className="text-sm font-medium text-green-600">{service.availability}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-purple-600">{service.price}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-600 text-white text-center font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  Book Now
                </div>
                <div className="border-2 border-purple-600 text-purple-600 text-center font-bold py-2 px-4 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
                  <Phone size={16} />
                  Contact
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Services;
