import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, MapPin, Plus } from 'lucide-react';

interface Item {
  id: string; title: string; price: number; category: string;
  location: string; image?: string; condition: string; description: string; postedAt: string;
}

const SAMPLES: Item[] = [
  { id:'1', title:'iPhone 13 Pro Max 256GB', price:450000, category:'Electronics', location:'Yaounde', condition:'Good', description:'Excellent condition, with charger and box.', postedAt: new Date().toISOString() },
  { id:'2', title:'Samsung 55" Smart TV', price:280000, category:'Electronics', location:'Douala', condition:'Like New', description:'Used only 3 months, perfect working order.', postedAt: new Date().toISOString() },
  { id:'3', title:'Traditional African Fabric 5m', price:25000, category:'Fashion', location:'Yaounde', condition:'New', description:'Authentic Cameroonian fabric, various patterns.', postedAt: new Date().toISOString() },
  { id:'4', title:'Honda Generator 2.5KVA', price:180000, category:'Electronics', location:'Bafoussam', condition:'Good', description:'Reliable generator, serviced regularly.', postedAt: new Date().toISOString() },
  { id:'5', title:'Fridge Samsung 300L', price:220000, category:'Appliances', location:'Douala', condition:'Good', description:'3-door fridge in excellent condition.', postedAt: new Date().toISOString() },
  { id:'6', title:'School Textbooks Set', price:15000, category:'Books', location:'Yaounde', condition:'Fair', description:'Complete set for Form 5 sciences.', postedAt: new Date().toISOString() },
];

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Appliances', 'Books', 'Furniture', 'Vehicles', 'Other'];

export default function Marketplace() {
  const navigate = useNavigate();
  const [items, setItems]     = useState<Item[]>([]);
  const [search, setSearch]   = useState('');
  const [cat, setCat]         = useState('All');
  const [favs, setFavs]       = useState<Set<string>>(new Set());

  useEffect(() => {
    function loadItems() {
      try {
        const stored = localStorage.getItem('bambeh_marketplace_items');
        if (stored) {
          const userItems = JSON.parse(stored);
          setItems([...userItems, ...SAMPLES]);
        } else {
          setItems(SAMPLES);
        }
      } catch {
        setItems(SAMPLES);
      }
    }
    loadItems();
    window.addEventListener('focus', loadItems);
    return () => window.removeEventListener('focus', loadItems);
  }, []);

  function toggleFav(id: string) {
    setFavs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const filtered = items.filter(i => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase());
    const matchCat    = cat === 'All' || i.category === cat;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-600" />Marketplace
          </h1>
          <button onClick={() => navigate('/post-item')} className="bg-teal-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1">
            <Plus className="w-4 h-4" />Sell
          </button>
        </div>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${cat===c ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No items found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(item => (
              <div key={item.id} onClick={() => navigate('/marketplace/'+item.id)} className="bg-white rounded-2xl overflow-hidden shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
                <div className="h-32 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center relative">
                  {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : <ShoppingBag className="w-10 h-10 text-teal-200" />}
                  <button onClick={e => { e.stopPropagation(); toggleFav(item.id); }} className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm">
                    <Heart className={`w-3.5 h-3.5 ${favs.has(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                  <span className="absolute bottom-2 left-2 text-xs bg-white/90 text-gray-700 px-1.5 py-0.5 rounded-full">{item.condition}</span>
                </div>
                <div className="p-2.5">
                  <p className="text-xs text-gray-500 mb-0.5">{item.category}</p>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">{item.title}</h3>
                  <p className="text-teal-600 font-bold text-sm">{item.price.toLocaleString()} XAF</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <MapPin className="w-3 h-3" />{item.location}
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
