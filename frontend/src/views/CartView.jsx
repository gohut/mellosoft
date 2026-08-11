"use client";

import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import QuantityStepper from "../components/QuantityStepper";
import EmptyState from "../components/EmptyState";
import { formatPrice } from "../utils/currency";

export default function CartView() {
  const { cart, updateQty, removeFromCart, clearCart, navigateTo, placeOrder, products, currentCustomerId } = useStore();
  const [checkoutStep, setCheckoutStep] = useState("cart"); // "cart" | "success"
  const [orderNumber, setOrderNumber] = useState("");

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const delivery = subtotal > 150 ? 0 : 30.0;
  const total = subtotal + delivery;

  const handleCheckout = () => {
    // Generate a random order number
    const rand = Math.floor(100000 + Math.random() * 900000);
    const newOrderId = `MS-${rand}`;
    setOrderNumber(newOrderId);

    // Build relational order item array
    const orderItems = cart.map((item) => {
      const prod = (products || []).find((p) => p.id === item.id);
      return {
        productId: item.id,
        name: item.name || prod?.name || "Product",
        variantSize: item.size || "Queen",
        variantFirmness: item.firmness || "Medium",
        variantSKU: item.sku || `MEL-${(item.size || "QUEEN").toUpperCase().slice(0, 3)}-${(item.firmness || "MEDIUM").toUpperCase().slice(0, 3)}`,
        quantity: item.qty,
        price: item.price,
        actualPrice: item.price,
        discountPercent: prod?.discountPercent || 10,
        image: item.image || prod?.images?.[0] || "/asset/img1.jpg",
      };
    });

    const newOrder = {
      id: newOrderId,
      customerId: currentCustomerId || "C001",
      items: orderItems,
      totalAmount: total,
      subtotal: subtotal,
      delivery: delivery,
      paymentStatus: "Paid",
      orderStatus: "Processing",
      createdAt: new Date().toISOString().split("T")[0],
      shippingAddress: {
        name: "Rahul Sharma",
        street: "123 Green Park Extension",
        city: "New Delhi",
        state: "Delhi",
        zip: "110016",
        phone: "+91 98765 43210"
      },
      paymentMethod: "Credit Card (Visa ending in 4242)"
    };

    placeOrder(newOrder);
    setCheckoutStep("success");
    clearCart();
  };

  // Sleep Tip of the Day for checkout success screen
  const sleepTips = [
    "Keep your bedroom cool (around 65°F / 18°C) for the deepest, most restorative sleep cycle.",
    "Try to maintain a consistent sleep schedule, even on weekends, to regulate your circadian rhythm.",
    "Avoid screens and bright blue lights at least 45 minutes before climbing into your Mellosoft bed.",
    "Engaging in light stretching or deep breathing exercises before bed signals your body it is time to sleep."
  ];
  const [randomTip] = useState(() => sleepTips[Math.floor(Math.random() * sleepTips.length)]);

  if (checkoutStep === "success") {
    return (
      <div style={successContainerStyle}>
        <div style={successCardStyle} className="hover-lift">
          <div style={successIconWrapperStyle}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={successTitleStyle}>Your Order is Placed!</h2>
          <p style={successOrderStyle}>Order ID: <strong>{orderNumber}</strong></p>
          <p style={successDescStyle}>
            Thank you for choosing Mellosoft. We have sent a confirmation email to your address. Your sleep products will arrive in 2-5 business days.
          </p>

          <div style={tipBoxStyle}>
            <h5 style={tipTitleStyle}>💡 Sleep Tip of the Day</h5>
            <p style={tipTextStyle}>{randomTip}</p>
          </div>

          <button onClick={() => navigateTo("home")} style={successHomeBtnStyle} className="hover-lift">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={emptyWrapperStyle}>
        <EmptyState
          iconType="cart"
          title="Your shopping cart is empty"
          message="It looks like you haven't added any sleep products to your cart yet. Explore our mattresses, pillows, and bedding accessories to start."
          actionLabel="Explore Collections"
          onAction={() => navigateTo("catalog")}
        />
      </div>
    );
  }

  return (
    <div style={containerStyle} className="cart-container">
      <style>{`
        @media (max-width: 768px) {
          .cart-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .cart-summary-col {
            position: static !important;
            top: auto !important;
          }
        }
        @media (max-width: 640px) {
          .cart-container {
            padding: 32px 12px 60px 12px !important;
          }
        }
      `}</style>
      <h2 style={pageTitleStyle}>Your Cart</h2>

      <div style={layoutGridStyle} className="cart-layout-grid">
        {/* Left: Line Items List */}
        <div style={itemsListColStyle}>
          {cart.map((item) => (
            <div key={item.cartItemId} style={itemCardStyle}>
              {/* Product Image */}
              <div style={itemImageWrapperStyle}>
                <img src={item.image} alt={item.name} style={itemImageStyle} />
              </div>

              {/* Item Info */}
              <div style={itemInfoStyle}>
                <div style={itemHeaderRowStyle}>
                  <h4 style={itemNameStyle}>{item.name}</h4>
                  <button 
                    onClick={() => removeFromCart(item.cartItemId)}
                    style={removeBtnStyle}
                    aria-label="Remove item"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B75" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
                
                <p style={itemMetaStyle}>
                  Firmness: <strong>{item.firmness}</strong> • Size: <strong>{item.size}</strong>
                </p>

                <div style={itemFooterRowStyle}>
                  <QuantityStepper 
                    qty={item.qty} 
                    onChange={(newQty) => updateQty(item.cartItemId, newQty)} 
                  />
                  <div style={itemPriceBlockStyle}>
                    <span style={itemSinglePriceStyle}>{formatPrice(item.price)} each</span>
                    <span style={itemTotalPriceStyle}>{formatPrice(item.price * item.qty)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary Panel */}
        <div style={summaryColStyle} className="cart-summary-col">
          <div style={summaryCardStyle}>
            <h3 style={summaryHeaderStyle}>Order Summary</h3>

            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Subtotal</span>
              <span style={summaryValueStyle}>{formatPrice(subtotal)}</span>
            </div>

            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Delivery</span>
              <span style={summaryValueStyle}>
                {delivery === 0 ? <span style={{ color: "#16A34A" }}>Free</span> : formatPrice(delivery)}
              </span>
            </div>

            <div style={dividerStyle} />

            <div style={{ ...summaryRowStyle, marginBottom: "24px" }}>
              <span style={totalLabelStyle}>Total</span>
              <span style={totalValueStyle}>{formatPrice(total)}</span>
            </div>

            <button 
              onClick={handleCheckout} 
              style={checkoutBtnStyle}
              className="hover-lift"
            >
              Proceed to Checkout
            </button>

            <p style={guaranteeTextStyle}>
              🔒 Secure checkout. 100-Night risk-free trial is automatically applied to all mattress items.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styling Object Configurations
const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "20px 16px 80px 16px",
  width: "100%"
};

const pageTitleStyle = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#1B1F8C",
  marginBottom: "16px"
};

const layoutGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.7fr 1fr",
  gap: "24px",
  alignItems: "flex-start"
};

const itemsListColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

// Item Card
const itemCardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: 0,
  boxShadow: "none",
  border: "1px solid #E7E7E2",
  padding: 0,
  display: "flex",
  gap: 0,
};

const itemImageWrapperStyle = {
  width: "140px",
  alignSelf: "stretch",
  borderRadius: 0,
  overflow: "hidden",
  backgroundColor: "#F3F3F0",
  flexShrink: 0
};

const itemImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
  transform: "scale(1.35)"
};

