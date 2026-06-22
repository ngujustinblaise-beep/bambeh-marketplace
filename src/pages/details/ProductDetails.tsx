// @ts-nocheck
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLang, t } from "@/hooks/useAppLang";

const ProductDetails: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [added,  setAdded]     = useState(false);
  const [favored, setFavored]  = useState(false);

  const handleCart = () => {
    const item = {
      itemId: id ?? "", itemTitle: "Product",
      priceXAF: 0, currency: "XAF", quantity: 1,
    };
    console.debug("cart:", item);
    setAdded(true);
  };

  const handleFav = () => {
    const fav = {
      id: `fav_${id}`, itemId: id ?? "", itemTitle: "Product",
      itemType: "marketplace", currency: "XAF", addedAt: new Date().toISOString(),
    };
    console.debug("fav:", fav);
    setFavored(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-teal-600 hover:underline text-sm">
        ← Back
      </button>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6">
        <div className="h-48 bg-gray-200 rounded-xl mb-4 flex items-center justify-center text-4xl text-gray-400">
          🖼
        </div>
        <h1 className="text-xl font-bold mb-1">Product #{id}</h1>
        <p className="text-teal-600 font-bold text-xl mb-4">0 XAF</p>
        <div className="flex gap-3">
          <button onClick={handleCart}
            className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl font-medium">
            {added ? "✅ Added to Cart" : "Add to Cart"}
          </button>
          <button onClick={handleFav}
            className={`px-4 py-2.5 border rounded-xl text-xl transition-colors
              ${favored ? "border-red-400 text-red-500" : "border-gray-300 text-gray-400"}`}>
            {favored ? "♥" : "♡"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;




