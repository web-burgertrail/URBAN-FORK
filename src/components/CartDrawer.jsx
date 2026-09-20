import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';

export default function CartDrawer() {
  const { isOpen, closeCart, items, total, updateQty, removeItem, clearCart } = useCart();
  const { outletId, table, tableToken, isTableSession, offers } = useRestaurant();

  const [confirmClear, setConfirmClear] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);

  // Ordering & Order Status State
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [liveOrderStatus, setLiveOrderStatus] = useState(null);

  // Check for active order in session
  useEffect(() => {
    const savedOrderId = sessionStorage.getItem('active_customer_order_id');
    const savedOat = sessionStorage.getItem('active_customer_order_oat');
    if (savedOrderId && savedOat) {
      fetchOrderStatus(savedOrderId, savedOat);
    }
  }, []);

  // Poll or fetch order status
  const fetchOrderStatus = async (orderId, oat) => {
    try {
      const { data, error } = await supabase.rpc('get_customer_order_status', {
        p_order_id: orderId,
        p_oat: oat,
      });
      if (!error && data?.success) {
        setLiveOrderStatus(data);
      }
    } catch {
      // Ignore background errors
    }
  };

  // Realtime order subscription
  useEffect(() => {
    if (!placedOrder?.order_id && !liveOrderStatus?.order_id) return;
    const orderId = placedOrder?.order_id || liveOrderStatus?.order_id;
    const oat = placedOrder?.oat || sessionStorage.getItem('active_customer_order_oat');

    const channel = supabase
      .channel(`website_order_tracking_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        () => {
          if (orderId && oat) fetchOrderStatus(orderId, oat);
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      if (orderId && oat) fetchOrderStatus(orderId, oat);
    }, 6000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [placedOrder, liveOrderStatus?.order_id]);

  // Coupon handling
  const handleApplyCoupon = () => {
    setCouponError(null);
    if (!couponCode.trim()) return;

    const matchedOffer = (offers || []).find(
      (o) => o.code.toUpperCase() === couponCode.trim().toUpperCase()
    );

    if (!matchedOffer) {
      setCouponError('Invalid or expired coupon code');
      return;
    }

    if (total < (matchedOffer.min_order_subtotal || 0)) {
      setCouponError(`Minimum subtotal of Rs.${matchedOffer.min_order_subtotal} required for this coupon`);
      return;
    }

    let discount = 0;
    if (matchedOffer.discount_type === 'PERCENTAGE') {
      discount = (total * matchedOffer.discount_value) / 100;
      if (matchedOffer.max_discount_amount) {
        discount = Math.min(discount, matchedOffer.max_discount_amount);
      }
    } else {
      discount = matchedOffer.discount_value;
    }

    setAppliedCoupon({
      code: matchedOffer.code,
      discount: Math.round(discount),
    });
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const netPayable = Math.max(total - discountAmount, 0);

  // Submit Order via Supabase create_customer_order RPC
  const handlePlaceOrder = async () => {
    if (!outletId) {
      setOrderError('Restaurant outlet configuration not loaded. Please try again.');
      return;
    }

    if (items.length === 0) {
      setOrderError('Your cart is empty.');
      return;
    }

    if (customerPhone && !/^[0-9]{10}$/.test(customerPhone.trim().replace(/[^0-9]/g, ''))) {
      setOrderError('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    // CRITICAL: Take an immutable snapshot of the current cart items RIGHT NOW,
    // before any async call or state mutation. This prevents stale React state
    // or stale localStorage items from being submitted if state updates mid-flight.
    // NOTE: item.modifiers is the menu catalog available add-on list, NOT customer-selected
    // modifiers. Modifiers must only be submitted if explicitly selected by the user.
    const cartSnapshot = items.map((item) => ({
      menu_item_id: item.id,
      variant_id: item.variant_id || undefined,
      modifiers: Array.isArray(item.selectedModifiers) && item.selectedModifiers.length > 0
        ? item.selectedModifiers.map((m) => ({ modifier_id: m.id || m.modifier_id }))
        : [],
      quantity: item.quantity,
      notes: item.notes || undefined,
    }));

    if (cartSnapshot.length === 0) {
      setOrderError('Your cart is empty.');
      return;
    }

    // Validate snapshot: every item must have a menu_item_id and quantity >= 1
    for (const si of cartSnapshot) {
      if (!si.menu_item_id) {
        setOrderError('Cart contains an invalid item. Please clear the cart and try again.');
        return;
      }
      if (!si.quantity || si.quantity < 1) {
        setOrderError('Cart contains an item with invalid quantity. Please review your cart.');
        return;
      }
    }

    try {
      setIsPlacingOrder(true);
      setOrderError(null);

      // Clear localStorage immediately and synchronously BEFORE calling the RPC.
      // This prevents stale cart data from leaking into a subsequent order if the
      // browser crashes or reloads between the RPC call and the React state update.
      try { localStorage.removeItem('bt_cart'); } catch { /* ignore */ }

      const orderPayload = {
        outlet_id: outletId,
        order_source: isTableSession ? 'TABLE_QR' : 'TAKEAWAY',
        table_token: tableToken || undefined,
        customer_phone: customerPhone ? customerPhone.trim().replace(/[^0-9]/g, '') : undefined,
        customer_name: customerName.trim() || undefined,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
        // Use the immutable snapshot — never use live React state here
        items: cartSnapshot,
      };

      const { data, error } = await supabase.rpc('create_customer_order', {
        p_payload: orderPayload,
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Failed to place order');

      // Save order context in sessionStorage
      sessionStorage.setItem('active_customer_order_id', data.order_id);
      sessionStorage.setItem('active_customer_order_oat', data.oat);

      // Clear React cart state (localStorage already cleared above)
      clearCart();
      setPlacedOrder(data);
    } catch (err) {
      // On failure, restore localStorage so user can retry with the same cart
      try { localStorage.setItem('bt_cart', JSON.stringify(items)); } catch { /* ignore */ }
      setOrderError(err.message || 'Failed to submit order to restaurant.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] flex flex-col"
            style={{ background: '#162416', borderLeft: '1px solid rgba(244,160,23,0.2)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-cream/10">
              <div>
                <h2 className="font-heading font-bold text-cream text-lg">Your Order</h2>
                {isTableSession ? (
                  <p className="text-amber-primary font-bold text-xs font-body">
                    Dining at Table {table.table_number} ({table.section_name})
                  </p>
                ) : (
                  <p className="text-cream/50 text-xs font-body">Takeaway / Pickup</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && !confirmClear && !placedOrder && (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="text-red-400/60 hover:text-red-400 text-xs font-heading transition-colors px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.08)' }}
                  >
                    Clear
                  </button>
                )}
                {confirmClear && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        clearCart();
                        setConfirmClear(false);
                      }}
                      className="text-red-400 text-xs font-heading px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(239,68,68,0.15)' }}
                    >
                      Yes
                    </button>
                    <button onClick={() => setConfirmClear(false)} className="text-cream/40 text-xs font-heading">
                      Cancel
                    </button>
                  </div>
                )}
                <button
                  onClick={closeCart}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-cream/60 hover:text-cream transition-colors"
                  style={{ background: 'rgba(255,245,230,0.07)' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* STATE 1: ACTIVE ORDER PLACED CONFIRMATION */}
              {placedOrder ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center mx-auto text-3xl animate-pulse">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-bold text-cream">Order Received!</h3>
                    <p className="text-amber-primary font-mono text-sm font-bold mt-0.5">
                      #{placedOrder.order_number}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-dark-800/80 border border-amber-primary/20 text-left space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cream/60">Status</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {liveOrderStatus?.order_status || placedOrder.order_status || 'PENDING_VERIFICATION'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cream/60">Destination</span>
                      <span className="text-cream font-medium">
                        {isTableSession ? `Table ${table.table_number}` : 'Takeaway'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cream/60">Net Amount</span>
                      <span className="text-amber-primary font-bold">
                        Rs.{liveOrderStatus?.net_amount || placedOrder.net_amount}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-green-950/60 border border-green-600/30 text-xs text-green-300 text-left leading-relaxed">
                    🔔 <strong>Sent to Restaurant POS:</strong> Our staff will confirm your order shortly. Once approved, items will be dispatched to the kitchen.
                  </div>

                  <button
                    onClick={() => {
                      setPlacedOrder(null);
                      closeCart();
                    }}
                    className="w-full py-3 rounded-xl bg-amber-primary text-dark-900 font-heading font-bold text-sm hover:brightness-110 transition"
                  >
                    Back to Menu
                  </button>
                </div>
              ) : items.length === 0 ? (
                /* STATE 2: EMPTY CART */
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-cream/5 flex items-center justify-center text-3xl mb-3">
                    🍽️
                  </div>
                  <p className="font-heading font-bold text-cream mb-1">Your cart is empty</p>
                  <p className="text-cream/40 text-xs font-body mb-6">Add freshly made dishes to begin your order!</p>
                  <Link
                    to="/menu"
                    onClick={closeCart}
                    className="text-dark-900 px-6 py-2.5 rounded-full font-heading font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg,#f7b84b,#f4a017)' }}
                  >
                    Browse Menu
                  </Link>
                </div>
              ) : (
                /* STATE 3: CART ITEMS & CHECKOUT FORM */
                <>
                  <div className="space-y-2.5">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-3 rounded-xl bg-amber-primary/5 border border-amber-primary/10"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-bold text-cream text-sm truncate">{item.name}</p>
                          <p className="font-body text-xs text-amber-primary">Rs.{item.price} each</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => updateQty(item.id, item.quantity - 1)}
                                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-cream bg-amber-primary/20 hover:bg-amber-primary/30"
                              >
                                -
                              </button>
                              <span className="text-cream font-bold text-sm w-5 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQty(item.id, item.quantity + 1)}
                                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-dark-900 bg-amber-primary"
                              >
                                +
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-bold text-sm text-amber-primary">
                                Rs.{item.price * item.quantity}
                              </span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-cream/30 hover:text-red-400 transition"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Information Form */}
                  <div className="pt-2 border-t border-cream/10 space-y-2.5">
                    <p className="text-[11px] font-bold text-cream/70 uppercase tracking-wider">Customer Details</p>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Mobile Phone (10 digits)"
                      maxLength={10}
                      className="w-full px-3.5 py-2 rounded-xl bg-dark-900/80 border border-cream/10 text-xs text-cream placeholder-cream/30 focus:outline-none focus:border-amber-primary font-mono"
                    />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your Name (Optional)"
                      className="w-full px-3.5 py-2 rounded-xl bg-dark-900/80 border border-cream/10 text-xs text-cream placeholder-cream/30 focus:outline-none focus:border-amber-primary font-body"
                    />

                    {/* Coupon Code Input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Coupon Code"
                        className="flex-1 px-3 py-1.5 rounded-xl bg-dark-900/80 border border-cream/10 text-xs text-cream placeholder-cream/30 focus:outline-none focus:border-amber-primary font-mono uppercase"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-primary/20 hover:bg-amber-primary/30 text-amber-primary text-xs font-bold transition"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-[10px] text-rose-400 font-medium">{couponError}</p>}
                    {appliedCoupon && (
                      <p className="text-[10px] text-green-400 font-bold">
                        ✓ Coupon {appliedCoupon.code} applied (-Rs.{appliedCoupon.discount})
                      </p>
                    )}
                  </div>

                  {orderError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-medium">
                      ⚠️ {orderError}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer / Place Order Action */}
            {items.length > 0 && !placedOrder && (
              <div className="px-5 py-4 border-t border-cream/10 space-y-3 bg-dark-900/90">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-cream/60 font-body">
                    <span>Subtotal</span>
                    <span>Rs.{total}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-400 font-body font-bold">
                      <span>Discount</span>
                      <span>-Rs.{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-cream font-heading font-bold text-base pt-1 border-t border-cream/5">
                    <span>Net Payable</span>
                    <span className="text-amber-primary">Rs.{netPayable}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full py-3.5 rounded-2xl font-heading font-bold text-sm text-dark-900 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#f7b84b,#f4a017)' }}
                >
                  {isPlacingOrder ? (
                    <span>Sending Order to Kitchen...</span>
                  ) : (
                    <span>Confirm & Place Order (Send to Staff)</span>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
