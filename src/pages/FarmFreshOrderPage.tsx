/**
 * src/pages/FarmFreshOrderPage.tsx â€” Bambeh Marketplace
 *
 * FIXED:
 *  âœ… BOM character removed
 *  âœ… isUUID is a plain function â€” no useLang() hook called inside it (was crashing)
 *  âœ… Uses shared @/lib/supabase
 *  âœ… Handles both UUID product IDs (from DB) and sample string IDs (s1â€“s8)
 *  âœ… Saves orders to Supabase farm_orders table (if user is logged in)
 *  âœ… Falls back to localStorage for guest/sample-item orders
 *  âœ… Full i18n â€” reacts instantly when user changes language
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Leaf, MapPin, ShoppingCart,
  Check, Loader2, AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import AfricanPhoneInput from "@/components/AfricanPhoneInput";
import { useLang, t } from "@/hooks/useAppLang";

// âœ… FIX: isUUID is a plain function â€” no hook calls inside it
function isUUID(s: string): boolean {
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
  seller_phone?: string;
}

const SAMPLE_PRODUCTS: Record<string, Product> = {
  s1: { id: "s1", name: "Fresh Tomatoes",      price: 500,  unit: "kg",    location: "Bafoussam",   is_organic: true,  image_url: "https://images.unsplash.com/photo-1546470427-e212876f0173?w=400&q=80" },
  s2: { id: "s2", name: "Plantains (1 bunch)",  price: 1500, unit: "bunch", location: "YaoundÃ©",    is_organic: false, image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80" },
  s3: { id: "s3", name: "Cocoyams (Macabo)",    price: 800,  unit: "kg",    location: "Douala",     is_organic: true,  image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80" },
  s4: { id: "s4", name: "Fresh Maize (Corn)",   price: 300,  unit: "cob",   location: "Bamenda",    is_organic: false, image_url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80" },
  s5: { id: "s5", name: "Groundnuts (1kg bag)", price: 1200, unit: "kg",    location: "NgaoundÃ©rÃ©", is_organic: false, image_url: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&q=80" },
  s6: { id: "s6", name: "Bitter Leaf (NdolÃ©)",  price: 200,  unit: "bunch", location: "YaoundÃ©",    is_organic: true,  image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80" },
  s7: { id: "s7", name: "Fresh Avocados",        price: 800,  unit: "kg",    location: "Dschang, West",   is_organic: true,  image_url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80" },
  s8: { id: "s8", name: "Pineapples (Large)",    price: 600,  unit: "piece", location: "Edea, Littoral",  is_organic: false, image_url: "https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=400&q=80" },
};

const fmtXAF = (n: number) =>
  new Intl.NumberFormat("fr-CM").format(Math.round(n)) + " FCFA";

export default function FarmFreshOrderPage() {
  const { productId } = useParams<{ productId: string }>();
  const [params]      = useSearchParams();
  const navigate      = useNavigate();
  const lang          = useLang();

  const [product,    setProduct]    = useState<Product | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [qty,        setQty]        = useState(Math.max(1, Number(params.get("quantity")) || 1));
  const [address,    setAddress]    = useState("");
  const [phone,      setPhone]      = useState("");
  const [phoneValid, setPhoneValid] = useState(false);
  const [note,       setNote]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [isDemo,     setIsDemo]     = useState(false);

  useEffect(() => {
    if (productId) void loadProduct(productId);
  }, [productId]);

  async function loadProduct(id: string) {
    setLoading(true);

    if (SAMPLE_PRODUCTS[id]) {
      setProduct(SAMPLE_PRODUCTS[id]);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    if (isUUID(id)) {
      try {
        const { data, error: dbErr } = await supabase
          .from("farm_products")
          .select("*")
          .eq("id", id)
          .single();
        if (!dbErr && data) {
          setProduct({
            id:           data.id,
            name:         data.name ?? data.title,
            price:        data.price ?? data.price_per_unit_xaf,
            unit:         data.unit,
            farmer_id:    data.farmer_id ?? data.seller_id,
            location:     data.location,
            image_url:    data.image_url ?? data.images?.[0],
            is_organic:   data.is_organic,
            description:  data.description,
            seller_phone: data.seller_phone,
          });
          setLoading(false);
          return;
        }
      } catch { /* fall through */ }
    }

    try {
      const stored = JSON.parse(localStorage.getItem("bambeh_farm_products") ?? "[]") as Product[];
      const found  = stored.find(p => p.id === id);
      if (found) { setProduct(found); setLoading(false); return; }
    } catch { /* ignore */ }

    setLoading(false);
  }

  async function placeOrder() {
    if (!address.trim()) { setError(t("enterAddress", lang) as string); return; }
    if (!phoneValid)     { setError(t("enterPhone", lang) as string);   return; }

    setSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user && !isDemo) {
        const { error: orderErr } = await supabase.from("farm_orders").insert({
          buyer_id:   session.user.id,
          product_id: product?.id,
          quantity:   qty,
          address:    address.trim(),
          phone,
          note:       note.trim() || null,
          total_xaf:  (product?.price ?? 0) * qty,
          status:     "pending",
        });
        if (orderErr) throw orderErr;
      } else {
        const orders = JSON.parse(localStorage.getItem("bambeh_farm_orders") ?? "[]");
        orders.unshift({
          id:        Date.now().toString(),
          productId: product?.id,
          product:   product?.name,
          qty,
          address:   address.trim(),
          phone,
          note,
          total_xaf: (product?.price ?? 0) * qty,
          status:    "pending",
          createdAt: new Date().toISOString(),
          isDemo,
        });
        localStorage.setItem("bambeh_farm_orders", JSON.stringify(orders));
      }

      setDone(true);
    } catch (e: any) {
      setError(e.message || "Could not place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // â”€â”€ Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  // â”€â”€ Success â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-6">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t("orderPlacedTitle", lang)}</h2>
          {isDemo ? (
            <p className="text-gray-500 text-sm mb-2">{t("demoOrderNote", lang)}</p>
          ) : (
            <p className="text-gray-500 text-sm mb-2">
              {(t("farmerContact", lang) as (phone: string) => string)(phone)}
            </p>
          )}
          <p className="text-gray-400 text-xs mb-6">{t("total", lang)}: {fmtXAF((product?.price ?? 0) * qty)}</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate("/farm-fresh")}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold">
              {t("backToFarmFresh", lang)}
            </button>
            {/* WhatsApp contact seller option on success */}
            {!isDemo && product?.seller_phone && (
              <a
                href={`https://wa.me/${product.seller_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I just placed an order on Bambeh for ${product.name} (${qty} ${product.unit}). Order total: ${fmtXAF((product.price ?? 0) * qty)}.`)}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-xl font-semibold text-sm">
                ðŸ’¬ {t("whatsappSeller", lang) || "WhatsApp Seller"}
              </a>
            )}
            {!isDemo && (
              <button onClick={() => navigate("/orders")}
                className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm">
                {t("viewMyOrders", lang)}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // â”€â”€ Not found â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <Leaf className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold mb-2">{t("productNotFound", lang)}</p>
          <button onClick={() => navigate("/farm-fresh")} className="text-green-600 underline text-sm">
            {t("backToFarmFresh", lang)}
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
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 truncate">{t("orderHeader", lang)} {product.name}</h2>
          {isDemo && <p className="text-xs text-yellow-600 font-medium">{t("demoWarning", lang)}</p>}
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        {/* Product summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-4">
          <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {product.image_url
              ? <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover rounded-xl" />
              : <span className="text-3xl">ðŸŒ¿</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <MapPin className="w-3 h-3" />{product.location}
            </div>
            {product.is_organic && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full mt-1">
                ðŸŒ¿ {t("organic", lang)}
              </span>
            )}
            <p className="text-green-600 font-bold text-sm mt-1">{fmtXAF(product.price)} / {product.unit}</p>
          </div>
        </div>

        {/* Quantity */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-3">{t("quantity", lang)}</h3>
          <div className="flex items-center gap-4">
            <button onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-11 h-11 rounded-full border-2 border-gray-300 flex items-center justify-center text-xl font-bold text-gray-600 active:scale-95">
              âˆ’
            </button>
            <span className="text-2xl font-bold text-gray-900 w-10 text-center">{qty}</span>
            <button onClick={() => setQty(q => q + 1)}
              className="w-11 h-11 rounded-full border-2 border-green-500 flex items-center justify-center text-xl font-bold text-green-600 active:scale-95">
              +
            </button>
            <span className="text-gray-500 text-sm">{product.unit}(s)</span>
          </div>
          <div className="mt-4 pt-3 border-t flex justify-between items-center">
            <span className="text-gray-600 text-sm">{t("total", lang)}</span>
            <span className="font-bold text-green-700 text-xl">{fmtXAF(total)}</span>
          </div>
        </div>

        {/* Delivery details */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border space-y-4">
          <h3 className="font-semibold text-gray-900">{t("deliveryDetails", lang)}</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t("deliveryAddress", lang)} <span className="text-red-500">*</span>
            </label>
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder={t("addressPlaceholder", lang) as string}
              className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
          </div>

          <AfricanPhoneInput
            label={t("phoneNumber", lang) as string}
            required
            onChange={(fullNumber, isValid) => { setPhone(fullNumber); setPhoneValid(isValid); }}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t("specialInstructions", lang)}
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder={t("instructPlaceholder", lang) as string}
              className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors" />
          </div>
        </div>

        {/* Contact seller option */}
        {!isDemo && product.seller_phone && (
          <a
            href={`https://wa.me/${product.seller_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in buying ${product.name} (${fmtXAF(product.price)}/${product.unit}) on Bambeh. Are you available?`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366]/10 border border-[#25D366]/40 text-[#128C7E] font-semibold rounded-xl text-sm">
            ðŸ’¬ {t("contactSellerWhatsApp", lang) || "Contact Seller via WhatsApp"}
          </a>
        )}

        {isDemo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="text-xs text-yellow-700 font-medium">{t("demoNotice", lang)}</p>
          </div>
        )}
      </div>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 shadow-xl">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>{qty} Ã— {fmtXAF(product.price)}</span>
            <span className="font-bold text-green-700 text-base">{fmtXAF(total)}</span>
          </div>
          <button
            onClick={placeOrder}
            disabled={submitting || !address.trim() || !phoneValid}
            className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white py-3.5 rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" />{t("placingOrder", lang)}</>
              : <><ShoppingCart className="w-5 h-5" />{t("placeOrder", lang)} â€” {fmtXAF(total)}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
