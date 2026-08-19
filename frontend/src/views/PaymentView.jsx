"use client";

import React, { useState, useMemo } from "react";
import { useStore } from "../context/StoreContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { formatPrice } from "../utils/currency";
import { ArrowLeft, CheckCircle2, ShieldCheck, Lock, CreditCard, Smartphone, Building, Banknote } from "lucide-react";

export default function PaymentView() {
  const {
    checkoutItems,
    cart,
    selectedAddress,
    placeOrder,
    navigateTo,
    setSelectedOrderId
  } = useStore();

  const { currentCustomer } = useCustomerAuth();
  const userId = currentCustomer ? currentCustomer.id : "C001";

  // Items for payment summary
  const items = useMemo(() => {
    return checkoutItems && checkoutItems.length > 0 ? checkoutItems : cart;
  }, [checkoutItems, cart]);

  // Active delivery address
  const address = selectedAddress || {
    fullName: "Rahul Sharma",
    phone: "+91 98765 43210",
    addressLine1: "123 Indiranagar 100ft Road",
    addressLine2: "Near Metro Station",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038"
  };

  // Payment Method Selection: "upi" | "card" | "netbanking" | "cod"
  const [paymentMethod, setPaymentMethod] = useState("upi");
  
  // Payment Method Details Form State
  const [upiId, setUpiId] = useState("customer@okaxis");
  const [cardDetails, setCardDetails] = useState({
    number: "4242 •••• •••• 4242",
    name: address.fullName || "Rahul Sharma",
    expiry: "12/28",
    cvv: "•••"
  });
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Price calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const price = item.price || item.discountPrice || item.actualPrice || 0;
      const qty = item.qty || item.quantity || 1;
      return acc + price * qty;
    }, 0);
  }, [items]);

  const rawTotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const actual = item.actualPrice || item.price || 0;
      const qty = item.qty || item.quantity || 1;
      return acc + actual * qty;
    }, 0);
  }, [items]);

  const discountSavings = Math.max(0, rawTotal - subtotal);
  const couponDiscount = Math.round(subtotal * 0.1); // 10% coupon
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const shipping = subtotal >= 5000 || subtotal === 0 ? 0 : 150;
  const finalTotal = subtotal + tax + shipping - couponDiscount;

  const handleCompleteOrder = () => {
    if (paymentMethod === "upi" && !upiId.trim()) {
      setPaymentError("Please enter a valid UPI ID.");
      return;
    }

    setIsProcessing(true);
    setPaymentError("");

    setTimeout(() => {
      // Generate Order ID
      const randNum = Math.floor(10000 + Math.random() * 90000);
      const generatedOrderId = `MS-${randNum}`;

      const paymentMethodLabel =
        paymentMethod === "upi" ? `UPI (${upiId || "GPay"})` :
        paymentMethod === "card" ? `Credit Card (${cardDetails.number.slice(-4)})` :
        paymentMethod === "netbanking" ? `Net Banking (${selectedBank})` :
        "Cash on Delivery";

      const newOrder = {
        id: generatedOrderId,
        orderId: generatedOrderId,
        customerId: userId,
        userId: userId,
        customerName: address.fullName,
        email: currentCustomer?.email || "customer@mellosoft.com",
        phone: address.phone,
        items: items.map((item) => ({
          productId: item.productId || item.id,
          productName: item.productName || item.name,
          name: item.name || item.productName,
          category: item.category || "mattress",
          size: item.size || "Queen",
          firmness: item.firmness || "Medium",
          variantSize: item.size || "Queen",
          variantFirmness: item.firmness || "Medium",
          sku: item.sku || `MEL-${(item.size || "QUEEN").toUpperCase()}-${(item.firmness || "MEDIUM").toUpperCase()}`,
          variantSKU: item.sku || `MEL-${(item.size || "QUEEN").toUpperCase()}-${(item.firmness || "MEDIUM").toUpperCase()}`,
          quantity: item.qty || item.quantity || 1,
          price: item.price || item.discountPrice,
          actualPrice: item.actualPrice || item.price,
          discountPercent: 10,
          image: item.image || "/asset/img1.jpg"
        })),
        deliveryAddress: address,
        shippingAddress: address,
        paymentMethod: paymentMethodLabel,
        paymentStatus: paymentMethod === "cod" ? "Pending" : "Paid",
        orderStatus: "Processing",
        subtotal: subtotal,
        discount: discountSavings + couponDiscount,
        tax: tax,
        shipping: shipping,
        totalAmount: finalTotal,
        createdAt: new Date().toISOString().split("T")[0]
      };

      placeOrder(newOrder);
      setSelectedOrderId(generatedOrderId);
      setIsProcessing(false);
      navigateTo("confirmation", generatedOrderId);
    }, 800);
  };

  if (!items || items.length === 0) {
    return (
      <div style={emptyContainerStyle}>
        <div style={emptyCardStyle}>
          <h2 style={{ fontSize: "24px", color: "#1B1F8C", margin: "0 0 12px 0" }}>No Active Payment</h2>
          <p style={{ color: "#6B6B75", marginBottom: "20px" }}>Please select a product and complete delivery details first.</p>
          <button onClick={() => navigateTo("catalog")} style={primaryBtnStyle}>
            Browse Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header Nav */}
      <div style={headerNavStyle}>
        <button onClick={() => navigateTo("checkout")} style={backBtnStyle}>
          <ArrowLeft size={18} />
          <span>Back to Address</span>
        </button>
        <div style={stepperStyle}>
          <span style={completedStepStyle}>1. Delivery Address</span>
          <span style={stepDividerStyle}>→</span>
          <span style={activeStepStyle}>2. Payment</span>
          <span style={stepDividerStyle}>→</span>
          <span style={inactiveStepStyle}>3. Confirmation</span>
        </div>
      </div>

      <div style={layoutGridStyle}>
        {/* LEFT COLUMN: Payment Methods & Address Summary */}
        <div style={leftColStyle}>
          
          {/* DELIVERY ADDRESS SUMMARY BOX */}
          <div style={summaryBoxStyle}>
            <div style={summaryBoxHeaderStyle}>
              <div style={summaryBoxTitleStyle}>
                <CheckCircle2 size={18} color="#16A34A" />
                <span>Deliver To: <strong>{address.fullName}</strong></span>
              </div>
              <button onClick={() => navigateTo("checkout")} style={changeAddrLinkStyle}>
                Change
              </button>
            </div>
            <p style={addrLineStyle}>
              {address.addressLine1}, {address.addressLine2 ? address.addressLine2 + ", " : ""}{address.city}, {address.state} - <strong>{address.pincode}</strong> (Phone: {address.phone})
            </p>
          </div>

          {/* PAYMENT METHODS SECTION */}
          <div style={cardSectionStyle}>
            <h2 style={sectionTitleStyle}>Select Payment Method</h2>
            
            {paymentError && (
              <div style={errorAlertStyle}>
                <span>⚠️ {paymentError}</span>
              </div>
            )}

            <div style={paymentMethodsGridStyle}>
              {/* Option 1: UPI */}
              <div
                style={{
                  ...paymentOptionCardStyle,
                  borderColor: paymentMethod === "upi" ? "#1B1F8C" : "#E7E7E2",
                  backgroundColor: paymentMethod === "upi" ? "#F4F5FF" : "#FFFFFF"
                }}
                onClick={() => setPaymentMethod("upi")}
              >
                <div style={optionRadioRowStyle}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "upi"}
                    onChange={() => setPaymentMethod("upi")}
                    style={radioInputStyle}
                  />
                  <div style={optionTitleWrapStyle}>
                    <Smartphone size={20} color="#1B1F8C" />
                    <strong style={optionTitleStyle}>UPI (Google Pay, PhonePe, Paytm, BHIM)</strong>
                  </div>
                </div>

                {paymentMethod === "upi" && (
                  <div style={optionDetailsWrapStyle}>
                    <label style={labelStyle}>Enter VPA / UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. username@upi"
                      style={inputStyle}
                    />
                    <span style={{ fontSize: "12px", color: "#6B6B75" }}>
                      Instant payment verification via UPI app request.
                    </span>
                  </div>
                )}
              </div>

              {/* Option 2: Credit / Debit Card */}
              <div
                style={{
                  ...paymentOptionCardStyle,
                  borderColor: paymentMethod === "card" ? "#1B1F8C" : "#E7E7E2",
                  backgroundColor: paymentMethod === "card" ? "#F4F5FF" : "#FFFFFF"
                }}
                onClick={() => setPaymentMethod("card")}
              >
                <div style={optionRadioRowStyle}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    style={radioInputStyle}
                  />
                  <div style={optionTitleWrapStyle}>
                    <CreditCard size={20} color="#1B1F8C" />
                    <strong style={optionTitleStyle}>Credit / Debit Card</strong>
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <div style={optionDetailsWrapStyle}>
                    <div style={formRowStyle}>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Card Number</label>
                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    <div style={formTwoColStyle}>
                      <div>
                        <label style={labelStyle}>Expiry Date</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          placeholder="MM/YY"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>CVV</label>
                        <input
                          type="password"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          placeholder="123"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 3: Net Banking */}
              <div
                style={{
                  ...paymentOptionCardStyle,
                  borderColor: paymentMethod === "netbanking" ? "#1B1F8C" : "#E7E7E2",
                  backgroundColor: paymentMethod === "netbanking" ? "#F4F5FF" : "#FFFFFF"
                }}
                onClick={() => setPaymentMethod("netbanking")}
              >
                <div style={optionRadioRowStyle}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "netbanking"}
                    onChange={() => setPaymentMethod("netbanking")}
                    style={radioInputStyle}
                  />
                  <div style={optionTitleWrapStyle}>
                    <Building size={20} color="#1B1F8C" />
                    <strong style={optionTitleStyle}>Net Banking</strong>
                  </div>
                </div>

                {paymentMethod === "netbanking" && (
                  <div style={optionDetailsWrapStyle}>
                    <label style={labelStyle}>Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Option 4: Cash on Delivery */}
              <div
                style={{
                  ...paymentOptionCardStyle,
                  borderColor: paymentMethod === "cod" ? "#1B1F8C" : "#E7E7E2",
                  backgroundColor: paymentMethod === "cod" ? "#F4F5FF" : "#FFFFFF"
                }}
                onClick={() => setPaymentMethod("cod")}
              >
                <div style={optionRadioRowStyle}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    style={radioInputStyle}
                  />
                  <div style={optionTitleWrapStyle}>
                    <Banknote size={20} color="#16A34A" />
                    <strong style={optionTitleStyle}>Cash on Delivery (COD)</strong>
                  </div>
                </div>

                {paymentMethod === "cod" && (
                  <div style={optionDetailsWrapStyle}>
                    <p style={{ fontSize: "13px", color: "#6B6B75", margin: 0 }}>
                      Pay via Cash or UPI QR Code upon doorstep delivery. Payment status will be set to <strong>Pending</strong> until delivery completion.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY & PAY BUTTON */}
        <div style={rightColStyle}>
          <div style={summaryCardStyle}>
            <h3 style={summaryTitleStyle}>Order & Payment Summary</h3>

            {/* Items Brief List */}
            <div style={itemsBriefListStyle}>
              {items.map((item, idx) => (
                <div key={idx} style={itemBriefRowStyle}>
                  <span style={itemBriefTitleStyle}>{item.name || item.productName} ({item.size}) × {item.qty || item.quantity}</span>
                  <span style={itemBriefPriceStyle}>{formatPrice((item.price || item.discountPrice) * (item.qty || item.quantity))}</span>
                </div>
              ))}
            </div>

            <div style={summaryDividerStyle} />

            <div style={summaryRowsStyle}>
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Subtotal</span>
                <span style={summaryValStyle}>{formatPrice(subtotal)}</span>
              </div>
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Product & Promo Discount</span>
                <span style={{ ...summaryValStyle, color: "#16A34A" }}>–{formatPrice(discountSavings + couponDiscount)}</span>
              </div>
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>18% GST Tax</span>
                <span style={summaryValStyle}>{formatPrice(tax)}</span>
              </div>
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Shipping</span>
                <span style={summaryValStyle}>{shipping === 0 ? <strong style={{ color: "#16A34A" }}>FREE</strong> : formatPrice(shipping)}</span>
              </div>
            </div>

            <div style={summaryDividerStyle} />

            <div style={summaryTotalRowStyle}>
              <span style={totalLabelStyle}>Total Amount</span>
              <span style={totalValStyle}>{formatPrice(finalTotal)}</span>
            </div>

            <button
              onClick={handleCompleteOrder}
              disabled={isProcessing}
              style={{
                ...payBtnStyle,
                opacity: isProcessing ? 0.7 : 1,
                cursor: isProcessing ? "not-allowed" : "pointer"
              }}
            >
              <Lock size={18} />
              <span>
                {isProcessing
                  ? "Processing Order..."
                  : paymentMethod === "cod"
                  ? `Place Order (COD ${formatPrice(finalTotal)})`
                  : `Pay ${formatPrice(finalTotal)}`}
              </span>
            </button>

            <div style={securityFooterNoteStyle}>
              <ShieldCheck size={16} color="#16A34A" />
              <span>256-Bit SSL Encrypted & 100% Risk-Free Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inlined Style Tokens
const containerStyle = {
  maxWidth: "1720px",
  margin: "0 auto",
  padding: "30px 48px 80px 48px",
  width: "100%",
  boxSizing: "border-box"
};

const headerNavStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "32px",
  flexWrap: "wrap",
  gap: "16px"
};

const backBtnStyle = {
  border: "none",
  background: "none",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px",
  fontWeight: "700",
  color: "#1B1F8C",
  cursor: "pointer",
  padding: 0
};

const stepperStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  fontSize: "14px"
};

