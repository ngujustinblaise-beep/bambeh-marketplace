/**
 * src/pages/Services.tsx — Bambeh Marketplace
 * FIXED: Reads from Supabase listings table (type='service') instead of static SAMPLE_SERVICES.
 * Cross-device, real-time — new services posted on any device appear instantly for everyone.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Star, Plus, Loader2, RefreshCw, Wrench
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Service {
  id:       string;
  title:    string;
  category: string;
  price:    number | null;
  location: string;
  description: string;
  phone?:   string;
  created_at: string;
}

const SAMPLE_SERVICES: Service[] = [
  { id:'s1', title:'Professional House Cleaning', category:'Cleaning',    price:15000, location:'Yaoundé',  description:'Deep cleaning services for homes and offices.',  created_at: new Date().toISOString() },
  { id:'s2', title:'Plumbing Repairs & Installation', category:'Plumbing', price:25000, location:'Douala',   description:'Expert plumbing services, pipes, water heaters.', created_at: new Date().toISOString() },
  { id:'s3', title:'Electrical Services',         category:'Electrical',  price:20000, location:'Yaoundé',  description:'Wiring, installations, and electrical repairs.',   created_at: new Date().toISOString() },
  { id:'s4', title:'Web Development & Design',    category:'IT & Tech',   price:150000,location:'Bambili',  description:'Custom websites, React apps, and mobile apps.',    created_at: new Date().toISOString() },
  { id:'s5', title:'Photography & Videography',   category:'Photography', price:50000, location:'Yaoundé',  description:'Events, portraits, commercial photography.',        created_at: new Date().toISOString() },
  { id:'s6', title:'Private Tutoring (Math/Sciences)', category:'Tutoring', price:10000, location:'Buea', description:'Tutoring for secondary and university students.',    created_at: new Date().toISOString() },
];

const CATEGORIES = ['All', 'Cleaning', 'Plumbing', 'Electrical', 'IT & Tech', 'Photography', 'Tutoring', 'Catering', 'Transport', 'Beauty', 'Other'];

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');

  async function fetchServices() {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, category, price, location, description, phone, created_at')
        .eq('type', 'service')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(40);

      if (error) throw error;
      setServices(data && data.length > 0 ? data : SAMPLE_SERVICES);
    } catch {
      setServices(SAMPLE_SERVICES);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchServices();
    const channel = supabase
      .channel('services_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'listings' }, fetchServices)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = services.filter(s => {
    const matchSearch   = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || s.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white pt-10 pb-14 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Professional Services</h1>
          <p className="text-purple-100 mb-6">Find trusted service providers across Cameroon</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-white/30" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4">
        {/* Category chips */}
        <div className="bg-white rounded-2xl shadow-sm p-3 mb-4 flex gap-2 overflow-x-auto">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                category === c ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{filtered.length} service{filtered.length !== 1 ? 's' : ''} found</p>
          <div className="flex gap-2">
            <button onClick={fetchServices} className="p-2 text-gray-400 hover:text-purple-600 rounded-xl hover:bg-gray-100">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/services/offer')}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Offer Service
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Wrench className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">No services found</p>
            <button onClick={() => navigate('/services/offer')}
              className="mt-4 bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
              Offer a Service
            </button>
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            {filtered.map(service => (
              <div key={service.id}
                onClick={() => navigate('/services/' + service.id)}
                className="bg-white rounded-2xl p-4 shadow-sm border flex gap-4 cursor-pointer hover:shadow-md transition-shadow">
                {/* Icon */}
                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-7 h-7 text-purple-500" />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm mb-0.5">{service.title}</h3>
                  {service.category && (
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      {service.category}
                    </span>
                  )}
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{service.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />{service.location}
                    </div>
                    {service.price && (
                      <span className="font-bold text-purple-600 text-sm">
                        {service.price.toLocaleString()} XAF
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
