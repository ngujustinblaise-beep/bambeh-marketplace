/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ORDER TRACKING PAGE - PROFESSIONAL E-COMMERCE TRACKING
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Real-time order status tracking
 * - Visual timeline of order progress
 * - Delivery location and estimated time
 * - Order details with product images
 * - Contact support option
 * - Map integration ready
 *
 * © 2025 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package, Truck, CheckCircle, Clock, MapPin,
  Phone, MessageCircle, ArrowLeft, Copy,
  AlertCircle, RefreshCw, Home, Store,
  Calendar, User, CreditCard, ChevronRight,
} from 'lucide-react';

// Order status types
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface TrackingEvent {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  completed: boolean;
}

interface OrderDetails {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  placedAt: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    region: string;
    country: string;
  };
  courier: {
    name: string;
    trackingNumber: string;
    phone?: string;
  };
  trackingEvents: TrackingEvent[];
}

// Status configuration
const STATUS_CONFIG: Record<OrderStatus, { color: string; bgColor: string; icon: any; label: string }> = {
  pending:          { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock,        label: 'Pending'          },
  confirmed:        { color: 'text-blue-600',   bgColor: 'bg-blue-100',   icon: CheckCircle,  label: 'Confirmed'        },
  processing:       { color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Package,      label: 'Processing'       },
  shipped:          { color: 'text-indigo-600', bgColor: 'bg-indigo-100', icon: Truck,        label: 'Shipped'          },
  out_for_delivery: { color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Truck,        label: 'Out for Delivery' },
  delivered:        { color: 'text-green-600',  bgColor: 'bg-green-100',  icon: CheckCircle,  label: 'Delivered'        },
  cancelled:        { color: 'text-red-600',    bgColor: 'bg-red-100',    icon: AlertCircle,  label: 'Cancelled'        },
};

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch order details
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call - Replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock order data - This would come from your backend
      const mockOrder: OrderDetails = {
        orderId: orderId || '1',
        orderNumber: `BMB-${String(orderId || '1').padStart(8, '0')}`,
        status: 'shipped',
        placedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            id: '1',
            name: 'Premium Wireless Headphones',
            quantity: 1,
            price: 45000,
            image: '/images/products/headphones.jpg',
          },
          {
            id: '2',
            name: 'USB-C Charging Cable (2m)',
            quantity: 2,
            price: 5000,
            image: '/images/products/cable.jpg',
          },
        ],
        subtotal: 55000,
        shipping: 2500,
        total: 57500,
        paymentMethod: 'MTN Mobile Money',
        shippingAddress: {
          name: 'Jean-Pierre Mbarga',
          phone: '+237 6XX XXX XXX',
          street: '123 Rue de la Paix',
          city: 'Yaoundé',
          region: 'Centre',
          country: 'Cameroon',
        },
        courier: {
          name: 'Bambeh Express',
          trackingNumber: 'BEX' + String(Date.now()).slice(-10),
          phone: '+237 6XX XXX XXX',
        },
        trackingEvents: [
          {
            status: 'pending',
            title: 'Order Placed',
            description: 'Your order has been received and is awaiting confirmation.',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true,
          },
          {
            status: 'confirmed',
            title: 'Order Confirmed',
            description: 'Payment verified. Your order is being prepared.',
            timestamp: new Date(Date.now() - 2.8 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true,
          },
          {
            status: 'processing',
            title: 'Processing',
            description: 'Your items are being picked and packed.',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Bambeh Warehouse, Douala',
            completed: true,
          },
          {
            status: 'shipped',
            title: 'Shipped',
            description: 'Your package is on its way!',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Douala Sorting Center',
            completed: true,
          },
          {
            status: 'out_for_delivery',
            title: 'Out for Delivery',
            description: 'Your package is with the delivery agent.',
            timestamp: '',
            location: 'Yaoundé Distribution Center',
            completed: false,
          },
          {
            status: 'delivered',
            title: 'Delivered',
            description: 'Package delivered successfully.',
            timestamp: '',
            completed: false,
          },
        ],
      };

      setOrder(mockOrder);
    } catch (err) {
      setError('Unable to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrderDetails();
    setRefreshing(false);
  };

  const copyTrackingNumber = () => {
    if (order?.courier.trackingNumber) {
      navigator.clipboard.writeText(order.courier.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Pending';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || `We couldn't find order #${orderId}. Please check the order ID and try again.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              to="/profile?tab=orders"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Package className="w-4 h-4" />
              My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <div className="text-center">
            <p className="text-teal-200 text-sm mb-1">Order Number</p>
            <h1 className="text-2xl font-bold mb-4">{order.orderNumber}</h1>

            {/* Current Status Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bgColor}`}>
              <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
              <span className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-4">
        {/* Estimated Delivery Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">
                {order.status === 'delivered' ? 'Delivered On' : 'Estimated Delivery'}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {formatDate(order.actualDelivery || order.estimatedDelivery)}
              </p>
            </div>
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
              <Calendar className="w-7 h-7 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            Tracking Timeline
          </h2>

          <div className="relative">
            {order.trackingEvents.map((event, index) => {
              const eventConfig = STATUS_CONFIG[event.status];
              const EventIcon = eventConfig.icon;
              const isLast = index === order.trackingEvents.length - 1;

              return (
                <div key={index} className="flex gap-4 pb-8 last:pb-0">
                  {/* Timeline Line & Icon */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      event.completed ? eventConfig.bgColor : 'bg-gray-100'
                    }`}>
                      <EventIcon className={`w-5 h-5 ${
                        event.completed ? eventConfig.color : 'text-gray-400'
                      }`} />
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 flex-1 mt-2 ${
                        event.completed ? 'bg-teal-300' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 pb-2">
                    <h3 className={`font-semibold ${
                      event.completed ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {event.title}
                    </h3>
                    <p className={`text-sm ${
                      event.completed ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {event.description}
                    </p>
                    {event.location && (
                      <p className={`text-sm flex items-center gap-1 mt-1 ${
                        event.completed ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </p>
                    )}
                    {event.timestamp && (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(event.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Courier Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-teal-600" />
            Courier Details
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Courier</p>
                <p className="font-semibold text-gray-900">{order.courier.name}</p>
              </div>
              {order.courier.phone && (
                <a
                  href={`tel:${order.courier.phone}`}
                  className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center hover:bg-teal-200 transition-colors"
                >
                  <Phone className="w-5 h-5 text-teal-600" />
                </a>
              )}
            </div>

            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-gray-500 text-sm">Tracking Number</p>
                <p className="font-mono font-semibold text-gray-900">{order.courier.trackingNumber}</p>
              </div>
              <button
                onClick={copyTrackingNumber}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-teal-600" />
            Shipping Address
          </h2>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-semibold text-gray-900">{order.shippingAddress.name}</p>
            <p className="text-gray-600">{order.shippingAddress.phone}</p>
            <p className="text-gray-600 mt-2">
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.region}<br />
              {order.shippingAddress.country}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-600" />
            Order Items ({order.items.length})
          </h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder-product.png';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  <p className="font-semibold text-teal-600">{formatCurrency(item.price)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{formatCurrency(order.shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-teal-600">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-4 flex items-center gap-3 bg-gray-50 rounded-lg p-4">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-medium text-gray-900">{order.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h2>

          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/help"
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">Chat Support</span>
            </Link>
            <Link
              to="/help/orders"
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Package className="w-6 h-6 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">Order Help</span>
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/profile?tab=orders"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Orders
          </Link>
          <Link
            to="/marketplace"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors font-medium"
          >
            <Store className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}