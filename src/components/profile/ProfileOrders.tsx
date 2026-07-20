// BAMBEH_DEPLOY_TOKEN__PROFILEORDERS_FIX129_CLEAN
/**
 * ProfileOrders.tsx — Bambeh Marketplace
 * FILE LOCATION: src/components/profile/ProfileOrders.tsx
 *
 * Full multi-lingual layout direction compliance (LTR / RTL mirror)
 * configured across English, French, Pidgin English, Arabic, and Fulfulde.
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ChevronLeft, ChevronRight, AlertCircle, Search, Filter, RefreshCw, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/App';
import { supabase } from '@/lib/supabase';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

interface OrderItem { id: string; name: string; quantity: number; price: number; image: string; }

interface Order {
  id: string; orderNumber: string; status: OrderStatus; placedAt: string;
  total: number; itemCount: number; items: OrderItem[]; estimatedDelivery?: string;
}

const S: Record<Lang, {
  title: string;
  totalOrders: string;
  refresh: string;
  searchPlaceholder: string;
  filterAll: string;
  noOrdersTitle: string;
  noOrdersDesc: string;
  browseBtn: string;
  noCriteria: string;
  placedOn: string;
  itemsCountSingle: string;
  itemsCountPlural: string;
  estDelivery: string;
  trackBtn: string;
  detailsBtn: string;
  loading: string;
  tryAgain: string;
  statuses: Record<OrderStatus, string>;
}> = {
  en: {
    title: "My Orders",
    totalOrders: "total orders",
    refresh: "Refresh",
    searchPlaceholder: "Search orders...",
    filterAll: "All Orders",
    noOrdersTitle: "No Orders Yet",
    noOrdersDesc: "You haven't placed any orders yet. Start shopping to see your orders here!",
    browseBtn: "Browse Marketplace",
    noCriteria: "No orders found matching your criteria.",
    placedOn: "Placed on",
    itemsCountSingle: "item",
    itemsCountPlural: "items",
    estDelivery: "Est. delivery:",
    trackBtn: "Track Order",
    detailsBtn: "Details",
    loading: "Loading orders...",
    tryAgain: "Try Again",
    statuses: { pending: "Pending", confirmed: "Confirmed", processing: "Processing", shipped: "Shipped", out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled" }
  },
  fr: {
    title: "Mes Commandes",
    totalOrders: "commandes au total",
    refresh: "Actualiser",
    searchPlaceholder: "Rechercher des commandes...",
    filterAll: "Toutes les commandes",
    noOrdersTitle: "Aucune commande pour le moment",
    noOrdersDesc: "Vous n'avez pas encore passé de commande. Commencez vos achats pour les voir ici !",
    browseBtn: "Parcourir le marché",
    noCriteria: "Aucune commande ne correspond à vos critères.",
    placedOn: "Simulée le",
    itemsCountSingle: "article",
    itemsCountPlural: "articles",
    estDelivery: "Livraison prévue :",
    trackBtn: "Suivre",
    detailsBtn: "Détails",
    loading: "Chargement des commandes...",
    tryAgain: "Réessayer",
    statuses: { pending: "En attente", confirmed: "Confirmée", processing: "Traitement", shipped: "Expédiée", out_for_delivery: "En cours de livraison", delivered: "Livrée", cancelled: "Annulée" }
  },
  pidgin: {
    title: "My Orders",
    totalOrders: "total market orders wey you buy",
    refresh: "Refresh",
    searchPlaceholder: "Find orders...",
    filterAll: "All Orders",
    noOrdersTitle: "No Market Orders Yet",
    noOrdersDesc: "You never buy any item yet. Clear go marketplace start shopping make details look clear for here!",
    browseBtn: "Browse Marketplace",
    noCriteria: "No orders match that description for street.",
    placedOn: "You pay on",
    itemsCountSingle: "item",
    itemsCountPlural: "items",
    estDelivery: "Est. reach day:",
    trackBtn: "Track Order",
    detailsBtn: "Details",
    loading: "We dey pull orders...",
    tryAgain: "Try Again",
    statuses: { pending: "Pending Line", confirmed: "Confirmed Clear", processing: "Packaging level", shipped: "Motor dey road", out_for_delivery: "Rider dey close", delivered: "E don reach hand", cancelled: "Cancelled off" }
  },
  ar: {
    title: "طلباتي",
    totalOrders: "إجمالي الطلبات",
    refresh: "تحديث",
    searchPlaceholder: "البحث في الطلبات...",
    filterAll: "جميع الطلبات",
    noOrdersTitle: "لا توجد طلبات بعد",
    noOrdersDesc: "لم تقم بإجراء أي طلبات حتى الآن. ابدأ التسوق لرؤية طلباتك هنا!",
    browseBtn: "تصفح السوق",
    noCriteria: "لم نجد أي طلبات تطابق معايير البحث الخاصة بك.",
    placedOn: "تم الطلب في",
    itemsCountSingle: "منتج",
    itemsCountPlural: "منتجات",
    estDelivery: "التوصيل المتوقع:",
    trackBtn: "تتبع الطلب",
    detailsBtn: "التفاصيل",
    loading: "جاري تحميل الطلبات...",
    tryAgain: "إعادة المحاولة",
    statuses: { pending: "قيد الانتظار", confirmed: "تم التأكيد", processing: "جاري التجهيز", shipped: "تم الشحن", out_for_delivery: "جاري التوصيل", delivered: "تم التسليم", cancelled: "ملغي" }
  },
  ff: {
    title: "Kuuje Coodaaɗe am",
    totalOrders: "ko cood-ɗaa fof",
    refresh: "Hesɗitinki",
    searchPlaceholder: "Find orders...",
    filterAll: "Kuuje Coodaaɗe Fof",
    noOrdersTitle: "Walaa Kuuje Coodaaɗe",
    noOrdersDesc: "A never sooda kuuje sam tawon. Nastu gollirde yeeyugo fuɗɗugo soodgo joni!",
    browseBtn: "Lartu Gollirde",
    noCriteria: "Walaa kuuje coodaaɗe pottuɗe e ko njiɗ-ɗaa.",
    placedOn: "Coodaaɗe haa",
    itemsCountSingle: "kuuje",
    itemsCountPlural: "kuuje",
    estDelivery: "Saa'i jottarki:",
    trackBtn: "Laaru Nokku",
    detailsBtn: "Kabaaru",
    loading: "Ɗon ɗisata coodaaɗe...",
    tryAgain: "Eto Kadi",
    statuses: { pending: "Ɗon jorta", confirmed: "Tabitinaama", processing: "Ɗon surna", shipped: "Ɗon e laawol", out_for_delivery: "Rider ɗon ɓadi", delivered: "Heɓama ko woodi", cancelled: "Fasiknaama sam" }
  }
};

const STATUS_CONFIG: Record<OrderStatus, { color: string; bgColor: string; borderColor: string; icon: any }> = {
  pending:          { color: 'text-yellow-600', bgColor: 'bg-yellow-50',  borderColor: 'border-yellow-200',  icon: Clock },
  confirmed:        { color: 'text-blue-600',   bgColor: 'bg-blue-50',   borderColor: 'border-blue-200',    icon: CheckCircle },
  processing:       { color: 'text-purple-600', bgColor: 'bg-purple-50',  borderColor: 'border-purple-200',  icon: Package },
  shipped:          { color: 'text-indigo-600', bgColor: 'bg-indigo-50',  borderColor: 'border-indigo-200',  icon: Truck },
  out_for_delivery: { color: 'text-orange-600', bgColor: 'bg-orange-50',  borderColor: 'border-orange-200',  icon: Truck },
  delivered:        { color: 'text-green-600',  bgColor: 'bg-green-50',   borderColor: 'border-green-200',   icon: CheckCircle },
  cancelled:        { color: 'text-red-600',    bgColor: 'bg-red-50',     borderColor: 'border-red-200',     icon: AlertCircle },
};

interface ProfileOrdersProps { userId?: string; }

export default function ProfileOrders({ userId }: ProfileOrdersProps) {
  const { language } = useLanguage();
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [filter, setFilter]         = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const lang: Lang = (language in S ? language : "en") as Lang;
  const s = S[lang];
  const isRtl = lang === "ar";

  useEffect(() => { fetchOrders(); }, [userId]);

  // FIX129: REAL orders from Supabase (mock array removed).
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      let uid = userId ?? null;
      if (!uid) {
        const { data: auth } = await supabase.auth.getUser();
        uid = auth?.user?.id ?? null;
      }
      if (!uid) { setOrders([]); setLoading(false); return; }

      const { data, error: qe } = await supabase
        .from('orders')
        .select('id, order_number, status, created_at, total_xaf, items, escrow_status')
        .eq('buyer_id', uid)
        .order('created_at', { ascending: false })
        .limit(100);
      if (qe) throw qe;

      const KNOWN: OrderStatus[] = ['pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled'];
      const mapStatus = (s: string | null): OrderStatus => {
        if (s && (KNOWN as string[]).includes(s)) return s as OrderStatus;
        if (s === 'paid' || s === 'success' || s === 'completed') return 'confirmed';
        if (s === 'failed' || s === 'refunded') return 'cancelled';
        return 'pending';
      };

      const mapped: Order[] = ((data ?? []) as Array<{
        id: string; order_number: string | null; status: string | null;
        created_at: string; total_xaf: number | null; items: unknown;
      }>).map((r) => {
        const rawItems = Array.isArray(r.items) ? (r.items as Array<Record<string, unknown>>) : [];
        const items: OrderItem[] = rawItems.map((it, i) => ({
          id: String(it.id ?? it.listing_id ?? i),
          name: String(it.name ?? it.title ?? 'Item'),
          quantity: Number(it.quantity ?? it.qty ?? 1),
          price: Number(it.price ?? it.price_xaf ?? 0),
          image: String((Array.isArray(it.images) ? (it.images as string[])[0] : it.image) ?? ''),
        }));
        return {
          id: r.id,
          orderNumber: r.order_number ?? r.id.slice(0, 8).toUpperCase(),
          status: mapStatus(r.status),
          placedAt: r.created_at,
          total: r.total_xaf ?? items.reduce((sum, it) => sum + it.price * it.quantity, 0),
          itemCount: items.reduce((sum, it) => sum + it.quantity, 0) || items.length,
          items,
        } as Order;
      });
      setOrders(mapped);
    } catch (err) {
      console.error('[ProfileOrders] load failed:', err);
      setError(s.tryAgain);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const localeMap: Record<Lang, string> = { en: 'en-US', fr: 'fr-CM', pidgin: 'en-US', ar: 'ar-CM', ff: 'fr-CM' };
    return new Date(dateString).toLocaleDateString(localeMap[lang], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading && orders.length === 0) {
    return (
      <div dir={isRtl ? "rtl" : "ltr"} className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mx-auto mb-4" />
        <p className="text-xs text-gray-500 font-semibold">{s.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div dir={isRtl ? "rtl" : "ltr"} className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-xs text-gray-500 mb-4 font-semibold">{error}</p>
        <button onClick={handleRefresh} className="px-5 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 transition-colors focus:outline-none">{s.tryAgain}</button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div dir={isRtl ? "rtl" : "ltr"} className="p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><ShoppingBag className="w-10 h-10 text-gray-400" /></div>
        <h3 className="text-base font-bold text-gray-900 mb-2">{s.noOrdersTitle}</h3>
        <p className="text-xs text-gray-400 mb-6 font-medium max-w-sm mx-auto leading-relaxed">{s.noOrdersDesc}</p>
        <Link to="/marketplace" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-bold text-xs focus:outline-none">
          <ShoppingBag className="w-4 h-4" />{s.browseBtn}
        </Link>
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-5 text-start">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{s.title}</h2>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">{orders.length} {s.totalOrders}</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none border border-gray-200 bg-white">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />{s.refresh}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={s.searchPlaceholder}
            className={`w-full ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none`} />
        </div>
        <div className="relative">
          <select value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | 'all')}
            className={`appearance-none ${isRtl ? 'pl-9 pr-4' : 'pl-4 pr-9'} py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-xs font-bold text-gray-700 focus:outline-none`}>
            <option value="all">{s.filterAll} ({orders.length})</option>
            <option value="pending">{s.statuses.pending} ({statusCounts['pending'] || 0})</option>
            <option value="processing">{s.statuses.processing} ({statusCounts['processing'] || 0})</option>
            <option value="shipped">{s.statuses.shipped} ({statusCounts['shipped'] || 0})</option>
            <option value="delivered">{s.statuses.delivered} ({statusCounts['delivered'] || 0})</option>
            <option value="cancelled">{s.statuses.cancelled} ({statusCounts['cancelled'] || 0})</option>
          </select>
          <Filter className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none`} />
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 border-dashed"><p className="text-xs font-semibold text-gray-400">{s.noCriteria}</p></div>
        ) : (
          filteredOrders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status];
            const StatusIcon   = statusConfig.icon;
            const currentLabel = s.statuses[order.status];

            return (
              <div key={order.id} className={`bg-white rounded-xl border ${statusConfig.borderColor} overflow-hidden hover:shadow-sm transition-shadow`}>
                <div className={`${statusConfig.bgColor} px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b ${statusConfig.borderColor}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-xs">
                      <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm leading-tight">{order.orderNumber}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{s.placedOn} {formatDate(order.placedAt)}</p>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
                    <StatusIcon className="w-3 h-3" />{currentLabel}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex gap-2.5 mb-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="relative">
                        <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/images/placeholder-product.png'; }} />
                        </div>
                        {item.quantity > 1 && (
                          <span className={`absolute -top-1.5 ${isRtl ? '-left-1.5' : '-right-1.5'} w-4 h-4 bg-teal-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs`}>{item.quantity}</span>
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-14 h-14 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-400">+{order.items.length - 3}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{order.itemCount} {order.itemCount > 1 ? s.itemsCountPlural : s.itemsCountSingle}</p>
                      <p className="font-bold text-gray-900 text-base mt-0.5">{formatCurrency(order.total)}</p>
                      {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <p className="text-[11px] text-teal-600 font-semibold mt-1">{s.estDelivery} {formatDate(order.estimatedDelivery)}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/track/${order.id}`} className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-bold text-xs focus:outline-none shadow-xs">
                        <Truck className="w-3.5 h-3.5" />{s.trackBtn}
                      </Link>
                      <Link to={`/order/${order.id}`} className="flex items-center gap-1 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold text-xs focus:outline-none">
                        <span>{s.detailsBtn}</span>
                        {isRtl ? <ChevronLeft className="w-3.5 h-3.5 mt-0.5" /> : <ChevronRight className="w-3.5 h-3.5 mt-0.5" />}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__PROFILEORDERS__COMPLETE
