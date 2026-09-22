"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../context/StoreContext";
import { getResolvedImageUrlSync, useResolvedImageUrl } from "../utils/imageStorage";
import { X, ChevronDown } from "lucide-react";

export default function Footer() {
  const { navigateTo, setActiveFilters, settings } = useStore();
  const router = useRouter();

  const footerLogo = useResolvedImageUrl(settings?.website?.logo, "/asset/logo.png");

  // Info Modal state (for Contact, Policy, etc.)
  const [modalContent, setModalContent] = useState(null);

  // Mobile Accordion state
  const [expandedSections, setExpandedSections] = useState({
    quickLinks: false,
    customerService: false,
    legal: false
  });

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCategoryClick = (category) => {
    setActiveFilters((prev) => ({
      ...prev,
      category,
      firmness: "All",
      size: "All",
      sort: "Recommended"
    }));
    navigateTo("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavClick = (viewName) => {
    navigateTo(viewName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePolicyNavigation = (path) => {
    router.push(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openInfoModal = (title, content) => {
    setModalContent({ title, content });
  };

  return (
    <footer style={footerWrapperStyle} className="storefront-footer">
      <div style={footerInnerContainerStyle} className="footer-inner-container">
        {/* FOUR COLUMN GRID */}
        <div style={footerGridStyle} className="footer-columns-grid">
          
          {/* COLUMN 1: BRAND */}
          <div style={brandColStyle} className="footer-brand-col">
            <button
              onClick={() => handleNavClick("home")}
              style={logoButtonResetStyle}
              aria-label={`${settings?.store?.name || "Mellosoft"} Home`}
            >
              <img
                src={footerLogo}
                alt={settings?.store?.name || "Mellosoft"}
                style={logoImgStyle}
                onError={(e) => { e.currentTarget.src = "/asset/logo.png"; }}
              />
            </button>
            <p style={brandDescStyle}>
              Premium comfort designed for better nights and brighter mornings.
            </p>

            {/* Social Media Icons */}
            <div style={socialsRowStyle} aria-label="Social media links">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                style={socialIconLinkStyle}
                className="social-icon-btn"
                aria-label="Facebook"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                style={socialIconLinkStyle}
                className="social-icon-btn"
                aria-label="Instagram"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                style={socialIconLinkStyle}
                className="social-icon-btn"
                aria-label="YouTube"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href={settings?.store?.phone ? `https://wa.me/${settings.store.phone.replace(/[^0-9]/g, "")}` : "https://wa.me/919876543210"}
                target="_blank"
                rel="noreferrer"
                style={socialIconLinkStyle}
                className="social-icon-btn"
                aria-label="WhatsApp"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 10.23c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.57c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29" />
                </svg>
              </a>
            </div>
          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <div style={colNavStyle} className="footer-col-group">
            <button
              type="button"
              className="footer-accordion-trigger"
              onClick={() => toggleSection("quickLinks")}
              aria-expanded={expandedSections.quickLinks}
            >
              <h4 style={colHeadingStyle}>Quick Links</h4>
              <ChevronDown
                size={18}
                className={`footer-chevron ${expandedSections.quickLinks ? "rotate-180" : ""}`}
              />
            </button>
            <ul style={linkListStyle} className={`footer-links-list ${expandedSections.quickLinks ? "is-open" : ""}`}>
              <li>
                <button onClick={() => handleNavClick("home")} style={linkItemBtnStyle} className="footer-link-hover">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick("mattress")} style={linkItemBtnStyle} className="footer-link-hover">
                  Mattresses
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick("pillows")} style={linkItemBtnStyle} className="footer-link-hover">
                  Pillows
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick("bed frames")} style={linkItemBtnStyle} className="footer-link-hover">
                  Bed Frames
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick("about")} style={linkItemBtnStyle} className="footer-link-hover">
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("contact")}
                  style={linkItemBtnStyle}
                  className="footer-link-hover"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: CUSTOMER SERVICE */}
          <div style={colNavStyle} className="footer-col-group">
            <button
              type="button"
              className="footer-accordion-trigger"
              onClick={() => toggleSection("customerService")}
              aria-expanded={expandedSections.customerService}
            >
              <h4 style={colHeadingStyle}>Customer Service</h4>
              <ChevronDown
                size={18}
                className={`footer-chevron ${expandedSections.customerService ? "rotate-180" : ""}`}
              />
            </button>
            <ul style={linkListStyle} className={`footer-links-list ${expandedSections.customerService ? "is-open" : ""}`}>
              <li>
                <button
                  onClick={() =>
                    openInfoModal(
                      "Customer Support",
                      `Our sleep specialists are available to help you select the ideal mattress and variant for your sleep profile. Reach us at ${settings?.store?.email || "support@mellosoft.com"} or call ${settings?.store?.phone || "+91 98765 43210"}.`
                    )
                  }
                  style={linkItemBtnStyle}
                  className="footer-link-hover"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    openInfoModal(
                      "Shipping & Returns",
                      `Enjoy free contactless doorstep shipping across India on orders above ₹${Number(settings?.shipping?.freeShippingAmount || 5000).toLocaleString("en-IN")}. Hassle-free 100-night trial returns with complimentary pickup.`
                    )
                  }
                  style={linkItemBtnStyle}
                  className="footer-link-hover"
                >
                  Shipping & Returns
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick("orders")} style={linkItemBtnStyle} className="footer-link-hover">
                  Order Tracking
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    openInfoModal(
                      "Mattress Size Guide",
                      "• Twin: 38\" x 75\"\n• Full: 54\" x 75\"\n• Queen: 60\" x 80\"\n• King: 76\" x 80\"\nStandard custom dimensions available on request."
                    )
                  }
                  style={linkItemBtnStyle}
                  className="footer-link-hover"
                >
                  Size Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    openInfoModal(
                      "10-Year Warranty",
                      "Every Mellosoft mattress includes a 10-year manufacturer warranty protecting against structural sagging, foam defects, and craftsmanship imperfections."
                    )
                  }
                  style={linkItemBtnStyle}
                  className="footer-link-hover"
                >
                  Warranty
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: LEGAL */}
          <div style={colNavStyle} className="footer-col-group">
            <button
              type="button"
              className="footer-accordion-trigger"
              onClick={() => toggleSection("legal")}
              aria-expanded={expandedSections.legal}
            >
              <h4 style={colHeadingStyle}>Legal</h4>
              <ChevronDown
                size={18}
                className={`footer-chevron ${expandedSections.legal ? "rotate-180" : ""}`}
              />
            </button>
            <ul style={linkListStyle} className={`footer-links-list ${expandedSections.legal ? "is-open" : ""}`}>
              <li>
                <button
                  onClick={() => handlePolicyNavigation("/terms")}
                  style={linkItemBtnStyle}
                  className="footer-link-hover"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePolicyNavigation("/privacy")}
                  style={linkItemBtnStyle}
                  className="footer-link-hover"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePolicyNavigation("/return-policy")}
                  style={linkItemBtnStyle}
                  className="footer-link-hover"
                >
                  Return Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePolicyNavigation("/cancellation-policy")}
                  style={linkItemBtnStyle}
                  className="footer-link-hover"
                >
                  Cancellation Policy
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* 5. FOOTER DIVIDER */}
        <div style={dividerLineStyle} className="footer-divider-line" />

        {/* 6. COPYRIGHT SECTION */}
        <div style={copyrightRowStyle} className="footer-copyright-row">
          <p style={copyrightTextStyle}>
            © 2026 {settings?.store?.name || "Mellosoft"}. All rights reserved.
          </p>
        </div>
      </div>

      {/* INFO / POLICY MODAL */}
      {modalContent && (
        <div style={modalBackdropStyle} onClick={() => setModalContent(null)}>
          <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderRowStyle}>
              <h3 style={modalTitleStyle}>{modalContent.title}</h3>
              <button
                onClick={() => setModalContent(null)}
                style={modalCloseBtnStyle}
                aria-label="Close dialog"
              >
                <X size={18} color="#14151A" />
              </button>
            </div>
            <p style={modalBodyTextStyle}>
              {modalContent.content}
            </p>
            <button
              onClick={() => setModalContent(null)}
              style={modalDismissBtnStyle}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* STYLED RESPONSIVE CSS OVERRIDES */}
      <style>{`
        .footer-link-hover {
          transition: color 0.2s ease;
        }
        .footer-link-hover:hover {
          color: #1B1F8C !important;
        }
        .social-icon-btn {
          transition: all 0.2s ease;
        }
        .social-icon-btn:hover {
          background-color: #1B1F8C !important;
          color: #FFFFFF !important;
          border-color: #1B1F8C !important;
          transform: translateY(-2px);
        }

        .footer-accordion-trigger {
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          cursor: default;
          color: inherit;
          font-family: inherit;
        }
        .footer-chevron {
          display: none;
          color: #1B1F8C;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .footer-chevron.rotate-180 {
          transform: rotate(180deg);
        }

        .footer-links-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .footer-columns-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px 24px !important;
            margin-bottom: 24px !important;
          }
        }

        @media (max-width: 640px) {
          .storefront-footer {
            padding: 20px 0 16px 0 !important;
          }
          .footer-inner-container {
            padding: 0 16px !important;
          }
          .footer-columns-grid {
            grid-template-columns: 1fr !important;
            gap: 4px !important;
            margin-bottom: 0 !important;
          }
          .footer-brand-col {
            padding-bottom: 12px;
            border-bottom: 1px solid #EAEAE5;
          }
          .footer-col-group {
            border-bottom: 1px solid #EAEAE5;
            padding-bottom: 8px;
            margin-bottom: 0 !important;
          }
          .footer-accordion-trigger {
            cursor: pointer;
            padding: 8px 0;
            user-select: none;
          }
          .footer-chevron {
            display: inline-block !important;
          }
          .footer-links-list {
            display: none !important;
            padding-top: 4px;
            padding-bottom: 6px;
            gap: 8px !important;
          }
          .footer-links-list.is-open {
            display: flex !important;
            animation: footerExpand 0.2s ease-out forwards;
          }
          @keyframes footerExpand {
            from {
              opacity: 0;
              transform: translateY(-4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .footer-divider-line {
            display: none !important;
          }
          .footer-copyright-row {
            padding-top: 14px !important;
            margin-top: 0 !important;
          }
        }
      `}</style>
    </footer>
  );
}

