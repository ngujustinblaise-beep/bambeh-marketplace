import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { BambehImage } from '@/components/ui/BambehImage';

interface CartItem { id:string; title:string; price:number; quantity:number; image?:string; sellerId?:string; }

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bambeh_cart');
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  function save(updated: CartItem[]) { setItems(updated); try { localStorage.setItem('bambeh_cart', JSON.stringify(updated)); } catch {} }
  function remove(id: string) { save(items.filter(i => i.id !== id)); }
  function qty(id: string, delta: number) {
    save(items.map(i => i.id===id ? {...i, quantity: Math.max(1, i.quantity+delta)} : i));
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Cart is empty</h2>
        <p className="text-gray-500 mb-6">Add items from the marketplace</p>
        <button onClick={() => navigate('/marketplace')} className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold">Browse Marketplace</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6"><ShoppingCart className="w-6 h-6 text-teal-600" />Cart ({items.length})</h1>
        <div className="space-y-3 mb-6">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border flex gap-3">
              {item.image ? <BambehImage src={item.image} alt={item.title} width={64} height={64} imgClassName="rounded-xl" /> : <div className="w-16 h-16 bg-gray-100 rounded-xl" />}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                <p className="text-teal-600 font-bold mt-1">{(item.price * item.quantity).toLocaleString()} XAF</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => qty(item.id,-1)} className="w-7 h-7 rounded-full border flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button onClick={() => qty(item.id,1)} className="w-7 h-7 rounded-full border flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
              <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
          <div className="flex justify-between items-center mb-2 text-sm text-gray-600"><span>Subtotal</span><span>{total.toLocaleString()} XAF</span></div>
          <div className="flex justify-between items-center mb-3 text-sm text-gray-600"><span>Delivery</span><span>Calculated at checkout</span></div>
          <div className="flex justify-between items-center font-bold text-gray-900 text-lg border-t pt-3"><span>Total</span><span>{total.toLocaleString()} XAF</span></div>
        </div>
        <button onClick={() => navigate('/checkout')} className="w-full bg-teal-600 text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2">
          Checkout <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
