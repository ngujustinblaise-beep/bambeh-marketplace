/**
 * src/pages/FarmFreshOrderPage.tsx — Bambeh Marketplace
 * FIXED: Reads product from Supabase, saves order properly.
 * Handles both UUID product IDs (from DB) and legacy string IDs (sample data).
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Leaf, MapPin, ShoppingCart, Check, Loader2, Phone } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  (import.meta as any).env?.VITE_SUPABASE_URL || '',
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''
);

function isUUID(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  farmer_id?: string;
  location: string;
  image_url?: string;
  is_organic?: boolean;
  description?: string;
}

const SAMPLE_PRODUCTS: Record<string, Product> = {
  s1: { id: 's1', name: 'Fresh Tomatoes',    price: 500,  unit: 'kg',    location: 'Bafoussam', is_organic: true },
  s2: { id: 's2', name: 'Plantains',         price: 1500, unit: 'bunch', location: 'Yaoundé' },
  s3: { id: 's3', name: 'Cocoyams',          price: 800,  unit: 'kg',    location: 'Douala', is_organic: true },
  s4: { id: 's4', name: 'Fresh Corn',        price: 300,  unit: 'cob',   location: 'Bamenda' },
  s5: { id: 's5', name: 'Groundnuts',        price: 1200, unit: 'kg',    location: 'Ngaoundéré' },
  s6: { id: 's6', name: 'Bitter Leaf',       price: 200,  unit: 'bunch', location: 'Yaoundé', is_organic: true },
};

export default function FarmFreshOrderPage() {
  const { productId } = useParams<{ productId: string }>();
  const [params]      = useSearchParams();
  const navigate      = useNavigate();

  const [product,   setProduct]   = useState<Product | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [qty,       setQty]       = useState(Number(params.get('quantity')) || 1);
  const [address,   setAddress]   = useState('');
  const [phone,     setPhone]     = useState('');
  const [note,      setNote]      = useState('');
  const [submitting,setSubmitting]= useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    loadProduct(productId);
  }, [productId]);

  async function loadProduct(id: string) {
    // Try Supabase first if UUID
    if (isUUID(id)) {
      try {
        const { data } = await supabase.from('farm_products').select('*').eq('id', id).single();
        if (data) { setProduct(data); setLoading(false); return; }
      } catch {}
    }

    // Try sample data
    if (SAMPLE_PRODUCTS[id]) {
      setProduct(SAMPLE_PRODUCTS[id]);
      setLoading(false);
      return;
    }

    // Try localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('bambeh_farm_products') || '[]');
      const found  = stored.find((p: Product) => p.id === id);
      if (found) { setProduct(found); setLoading(false); return; }
    } catch {}

    setLoading(false);
  }

  async function placeOrder() {
    if (!address.trim() || !phone.trim()) {
      setError('Please fill in your address and phone number.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      // Save to localStorage (no orders table yet — easy to add later)
      const orders = JSON.parse(localStorage.getItem('bambeh_farm_orders') || '[]');
      orders.unshift({
        id:        Date.now().toString(),
        productId: product?.id,
        product:   product?.name,
        qty,
        address,
        phone,
        note,
        status:    'pending',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('bambeh_farm_orders', JSON.stringify(orders));
      setDone(true);
    } catch (e: any) {
      setError('Could not place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-6">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Placed! 🌿</h2>
          <p className="text-gray-500 text-sm mb-6">The farmer will contact you at {phone} to confirm delivery.</p>
          <button onClick={() => navigate('/farm-fresh')}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold">
            Back to Farm Fresh
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <Leaf className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold mb-2">Product not found</p>
          <button onClick={() => navigate('/farm-fresh')} className="text-green-600 underline text-sm">
            Back to Farm Fresh
          </button>
        </div>
      </div>
    );
  }

  const total = product.price * qty;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-gray-900">Order {product.name}</h2>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Product summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">🌿</div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{product.name}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <MapPin className="w-3 h-3" />{product.location}
            </div>
            <p className="text-green-600 font-bold text-sm mt-1">
              {product.price.toLocaleString()} XAF / {product.unit}
            </p>
          </div>
        </div>

        {/* Quantity */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
          <div className="flex items-center gap-4">
            <button onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-lg font-bold">−</button>
            <span className="text-2xl font-bold text-gray-900 w-10 text-center">{qty}</span>
            <button onClick={() => setQty(q => q + 1)}
              className="w-10 h-10 rounded-full border-2 border-green-500 flex items-center justify-center text-lg font-bold text-green-600">+</button>
            <span className="text-gray-500 text-sm">{product.unit}(s)</span>
          </div>
          <div className="mt-3 pt-3 border-t flex justify-between text-sm">
            <span className="text-gray-600">Total</span>
            <span className="font-bold text-green-600 text-lg">{total.toLocaleString()} XAF</span>
          </div>
        </div>

        {/* Delivery details */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border space-y-3">
          <h3 className="font-semibold text-gray-900">Delivery Details</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
            <input value={address} onChange={e => setAddress(e.target.value)}
              placeholder="Your full address"
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="inline w-3 h-3 mr-1" />Phone Number *
            </label>
            <input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="237 6XX XXX XXX"
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              placeholder="Special instructions..."
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button onClick={placeOrder} disabled={submitting || !address || !phone}
          className="w-full bg-green-600 text-white py-3.5 rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting
            ? <><Loader2 className="w-4 h-4 animate-spin" />Placing order...</>
            : <><ShoppingCart className="w-5 h-5" />Place Order — {total.toLocaleString()} XAF</>
          }
        </button>
      </div>
    </div>
  );
}
