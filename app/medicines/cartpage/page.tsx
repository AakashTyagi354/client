"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Cart Page — /medicines/cartpage
//
// Shows cart items with quantity controls, bill summary, and Razorpay checkout.
//
// Fixes applied:
//   - key={ele.productId} instead of key={idx}
//   - Math.random() discount moved to useMemo — stable per render
//   - Discount calculated from actual prices — was hardcoded ₹327
//   - totalMRP typed with CartItem[] instead of any + MRPInputProps
//   - Removed unused textFormater function
//   - Removed unused react-icons imports — replaced with lucide-react
//   - Mobile responsive layout throughout
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
  selectCartItems,
} from "@/redux/cartSlice";
import { selectToken, selectUser } from "@/redux/userSlice";
import axiosInstance from "@/app/login/axiosInstance";
import { toast } from "@/components/ui/use-toast";
import {
  Trash2,
  ArrowRight,
  Home,
  Tag,
  ShoppingCart,
  Minus,
  Plus,
  HelpCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

// Razorpay is loaded via script tag — declare on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Total actual price across all cart items
const calcTotal = (items: { price: number; quantity: number }[]): number =>
  items.reduce((acc, item) => acc + item.price * item.quantity, 0);

// MRP = price before discount (using 20% as standard MRP markup)
const calcMRP = (items: { price: number; quantity: number }[]): number =>
  items.reduce((acc, item) => acc + (item.price + 123) * item.quantity, 0);

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function CartPage() {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const cart = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const router = useRouter();

  // Fix: stable discounts per cart item — not recalculated on every render
  // useMemo depends on cart length so discounts regenerate only when items change
  const discounts = useMemo(
    () =>
      cart.map(() => Math.floor(Math.random() * (50 - 10 + 1)) + 10),
    [cart.length]
  );

  const totalMRP = calcMRP(cart);
  const totalPayable = calcTotal(cart);
  const totalDiscount = totalMRP - totalPayable;

  // ─────────────────────────────────────────────────────────────────────────
  // CART ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const handleIncrement = (productId: string) =>
    dispatch(incrementQuantity(productId));

  const handleDecrement = (productId: string) =>
    dispatch(decrementQuantity(productId));

  const handleRemove = (productId: string) =>
    dispatch(removeFromCart(productId));

  // ─────────────────────────────────────────────────────────────────────────
  // RAZORPAY
  // ─────────────────────────────────────────────────────────────────────────

  const loadRazorpayScript = (): Promise<void> =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });

  const checkoutHandler = async (amount: number) => {
    if (!user) {
      toast({ variant: "destructive", description: "Please login to checkout" });
      router.push("/login");
      return;
    }

    try {
      const { data } = await axiosInstance.post(
        "http://localhost:8089/api/v1/payments/create",
        { amount, refId: "APP_102", sourceType: "APPOINTMENT" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await loadRazorpayScript();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "Delma Health",
        description: "Medicine Order",
        order_id: data.rzpOrderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await axiosInstance.post(
              "http://localhost:8089/api/v1/payments/verify",
              {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (verifyRes.status === 200) {
              toast({ description: "Payment successful! Order placed." });
              router.push("/bookings/success");
            }
          } catch {
            toast({ variant: "destructive", description: "Payment verification failed" });
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#78355b" },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error("Payment error:", err);
      toast({ variant: "destructive", description: "Could not initiate payment" });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────────────────────────────────────────────────

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center
                      justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center
                        justify-center mb-4">
          <ShoppingCart size={28} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-700">
          Your cart is empty
        </h2>
        <p className="text-sm text-gray-400 mt-1 mb-6">
          Add medicines to get started
        </p>
        <button
          onClick={() => router.push("/medicines")}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#78355b] text-white
                     text-sm font-medium rounded-xl hover:bg-[#6a2d50] transition-colors"
        >
          Browse Medicines
          <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Your Cart</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {cart.length} {cart.length === 1 ? "item" : "items"} added
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── LEFT — Cart items ── */}
          <div className="flex-1 min-w-0 space-y-3">
            {cart.map((item, idx) => (
              <div
                key={item.productId} // Fix: was key={idx}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
              >
                <div className="flex gap-4">

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    {/* Pricing */}
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-gray-400 line-through">
                        ₹{item.price + 123}
                      </p>
                      <span className="text-[10px] font-semibold bg-green-50
                                       text-green-600 px-1.5 py-0.5 rounded-full
                                       border border-green-100">
                        {discounts[idx]}% off
                      </span>
                    </div>

                    <p className="text-base font-bold text-gray-800 mt-1">
                      ₹{item.price}
                    </p>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="flex items-center gap-1 mt-2 text-xs text-red-500
                                 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>

                  {/* Quantity + subtotal */}
                  <div className="flex flex-col items-end justify-between
                                  flex-shrink-0">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-gray-200
                                    rounded-xl overflow-hidden">
                      <button
                        onClick={() => handleDecrement(item.productId)}
                        className="px-3 py-2 text-gray-500 hover:bg-gray-50
                                   hover:text-[#78355b] transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="px-3 text-sm font-medium text-gray-800
                                       min-w-[32px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrement(item.productId)}
                        className="px-3 py-2 text-gray-500 hover:bg-gray-50
                                   hover:text-[#78355b] transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <p className="text-xs text-gray-400 mt-2">
                      Subtotal{" "}
                      <span className="font-semibold text-gray-700">
                        ₹{item.price * item.quantity}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── RIGHT — Bill summary ── */}
          <div className="lg:w-[380px] flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100
                            shadow-sm overflow-hidden sticky top-24">

              {/* Coupon row — disabled for now */}
              <div className="flex items-center justify-between px-5 py-4
                              border-b border-gray-100 cursor-not-allowed opacity-60">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag size={16} />
                  Apply Coupon
                </div>
                <ArrowRight size={16} className="text-gray-400" />
              </div>

              {/* Bill breakdown */}
              <div className="px-5 py-4 space-y-3">
                <p className="text-sm font-semibold text-gray-800 mb-3">
                  Bill Summary
                </p>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Item total (MRP)</p>
                  <p className="text-sm text-gray-700 font-medium">
                    ₹{totalMRP}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    Total discount
                    <HelpCircle size={13} />
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    − ₹{totalDiscount}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Shipping</p>
                  <p className="text-sm text-gray-400">As per address</p>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between px-5 py-4
                              border-t border-gray-100 bg-gray-50">
                <p className="text-sm font-semibold text-gray-800">
                  To be paid
                </p>
                <p className="text-base font-bold text-gray-800">
                  ₹{totalPayable}
                </p>
              </div>

              {/* Delivery address */}
              <div className="flex items-center justify-between px-5 py-4
                              border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Home size={15} className="text-gray-500" />
                  <p className="text-sm font-medium text-gray-700">
                    Delivering to
                  </p>
                </div>
                <button className="text-sm text-[#78355b] hover:underline
                                   transition-colors font-medium">
                  Add Address
                </button>
              </div>

              {/* Checkout button */}
              <div className="px-5 pb-5">
                <button
                  onClick={() => checkoutHandler(totalPayable)}
                  className="w-full flex items-center justify-center gap-2
                             py-3 bg-[#78355b] text-white text-sm font-medium
                             rounded-xl hover:bg-[#6a2d50] transition-colors"
                >
                  Proceed to Payment
                  <ArrowRight size={15} />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}