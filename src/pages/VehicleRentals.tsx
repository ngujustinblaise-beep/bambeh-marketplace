/**
 * src/pages/VehicleRentals.tsx — Bambeh Marketplace
 *
 * CHANGES IN THIS VERSION:
 * ✅ LocationFilter integrated — filters by region, city, quarter, landmark
 * ✅ locationFilters state added and wired into filtered array
 * ✅ All existing Supabase / real-time / sample logic preserved exactly
 * ✅ DEMO BADGE: isDemo added to Vehicle interface and all SAMPLE_VEHICLES entries
 * ✅ SORTING: real user listings always appear above demo listings
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Gauge, Fuel, Plus, Car, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LocationFilter, LocationFilters, EMPTY_LOCATION } from '@/components/filters/LocationFilter';
import { DemoBadge } from '@/components/listings/DemoBadge';

interface Vehicle {
  id:         string;
  title:      string;
  price:      number;
  location:   string;
  category:   string;
  images:     string[];
  created_at: string;
  extra:      Record<string, any>;
  isDemo?:    boolean; // ← NEW: marks sample/demo items
}

const SAMPLE_VEHICLES: Vehicle[] = [
  { id:'s1', title:'Toyota Camry 2020',          price:8500000,  location:'Yaoundé', category:'Sedan',      images:[], created_at: new Date().toISOString(), extra:{ fuel:'Petrol', transmission:'Automatic', mileage:'45,000 km' }, isDemo: true },
  { id:'s2', title:'Honda Activa Motorcycle',     price:850000,   location:'Douala',  category:'Motorcycle', images:[], created_at: new Date().toISOString(), extra:{ fuel:'Petrol', transmission:'Manual',    mileage:'12,000 km' }, isDemo: true },
  { id:'s3', title:'Toyota Land Cruiser V8 2019', price:35000000, location:'Yaoundé', category:'SUV',        images:[], created_at: new Date().toISOString(), extra:{ fuel:'Diesel', transmission:'Automatic', mileage:'78,000 km' }, isDemo: true },
  { id:'s4', title:'Nissan Pickup 4x4',           price:12000000, location:'Bamenda', category:'Pickup',     images:[], created_at: new Date().toISOString(), extra:{ fuel:'Diesel', transmission:'Manual',    mileage:'95,000 km' }, isDemo: true },
];

const VEHICLE_TYPES = ['All', 'Sedan', 'SUV', 'Pickup', 'Motorcycle', 'Van', 'Minibus', 'Truck'];
const CITIES        = ['All', 'Yaoundé', 'Douala', 'Bamenda', 'Bafoussam', 'Garoua'];

export default function VehicleRentals() {
  const navigate = useNavigate();
  const [vehicles,   setVehicles]   = useState<Vehicle[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');

  // ── Location filter state ──────────────────────────────────────────
  const [locationFilters, setLocationFilters] = useState<LocationFilters>(EMPTY_LOCATION);

  async function fetchVehicles() {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, price, location, category, images, created_at, extra')
        .eq('type', 'vehicle')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(40);

      if (error) throw error;
      // Real data from Supabase — mark isDemo false
      setVehicles(
        data && data.length > 0
          ? data.map((d: any) => ({ ...d, isDemo: false }))
          : SAMPLE_VEHICLES
      );
    } catch {
      setVehicles(SAMPLE_VEHICLES);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVehicles();
    const channel = supabase
      .channel('vehicles_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'listings' }, fetchVehicles)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Filter — includes location filter ────────────────────────────────────
  const baseFiltered = vehicles.filter(v => {
    const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase()) ||
      (v.extra?.make || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || v.category === typeFilter ||
      v.extra?.vehicle_type === typeFilter;
    const matchCity = cityFilter === 'All' || v.location.toLowerCase().includes(cityFilter.toLowerCase());

    const loc = v.location.toLowerCase();
    if (locationFilters.region   && !loc.includes(locationFilters.region.toLowerCase()))   return false;
    if (locationFilters.city     && !loc.includes(locationFilters.city.toLowerCase()))     return false;
    if (locationFilters.quarter  && !loc.includes(locationFilters.quarter.toLowerCase()))  return false;
    if (locationFilters.landmark && !loc.includes(locationFilters.landmark.toLowerCase())) return false;

    return matchSearch && matchType && matchCity;
  });

  // ── SORTING: real listings first, demo listings last ─────────────────────
  const filtered = [...baseFiltered].sort((a, b) => {
    if (a.isDemo !== b.isDemo) return a.isDemo ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-700 to-green-800 text-white pt-10 pb-14 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Car className="w-8 h-8" /> Cars & Vehicles
          </h1>
          <p className="text-green-100 mb-6">Buy and sell vehicles across Cameroon</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search vehicles, makes..."
              className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-white/30" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4">
        {/* Filters card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {VEHICLE_TYPES.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition
                  ${typeFilter === t ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
              className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white">
              {CITIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>)}
            </select>
            <button onClick={fetchVehicles} className="p-2 text-gray-500 hover:text-green-600 rounded-xl hover:bg-gray-100">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/vehicles/sell')}
              className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Sell
            </button>
          </div>
        </div>

        {/* ── LOCATION FILTER ───────────────────────────────────────────── */}
        <LocationFilter onFilterChange={setLocationFilters} />

        <div className="mb-3 text-sm text-gray-500">{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} found</div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Car className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">No vehicles found</p>
            <button onClick={() => navigate('/vehicles/sell')}
              className="mt-4 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
              List Your Vehicle
            </button>
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            {filtered.map(v => (
              <div key={v.id}
                onClick={() => navigate('/vehicles/' + v.id)}
                className="bg-white rounded-2xl shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                {/* Image container — `relative` so DemoBadge positions correctly */}
                <div className="h-44 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center overflow-hidden relative">
                  {v.images?.[0]
                    ? <img src={v.images[0]} alt={v.title} className="w-full h-full object-cover" />
                    : <span className="text-5xl">🚗</span>
                  }
                  {/* ── DEMO BADGE ── */}
                  {v.isDemo && <DemoBadge />}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm flex-1">{v.title}</h3>
                    {v.category && (
                      <span className="flex-shrink-0 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {v.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-bold text-green-700 mb-2">{v.price.toLocaleString()} XAF</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{v.location}</span>
                    {v.extra?.mileage     && <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />{v.extra.mileage}</span>}
                    {v.extra?.fuel        && <span className="flex items-center gap-1"><Fuel className="w-3 h-3" />{v.extra.fuel}</span>}
                    {v.extra?.transmission && <span className="capitalize">{v.extra.transmission}</span>}
                  </div>
                  {v.isDemo && (
                    <p className="text-xs text-yellow-600 mt-2 italic">Sample — not a real listing</p>
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
