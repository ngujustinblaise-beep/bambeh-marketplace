/**
 * ---------------------------------------------------------------------------
 * ORDER MANAGEMENT COMPONENT
 * ---------------------------------------------------------------------------
 * 
 * Manage vendor orders - view, update status, track deliveries
 * 
 * © 2025 Bambeh. All rights reserved.
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  User,
  MapPin,
  Phone
} from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  status: 'pending' | 'in_escrow' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  buyerName?: string;
  buyerPhone?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  createdAt: string;
  escrowReleaseDate?: string;
}

interface OrderManagementProps { vendorId: string;  }

const OrderManagement: React.FC<OrderManagementProps> = ({ vendorId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const loadOrders = () => {
      try {
        const allOrders = JSON.parse(localStorage.getItem('Bambeh_orders') || '[]');
        // Filter orders that contain items from this vendor
        const vendorOrders = allOrders.filter((order: Order) => 
          order.items?.some((item: any) => item.sellerId === vendorId)
        );
        setOrders(vendorOrders);
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [vendorId]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_escrow': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': 
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'in_escrow': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': 
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const allOrders = JSON.parse(localStorage.getItem('Bambeh_orders') || '[]');
    const updatedAll = allOrders.map((o: Order) => 
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    localStorage.setItem('Bambeh_orders', JSON.stringify(updatedAll));
    
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o
    ));
  };

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_escrow', label: 'In Escrow' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"/>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        <p className="text-gray-500">{orders.length} total orders</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Orders Yet</h3>
          <p className="text-gray-500">Orders will appear here when customers buy your products.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)}
                    </span>
                    <span className="font-bold text-teal-600 text-lg">
                      {order.total?.toLocaleString()} XAF
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 bg-gray-50">
                <div className="space-y-3">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.price?.toLocaleString()} XAF × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="text-sm text-gray-500">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>
              </div>

              {/* Buyer Info & Actions */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-500">
                  {order.buyerName && (
                    <p className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {order.buyerName}
                    </p>
                  )}
                  {order.escrowReleaseDate && (
                    <p className="flex items-center gap-1 text-blue-600">
                      <Clock className="w-4 h-4" />
                      Escrow releases: {new Date(order.escrowReleaseDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {order.status === 'in_escrow' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 flex items-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      Mark Shipped
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Delivered
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2"
                  >
                    Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg">Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-bold">{selectedOrder.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-bold text-teal-600 text-xl">{selectedOrder.total?.toLocaleString()} XAF</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Items</p>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-2 bg-gray-50 rounded-lg">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-medium">{(item.price * item.quantity).toLocaleString()} XAF</span>
                    </div>
                  ))}
                </div>
              </div>
              {selectedOrder.escrowReleaseDate && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Escrow Release:</strong> {new Date(selectedOrder.escrowReleaseDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

export default OrderManagement;