// Inlined Style Tokens
const footerWrapperStyle = {
  backgroundColor: "#FFFFFF",
  borderTop: "1px solid #E7E7E2",
  padding: "40px 0 20px 0",
  width: "100%",
  marginTop: "auto",
  boxSizing: "border-box"
};

const footerInnerContainerStyle = {
  width: "100%",
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "0 40px",
  boxSizing: "border-box"
};

const footerGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.4fr 1fr 1fr 0.8fr",
  gap: "36px",
  alignItems: "flex-start",
  marginBottom: "28px"
};

const brandColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const logoButtonResetStyle = {
  border: "none",
  background: "none",
  padding: 0,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  alignSelf: "flex-start"
};

const logoImgStyle = {
  maxHeight: "42px",
  maxWidth: "180px",
  height: "auto",
  width: "auto",
  objectFit: "contain",
  display: "block"
};

const brandDescStyle = {
  fontSize: "13.5px",
  color: "#6B6B75",
  lineHeight: "1.6",
  margin: 0,
  maxWidth: "300px"
};

const socialsRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "4px"
};

const socialIconLinkStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  border: "1px solid #E7E7E2",
  backgroundColor: "#F7F7F2",
  color: "#6B6B75",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  cursor: "pointer"
};

const colNavStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px"
};

