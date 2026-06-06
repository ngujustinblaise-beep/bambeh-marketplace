/**
 * CART.TSX CHECKOUT SNIPPET
 * FILE LOCATION: src/pages/Cart.tsx
 *
 * Find your existing "Proceed to Checkout" button handler
 * and replace the navigation call with this:
 */

// ─── In your Cart.tsx, find the handleCheckout function ───────────────────────
// Replace whatever navigate('/checkout') or navigate('/checkout-advanced') 
// call you have with this:

const handleCheckout = () => {
  // Gather your cart items (from your state/store/localStorage)
  // const cartItems = ... (your existing cart items array)
  // const subtotal  = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // const userAddress = ... (from user profile or input)

  navigate('/payment/checkout', {
    state: {
      items:           cartItems,
      subtotal:        subtotal,
      deliveryFee:     2000,          // your delivery fee logic
      total:           subtotal + 2000,
      deliveryAddress: userAddress ?? 'Yaoundé, Cameroon',
      context:         'cart',
    }
  });
};

// ─── For ESCROW payments (buying a specific item with escrow protection) ───────
const handleEscrowCheckout = (item: any, sellerUserId: string) => {
  navigate('/payment/checkout', {
    state: {
      total:       item.price,
      description: `Escrow — ${item.name}`,
      context:     'escrow',
      // Pass seller info so EscrowPage can link the transaction
      metadata: {
        item_id:   item.id,
        seller_id: sellerUserId,
      },
    }
  });
};

// ─── For SERVICE bookings ────────────────────────────────────────────────────
const handleServiceBooking = (service: any, fee: number) => {
  navigate('/payment/checkout', {
    state: {
      total:       fee,
      description: `Service: ${service.name}`,
      context:     'service',
    }
  });
};
