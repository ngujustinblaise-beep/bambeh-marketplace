/**
 * src/pages/FlashDeals.tsx — Bambeh Marketplace
 * FIXED: Reads flash deals from Supabase (cross-device, real-time).
 * Falls back to sample data if Supabase table is empty.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Clock, Tag, Loader2, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  (import.meta as any).env?.VITE_SUPABASE_URL || '',
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''
);

interface Deal {
  id: string;
  title: string;
  original_price: number;
  deal_price: number;
  ends_at: string;
  category: string;
  image_url?: string;
  vendor_id?: string;
}

// Sample fallback deals (shown when DB is empty)
const SAMPLE_DEALS: Deal[] = [
  { id:'s1', title:'Samsung TV 32"',  original_price:250000, deal_price:180000, ends_at: new Date(Date.now()+86400000).toISOString(), category:'Electronics' },
  { id:'s2', title:'Nike Shoes',       original_price:45000,  deal_price:28000,  ends_at: new Date(Date.now()+3600000*12).toISOString(), category:'Fashion' },
  { id:'s3', title:'Blender Pro',      original_price:35000,  deal_price:22000,  ends_at: new Date(Date.now()+3600000*6).toISOString(),  category:'Appliances' },
  { id:'s4', title:'Laptop Bag',       original_price:18000,  deal_price:12000,  ends_at: new Date(Date.now()+3600000*3).toISOString(),  category:'Accessories' },
];

function Countdown({ endsAt }: { endsAt: string }) {
  const [left, setLeft] = useState(Math.max(0, new Date(endsAt).getTime() - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, new Date(endsAt).getTime() - Date.now())), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  if (left === 0) return <span className="font-mono text-gray-400 text-sm">Ended</span>;
  return <span className="font-mono text-red-600 text-sm">{h}h {m}m {s}s</span>;
}

export default function FlashDeals() {
  const navigate = useNavigate();
  const [deals,   setDeals]   = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy,  setSortBy]  = useState<'time' | 'price' | 'discount'>('time');

  async function fetchDeals() {
    try {
      const { data, error } = await supabase
        .from('flash_deals')
        .select('*')
        .eq('is_active', true)
        .gt('ends_at', new Date().toISOString())
        .order('ends_at', { ascending: true })
        .limit(20);

      if (error) throw error;
      // Use DB data if available, else show samples
      setDeals(data && data.length > 0 ? data : SAMPLE_DEALS);
    } catch {
      setDeals(SAMPLE_DEALS); // fallback to samples
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDeals();
    // Real-time updates
    const channel = supabase
      .channel('flash_deals_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flash_deals' }, fetchDeals)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sorted = [...deals].sort((a, b) => {
    if (sortBy === 'price') return a.deal_price - b.deal_price;
    if (sortBy === 'discount') return (b.original_price - b.deal_price) - (a.original_price - a.deal_price);
    return new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime();
  });

  const hotDeals = sorted.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" /> Flash Deals
          </h1>
          <button onClick={fetchDeals} className="p-2 text-gray-500 hover:text-teal-600 rounded-xl hover:bg-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        )}

        {!loading && (
          <>
            {/* Hot deals */}
            {hotDeals.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-red-500" /> Hot Deals
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {hotDeals.map(d => (
                    <div key={d.id} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 border border-red-100 cursor-pointer"
                      onClick={() => navigate('/deals/' + d.id)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{d.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-red-600 font-bold">{d.deal_price.toLocaleString()} XAF</span>
                            <span className="text-gray-400 line-through text-sm">{d.original_price.toLocaleString()} XAF</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {Math.round((1 - d.deal_price / d.original_price) * 100)}% OFF
                          </span>
                          <div className="flex items-center gap-1 mt-1 justify-end">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <Countdown endsAt={d.ends_at} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sort */}
            <div className="flex gap-2 mb-4">
              {(['time', 'price', 'discount'] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${sortBy === s ? 'bg-teal-600 text-white' : 'bg-white border text-gray-600'}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* All deals */}
            <div className="space-y-3">
              {sorted.map(d => (
                <div key={d.id} onClick={() => navigate('/deals/' + d.id)}
                  className="bg-white rounded-2xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">{d.category}</span>
                      <h3 className="font-semibold text-gray-900 mt-0.5">{d.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-teal-600 font-bold">{d.deal_price.toLocaleString()} XAF</span>
                        <span className="text-gray-400 line-through text-sm">{d.original_price.toLocaleString()} XAF</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-semibold">
                        {Math.round((1 - d.deal_price / d.original_price) * 100)}% OFF
                      </span>
                      <div className="flex items-center gap-1 mt-2 justify-end">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <Countdown endsAt={d.ends_at} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