const itemInfoStyle = {
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  padding: "16px 20px"
};

const itemHeaderRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "6px"
};

const itemNameStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#1B1F8C"
};

const removeBtnStyle = {
  border: "none",
  background: "none",
  cursor: "pointer",
  padding: "4px",
  color: "#6B6B75",
  borderRadius: "50%",
  transition: "all 0.2s ease"
};

const itemMetaStyle = {
  fontSize: "13px",
  color: "#6B6B75",
  marginBottom: "16px"
};

const itemFooterRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "auto"
};

const itemPriceBlockStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end"
};

const itemSinglePriceStyle = {
  fontSize: "11px",
  color: "#6B6B75"
};

const itemTotalPriceStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#1B1F8C"
};

// Summary Column
const summaryColStyle = {
  position: "sticky",
  top: "100px"
};

const summaryCardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: 0,
  padding: "30px 24px",
};

const summaryHeaderStyle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#1B1F8C",
  marginBottom: "24px",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
  fontSize: "15px"
};

const summaryLabelStyle = {
  color: "#6B6B75"
};

const summaryValueStyle = {
  fontWeight: "600",
  color: "#14151A"
};

const dividerStyle = {
  height: "1px",
  backgroundColor: "#E7E7E2",
  margin: "16px 0"
};

const totalLabelStyle = {
  fontWeight: "700",
  fontSize: "16px",
  color: "#1B1F8C"
};

const totalValueStyle = {
  fontWeight: "800",
  fontSize: "22px",
  color: "#1B1F8C"
};

const checkoutBtnStyle = {
  width: "100%",
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "24px",
  padding: "14px 20px",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const guaranteeTextStyle = {
  fontSize: "11px",
  color: "#6B6B75",
  textAlign: "center",
  lineHeight: "1.4",
  marginTop: "16px"
};

const emptyWrapperStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "80px 0"
};

// Checkout Success Styles
const successContainerStyle = {
  maxWidth: "600px",
  margin: "60px auto 100px auto",
  padding: "0 24px"
};

const successCardStyle = {
  backgroundColor: "#FFFFFF",
  padding: "48px 36px",
  textAlign: "center"
};

const successIconWrapperStyle = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  backgroundColor: "#16A34A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 24px auto"
};

const successTitleStyle = {
  fontSize: "26px",
  fontWeight: "800",
  color: "#1B1F8C",
  marginBottom: "8px"
};

const successOrderStyle = {
  fontSize: "14px",
  color: "#6B6B75",
  marginBottom: "16px",
  backgroundColor: "#F7F7F2",
  padding: "6px 12px",
  borderRadius: "8px",
  display: "inline-block"
};

const successDescStyle = {
  fontSize: "15px",
  color: "#6B6B75",
  lineHeight: "1.6",
  marginBottom: "28px"
};

const tipBoxStyle = {
  backgroundColor: "#F7F7F2",
  borderRadius: 0,
  padding: "20px",
  textAlign: "left",
  marginBottom: "32px"
};

const tipTitleStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#1B1F8C",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const tipTextStyle = {
  fontSize: "13px",
  color: "#6B6B75",
  lineHeight: "1.5"
};

const successHomeBtnStyle = {
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "24px",
  padding: "14px 28px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease"
};