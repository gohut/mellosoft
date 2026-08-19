"use client";

import React from "react";
import { useStore } from "../context/StoreContext";
import { RotateCcw, ShieldCheck, ArrowLeft, Mail, Phone, Clock, CheckCircle2 } from "lucide-react";

export default function ReturnPolicyView() {
  const { navigateTo } = useStore();

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
            <RotateCcw size={14} color="#16A34A" />
            <span>100-NIGHT TRIAL & RETURNS</span>
          </div>
          <h1 style={pageTitleStyle}>Return Policy</h1>
          <p style={lastUpdatedStyle}>
            <Clock size={14} style={{ display: "inline", marginRight: "6px" }} />
            Last Updated: August 20, 2026
          </p>
          <p style={introCopyStyle}>
            At Mellosoft, we stand behind the craftsmanship and comfort of our products. We offer a 100-Night Sleep Trial on mattresses to ensure you find your perfect sleep match. If you are not completely satisfied, we provide a smooth, customer-friendly return process.
          </p>
        </header>

        {/* CONTENT ARTICLES */}
        <div style={contentCardStyle}>
          
          {/* SECTION 1 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>1. Overview</h2>
            <p style={paragraphStyle}>
              We believe it takes your body time to adjust to a new mattress. Our Return Policy allows you to test your mattress in the comfort of your own home during the 100-Night Trial period. If it isn&apos;t the right fit, we arrange complimentary doorstep pickup and process your refund.
            </p>
          </section>

          {/* SECTION 2 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>2. Return Eligibility</h2>
            <p style={paragraphStyle}>
              To qualify for a trial return or exchange, the following eligibility criteria apply:
            </p>
            <ul style={listStyle}>
              <li>The mattress must be within the applicable 100-Night Sleep Trial period starting from the delivery date.</li>
              <li>The item must be in hygienic condition, free from permanent stains, tears, burns, or liquid damage.</li>
              <li>Original proof of purchase (Order ID or invoice) must be provided.</li>
              <li>Returns must be initiated by the original purchaser.</li>
            </ul>
          </section>

          {/* SECTION 3 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>3. Non-Returnable Items</h2>
            <p style={paragraphStyle}>
              The following categories are not eligible for trial returns:
            </p>
            <ul style={listStyle}>
              <li>Customized mattress dimensions ordered outside standard sizing options.</li>
              <li>Products showing signs of physical abuse, improper foundation support, or liquid spills.</li>
              <li>Items purchased through unauthorized resellers or liquidators.</li>
            </ul>
          </section>

          {/* SECTION 4 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>4. How to Request a Return</h2>
            <p style={paragraphStyle}>
              Requesting a return is simple and hassle-free. Follow these steps:
            </p>
            
            <div style={stepGridStyle}>
              <div style={stepCardStyle}>
                <span style={stepNumStyle}>1</span>
                <div>
                  <strong style={stepTitleStyle}>Contact Support</strong>
                  <p style={stepDescStyle}>Reach out to support@mellosoft.com with your Order ID (<code style={codeTagStyle}>MS-XXXXX</code>).</p>
                </div>
              </div>

              <div style={stepCardStyle}>
                <span style={stepNumStyle}>2</span>
                <div>
                  <strong style={stepTitleStyle}>Provide Order Details</strong>
                  <p style={stepDescStyle}>Provide a brief description and photos of the product condition.</p>
                </div>
              </div>

              <div style={stepCardStyle}>
                <span style={stepNumStyle}>3</span>
                <div>
                  <strong style={stepTitleStyle}>Schedule Pickup</strong>
                  <p style={stepDescStyle}>Our courier partner contacts you to schedule a free doorstep pickup.</p>
                </div>
              </div>

              <div style={stepCardStyle}>
                <span style={stepNumStyle}>4</span>
                <div>
                  <strong style={stepTitleStyle}>Quality Inspection</strong>
                  <p style={stepDescStyle}>The returned item undergoes standard quality and hygiene verification.</p>
                </div>
              </div>

              <div style={stepCardStyle}>
                <span style={stepNumStyle}>5</span>
                <div>
                  <strong style={stepTitleStyle}>Refund Authorization</strong>
                  <p style={stepDescStyle}>Upon inspection approval, your full refund is authorized immediately.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>5. Refunds</h2>
            <p style={paragraphStyle}>
              Approved refunds are credited directly back to the original payment method used during checkout (UPI, Credit/Debit Card, or Net Banking). For Cash on Delivery (COD) orders, refunds are credited via direct bank transfer after verifying bank account details. Refunds typically reflect within 5 to 7 business days following pickup approval.
            </p>
          </section>

          {/* SECTION 6 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>6. Damaged or Incorrect Products</h2>
            <p style={paragraphStyle}>
              If your package arrives damaged during transit or contains an incorrect product model, please notify us within 48 hours of delivery. We will arrange an immediate priority replacement at zero additional cost.
            </p>
          </section>

          {/* SECTION 7 */}
          <section style={{ ...sectionStyle, borderBottom: "none", paddingBottom: 0 }}>
            <h2 style={sectionHeadingStyle}>7. Contact Support</h2>
            <p style={paragraphStyle}>
              Need assistance initiating a return or have questions regarding trial eligibility? Contact our team:
            </p>
            
            <div style={contactBoxStyle}>
              <div style={contactItemStyle}>
                <Mail size={16} color="#16A34A" />
                <span>Email: returns@mellosoft.com / support@mellosoft.com</span>
              </div>
              <div style={contactItemStyle}>
                <Phone size={16} color="#16A34A" />
                <span>Phone: +91 98765 43210 (Mon-Sat, 9 AM - 7 PM IST)</span>
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
  backgroundColor: "#F7F7F2",
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

const stepGridStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "16px"
};

const stepCardStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "16px",
  padding: "16px",
  backgroundColor: "#F9FAFB",
  borderRadius: "10px",
  border: "1px solid #E5E7EB"
};

const stepNumStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  fontSize: "14px",
  fontWeight: "800",
  flexShrink: 0
};

const stepTitleStyle = {
  display: "block",
  fontSize: "15px",
  fontWeight: "700",
  color: "#14151A",
  marginBottom: "2px"
};

const stepDescStyle = {
  fontSize: "14px",
  color: "#6B6B75",
  margin: 0
};

const codeTagStyle = {
  backgroundColor: "#E5E7EB",
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
