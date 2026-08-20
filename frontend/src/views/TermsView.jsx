"use client";

import React from "react";
import { useStore } from "../context/StoreContext";
import { ShieldCheck, FileText, ArrowLeft, Mail, Phone, Clock } from "lucide-react";

export default function TermsView() {
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
            <FileText size={14} color="#16A34A" />
            <span>LEGAL DOCUMENTATION</span>
          </div>
          <h1 style={pageTitleStyle}>Terms & Conditions</h1>
          <p style={lastUpdatedStyle}>
            <Clock size={14} style={{ display: "inline", marginRight: "6px" }} />
            Last Updated: August 20, 2026
          </p>
          <p style={introCopyStyle}>
            Welcome to Mellosoft. These Terms & Conditions govern your access to and use of the Mellosoft website, mobile applications, and online store, as well as the purchase of our sleep products and accessories. By visiting or shopping on our website, you agree to be bound by these terms.
          </p>
        </header>

        {/* CONTENT ARTICLES */}
        <div style={contentCardStyle}>
          
          {/* SECTION 1 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>1. Introduction</h2>
            <p style={paragraphStyle}>
              These Terms & Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;Customer&quot; or &quot;User&quot;) and Mellosoft (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). They govern all purchases of mattresses, pillows, bed frames, protectors, and related sleep accessories made through our website.
            </p>
          </section>

          {/* SECTION 2 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>2. Website Usage</h2>
            <p style={paragraphStyle}>
              By using our website, you confirm that you are at least 18 years of age or accessing the site under the supervision of a parent or legal guardian. You agree to use the site only for lawful purposes and in a manner that does not infringe the rights of, or restrict or inhibit the use and enjoyment of this site by any third party.
            </p>
          </section>

          {/* SECTION 3 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>3. Products and Product Information</h2>
            <p style={paragraphStyle}>
              We strive to display product colors, dimensions, layer compositions, and firmness ratings as accurately as possible. However, actual colors and fabric textures may vary slightly depending on monitor calibrations. All product specifications and prices are subject to change without prior notice.
            </p>
          </section>

          {/* SECTION 4 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>4. Orders</h2>
            <p style={paragraphStyle}>
              Placing an order on Mellosoft constitutes an offer to purchase products. Order confirmation emails or SMS messages acknowledge receipt of your order but do not constitute final acceptance. We reserve the right to accept, decline, or cancel any order at our discretion due to inventory limitations, pricing errors, or suspected fraudulent activity.
            </p>
          </section>

          {/* SECTION 5 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>5. Pricing and Payments</h2>
            <p style={paragraphStyle}>
              All prices listed on the website are displayed in Indian Rupees (₹) and include applicable Goods and Services Tax (GST) unless specified otherwise. We accept payments via UPI, Credit Cards, Debit Cards, Net Banking, and Cash on Delivery (COD). Shipping fees, if applicable, are calculated and displayed at checkout.
            </p>
          </section>

          {/* SECTION 6 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>6. Shipping and Delivery</h2>
            <p style={paragraphStyle}>
              We provide doorstep delivery across serviceable pincodes in India. Standard delivery timelines range from 3 to 5 business days depending on delivery location. While we strive to meet all estimated timelines, delays caused by logistics partners, weather conditions, or force majeure events are beyond our direct control.
            </p>
          </section>

          {/* SECTION 7 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>7. Returns and Refunds</h2>
            <p style={paragraphStyle}>
              Eligible product returns are governed by our separate <a href="/return-policy" onClick={(e) => { e.preventDefault(); navigateTo("return-policy"); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={inlineLinkStyle}>Return Policy</a>. Mellosoft mattresses come with a 100-Night Sleep Trial subject to standard trial guidelines. Refunds are processed to the original payment method upon physical inspection and approval.
            </p>
          </section>

          {/* SECTION 8 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>8. Cancellation</h2>
            <p style={paragraphStyle}>
              Order cancellation requests are subject to our separate <a href="/cancellation-policy" onClick={(e) => { e.preventDefault(); navigateTo("cancellation-policy"); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={inlineLinkStyle}>Cancellation Policy</a>. Orders may be cancelled prior to dispatch through your customer account or by contacting customer support.
            </p>
          </section>

          {/* SECTION 9 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>9. Intellectual Property</h2>
            <p style={paragraphStyle}>
              All materials on this website—including logos, product names, text, graphics, photography, foam layer diagrams, and software—are the intellectual property of Mellosoft and protected by copyright, trademark, and intellectual property laws. Unauthorized copying or redistribution is strictly prohibited.
            </p>
          </section>

          {/* SECTION 10 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>10. Limitation of Liability</h2>
            <p style={paragraphStyle}>
              Mellosoft shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our products or website. Our maximum total liability for any claim arising out of an order shall not exceed the total amount paid by the customer for that order.
            </p>
          </section>

          {/* SECTION 11 */}
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>11. Changes to Terms</h2>
            <p style={paragraphStyle}>
              We reserve the right to revise or update these Terms & Conditions at any time. All updates will be posted directly to this page with an updated &quot;Last Updated&quot; timestamp. Your continued use of the website following any modifications signifies acceptance of the revised terms.
            </p>
          </section>

          {/* SECTION 12 */}
          <section style={{ ...sectionStyle, borderBottom: "none", paddingBottom: 0 }}>
            <h2 style={sectionHeadingStyle}>12. Contact Support</h2>
            <p style={paragraphStyle}>
              If you have any questions or concerns regarding these Terms & Conditions, please contact our support team:
            </p>
            
            <div style={contactBoxStyle}>
              <div style={contactItemStyle}>
                <Mail size={16} color="#16A34A" />
                <span>Email: support@mellosoft.com</span>
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
        @media (max-width: 767px) {
          .terms-page-wrapper {
            padding: 24px 16px !important;
          }
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

const inlineLinkStyle = {
  color: "#1B1F8C",
  fontWeight: "600",
  textDecoration: "underline"
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
