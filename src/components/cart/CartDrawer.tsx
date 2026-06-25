// @ts-nocheck
import React from "react";
import type { CartItem, CartContextType } from "@/types/cart";

interface CartDrawerProps {
  cart: CartContextType;
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ cart, isOpen, onClose }) => {
  if (!isOpen) return null;

  const total = cart.items.reduce((s, i) => s + (i.priceXAF ?? 0) * (i.quantity ?? 1), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full flex flex-col shadow-xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Cart ({cart.items.length})</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">�</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.items.length === 0 ? (
            <p className="text-gray-400 text-center py-12">Your cart is empty.</p>
          ) : (
            cart.items.map((item: CartItem) => (
              <div key={item.id ?? item.itemId} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.itemTitle}</p>
                  <p className="text-teal-600 text-sm font-bold">
                    {(item.priceXAF ?? 0).toLocaleString()} XAF
                  </p>
                </div>
                <button
                  onClick={() => cart.removeItem(item.itemId)}
                  className="text-red-400 hover:text-red-600 text-sm px-2 py-1"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex justify-between mb-4">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-teal-600">{total.toLocaleString()} XAF</span>
          </div>
          <button
            disabled={cart.items.length === 0}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;





