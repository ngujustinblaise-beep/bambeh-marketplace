import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, MapPin, Bed, Bath, DollarSign } from 'lucide-react';

interface Property {
  id: string; title: string; type: string; price: number; location: string;
  quartier?: string; bedrooms: string; bathrooms: string; description: string;
  image?: string; postedAt: string;
}

const SAMPLE: Property[] = [
  { id:'1', title:'Modern 2-bed apartment in Bastos', type:'Apartment', price:150000, location:'Yaounde', quartier:'Bastos', bedrooms:'2', bathrooms:'1', description:'Furnished apartment with balcony and security.', postedAt: new Date().toISOString() },
  { id:'2', title:'Spacious villa in Bonamoussadi', type:'Villa', price:350000, location:'Douala', quartier:'Bonamoussadi', bedrooms:'4', bathrooms:'3', description:'4-bedroom villa with garden and parking.', postedAt: new Date().toISOString() },
  { id:'3', title:'Studio near University of Yaounde', type:'Studio', price:60000, location:'Yaounde', quartier:'Ngoa-Ekele', bedrooms:'Studio', bathrooms:'1', description:'Clean studio, ideal for students.', postedAt: new Date().toISOString() },
  { id:'4', title:'Office space in Akwa', type:'Office', price:200000, location:'Douala', quartier:'Akwa', bedrooms:'N/A', bathrooms:'1', description:'Professional office space in prime location.', postedAt: new Date().toISOString() },
];

const CITIES = ['All Cities', 'Yaounde', 'Douala', 'Bafoussam', 'Garoua', 'Maroua', 'Bamenda', 'Ngaoundere', 'Bertoua', 'Ebolowa', 'Kumba'];
const TYPES  = ['All Types', 'Apartment', 'Villa', 'Studio', 'House', 'Office', 'Room'];

export default function Rentals() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All Cities');
  const [type, setType] = useState('All Types');
  const [maxPrice, setMaxPrice] = useState(1000000);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bambeh_properties');
      if (stored) {
        const userProps = JSON.parse(stored);
        setProperties([...userProps, ...SAMPLE]);
      } else {
        setProperties(SAMPLE);
      }
    } catch {
      setProperties(SAMPLE);
    }
  }, []);

  const filtered = properties.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchCity   = city === 'All Cities' || p.location === city;
    const matchType   = type === 'All Types' || p.type === type;
    const matchPrice  = p.price <= maxPrice;
    return matchSearch && matchCity && matchType && matchPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Home className="w-6 h-6 text-orange-500" />Rentals
          </h1>
          <button onClick={() => navigate('/list-property')} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
            + List Property
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search rentals..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          >
            {CITIES.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          >
            {TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Price range */}
        <div className="mb-4 bg-white rounded-xl p-3 border">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Max Price</span>
            <span className="font-semibold">{maxPrice.toLocaleString()} XAF/mo</span>
          </div>
          <input
            type="range" min={30000} max={1000000} step={10000}
            value={maxPrice}
            onChange={e => setMaxPrice(+e.target.value)}
            className="w-full accent-orange-500"
          />
        </div>

        {/* Results */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No properties found</p>
            </div>
          ) : filtered.map(p => (
            <div
              key={p.id}
              onClick={() => navigate('/rental/' + p.id)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="h-36 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                <Home className="w-12 h-12 text-orange-300" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900 flex-1 pr-2 text-sm">{p.title}</h3>
                  <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full whitespace-nowrap">{p.type}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                  <MapPin className="w-3 h-3" />{p.location}{p.quartier ? ', ' + p.quartier : ''}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{p.bedrooms}</span>
                    <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{p.bathrooms}</span>
                  </div>
                  <span className="font-bold text-orange-600 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />{p.price.toLocaleString()} XAF/mo
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
