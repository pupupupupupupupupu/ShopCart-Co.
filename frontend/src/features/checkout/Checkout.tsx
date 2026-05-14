import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useCart from "../../hooks/useCart";
import { useToast } from "../../context/ToastContext";
import { Skeleton } from "../../components/common/Skeleton";

/* ─── Types ─────────────────────────────────────────── */
type CartItem  = { productId: { _id: string; name: string; price: number; images: string[] }; qty: number };
type Address   = { _id: string; label: string; street: string; city: string; state: string; zip: string; country: string; isDefault: boolean };
type Gateway   = "stripe" | "razorpay";

interface Breakdown {
  subtotal: number; couponDiscount: number;
  tax: number; shipping: number; totalAmount: number;
}

/* ─── Stripe dynamic import helper ──────────────────── */
const loadStripeJs = (): Promise<any> =>
  new Promise((resolve, reject) => {
    if ((window as any).Stripe) { resolve((window as any).Stripe); return; }
    const s = document.createElement("script");
    s.src = "https://js.stripe.com/v3/";
    s.onload = () => resolve((window as any).Stripe);
    s.onerror = reject;
    document.head.appendChild(s);
  });

/* ─── Razorpay dynamic import helper ────────────────── */
const loadRazorpayJs = (): Promise<any> =>
  new Promise((resolve, reject) => {
    if ((window as any).Razorpay) { resolve((window as any).Razorpay); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve((window as any).Razorpay);
    s.onerror = reject;
    document.head.appendChild(s);
  });

/* ─── Helper components ──────────────────────────────── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "14px",
  }}>{children}</p>
);

const GatewayCard = ({ selected, onClick, icon, title, subtitle }: {
  selected: boolean; onClick: () => void; icon: string; title: string; subtitle: string;
}) => (
  <button onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: "14px",
    padding: "14px 18px", borderRadius: "var(--radius-lg)",
    border: `2px solid ${selected ? "var(--brand-500)" : "var(--border)"}`,
    background: selected ? "var(--brand-50)" : "var(--surface)",
    cursor: "pointer", width: "100%", textAlign: "left",
    transition: "all var(--transition-base)",
  }}>
    <span style={{ fontSize: "24px" }}>{icon}</span>
    <div>
      <p style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)", marginBottom: "2px" }}>{title}</p>
      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{subtitle}</p>
    </div>
    <span style={{
      marginLeft: "auto", width: "18px", height: "18px", borderRadius: "50%",
      border: `2px solid ${selected ? "var(--brand-500)" : "var(--border-strong)"}`,
      background: selected ? "var(--brand-500)" : "transparent",
      flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {selected && <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#fff" }} />}
    </span>
  </button>
);

/* ═══════════════════════════════════════════════════════
   CHECKOUT PAGE
═══════════════════════════════════════════════════════ */
const Checkout = () => {
  const axiosAuth = useAxiosPrivate();
  const navigate  = useNavigate();
  const { refreshCart } = useCart();
  const { toast } = useToast();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [gateway, setGateway] = useState<Gateway>("stripe");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  /* ── Stripe card element state ── */
  const [stripeInstance, setStripeInstance] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const [stripeReady, setStripeReady] = useState(false);

  /* ── Load cart + addresses ── */
  useEffect(() => {
    (async () => {
      try {
        const [cartRes, addrRes] = await Promise.all([
          axiosAuth.get("/cart"),
          axiosAuth.get("/users/me/addresses"),
        ]);
        setCartItems(cartRes.data.items || []);
        setAddresses(addrRes.data || []);
        const def = addrRes.data?.find((a: Address) => a.isDefault);
        if (def) setSelectedAddressId(def._id);

        // Compute local breakdown while we don't have server totals yet
        const subtotal = (cartRes.data.items || []).reduce(
          (s: number, i: CartItem) => s + i.qty * i.productId.price, 0
        );
        const tax = Math.round(subtotal * 0.08 * 100) / 100;
        const shipping = subtotal >= 75 ? 0 : 5.99;
        setBreakdown({ subtotal, couponDiscount: 0, tax, shipping, totalAmount: subtotal + tax + shipping });
      } catch {
        toast("Failed to load checkout data", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Mount Stripe card when gateway = stripe ── */
  useEffect(() => {
    if (gateway !== "stripe") return;
    let mounted = true;

    (async () => {
      try {
        const StripeClass = await loadStripeJs();
        if (!mounted) return;
        const stripe = StripeClass(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");
        setStripeInstance(stripe);
        const elements = stripe.elements();
        const card = elements.create("card", {
          style: {
            base: {
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "15px",
              color: "#111214",
              "::placeholder": { color: "#9ca3af" },
            },
          },
        });
        card.mount("#stripe-card-element");
        card.on("ready", () => mounted && setStripeReady(true));
        setCardElement(card);
      } catch {
        toast("Failed to load Stripe. Please refresh.", "error");
      }
    })();

    return () => { mounted = false; };
  }, [gateway]);

  /* ── Coupon validation ── */
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await axiosAuth.get(
        `/payments/validate-coupon?code=${couponCode.trim()}&cartTotal=${breakdown?.subtotal ?? 0}`
      );
      const { discount } = res.data;
      setCouponApplied({ code: couponCode.trim().toUpperCase(), discount });
      toast(`Coupon applied! -$${discount.toFixed(2)}`, "success");

      // Recalc breakdown
      if (breakdown) {
        const discounted = breakdown.subtotal - discount;
        const tax = Math.round(discounted * 0.08 * 100) / 100;
        const shipping = discounted >= 75 ? 0 : 5.99;
        setBreakdown({ ...breakdown, couponDiscount: discount, tax, shipping, totalAmount: discounted + tax + shipping });
      }
    } catch (err: any) {
      toast(err.response?.data?.message || "Invalid coupon", "error");
    } finally {
      setValidatingCoupon(false);
    }
  };

  /* ── Payment handlers ── */
  const handleStripePayment = async () => {
    if (!stripeInstance || !cardElement) return;
    setPaying(true);
    try {
      // Create intent + pending order on backend
      const { data } = await axiosAuth.post("/payments/stripe/create-intent", {
        couponCode: couponApplied?.code || undefined,
        shippingAddressId: selectedAddressId || undefined,
      });

      setBreakdown(data.breakdown);

      // Confirm card payment
      const { error, paymentIntent } = await stripeInstance.confirmCardPayment(
        data.clientSecret,
        { payment_method: { card: cardElement } }
      );

      if (error) {
        toast(error.message || "Payment failed", "error");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        await refreshCart();
        toast("Payment successful! Your order is confirmed.", "success");
        navigate(`/orders`);
      }
    } catch (err: any) {
      toast(err.response?.data?.message || "Payment failed. Please try again.", "error");
    } finally {
      setPaying(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setPaying(true);
    try {
      const RazorpayClass = await loadRazorpayJs();

      const { data } = await axiosAuth.post("/payments/razorpay/create-order", {
        couponCode: couponApplied?.code || undefined,
        shippingAddressId: selectedAddressId || undefined,
      });

      setBreakdown(data.breakdown);

      const options = {
        key:        data.keyId,
        amount:     data.amount,
        currency:   data.currency,
        name:       "ShopCart Co.",
        description:"Order Payment",
        order_id:   data.rzpOrderId,
        handler: async (response: any) => {
          try {
            await axiosAuth.post("/payments/razorpay/verify", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderId:             data.orderId,
            });
            await refreshCart();
            toast("Payment successful! Your order is confirmed.", "success");
            navigate("/orders");
          } catch {
            toast("Payment verification failed. Contact support.", "error");
          }
        },
        prefill: { name: "", email: "", contact: "" },
        theme: { color: "#162231" },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast("Payment cancelled", "info");
          },
        },
      };

      const rzp = new RazorpayClass(options);
      rzp.open();
    } catch (err: any) {
      toast(err.response?.data?.message || "Could not initiate Razorpay payment", "error");
      setPaying(false);
    }
  };

  const handlePay = () => {
    if (cartItems.length === 0) { toast("Your cart is empty", "warning"); return; }
    if (gateway === "stripe") handleStripePayment();
    else handleRazorpayPayment();
  };

  /* ─── Loading state ─── */
  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Skeleton height="220px" radius="var(--radius-xl)" />
        <Skeleton height="160px" radius="var(--radius-xl)" />
        <Skeleton height="180px" radius="var(--radius-xl)" />
      </div>
      <Skeleton height="400px" radius="var(--radius-xl)" />
    </div>
  );

  const fmtCurrency = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div>
      <h1 style={{ marginBottom: "6px" }}>Checkout</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "32px" }}>
        {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px", alignItems: "start" }}>

        {/* ── LEFT: form panels ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* 1. Shipping address */}
          <div className="card" style={{ padding: "24px" }}>
            <SectionLabel>Shipping Address</SectionLabel>
            {addresses.length === 0 ? (
              <div style={{ padding: "24px", background: "var(--gray-50)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", marginBottom: 12, fontSize: 14 }}>No saved addresses.</p>
                <button
                  className="btn-outline"
                  style={{ fontSize: 13 }}
                  onClick={() => navigate("/profile")}
                >Add address in Profile →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {addresses.map((a) => (
                  <label key={a._id} style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "14px 16px", borderRadius: "var(--radius-lg)",
                    border: `2px solid ${selectedAddressId === a._id ? "var(--brand-500)" : "var(--border)"}`,
                    background: selectedAddressId === a._id ? "var(--brand-50)" : "var(--surface)",
                    cursor: "pointer", transition: "all var(--transition-base)",
                  }}>
                    <input
                      type="radio" name="address" value={a._id}
                      checked={selectedAddressId === a._id}
                      onChange={() => setSelectedAddressId(a._id)}
                      style={{ marginTop: 3 }}
                    />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{a.label}</p>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        {a.street}, {a.city}, {a.state} {a.zip}, {a.country}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 2. Coupon */}
          <div className="card" style={{ padding: "24px" }}>
            <SectionLabel>Discount Code</SectionLabel>
            {couponApplied ? (
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", background: "var(--success-light)",
                border: "1.5px solid var(--success)", borderRadius: "var(--radius-md)",
              }}>
                <span style={{ color: "var(--success)", fontWeight: 700 }}>✓</span>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{couponApplied.code}</span>
                <span style={{ color: "var(--success)", fontWeight: 700 }}>-{fmtCurrency(couponApplied.discount)}</span>
                <button
                  onClick={() => {
                    setCouponApplied(null);
                    setCouponCode("");
                    // reset breakdown
                    const subtotal = cartItems.reduce((s, i) => s + i.qty * i.productId.price, 0);
                    const tax = Math.round(subtotal * 0.08 * 100) / 100;
                    const shipping = subtotal >= 75 ? 0 : 5.99;
                    setBreakdown({ subtotal, couponDiscount: 0, tax, shipping, totalAmount: subtotal + tax + shipping });
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)", fontWeight: 700 }}>✕</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  placeholder="Enter coupon code"
                  style={{
                    flex: 1, padding: "10px 14px",
                    border: "1.5px solid var(--border-strong)", borderRadius: "var(--radius-md)",
                    fontFamily: "var(--font-body)", fontSize: 14, outline: "none",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                  }}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="btn-outline"
                  style={{ whiteSpace: "nowrap", opacity: !couponCode.trim() ? 0.5 : 1 }}
                >
                  {validatingCoupon ? "Checking…" : "Apply"}
                </button>
              </div>
            )}
          </div>

          {/* 3. Payment method */}
          <div className="card" style={{ padding: "24px" }}>
            <SectionLabel>Payment Method</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              <GatewayCard
                selected={gateway === "stripe"}
                onClick={() => setGateway("stripe")}
                icon="💳"
                title="Credit / Debit Card"
                subtitle="Powered by Stripe — Visa, Mastercard, Amex"
              />
              <GatewayCard
                selected={gateway === "razorpay"}
                onClick={() => setGateway("razorpay")}
                icon="🟦"
                title="UPI, Net Banking, Wallets"
                subtitle="Powered by Razorpay — all Indian payment methods"
              />
            </div>

            {/* Stripe card element */}
            <div style={{ display: gateway === "stripe" ? "block" : "none" }}>
              <div
                id="stripe-card-element"
                style={{
                  padding: "12px 14px",
                  border: "1.5px solid var(--border-strong)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface)",
                  minHeight: "44px",
                }}
              />
              {!stripeReady && gateway === "stripe" && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Loading secure payment form…</p>
              )}
            </div>

            {gateway === "razorpay" && (
              <div style={{
                padding: "14px 16px",
                background: "var(--brand-50)",
                borderRadius: "var(--radius-md)",
                fontSize: 13, color: "var(--text-secondary)",
              }}>
                🔒 You'll be redirected to Razorpay's secure checkout to complete your payment.
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: order summary ── */}
        <div style={{ position: "sticky", top: "calc(var(--navbar-height) + 24px)" }}>
          <div className="card" style={{ padding: "24px" }}>
            <SectionLabel>Order Summary</SectionLabel>

            {/* Items */}
            <div style={{ marginBottom: 20 }}>
              {cartItems.map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, alignItems: "center",
                  padding: "10px 0",
                  borderBottom: i < cartItems.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "var(--radius-sm)",
                    background: "var(--gray-100)", overflow: "hidden", flexShrink: 0,
                  }}>
                    {item.productId.images?.[0] && (
                      <img src={item.productId.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.4,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.productId.name}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>×{item.qty}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                    {fmtCurrency(item.qty * item.productId.price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            {breakdown && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {[
                  { label: "Subtotal", value: breakdown.subtotal },
                  { label: "Discount", value: -breakdown.couponDiscount, hide: !breakdown.couponDiscount, accent: "var(--success)" },
                  { label: "Tax (8%)", value: breakdown.tax },
                  { label: breakdown.shipping === 0 ? "Shipping (free!)" : "Shipping", value: breakdown.shipping, accent: breakdown.shipping === 0 ? "var(--success)" : undefined },
                ].filter((r) => !r.hide).map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
                    <span style={{ fontWeight: 500, color: row.accent || "var(--text-primary)" }}>
                      {row.value === 0 && row.label.includes("free") ? "FREE" : fmtCurrency(Math.abs(row.value))}
                    </span>
                  </div>
                ))}
                <div style={{ borderTop: "1.5px solid var(--border)", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", color: "var(--brand-800)" }}>
                    {fmtCurrency(breakdown.totalAmount)}
                  </span>
                </div>
                {breakdown.shipping === 0 && breakdown.subtotal < 75 && (
                  <p style={{ fontSize: 11, color: "var(--success)", textAlign: "center" }}>
                    🎉 Free shipping on orders over $75!
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={paying || (gateway === "stripe" && !stripeReady)}
              className="btn-brand"
              style={{
                width: "100%", padding: "14px",
                fontSize: 15, fontWeight: 700,
                opacity: paying || (gateway === "stripe" && !stripeReady) ? 0.7 : 1,
              }}
            >
              {paying ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Processing…
                </span>
              ) : (
                `Pay ${breakdown ? fmtCurrency(breakdown.totalAmount) : ""} via ${gateway === "stripe" ? "Stripe" : "Razorpay"}`
              )}
            </button>

            <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
              🔒 Your payment is encrypted and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
