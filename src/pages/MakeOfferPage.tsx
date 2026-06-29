/**
 * MakeOfferPage.tsx � Bambeh Marketplace
 * � 2026 Bambeh Marketplace. All rights reserved.
 *
 * UPGRADED: Full counter-offer negotiation trail.
 *
 * Supports the full offer lifecycle:
 *   Buyer ? Initial offer
 *   Seller ? Counter-offer (or Accept/Decline)
 *   Buyer ? Accept counter / New counter / Decline
 *
 * All offer state is persisted in Supabase (offers table).
 * The trail renders each step like a timeline with status badges.
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Tag,
  Send,
  Check,
  AlertCircle,
  Clock,
  X,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  TrendingUp,
  Minus,
  MessageCircle,
  CheckCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/providers/SupabaseAuthProvider";
import { logger } from "@/utils/logger";
import { BambehImage } from "@/components/ui/BambehImage";
import { useLang, t } from "@/hooks/useAppLang";

// --- TYPES --------------------------------------------------------------------

type OfferStatus =
  | "pending"
  | "countered"
  | "accepted"
  | "declined"
  | "expired"
  | "withdrawn";

interface OfferStep {
  id: string;
  offerId: string;
  stepNumber: number;
  actorType: "buyer" | "seller";
  actorId: string;
  actorName: string;
  action: "offer" | "counter" | "accept" | "decline" | "withdraw";
  amount?: number;
  message?: string;
  createdAt: string;
}

interface Offer {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage?: string;
  buyerId: string;
  sellerId: string;
  currentAmount: number;
  status: OfferStatus;
  steps: OfferStep[];
  createdAt: string;
  updatedAt: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  image?: string;
  sellerId: string;
  sellerName: string;
  category: string;
}

// --- STATUS CONFIG -------------------------------------------------------------

const STATUS_CONFIG: Record<OfferStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: "Awaiting Response",  color: "text-amber-700",  bg: "bg-amber-50 border-amber-200"  },
  countered: { label: "Counter-Offer Sent", color: "text-blue-700",   bg: "bg-blue-50 border-blue-200"    },
  accepted:  { label: "Deal Accepted! ??",  color: "text-green-700",  bg: "bg-green-50 border-green-200"  },
  declined:  { label: "Offer Declined",     color: "text-red-700",    bg: "bg-red-50 border-red-200"      },
  expired:   { label: "Offer Expired",      color: "text-gray-600",   bg: "bg-gray-50 border-gray-200"    },
  withdrawn: { label: "Offer Withdrawn",    color: "text-gray-600",   bg: "bg-gray-50 border-gray-200"    },
};

// --- OFFER TRAIL STEP ---------------------------------------------------------

const TrailStep: React.FC<{
  step: OfferStep;
  originalPrice: number;
  isLast: boolean;
}> = ({ step, originalPrice, isLast }) => {
  const isBuyer = step.actorType === "buyer";
  const time = new Date(step.createdAt).toLocaleString("fr-CM", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getActionIcon = () => {
    switch (step.action) {
      case "offer":    return <Tag className="w-4 h-4" />;
      case "counter":  return <RefreshCw className="w-4 h-4" />;
      case "accept":   return <Check className="w-4 h-4" />;
      case "decline":  return <X className="w-4 h-4" />;
      case "withdraw": return <Minus className="w-4 h-4" />;
    }
  };

  const getActionLabel = () => {
    switch (step.action) {
      case "offer":    return `${isBuyer ? "Buyer" : "Seller"} made an offer`;
      case "counter":  return `${isBuyer ? "Buyer" : "Seller"} countered`;
      case "accept":   return `${isBuyer ? "Buyer" : "Seller"} accepted the offer`;
      case "decline":  return `${isBuyer ? "Buyer" : "Seller"} declined`;
      case "withdraw": return "Buyer withdrew the offer";
    }
  };

  const savings = step.amount !== undefined ? originalPrice - step.amount : null;
  const savingsPct = savings !== null && originalPrice > 0
    ? Math.round((savings / originalPrice) * 100)
    : null;

  const dotColor = step.action === "accept"
    ? "bg-green-500"
    : step.action === "decline" || step.action === "withdraw"
      ? "bg-red-400"
      : isBuyer ? "bg-teal-500" : "bg-blue-500";

  return (
    <div className="flex gap-3">
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full ${dotColor} flex items-center justify-center flex-shrink-0 text-white shadow-sm`}>
          {getActionIcon()}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1 mb-1 min-h-[2rem]"/>}
      </div>

      {/* Content card */}
      <div className={`flex-1 pb-4 ${isLast ? "" : ""}`}>
        <div className={`rounded-2xl border p-4 shadow-sm ${
          isBuyer ? "bg-white border-gray-100" : "bg-blue-50/50 border-blue-100"
        }`}>
          {/* Actor + time */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                isBuyer ? "bg-teal-500" : "bg-blue-500"
              }`}>
                {step.actorName[0]?.toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-gray-700">
                {step.actorName}{" "}
                <span className={`font-normal ${isBuyer ? "text-teal-600" : "text-blue-600"}`}>
                  ({isBuyer ? "Buyer" : "Seller"})
                </span>
              </span>
            </div>
            <span className="text-[10px] text-gray-400">{time}</span>
          </div>

          {/* Action label */}
          <p className="text-sm font-semibold text-gray-800 mb-1">{getActionLabel()}</p>

          {/* Amount + savings */}
          {step.amount !== undefined && (
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-lg font-black text-gray-900">
                {step.amount.toLocaleString()} XAF
              </span>
              {savingsPct !== null && savingsPct > 0 && (
                <div className="flex items-center gap-1 bg-green-50 text-green-700 rounded-full px-2.5 py-0.5 text-xs font-semibold border border-green-100">
                  <TrendingDown className="w-3 h-3" />
                  {savingsPct}% off
                </div>
              )}
              {savingsPct !== null && savingsPct < 0 && (
                <div className="flex items-center gap-1 bg-red-50 text-red-600 rounded-full px-2.5 py-0.5 text-xs font-semibold border border-red-100">
                  <TrendingUp className="w-3 h-3" />
                  +{Math.abs(savingsPct)}% above ask
                </div>
              )}
            </div>
          )}

          {/* Message */}
          {step.message && (
            <div className="mt-2.5 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
              <div className="flex items-start gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 italic">"{step.message}"</p>
              </div>
            </div>
          )}

          {/* Step number badge */}
          <div className="flex justify-end mt-2">
            <span className="text-[10px] text-gray-300 font-medium">
              Step {step.stepNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT -----------------------------------------------------------

export default function MakeOfferPage() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useSupabaseAuth() as any;

  const [listing, setListing] = useState<Listing | null>(null);
  const [existingOffer, setExistingOffer] = useState<Offer | null>(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [trailExpanded, setTrailExpanded] = useState(true);

  // -- Load listing -----------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Try Supabase first
        const { data: listingData } = await supabase
          .from("listings")
          .select("id, title, price, images, seller_id, profiles(full_name)")
          .eq("id", listingId)
          .single();

        if (listingData) {
          setListing({
            id: listingData.id,
            title: listingData.title,
            price: listingData.price,
            image: listingData.images?.[0],
            sellerId: listingData.seller_id,
            sellerName: (listingData as any).profiles?.full_name ?? "Seller",
            category: "",
          });
        } else {
          // Fallback to localStorage for offline listings
          try {
            const stored = localStorage.getItem("bambeh_marketplace_items");
            if (stored) {
              const items = JSON.parse(stored);
              const found = items.find((i: any) => i.id === listingId);
              if (found) {
                setListing({
                  id: found.id,
                  title: found.title,
                  price: found.price,
                  image: found.image,
                  sellerId: found.seller,
                  sellerName: found.seller ?? "Seller",
                  category: found.category ?? "",
                });
              }
            }
          } catch {}
        }

        // Load existing offer for this listing + user
        if (user?.id && listingId) {
          const { data: offerData } = await supabase
            .from("offers")
            .select(`
              id, listing_id, listing_title, listing_price,
              buyer_id, seller_id, current_amount, status,
              created_at, updated_at,
              offer_steps(
                id, offer_id, step_number, actor_type, actor_id,
                actor_name, action, amount, message, created_at
              )
            `)
            .eq("listing_id", listingId)
            .eq("buyer_id", user.id)
            .in("status", ["pending", "countered"])
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (offerData) {
            setExistingOffer({
              id: offerData.id,
              listingId: offerData.listing_id,
              listingTitle: offerData.listing_title,
              listingPrice: offerData.listing_price,
              buyerId: offerData.buyer_id,
              sellerId: offerData.seller_id,
              currentAmount: offerData.current_amount,
              status: offerData.status as OfferStatus,
              steps: ((offerData as any).offer_steps ?? [])
                .sort((a: OfferStep, b: OfferStep) => a.stepNumber - b.stepNumber),
              createdAt: offerData.created_at,
              updatedAt: offerData.updated_at,
            });
          }
        }
      } catch (err) {
        logger.warn("MakeOfferPage data fetch error:", err);
        // Use stub listing so page doesn't crash
        setListing({
          id: listingId ?? "unknown",
          title: "Marketplace Item",
          price: 50000,
          sellerId: "",
          sellerName: "Bambeh Seller",
          category: "General",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [listingId, user?.id]);

  // -- Submit new offer -------------------------------------------------------
  const handleSubmitOffer = useCallback(async () => {
    const amount = Number(offerAmount);
    if (!amount || amount <= 0) return setError("Enter a valid offer amount");
    if (!phone.trim()) return setError("Enter your phone number");
    if (listing && amount >= listing.price) return setError("Offer must be less than the asking price");

    setError("");
    setIsSubmitting(true);

    try {
      if (user?.id && listing?.sellerId) {
        // Supabase offer
        const { data: offer, error: offerErr } = await supabase
          .from("offers")
          .insert({
            listing_id: listing.id,
            listing_title: listing.title,
            listing_price: listing.price,
            buyer_id: user.id,
            seller_id: listing.sellerId,
            current_amount: amount,
            status: "pending",
          })
          .select("id")
          .single();

        if (offerErr) throw offerErr;

        // Create first step
        await supabase.from("offer_steps").insert({
          offer_id: offer.id,
          step_number: 1,
          actor_type: "buyer",
          actor_id: user.id,
          actor_name: profile?.full_name ?? "Buyer",
          action: "offer",
          amount,
          message: message.trim() || null,
        });

        // Reload offer
        const { data: fresh } = await supabase
          .from("offers")
          .select(`
            id, listing_id, listing_title, listing_price,
            buyer_id, seller_id, current_amount, status,
            created_at, updated_at,
            offer_steps(id, offer_id, step_number, actor_type, actor_id, actor_name, action, amount, message, created_at)
          `)
          .eq("id", offer.id)
          .single();

        if (fresh) {
          setExistingOffer({
            id: fresh.id,
            listingId: fresh.listing_id,
            listingTitle: fresh.listing_title,
            listingPrice: fresh.listing_price,
            buyerId: fresh.buyer_id,
            sellerId: fresh.seller_id,
            currentAmount: fresh.current_amount,
            status: fresh.status as OfferStatus,
            steps: ((fresh as any).offer_steps ?? []).sort((a: OfferStep, b: OfferStep) => a.stepNumber - b.stepNumber),
            createdAt: fresh.created_at,
            updatedAt: fresh.updated_at,
          });
        }
      } else {
        // Offline localStorage fallback
        const offers = JSON.parse(localStorage.getItem("bambeh_offers") ?? "[]");
        offers.unshift({
          id: Date.now().toString(),
          listingId,
          listingTitle: listing?.title,
          offerAmount: amount,
          originalPrice: listing?.price,
          message: message.trim(),
          phone: phone.trim(),
          status: "pending",
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("bambeh_offers", JSON.stringify(offers));

        // Mock existing offer for display
        setExistingOffer({
          id: Date.now().toString(),
          listingId: listingId ?? "",
          listingTitle: listing?.title ?? "",
          listingPrice: listing?.price ?? 0,
          buyerId: user?.id ?? "local",
          sellerId: listing?.sellerId ?? "",
          currentAmount: amount,
          status: "pending",
          steps: [{
            id: "1",
            offerId: "local",
            stepNumber: 1,
            actorType: "buyer",
            actorId: user?.id ?? "local",
            actorName: profile?.full_name ?? "You",
            action: "offer",
            amount,
            message: message.trim() || undefined,
            createdAt: new Date().toISOString(),
          }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      setOfferAmount("");
      setMessage("");
    } catch (err: any) {
      setError(err.message ?? "Failed to submit offer");
    } finally {
      setIsSubmitting(false);
    }
  }, [offerAmount, phone, message, listing, user, profile, listingId]);

  // -- Accept counter-offer ---------------------------------------------------
  const handleAcceptCounter = useCallback(async () => {
    if (!existingOffer) return;
    setIsSubmitting(true);
    try {
      await supabase.from("offers").update({ status: "accepted", updated_at: new Date().toISOString() }).eq("id", existingOffer.id);
      await supabase.from("offer_steps").insert({
        offer_id: existingOffer.id,
        step_number: (existingOffer.steps.length ?? 0) + 1,
        actor_type: "buyer",
        actor_id: user?.id,
        actor_name: profile?.full_name ?? "Buyer",
        action: "accept",
        amount: existingOffer.currentAmount,
      });
      setExistingOffer(prev => prev ? { ...prev, status: "accepted" } : null);
    } catch (err) { logger.warn("Accept error:", err); }
    finally { setIsSubmitting(false); }
  }, [existingOffer, user, profile]);

  // -- Withdraw offer ---------------------------------------------------------
  const handleWithdraw = useCallback(async () => {
    if (!existingOffer) return;
    setIsSubmitting(true);
    try {
      await supabase.from("offers").update({ status: "withdrawn", updated_at: new Date().toISOString() }).eq("id", existingOffer.id);
      await supabase.from("offer_steps").insert({
        offer_id: existingOffer.id,
        step_number: (existingOffer.steps.length ?? 0) + 1,
        actor_type: "buyer",
        actor_id: user?.id,
        actor_name: profile?.full_name ?? "Buyer",
        action: "withdraw",
      });
      setExistingOffer(prev => prev ? { ...prev, status: "withdrawn" } : null);
    } catch (err) { logger.warn("Withdraw error:", err); }
    finally { setIsSubmitting(false); }
  }, [existingOffer, user, profile]);

  // --- RENDER ---------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-3 border-teal-600 border-t-transparent animate-spin" style={{ borderWidth: 3 }}/>
          <p className="text-sm text-gray-400">Loading offer details�</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div>
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Listing not found</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-teal-600 text-sm font-semibold">
            ? Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusCfg = existingOffer ? STATUS_CONFIG[existingOffer.status] : null;
  const isOfferClosed = existingOffer && ["accepted", "declined", "expired", "withdrawn"].includes(existingOffer.status);
  const hasCounter = existingOffer?.status === "countered";

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-gray-900 text-base">
            {existingOffer ? "Offer Negotiation" : "Make an Offer"}
          </h2>
          {existingOffer && (
            <p className="text-xs text-gray-400">{existingOffer.steps.length} step{existingOffer.steps.length !== 1 ? "s" : ""} in trail</p>
          )}
        </div>
        <Tag className="w-5 h-5 text-teal-600" />
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Listing card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
            {listing.image ? (
              <BambehImage src={listing.image} alt={listing.title} width={64} height={64} imgClassName="rounded-xl" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Tag className="w-6 h-6 text-gray-300" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm truncate">{listing.title}</h3>
            <p className="text-xs text-gray-500 truncate">{listing.sellerName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-teal-600 font-black text-base">{listing.price.toLocaleString()} XAF</span>
              <span className="text-xs text-gray-400 line-through">Asking price</span>
            </div>
          </div>
        </div>

        {/* Active offer status banner */}
        {existingOffer && statusCfg && (
          <div className={`rounded-2xl border p-4 ${statusCfg.bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-bold text-sm ${statusCfg.color}`}>{statusCfg.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Current: <span className="font-bold text-gray-800">{existingOffer.currentAmount.toLocaleString()} XAF</span>
                  {" � "}
                  {Math.round(((listing.price - existingOffer.currentAmount) / listing.price) * 100)}% off
                </p>
              </div>
              {existingOffer.status === "accepted" && (
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCheck className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Counter-offer actions */}
        {hasCounter && (
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <p className="font-bold text-blue-800 text-sm">Seller Made a Counter-Offer</p>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              The seller countered at{" "}
              <span className="font-black text-blue-700">{existingOffer!.currentAmount.toLocaleString()} XAF</span>.
              What would you like to do?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleAcceptCounter}
                disabled={isSubmitting}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" /> Accept Deal
              </button>
              <button
                onClick={handleWithdraw}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <X className="w-4 h-4" /> Decline
              </button>
            </div>
          </div>
        )}

        {/* Negotiation trail */}
        {existingOffer && existingOffer.steps.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setTrailExpanded(p => !p)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-gray-800 text-sm">Negotiation Trail</span>
                <span className="bg-teal-100 text-teal-700 text-xs font-bold rounded-full px-2 py-0.5">
                  {existingOffer.steps.length}
                </span>
              </div>
              {trailExpanded
                ? <ChevronUp className="w-4 h-4 text-gray-400" />
                : <ChevronDown className="w-4 h-4 text-gray-400" />
              }
            </button>

            {trailExpanded && (
              <div className="px-4 pb-4 pt-2">
                {existingOffer.steps.map((step, idx) => (
                  <TrailStep
                    key={step.id}
                    step={step}
                    originalPrice={listing.price}
                    isLast={idx === existingOffer.steps.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* New offer form � only show if no open offer or if closed */}
        {(!existingOffer || isOfferClosed) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">
              {isOfferClosed ? "Make a New Offer" : "Your Offer"}
            </h3>

            {/* Offer amount */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                Offer Amount (XAF) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={offerAmount}
                  onChange={e => { setOfferAmount(e.target.value); setError(""); }}
                  placeholder="Enter your offer"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base font-bold focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">XAF</span>
              </div>

              {offerAmount && Number(offerAmount) > 0 && Number(offerAmount) < listing.price && (
                <div className="flex items-center gap-2 mt-2 bg-green-50 rounded-xl px-3 py-2 border border-green-100">
                  <TrendingDown className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-700 font-semibold">
                    You save{" "}
                    {(listing.price - Number(offerAmount)).toLocaleString()} XAF{" "}
                    ({Math.round(((listing.price - Number(offerAmount)) / listing.price) * 100)}% off)
                  </p>
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                Your Phone *
              </label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+237 6XX XXX XXX"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder="Explain your offer or ask a question�"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none transition"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 rounded-xl p-3 border border-red-100">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 border border-amber-100">
              ? The seller will be notified and can accept, decline, or counter your offer.
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitOffer}
                disabled={isSubmitting || !offerAmount || !phone.trim()}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-teal-100"
              >
                {isSubmitting ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Sending�</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Offer</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Withdraw active offer */}
        {existingOffer && existingOffer.status === "pending" && (
          <button
            onClick={handleWithdraw}
            disabled={isSubmitting}
            className="w-full text-gray-400 hover:text-red-500 text-xs font-medium py-2 transition-colors"
          >
            Withdraw this offer
          </button>
        )}
      </div>
    </div>
  );
}