const completedStepStyle = {
  fontWeight: "700",
  color: "#16A34A"
};

const activeStepStyle = {
  fontWeight: "800",
  color: "#1B1F8C"
};

const inactiveStepStyle = {
  fontWeight: "500",
  color: "#9CA3AF"
};

const stepDividerStyle = {
  color: "#D1D5DB"
};

const layoutGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.6fr 1fr",
  gap: "32px",
  alignItems: "flex-start"
};

const leftColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px"
};

const rightColStyle = {
  position: "sticky",
  top: "100px"
};

const summaryBoxStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "16px",
  padding: "20px 24px",
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const summaryBoxHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
};

const summaryBoxTitleStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px",
  color: "#14151A"
};

const changeAddrLinkStyle = {
  border: "none",
  background: "none",
  color: "#1B1F8C",
  fontWeight: "700",
  fontSize: "13px",
  cursor: "pointer"
};

const addrLineStyle = {
  fontSize: "13.5px",
  color: "#6B6B75",
  margin: 0
};

const cardSectionStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "20px",
  padding: "32px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.02)"
};

const sectionTitleStyle = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: "0 0 20px 0"
};

const paymentMethodsGridStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const paymentOptionCardStyle = {
  border: "1.5px solid #E7E7E2",
  borderRadius: "16px",
  padding: "20px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "flex",
  flexDirection: "column",
  gap: "14px"
};

const optionRadioRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const radioInputStyle = {
  width: "18px",
  height: "18px",
  accentColor: "#1B1F8C",
  cursor: "pointer"
};

const optionTitleWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const optionTitleStyle = {
  fontSize: "15px",
  color: "#14151A"
};

const optionDetailsWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  paddingLeft: "30px",
  paddingTop: "8px"
};

const labelStyle = {
  fontSize: "12.5px",
  fontWeight: "700",
  color: "#14151A"
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #E7E7E2",
  fontSize: "14px",
  backgroundColor: "#FFFFFF",
  boxSizing: "border-box"
};

const selectStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #E7E7E2",
  fontSize: "14px",
  backgroundColor: "#FFFFFF",
  boxSizing: "border-box"
};

const formRowStyle = {
  display: "flex",
  gap: "12px"
};

const formTwoColStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px"
};

const summaryCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "20px",
  padding: "32px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.03)",
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const summaryTitleStyle = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: 0
};

const itemsBriefListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const itemBriefRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "13px"
};

const itemBriefTitleStyle = {
  color: "#6B6B75",
  maxWidth: "70%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};

const itemBriefPriceStyle = {
  fontWeight: "600",
  color: "#14151A"
};

const summaryRowsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "14px"
};

const summaryLabelStyle = {
  color: "#6B6B75"
};

const summaryValStyle = {
  fontWeight: "600",
  color: "#14151A"
};

const summaryDividerStyle = {
  height: "1px",
  backgroundColor: "#E7E7E2"
};

const summaryTotalRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const totalLabelStyle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#14151A"
};

const totalValStyle = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#1B1F8C"
};

const payBtnStyle = {
  width: "100%",
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "999px",
  padding: "16px",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  boxShadow: "0 8px 20px rgba(22, 163, 74, 0.25)"
};

const securityFooterNoteStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontSize: "12px",
  color: "#6B6B75"
};

const errorAlertStyle = {
  backgroundColor: "#FEE2E2",
  color: "#DC2626",
  padding: "10px 14px",
  borderRadius: "10px",
  fontSize: "13px",
  fontWeight: "600",
  marginBottom: "16px"
};

const emptyContainerStyle = {
  maxWidth: "600px",
  margin: "80px auto",
  padding: "0 24px",
  textAlign: "center"
};

const emptyCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "20px",
  padding: "48px 32px"
};

const primaryBtnStyle = {
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "999px",
  padding: "14px 28px",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer"
};