const colHeadingStyle = {
  fontSize: "15px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: 0,
  letterSpacing: "0.2px"
};

const linkListStyle = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const linkItemBtnStyle = {
  border: "none",
  background: "none",
  padding: 0,
  textAlign: "left",
  fontSize: "13.5px",
  color: "#6B6B75",
  cursor: "pointer",
  outline: "none",
  lineHeight: "1.4"
};

const dividerLineStyle = {
  height: "1px",
  backgroundColor: "#E7E7E2",
  width: "100%",
  marginBottom: "18px"
};

const copyrightRowStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  textAlign: "center"
};

const copyrightTextStyle = {
  fontSize: "13px",
  color: "#6B6B75",
  margin: 0
};

const modalBackdropStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(20, 21, 26, 0.5)",
  backdropFilter: "blur(4px)",
  zIndex: 3000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px"
};

const modalCardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "18px",
  padding: "28px 32px",
  maxWidth: "500px",
  width: "100%",
  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
  boxSizing: "border-box"
};

const modalHeaderRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "16px"
};

const modalTitleStyle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: 0
};

const modalCloseBtnStyle = {
  border: "none",
  backgroundColor: "#F7F7F2",
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer"
};

const modalBodyTextStyle = {
  fontSize: "14px",
  color: "#6B6B75",
  lineHeight: "1.6",
  whiteSpace: "pre-line",
  margin: "0 0 20px 0"
};

const modalDismissBtnStyle = {
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "999px",
  padding: "10px 24px",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  width: "100%"
};
