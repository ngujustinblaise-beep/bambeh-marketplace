// @ts-nocheck
/**
 * ---------------------------------------------------------------------------
 * CHECKOUT ADVANCED - PAYMENT GATEWAY INTEGRATION EXAMPLE
 * ---------------------------------------------------------------------------
 * 
 * This page demonstrates how to integrate the Payment Gateway
 * for processing MTN Mobile Money and Orange Money payments.
 * 
 * FEATURES:
 * ? MTN Mobile Money integration
 * ? Orange Money integration
 * ? Secure payment processing
 * ? Transaction receipts
 * ? Order confirmation
 * 
 * ? 2025 Bambeh. All rights reserved.
 * ---------------------------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentGatewayADVANCED from '@/advanced-features/payment-gateway/PaymentGateway-ADVANCED';
import { useLang, t } from "@/hooks/useAppLang";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CheckoutData {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
}

export default function CheckoutAdvanced() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const location = useLocation();

  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      setIsLoading(true);

      // In production, get cart items from your state management or API
      // const cartItems = await fetchCartItems();

      // For demo purposes, using mock data
      const mockItems: CartItem[] = [
        {
          id: '1',
          name: 'Samsung Galaxy A54',
          price: 250000,
          quantity: 1,
          image: '/images/phone.jpg'
        },
        {
          id: '2',
          name: 'Wireless Headphones',
          price: 45000,
          quantity: 2,
          image: '/images/headphones.jpg'
        }
      ];

      const subtotal = mockItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const deliveryFee = 2000; // Fixed delivery fee

      const mockCheckoutData: CheckoutData = {
        items: mockItems,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: subtotal + deliveryFee,
        deliveryAddress: ''
      };

      setCheckoutData(mockCheckoutData);

      // Generate order ID
      const newOrderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setOrderId(newOrderId);
    } catch (error) {
      console.error('Error loading checkout data:', error);
      alert('Error loading checkout data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (transaction: any) => {
    console.log('? Payment successful:', transaction);

    try {
      // 1. Create order in your backend
      // await createOrder({
      //   orderId: orderId,
      //   items: checkoutData?.items,
      //   total: checkoutData?.total,
      //   paymentId: transaction.id,
      //   transactionId: transaction.transactionId
      // });

      // 2. Clear cart
      // await clearCart();

      // 3. Show success message
      alert(`?? Payment Successful!\n\nOrder ID: ${orderId}\nTransaction ID: ${transaction.transactionId}\n\nYour order has been confirmed and will be delivered soon!`);

      // 4. Navigate to order tracking page
      navigate(`/track-order/${orderId}`, { state: { fromCheckout: true, transaction } });
    } catch (error) {
      console.error('Error processing successful payment:', error);
      alert('Payment was successful, but there was an error creating your order. Please contact support.');
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('? Payment failed:', error);

    // Show error message to user
    alert(`Payment Failed\n\n${error.message || 'An error occurred during payment processing. Please try again.'}`);

    // Optional: Log error to analytics
    // logPaymentError(error);
  }; // ? FIXED: was missing this closing brace (caused parse error on import)

  const handlePaymentCancel = () => {
    console.log('Payment cancelled by user');
    
    // Optional: Show cancellation message
    const shouldGoBack = window.confirm('Are you sure you want to cancel the payment and go back to cart?');
    
    if (shouldGoBack) {
      navigate('/cart');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-4"/>
          <p className="text-teal-600 font-semibold">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">??</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cart is Empty</h2>
          <p className="text-gray-600 mb-6">
            Add items to your cart before proceeding to checkout.
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 font-semibold transition-all"
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-teal-600 hover:text-teal-700 font-semibold mb-4 transition-colors"
          >
            <span className="text-2xl mr-2">?</span>
            Back to Cart
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase securely</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Summary - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {checkoutData.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Product';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                      <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                      <p className="font-semibold text-teal-600 text-sm">
                        {(item.price * item.quantity).toLocaleString()} XAF
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>{checkoutData.subtotal.toLocaleString()} XAF</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee:</span>
                  <span>{checkoutData.deliveryFee.toLocaleString()} XAF</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span className="text-teal-600">
                      {checkoutData.total.toLocaleString()} XAF
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-teal-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="mr-2">??</span>
                  Delivery Address
                </h3>
                <p className="text-gray-700 text-sm">{checkoutData.deliveryAddress}</p>
              </div>
            </div>
          </div>

          {/* Payment Gateway - Right Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>

              {/* Advanced Payment Gateway Component */}
              <PaymentGatewayADVANCED
                amount={checkoutData.total}
                currency="XAF"
                orderId={orderId}
                description={`Bambeh Order #${orderId} - ${checkoutData.items.length} item(s)`}
                userId={localStorage.getItem('Bambeh_user_id') || 'GUEST'}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="mr-2">??</span>
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">?</span>
                  <span>Verified</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">????</span>
                  <span></span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 rounded-2xl shadow-lg p-6 mt-6">
              <h3 className="font-bold text-blue-900 mb-3">Need Help?</h3>
              <p className="text-blue-800 text-sm mb-3">
                If you're having trouble with payment, please contact our support team.
              </p>
              <button
                onClick={() => navigate('/help/contact-support')}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                Contact Support ?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





