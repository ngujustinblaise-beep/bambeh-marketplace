/**
 * PROFILE ORDERS COMPONENT
 * FILE LOCATION: src/components/profile/ProfileOrders.tsx
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ChevronRight, AlertCircle, Search, Filter, RefreshCw, ShoppingBag } from 'lucide-react';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface OrderItem { id: string; name: string; quantity: number; price: number; image: string; }

interface Order {
  id: string; orderNumber: string; status: OrderStatus; placedAt: string;
  total: number; itemCount: number; items: OrderItem[]; estimatedDelivery?: string;
}

const STATUS_CONFIG: Record<OrderStatus, { color: string; bgColor: string; borderColor: string; icon: any; label: string }> = {
  pending:          { color: 'text-yellow-600', bgColor: 'bg-yellow-50',  borderColor: 'border-yellow-200',  icon: Clock,          label: 'Pending'          },
  confirmed:        { color: 'text-blue-600',   bgColor: 'bg-blue-50',    borderColor: 'border-blue-200',    icon: CheckCircle,    label: 'Confirmed'        },
  processing:       { color: 'text-purple-600', bgColor: 'bg-purple-50',  borderColor: 'border-purple-200',  icon: Package,        label: 'Processing'       },
  shipped:          { color: 'text-indigo-600', bgColor: 'bg-indigo-50',  borderColor: 'border-indigo-200',  icon: Truck,          label: 'Shipped'          },
  out_for_delivery: { color: 'text-orange-600', bgColor: 'bg-orange-50',  borderColor: 'border-orange-200',  icon: Truck,          label: 'Out for Delivery' },
  delivered:        { color: 'text-green-600',  bgColor: 'bg-green-50',   borderColor: 'border-green-200',   icon: CheckCircle,    label: 'Delivered'        },
  cancelled:        { color: 'text-red-600',    bgColor: 'bg-red-50',     borderColor: 'border-red-200',     icon: AlertCircle,    label: 'Cancelled'        },
};

interface ProfileOrdersProps { userId?: string; }

export default function ProfileOrders({ userId }: ProfileOrdersProps) {
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
      setError('Unable to load orders. Please try again.');
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
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mx-auto mb-4" />
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={handleRefresh} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">Try Again</button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><ShoppingBag className="w-10 h-10 text-gray-400" /></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
        <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your orders here!</p>
        <Link to="/marketplace" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium">
          <ShoppingBag className="w-5 h-5" />Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
          <p className="text-sm text-gray-500">{orders.length} total orders</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
        </div>
        <div className="relative">
          <select value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | 'all')}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white">
            <option value="all">All Orders ({orders.length})</option>
            <option value="pending">Pending ({statusCounts['pending'] || 0})</option>
            <option value="processing">Processing ({statusCounts['processing'] || 0})</option>
            <option value="shipped">Shipped ({statusCounts['shipped'] || 0})</option>
            <option value="delivered">Delivered ({statusCounts['delivered'] || 0})</option>
            <option value="cancelled">Cancelled ({statusCounts['cancelled'] || 0})</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg"><p className="text-gray-600">No orders found matching your criteria.</p></div>
        ) : (
          filteredOrders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status];
            const StatusIcon   = statusConfig.icon;
            return (
              <div key={order.id} className={`bg-white rounded-xl border ${statusConfig.borderColor} overflow-hidden hover:shadow-md transition-shadow`}>
                <div className={`${statusConfig.bgColor} px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">Placed on {formatDate(order.placedAt)}</p>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
                    <StatusIcon className="w-3 h-3" />{statusConfig.label}
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
                      <p className="text-sm text-gray-500">{order.itemCount} item{order.itemCount > 1 ? 's' : ''}</p>
                      <p className="font-bold text-gray-900 text-lg">{formatCurrency(order.total)}</p>
                      {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <p className="text-xs text-gray-500 mt-1">Est. delivery: {formatDate(order.estimatedDelivery)}</p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Link to={`/track/${order.id}`} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium text-sm">
                        <Truck className="w-4 h-4" />Track Order
                      </Link>
                      <Link to={`/order/${order.id}`} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                        Details<ChevronRight className="w-4 h-4" />
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
