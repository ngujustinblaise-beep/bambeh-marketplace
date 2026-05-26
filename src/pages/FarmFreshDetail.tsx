/**
 * src/pages/FarmFreshDetail.tsx
 * Bambeh Marketplace — Farm Fresh Product Detail
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ShoppingCart, MapPin, Star, Leaf,
  RefreshCw, AlertCircle, Plus, Minus, CheckCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BambehImage } from "@/components/ui/BambehImage";

interface FarmProduct {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerCity: string;
  sellerRating: number;
  title: string;
  description: string;
  pricePerUnitXAF: number;
  unit: string;
  stockQuantity: number;
  images: string[];
  isOrganic: boolean;
  harvestDate?: string;
  category: string;
  availableForDelivery: boolean;
}

const FarmFreshDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<FarmProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [ordered, setOrdered] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from("farm_products")
        .select("*, profiles:seller_id(display_name, city, rating)")
        .eq("id", id)
        .single();

      if (dbErr || !data) { setError("Produit introuvable"); return; }
      const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
      setProduct({
        id: data.id as string,
        sellerId: data.seller_id as string,
        sellerName: (profile?.display_name as string) ?? "—",
        sellerCity: (profile?.city as string) ?? "—",
        sellerRating: (profile?.rating as number) ?? 0,
        title: data.title as string,
        description: data.description as string,
        pricePerUnitXAF: data.price_per_unit_xaf as number,
        unit: (data.unit as string) ?? "kg",
        stockQuantity: (data.stock_quantity as number) ?? 0,
        images: (data.images as string[]) ?? [],
        isOrganic: Boolean(data.is_organic),
        harvestDate: data.harvest_date as string | undefined,
        category: data.category as string,
        availableForDelivery: Boolean(data.available_for_delivery),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const handleOrder = useCallback(async () => {
    if (!product) return;
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { navigate("/login"); return; }
    navigate(`/farm-fresh/order/${product.id}?quantity=${quantity}`);
  }, [product, quantity, navigate]);

  const formatXAF = (n: number) =>
    new Intl.NumberFormat("fr-CM", { maximumFractionDigits: 0 }).format(n) + " FCFA";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="w-6 h-6 text-teal-500 animate-spin" />
    </div>
  );

  if (error || !product) return (
    <div className="p-4 space-y-4">
      <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="text-sm text-red-600">{error ?? "Produit introuvable"}</p>
      </div>
    </div>
  );

  const totalXAF = product.pricePerUnitXAF * quantity;

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="relative">
        <button type="button" onClick={() => navigate(-1)} className="absolute top-4 left-4 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>

        {/* Images */}
        <div className="h-64 bg-gray-100 overflow-hidden">
          {product.images.length > 0 ? (
            <BambehImage src={product.images[imgIdx]} alt={product.title} width={448} height={256} objectFit="cover" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">🌾</div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-1.5 justify-center mt-2 px-4">
            {product.images.map((_, i) => (
              <button key={i} type="button" onClick={() => setImgIdx(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? "bg-teal-600" : "bg-gray-300"}`} />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Title + badges */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-gray-900">{product.title}</h1>
            {product.isOrganic && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex-shrink-0">
                <Leaf className="w-3 h-3" /> Bio
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{product.category}</p>
        </div>

        {/* Price */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-2xl font-bold text-green-800">
            {formatXAF(product.pricePerUnitXAF)} <span className="text-base font-normal text-green-600">/ {product.unit}</span>
          </p>
          <p className="text-sm text-green-600 mt-0.5">Stock: {product.stockQuantity} {product.unit} disponibles</p>
          {product.harvestDate && (
            <p className="text-xs text-green-500 mt-0.5">Récolté le: {new Date(product.harvestDate).toLocaleDateString("fr-CM")}</p>
          )}
        </div>

        {/* Seller */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-700 font-bold">{product.sellerName.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{product.sellerName}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />{product.sellerCity}
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 ml-1" />{product.sellerRating.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
        </div>

        {/* Delivery */}
        {product.availableForDelivery && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-700">Livraison disponible dans votre zone</p>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 border border-gray-300 rounded-xl overflow-hidden">
          <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <Minus className="w-4 h-4 text-gray-600" />
          </button>
          <span className="w-8 text-center text-sm font-bold text-gray-900">{quantity}</span>
          <button type="button" onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <button type="button" onClick={handleOrder}
          className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
          <ShoppingCart className="w-4 h-4" />
          Commander — {formatXAF(totalXAF)}
        </button>
      </div>

      {ordered && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 text-center mx-4 shadow-2xl">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Commande envoyée!</h2>
            <p className="text-sm text-gray-500 mb-4">Le vendeur vous contactera bientôt.</p>
            <button type="button" onClick={() => { setOrdered(false); navigate("/orders"); }}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium">Voir mes commandes</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmFreshDetail;
