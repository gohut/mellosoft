"use client";

import React from "react";
import { useStore } from "../context/StoreContext";
import { XCircle, ShieldCheck, ArrowLeft, Mail, Phone, Clock } from "lucide-react";

export default function CancellationPolicyView() {
  const { navigateTo, settings } = useStore();

  const handleBackHome = () => {
    navigateTo("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoToOrders = () => {
    navigateTo("orders");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={pageWrapperStyle}>
      <div style={containerStyle}>
        
        {/* BREADCRUMB / BACK LINK */}
        <div style={topNavRowStyle}>
          <button onClick={handleBackHome} style={backBtnStyle} className="policy-back-btn">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
        </div>

        {/* HEADER SECTION */}
        <header style={headerCardStyle}>
          <div style={headerBadgeStyle}>
            <XCircle size={14} color="#16A34A" />
            <span>ORDER CANCELLATION RULES</span>
          </div>
          <h1 style={pageTitleStyle}>Cancellation Policy</h1>
          <p style={lastUpdatedStyle}>
            <Clock size={14} style={{ display: "inline", marginRight: "6px" }} />
            Last Updated: August 20, 2026
          </p>
          <p style={introCopyStyle}>
            We understand that plans can change. Mellosoft provides a straightforward order cancellation process allowing customers to cancel order items before shipment dispatch and receive a prompt refund.
          </p>
        </header>

        {/* CONTENT ARTICLES */}
        <div style={contentCardStyle}>
          
          {/* SECTION 1 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>1. Order Cancellation Overview</h2>
            <p style={paragraphStyle}>
              Customers may request order cancellation at any point prior to product dispatch. Cancellation requests are evaluated based on real-time fulfillment status recorded in your customer account.
            </p>
          </section>

          {/* SECTION 2 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>2. Cancellation Before Shipment</h2>
            <p style={paragraphStyle}>
              If your order is currently in <code style={codeTagStyle}>Pending</code> or <code style={codeTagStyle}>Processing</code> status:
            </p>
            <ul style={listStyle}>
              <li>You can request cancellation directly from your <button onClick={handleGoToOrders} style={inlineBtnLinkStyle}>My Orders</button> page on our website.</li>
              <li>Alternatively, contact support immediately at <code style={codeTagStyle}>{settings?.store?.email || "support@mellosoft.com"}</code> or <code style={codeTagStyle}>{settings?.store?.phone || "+91 98765 43210"}</code>.</li>
              <li>Pre-shipment cancellations are processed immediately with zero penalty or cancellation fee.</li>
            </ul>
          </section>

          {/* SECTION 3 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>3. Orders Already Shipped</h2>
            <p style={paragraphStyle}>
              Once an order has reached <code style={codeTagStyle}>Shipped</code> or <code style={codeTagStyle}>In Transit</code> status, it has already been handed over to courier logistics partners and cannot be directly cancelled in transit. In such cases, customers may refuse delivery upon courier arrival or follow our standard <a href="/return-policy" onClick={(e) => { e.preventDefault(); navigateTo("return-policy"); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={inlineLinkStyle}>Return Policy</a> once received.
            </p>
          </section>

          {/* SECTION 4 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>4. Refund After Cancellation</h2>
            <p style={paragraphStyle}>
              Upon successful pre-shipment order cancellation, a 100% full refund will be processed back to the original payment source:
            </p>
            <ul style={listStyle}>
              <li><strong>Prepaid Orders (UPI / Card / Net Banking):</strong> Full credit credited within 3 to 5 business days.</li>
              <li><strong>Cash on Delivery (COD) Orders:</strong> Order booking is voided immediately with no payment obligation.</li>
            </ul>
          </section>

          {/* SECTION 5 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>5. Cancellation by Mellosoft</h2>
            <p style={paragraphStyle}>
              While rare, Mellosoft reserves the right to cancel an order prior to shipment under specific operational circumstances:
            </p>
            <ul style={listStyle}>
              <li>Temporary stock unavailability or raw material supply disruption.</li>
              <li>Systemic or technical errors resulting in incorrect pricing information.</li>
              <li>Delivery address located outside our active courier service pincodes.</li>
              <li>Unverified payment authentication or suspected fraudulent transaction flags.</li>
            </ul>
            <p style={{ ...paragraphStyle, marginTop: "10px" }}>
              If Mellosoft cancels your order, you will receive an immediate notification email and a 100% full refund credited to your original payment method.
            </p>
          </section>

          {/* SECTION 6 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>6. How to Request Cancellation</h2>
            <p style={paragraphStyle}>
              To cancel an active order:
            </p>
            <ol style={listStyle}>
              <li>Log in to your Mellosoft customer account and navigate to <button onClick={handleGoToOrders} style={inlineBtnLinkStyle}>My Orders</button>.</li>
              <li>Locate your active order card (<code style={codeTagStyle}>MS-XXXXX</code>).</li>
              <li>If eligible for pre-shipment cancellation, click the <strong>Cancel Order</strong> button.</li>
              <li>Alternatively, email <code style={codeTagStyle}>{settings?.store?.email || "support@mellosoft.com"}</code> with your Order ID and subject &quot;Order Cancellation Request&quot;.</li>
            </ol>
          </section>

          {/* SECTION 7 */}
          <section style={{ ...sectionStyle, borderBottom: "none", paddingBottom: 0 }}>
            <h2 style={sectionHeadingStyle}>7. Contact Support</h2>
            <p style={paragraphStyle}>
              Have questions or need assistance cancelling an order? Contact our support team:
            </p>
            
            <div style={contactBoxStyle}>
              <div style={contactItemStyle}>
                <Mail size={16} color="#16A34A" />
                <span>Email: {settings?.store?.email || "support@mellosoft.com"}</span>
              </div>
              <div style={contactItemStyle}>
                <Phone size={16} color="#16A34A" />
                <span>Phone: {settings?.store?.phone || "+91 98765 43210"} (Mon-Sat, 9 AM - 7 PM IST)</span>
              </div>
            </div>
          </section>

        </div>
      </div>

      <style>{`
        .policy-back-btn {
          transition: all 0.2s ease;
        }
        .policy-back-btn:hover {
          color: #1B1F8C !important;
          transform: translateX(-3px);
        }
      `}</style>
    </div>
  );
}

const pageWrapperStyle = {
  backgroundColor: "#FFFFFF",
  minHeight: "80vh",
  padding: "40px 24px 60px",
  width: "100%",
  boxSizing: "border-box"
};

const containerStyle = {
  maxWidth: "1000px",
  margin: "0 auto",
  width: "100%"
};

const topNavRowStyle = {
  marginBottom: "20px"
};

const backBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  background: "none",
  border: "none",
  color: "#6B6B75",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  padding: 0
};

const headerCardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  padding: "36px 40px",
  marginBottom: "24px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
  border: "1px solid #E7E7E2"
};

const headerBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "#DCFCE7",
  color: "#16A34A",
  fontSize: "12px",
  fontWeight: "800",
  padding: "4px 12px",
  borderRadius: "999px",
  marginBottom: "14px",
  letterSpacing: "0.05em"
};

const pageTitleStyle = {
  fontSize: "clamp(28px, 4vw, 40px)",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: "0 0 8px",
  lineHeight: "1.15"
};

const lastUpdatedStyle = {
  fontSize: "13px",
  color: "#6B6B75",
  fontWeight: "600",
  margin: "0 0 16px"
};

const introCopyStyle = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#374151",
  margin: 0
};

const contentCardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  padding: "40px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
  border: "1px solid #E7E7E2"
};

const sectionStyle = {
  paddingBottom: "24px",
  marginBottom: "24px",
  borderBottom: "1px solid #E7E7E2"
};

const sectionHeadingStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#14151A",
  margin: "0 0 12px"
};

const paragraphStyle = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#4B5563",
  margin: 0
};

const listStyle = {
  marginTop: "10px",
  marginBottom: 0,
  paddingLeft: "20px",
  color: "#4B5563",
  fontSize: "15px",
  lineHeight: "1.8"
};

const codeTagStyle = {
  backgroundColor: "#F3F4F6",
  color: "#1B1F8C",
  padding: "2px 6px",
  borderRadius: "4px",
  fontSize: "13px"
};

const inlineLinkStyle = {
  color: "#1B1F8C",
  fontWeight: "600",
  textDecoration: "underline"
};

const inlineBtnLinkStyle = {
  background: "none",
  border: "none",
  color: "#1B1F8C",
  fontWeight: "600",
  textDecoration: "underline",
  cursor: "pointer",
  padding: 0,
  fontSize: "15px"
};

const contactBoxStyle = {
  marginTop: "16px",
  backgroundColor: "#F9FAFB",
  padding: "16px 20px",
  borderRadius: "10px",
  border: "1px solid #E5E7EB",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const contactItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "14px",
  fontWeight: "600",
  color: "#14151A"
};
