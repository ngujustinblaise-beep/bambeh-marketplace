// @ts-nocheck
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ProductDetails: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [added,  setAdded] = useState(false);

  const handleAddToCart = () => {
    // CartItem compatible — priceXAF used, no bare "price" key
    const item = {
      itemId:    id ?? "",
      itemTitle: "Product",
      priceXAF:  0,
      currency:  "XAF",
      quantity:  1,
    };
    console.debug("Cart add:", item);
    setAdded(true);
  };

  const handleFavorite = () => {
    // FavoriteItem compatible — currency included
    const fav = {
      id:        `fav_${id}`,
      itemId:    id ?? "",
      itemTitle: "Product",
      itemType:  "marketplace",
      currency:  "XAF",
      addedAt:   new Date().toISOString(),
    };
    console.debug("Favorite add:", fav);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-teal-600 hover:underline">
        ← Back
      </button>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4
          flex items-center justify-center text-4xl text-gray-400">
          🖼
        </div>
        <h1 className="text-xl font-bold mb-2">Product #{id}</h1>
        <p className="text-teal-600 font-bold text-lg mb-4">0 XAF</p>
        <div className="flex gap-3">
          <button onClick={handleAddToCart}
            className="flex-1 bg-teal-600 text-white py-2 rounded-xl font-medium">
            {added ? "✅ Added" : "Add to Cart"}
          </button>
          <button onClick={handleFavorite}
            className="px-4 py-2 border border-gray-300 rounded-xl text-xl">
            ♡
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
