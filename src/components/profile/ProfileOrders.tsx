/**
 * PROFILE ORDERS COMPONENT
 * FILE LOCATION: src/components/profile/ProfileOrders.tsx
 *
 * i18n: all visible strings come from the local S table below, keyed by the live
 * language (useLang from @/hooks/useAppLang), so the list re-translates the
 * instant the language changes. Status labels, filter options, dates and the
 * item-count line are all localized. All logic (fetch, mock orders, filter,
 * search, currency formatting) is unchanged.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ChevronRight, AlertCircle, Search, Filter, RefreshCw, ShoppingBag } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface OrderItem { id: string; name: string; quantity: number; price: number; image: string; }

interface Order {
  id: string; orderNumber: string; status: OrderStatus; placedAt: string;
  total: number; itemCount: number; items: OrderItem[]; estimatedDelivery?: string;
}

const STATUS_STYLE: Record<OrderStatus, { color: string; bgColor: string; borderColor: string; icon: any }> = {
  pending:          { color: 'text-yellow-600', bgColor: 'bg-yellow-50',  borderColor: 'border-yellow-200',  icon: Clock       },
  confirmed:        { color: 'text-blue-600',   bgColor: 'bg-blue-50',    borderColor: 'border-blue-200',    icon: CheckCircle },
  processing:       { color: 'text-purple-600', bgColor: 'bg-purple-50',  borderColor: 'border-purple-200',  icon: Package     },
  shipped:          { color: 'text-indigo-600', bgColor: 'bg-indigo-50',  borderColor: 'border-indigo-200',  icon: Truck       },
  out_for_delivery: { color: 'text-orange-600', bgColor: 'bg-orange-50',  borderColor: 'border-orange-200',  icon: Truck       },
  delivered:        { color: 'text-green-600',  bgColor: 'bg-green-50',   borderColor: 'border-green-200',   icon: CheckCircle },
  cancelled:        { color: 'text-red-600',    bgColor: 'bg-red-50',     borderColor: 'border-red-200',     icon: AlertCircle },
};

const S: Record<Lang, {
  locale: string;
  status: Record<OrderStatus, string>;
  loading: string; errorMsg: string; tryAgain: string;
  emptyTitle: string; emptyDesc: string; browse: string;
  myOrders: string; totalOrders: (n: number) => string; refresh: string;
  searchPh: string;
  filterAll: (n: number) => string; filterPending: (n: number) => string; filterProcessing: (n: number) => string;
  filterShipped: (n: number) => string; filterDelivered: (n: number) => string; filterCancelled: (n: number) => string;
  noMatch: string; placedOn: string; itemsCount: (n: number) => string; estDelivery: string;
  trackOrder: string; details: string;
}> = {
  en: {
    locale: 'en-US',
    status: { pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' },
    loading: 'Loading orders...', errorMsg: 'Unable to load orders. Please try again.', tryAgain: 'Try Again',
    emptyTitle: 'No Orders Yet', emptyDesc: "You haven't placed any orders yet. Start shopping to see your orders here!", browse: 'Browse Marketplace',
    myOrders: 'My Orders', totalOrders: (n) => `${n} total orders`, refresh: 'Refresh',
    searchPh: 'Search orders...',
    filterAll: (n) => `All Orders (${n})`, filterPending: (n) => `Pending (${n})`, filterProcessing: (n) => `Processing (${n})`,
    filterShipped: (n) => `Shipped (${n})`, filterDelivered: (n) => `Delivered (${n})`, filterCancelled: (n) => `Cancelled (${n})`,
    noMatch: 'No orders found matching your criteria.', placedOn: 'Placed on', itemsCount: (n) => `${n} item${n > 1 ? 's' : ''}`, estDelivery: 'Est. delivery:',
    trackOrder: 'Track Order', details: 'Details',
  },
  fr: {
    locale: 'fr-FR',
    status: { pending: 'En attente', confirmed: 'ConfirmÃ©e', processing: 'En traitement', shipped: 'ExpÃ©diÃ©e', out_for_delivery: 'En cours de livraison', delivered: 'LivrÃ©e', cancelled: 'AnnulÃ©e' },
    loading: 'Chargement des commandes...', errorMsg: 'Impossible de charger les commandes. Veuillez rÃ©essayer.', tryAgain: 'RÃ©essayer',
    emptyTitle: 'Aucune commande', emptyDesc: "Vous n'avez pas encore passÃ© de commande. Commencez vos achats pour les voir ici !", browse: 'Parcourir la marketplace',
    myOrders: 'Mes commandes', totalOrders: (n) => `${n} commandes au total`, refresh: 'Actualiser',
    searchPh: 'Rechercher des commandes...',
    filterAll: (n) => `Toutes les commandes (${n})`, filterPending: (n) => `En attente (${n})`, filterProcessing: (n) => `En traitement (${n})`,
    filterShipped: (n) => `ExpÃ©diÃ©es (${n})`, filterDelivered: (n) => `LivrÃ©es (${n})`, filterCancelled: (n) => `AnnulÃ©es (${n})`,
    noMatch: 'Aucune commande ne correspond Ã  vos critÃ¨res.', placedOn: 'PassÃ©e le', itemsCount: (n) => `${n} article${n > 1 ? 's' : ''}`, estDelivery: 'Livraison estimÃ©e :',
    trackOrder: 'Suivre la commande', details: 'DÃ©tails',
  },
  pidgin: {
    locale: 'en-GB',
    status: { pending: 'Dey Wait', confirmed: 'Confirmed', processing: 'Dey Process', shipped: 'Don Ship', out_for_delivery: 'Dey Come', delivered: 'Don Deliver', cancelled: 'Cancelled' },
    loading: 'Orders dey load...', errorMsg: 'Orders no fit load. Try again.', tryAgain: 'Try Again',
    emptyTitle: 'No Order Yet', emptyDesc: 'You never order anything. Start to shop make your orders show here!', browse: 'Check Marketplace',
    myOrders: 'My Orders', totalOrders: (n) => `${n} orders all together`, refresh: 'Refresh',
    searchPh: 'Find orders...',
    filterAll: (n) => `All Orders (${n})`, filterPending: (n) => `Dey Wait (${n})`, filterProcessing: (n) => `Dey Process (${n})`,
    filterShipped: (n) => `Don Ship (${n})`, filterDelivered: (n) => `Don Deliver (${n})`, filterCancelled: (n) => `Cancelled (${n})`,
    noMatch: 'No order match wetin you dey find.', placedOn: 'You order am for', itemsCount: (n) => `${n} item${n > 1 ? 's' : ''}`, estDelivery: 'E go reach:',
    trackOrder: 'Track Order', details: 'Details',
  },
  ar: {
    locale: 'ar',
    status: { pending: 'Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±', confirmed: 'Ù…Ø¤ÙƒÙŽÙ‘Ø¯', processing: 'Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©', shipped: 'ØªÙ… Ø§Ù„Ø´Ø­Ù†', out_for_delivery: 'Ù‚ÙŠØ¯ Ø§Ù„ØªÙˆØµÙŠÙ„', delivered: 'ØªÙ… Ø§Ù„ØªØ³Ù„ÙŠÙ…', cancelled: 'Ù…Ù„ØºÙ‰' },
    loading: 'Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª...', errorMsg: 'ØªØ¹Ø°Ù‘Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.', tryAgain: 'Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰',
    emptyTitle: 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ø¨Ø¹Ø¯', emptyDesc: 'Ù„Ù… ØªÙ‚Ù… Ø¨Ø£ÙŠ Ø·Ù„Ø¨ Ø¨Ø¹Ø¯. Ø§Ø¨Ø¯Ø£ Ø§Ù„ØªØ³ÙˆÙ‘Ù‚ Ù„ØªØ¸Ù‡Ø± Ø·Ù„Ø¨Ø§ØªÙƒ Ù‡Ù†Ø§!', browse: 'ØªØµÙÙ‘Ø­ Ø§Ù„Ø³ÙˆÙ‚',
    myOrders: 'Ø·Ù„Ø¨Ø§ØªÙŠ', totalOrders: (n) => `${n} Ø·Ù„Ø¨Ø§Øª Ø¥Ø¬Ù…Ø§Ù„Ø§Ù‹`, refresh: 'ØªØ­Ø¯ÙŠØ«',
    searchPh: 'Ø§Ø¨Ø­Ø« ÙÙŠ Ø§Ù„Ø·Ù„Ø¨Ø§Øª...',
    filterAll: (n) => `ÙƒÙ„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª (${n})`, filterPending: (n) => `Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø± (${n})`, filterProcessing: (n) => `Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© (${n})`,
    filterShipped: (n) => `ØªÙ… Ø§Ù„Ø´Ø­Ù† (${n})`, filterDelivered: (n) => `ØªÙ… Ø§Ù„ØªØ³Ù„ÙŠÙ… (${n})`, filterCancelled: (n) => `Ù…Ù„ØºØ§Ø© (${n})`,
    noMatch: 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ù…Ø¹Ø§ÙŠÙŠØ±Ùƒ.', placedOn: 'ØªÙ… Ø§Ù„Ø·Ù„Ø¨ ÙÙŠ', itemsCount: (n) => `${n} Ø¹Ù†ØµØ±`, estDelivery: 'Ø§Ù„ØªØ³Ù„ÙŠÙ… Ø§Ù„Ù…ØªÙˆÙ‚Ø¹:',
    trackOrder: 'ØªØªØ¨Ù‘Ø¹ Ø§Ù„Ø·Ù„Ø¨', details: 'Ø§Ù„ØªÙØ§ØµÙŠÙ„',
  },
  ff: {
    locale: 'en-GB',
    status: { pending: 'HabbiiÉ—o', confirmed: 'TeeÅ‹tinaaÉ—o', processing: 'ÆŠon golleera', shipped: 'NuliraaÉ—o', out_for_delivery: 'ÆŠon ara', delivered: 'YottinaaÉ—o', cancelled: 'HaaytiraaÉ—o' },
    loading: 'Umrooje É—on loowee...', errorMsg: 'Umrooje mbaawaa loweede. TiiÉ—no eto kadi.', tryAgain: 'Eto kadi',
    emptyTitle: 'Umre woodaani tawo', emptyDesc: 'A umrii hay huunde tawo. FuÉ—É—o soodde ngam yiyde umrooje maa É—oo!', browse: 'Ndaar luumo',
    myOrders: 'Umrooje am', totalOrders: (n) => `umrooje ${n} denndaangal`, refresh: 'HesÉ—itin',
    searchPh: 'ÆŠaÉ“É“o umrooje...',
    filterAll: (n) => `Umrooje fof (${n})`, filterPending: (n) => `HabbiiÉ—e (${n})`, filterProcessing: (n) => `ÆŠe É—on golleera (${n})`,
    filterShipped: (n) => `NuliraaÉ—e (${n})`, filterDelivered: (n) => `YottinaaÉ—e (${n})`, filterCancelled: (n) => `HaaytiraaÉ—e (${n})`,
    noMatch: 'Umre fotnde e ko É—aÉ“É“uÉ—aa heÉ“aaka.', placedOn: 'Umraama Ã±alnde', itemsCount: (n) => `kuuje ${n}`, estDelivery: 'Jonnugol hiisaaÉ—o:',
    trackOrder: 'Jokku umre', details: 'Humpito',
  },
};

interface ProfileOrdersProps { userId?: string; }

export default function ProfileOrders({ userId }: ProfileOrdersProps) {
  const langCode = useLang();
  const l: Lang = (langCode in S ? langCode : 'en') as Lang;
  const s = S[l];
  const isRtl = l === 'ar';

  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [filter, setFilter]         = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchOrders(); }, [userId]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockOrders: Order[] = [
        { id: '1', orderNumber: 'BMB-00000001', status: 'shipped', placedAt: new Date(Date.now() - 3 * 86400000).toISOString(), total: 57500, itemCount: 3,
          items: [{ id: '1', name: 'Premium Wireless Headphones', quantity: 1, price: 45000, image: '/images/products/headphones.jpg' }, { id: '2', name: 'USB-C Charging Cable', quantity: 2, price: 5000, image: '/images/products/cable.jpg' }],
          estimatedDelivery: new Date(Date.now() + 2 * 86400000).toISOString() },
        { id: '2', orderNumber: 'BMB-00000002', status: 'delivered', placedAt: new Date(Date.now() - 10 * 86400000).toISOString(), total: 25000, itemCount: 1,
          items: [{ id: '3', name: 'Bluetooth Speaker', quantity: 1, price: 25000, image: '/images/products/speaker.jpg' }] },
        { id: '3', orderNumber: 'BMB-00000003', status: 'processing', placedAt: new Date(Date.now() - 86400000).toISOString(), total: 120000, itemCount: 2,
          items: [{ id: '4', name: 'Smart Watch', quantity: 1, price: 80000, image: '/images/products/watch.jpg' }, { id: '5', name: 'Watch Band', quantity: 2, price: 20000, image: '/images/products/band.jpg' }],
          estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString() },
        { id: '4', orderNumber: 'BMB-00000004', status: 'pending', placedAt: new Date(Date.now() - 0.5 * 86400000).toISOString(), total: 15000, itemCount: 1,
          items: [{ id: '6', name: 'Phone Case', quantity: 1, price: 15000, image: '/images/products/case.jpg' }] },
      ];
      setOrders(mockOrders);
    } catch (err) {
      setError(s.errorMsg);
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
    return new Date(dateString).toLocaleDateString(s.locale, { month: 'short', day: 'numeric', year: 'numeric' });
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
      <div dir={isRtl ? 'rtl' : 'ltr'} className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mx-auto mb-4" />
        <p className="text-gray-600">{s.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={handleRefresh} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">{s.tryAgain}</button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><ShoppingBag className="w-10 h-10 text-gray-400" /></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.emptyTitle}</h3>
        <p className="text-gray-600 mb-6">{s.emptyDesc}</p>
        <Link to="/marketplace" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium">
          <ShoppingBag className="w-5 h-5" />{s.browse}
        </Link>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{s.myOrders}</h2>
          <p className="text-sm text-gray-500">{s.totalOrders(orders.length)}</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />{s.refresh}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={s.searchPh}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
        </div>
        <div className="relative">
          <select value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | 'all')}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white">
            <option value="all">{s.filterAll(orders.length)}</option>
            <option value="pending">{s.filterPending(statusCounts['pending'] || 0)}</option>
            <option value="processing">{s.filterProcessing(statusCounts['processing'] || 0)}</option>
            <option value="shipped">{s.filterShipped(statusCounts['shipped'] || 0)}</option>
            <option value="delivered">{s.filterDelivered(statusCounts['delivered'] || 0)}</option>
            <option value="cancelled">{s.filterCancelled(statusCounts['cancelled'] || 0)}</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg"><p className="text-gray-600">{s.noMatch}</p></div>
        ) : (
          filteredOrders.map((order) => {
            const statusStyle = STATUS_STYLE[order.status];
            const StatusIcon  = statusStyle.icon;
            const statusLabel = s.status[order.status];
            return (
              <div key={order.id} className={`bg-white rounded-xl border ${statusStyle.borderColor} overflow-hidden hover:shadow-md transition-shadow`}>
                <div className={`${statusStyle.bgColor} px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <StatusIcon className={`w-4 h-4 ${statusStyle.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{s.placedOn} {formatDate(order.placedAt)}</p>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bgColor} ${statusStyle.color} border ${statusStyle.borderColor}`}>
                    <StatusIcon className="w-3 h-3" />{statusLabel}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex gap-3 mb-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="relative">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/images/placeholder-product.png'; }} />
                        </div>
                        {item.quantity > 1 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center">{item.quantity}</span>
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm text-gray-500">+{order.items.length - 3}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">{s.itemsCount(order.itemCount)}</p>
                      <p className="font-bold text-gray-900 text-lg">{formatCurrency(order.total)}</p>
                      {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <p className="text-xs text-gray-500 mt-1">{s.estDelivery} {formatDate(order.estimatedDelivery)}</p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Link to={`/track/${order.id}`} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium text-sm">
                        <Truck className="w-4 h-4" />{s.trackOrder}
                      </Link>
                      <Link to={`/order/${order.id}`} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                        {s.details}<ChevronRight className="w-4 h-4" />
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


