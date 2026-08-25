"use client";

import React from "react";
import { useStore } from "../context/StoreContext";
import { ShieldCheck, Lock, ArrowLeft, Mail, Phone, Clock } from "lucide-react";

export default function PrivacyView() {
  const { navigateTo, settings } = useStore();

  const handleBackHome = () => {
    navigateTo("home");
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
            <Lock size={14} color="#16A34A" />
            <span>DATA PROTECTION & PRIVACY</span>
          </div>
          <h1 style={pageTitleStyle}>Privacy Policy</h1>
          <p style={lastUpdatedStyle}>
            <Clock size={14} style={{ display: "inline", marginRight: "6px" }} />
            Last Updated: August 20, 2026
          </p>
          <p style={introCopyStyle}>
            Mellosoft values your trust and is committed to protecting your personal information. This Privacy Policy details how we collect, use, store, and safeguard your data when you interact with our website, browse our sleep catalog, or purchase our products.
          </p>
        </header>

        {/* CONTENT ARTICLES */}
        <div style={contentCardStyle}>
          
          {/* SECTION 1 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>1. Introduction</h2>
            <p style={paragraphStyle}>
              This Privacy Policy explains how Mellosoft (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) handles your personal information across all digital touchpoints. We process all customer data in accordance with applicable data protection legislation and privacy best practices.
            </p>
          </section>

          {/* SECTION 2 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>2. Information We Collect</h2>
            <p style={paragraphStyle}>
              We collect information to fulfill orders, provide personalized sleep recommendations, and improve customer experience. This includes:
            </p>
            <ul style={listStyle}>
              <li><strong>Contact & Account Details:</strong> Name, email address, contact phone number, and account credentials.</li>
              <li><strong>Delivery & Billing Information:</strong> Shipping street address, city, state, pincode, and billing details.</li>
              <li><strong>Order & Activity History:</strong> Purchased items, saved cart contents, wishlist selections, and past orders.</li>
              <li><strong>Sleep Profile Preferences:</strong> Preferred sleep position, firmness preferences, and temperature choices collected via our AI Sleep Advisor.</li>
            </ul>
          </section>

          {/* SECTION 3 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>3. How We Use Information</h2>
            <p style={paragraphStyle}>
              Your information is strictly used for legitimate business and operational purposes:
            </p>
            <ul style={listStyle}>
              <li>Processing, fulfilling, and delivering customer orders across India.</li>
              <li>Sending order confirmation, shipment tracking, and delivery notification messages.</li>
              <li>Providing customer support and resolving warranty or trial return inquiries.</li>
              <li>Generating personalized mattress firmness recommendations via our Sleep Advisor.</li>
              <li>Improving website performance, navigation flow, and user experience.</li>
            </ul>
          </section>

          {/* SECTION 4 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>4. Payment Information</h2>
            <p style={paragraphStyle}>
              Payment transactions are processed through accredited, PCI-DSS compliant third-party payment gateways (supporting UPI, Visa, Mastercard, RuPay, and Net Banking). Sensitive payment credentials such as card CVVs or net banking passwords are encrypted directly by payment gateways and are never stored on Mellosoft servers.
            </p>
          </section>

          {/* SECTION 5 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>5. Cookies and Local Storage</h2>
            <p style={paragraphStyle}>
              We utilize browser <code style={codeTagStyle}>localStorage</code> and session storage to maintain your active shopping session, persist cart items (<code style={codeTagStyle}>mellosoft_cart</code>), save wishlist selections (<code style={codeTagStyle}>mellosoft_wishlist</code>), and keep customer login authentication (<code style={codeTagStyle}>mellosoft_customer_session</code>) active across page visits without requiring repeated logins.
            </p>
          </section>

          {/* SECTION 6 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>6. Information Sharing</h2>
            <p style={paragraphStyle}>
              We respect customer privacy and do not sell, trade, or rent personal data to third-party advertising networks. Information is shared only with trusted partners essential to service fulfillment:
            </p>
            <ul style={listStyle}>
              <li>Logistics and courier partners to perform doorstep product delivery.</li>
              <li>Payment gateway providers to process secure transaction settlements.</li>
              <li>Legal authorities only when mandatory to comply with applicable laws or judicial orders.</li>
            </ul>
          </section>

          {/* SECTION 7 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>7. Data Security</h2>
            <p style={paragraphStyle}>
              We employ 256-bit SSL encryption, firewalls, and restricted administrative access protocols to protect customer information against unauthorized access, disclosure, or modification.
            </p>
          </section>

          {/* SECTION 8 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>8. User Rights</h2>
            <p style={paragraphStyle}>
              Customers have the right to access, inspect, update, or request deletion of their profile data stored in our system. You can update address information directly within your customer profile or request account data removal by contacting our privacy team.
            </p>
          </section>

          {/* SECTION 9 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>9. Policy Updates</h2>
            <p style={paragraphStyle}>
              Mellosoft may periodically update this Privacy Policy to reflect enhancements in technology or legal requirements. Updates become effective immediately upon posting to this page.
            </p>
          </section>

          {/* SECTION 10 */}
          <section style={{ ...sectionStyle, borderBottom: "none", paddingBottom: 0 }}>
            <h2 style={sectionHeadingStyle}>10. Contact Privacy Officer</h2>
            <p style={paragraphStyle}>
              If you have any questions regarding our privacy practices or data security, please reach out to our team:
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
