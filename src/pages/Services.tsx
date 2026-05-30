/**
 * src/pages/Services.tsx — Bambeh Marketplace
 *
 * CHANGES IN THIS VERSION:
 * ✅ LocationFilter integrated — filters by region, city, quarter, landmark
 * ✅ locationFilters state added and wired into filtered array
 * ✅ All existing Supabase / real-time / sample logic preserved exactly
 * ✅ DEMO BADGE: isDemo added to Service interface and all SAMPLE_SERVICES entries
 * ✅ SORTING: real user listings always appear above demo listings
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Plus, Loader2, RefreshCw, Wrench } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LocationFilter, LocationFilters, EMPTY_LOCATION } from '@/components/filters/LocationFilter';
import { DemoBadge } from '@/components/listings/DemoBadge';

interface Service {
  id:          string;
  title:       string;
  category:    string;
  price:       number | null;
  location:    string;
  description: string;
  phone?:      string;
  created_at:  string;
  isDemo?:     boolean; // ← NEW: marks sample/demo items
}

const SAMPLE_SERVICES: Service[] = [
  { id:'s1', title:'Professional House Cleaning',      category:'Cleaning',    price:15000,  location:'Yaoundé', description:'Deep cleaning services for homes and offices.',   created_at: new Date().toISOString(), isDemo: true },
  { id:'s2', title:'Plumbing Repairs & Installation',  category:'Plumbing',    price:25000,  location:'Douala',  description:'Expert plumbing services, pipes, water heaters.',  created_at: new Date().toISOString(), isDemo: true },
  { id:'s3', title:'Electrical Services',              category:'Electrical',  price:20000,  location:'Yaoundé', description:'Wiring, installations, and electrical repairs.',    created_at: new Date().toISOString(), isDemo: true },
  { id:'s4', title:'Web Development & Design',         category:'IT & Tech',   price:150000, location:'Bambili', description:'Custom websites, React apps, and mobile apps.',     created_at: new Date().toISOString(), isDemo: true },
  { id:'s5', title:'Photography & Videography',        category:'Photography', price:50000,  location:'Yaoundé', description:'Events, portraits, commercial photography.',         created_at: new Date().toISOString(), isDemo: true },
  { id:'s6', title:'Private Tutoring (Math/Sciences)', category:'Tutoring',    price:10000,  location:'Buea',    description:'Tutoring for secondary and university students.',    created_at: new Date().toISOString(), isDemo: true },
];

const CATEGORIES = ['All', 'Cleaning', 'Plumbing', 'Electrical', 'IT & Tech', 'Photography', 'Tutoring', 'Catering', 'Transport', 'Beauty', 'Other'];

export default function Services() {
  const navigate = useNavigate();
  const [services,  setServices]  = useState<Service[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('All');

  // ── Location filter state ──────────────────────────────────────────
  const [locationFilters, setLocationFilters] = useState<LocationFilters>(EMPTY_LOCATION);

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
      // Real data from Supabase — mark isDemo false
      setServices(
        data && data.length > 0
          ? data.map((d: any) => ({ ...d, isDemo: false }))
          : SAMPLE_SERVICES
      );
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

  // ── Filter — includes location filter ────────────────────────────────────
  const baseFiltered = services.filter(s => {
    const matchSearch   = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || s.category === category;

    const loc = s.location.toLowerCase();
    if (locationFilters.region   && !loc.includes(locationFilters.region.toLowerCase()))   return false;
    if (locationFilters.city     && !loc.includes(locationFilters.city.toLowerCase()))     return false;
    if (locationFilters.quarter  && !loc.includes(locationFilters.quarter.toLowerCase()))  return false;
    if (locationFilters.landmark && !loc.includes(locationFilters.landmark.toLowerCase())) return false;

    return matchSearch && matchCategory;
  });

  // ── SORTING: real listings first, demo listings last ─────────────────────
  const filtered = [...baseFiltered].sort((a, b) => {
    if (a.isDemo !== b.isDemo) return a.isDemo ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition
                ${category === c ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Actions row */}
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

        {/* ── LOCATION FILTER ───────────────────────────────────────────── */}
        <LocationFilter onFilterChange={setLocationFilters} accentClass="purple" />

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
                {/* Icon container — `relative` so DemoBadge positions correctly */}
                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 relative">
                  <Wrench className="w-7 h-7 text-purple-500" />
                  {/* ── DEMO BADGE (smaller position for list layout) ── */}
                  {service.isDemo && (
                    <div className="absolute -top-2 -left-2 z-10 bg-yellow-400 text-yellow-900 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow border border-yellow-600 uppercase tracking-wide">
                      DEMO
                    </div>
                  )}
                </div>
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
                  {service.isDemo && (
                    <p className="text-xs text-yellow-600 mt-1 italic">Sample — not a real service</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
