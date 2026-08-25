"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../context/StoreContext";
import { X } from "lucide-react";

export default function Footer() {
  const { navigateTo, setActiveFilters } = useStore();
  const router = useRouter();

  // Info Modal state (for Contact, Policy, etc.)
  const [modalContent, setModalContent] = useState(null);

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
      <div style={footerInnerContainerStyle}>
        {/* FOUR COLUMN GRID */}
        <div style={footerGridStyle} className="footer-columns-grid">
          
          {/* COLUMN 1: BRAND */}
          <div style={brandColStyle} className="footer-brand-col">
            <button
              onClick={() => handleNavClick("home")}
              style={logoButtonResetStyle}
              aria-label="Mellosoft Home"
            >
              <img src="/asset/logo.png" alt="Mellosoft" style={logoImgStyle} />
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

              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                style={socialIconLinkStyle}
                className="social-icon-btn"
                aria-label="Twitter / X"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
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

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                style={socialIconLinkStyle}
                className="social-icon-btn"
                aria-label="LinkedIn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <nav style={colNavStyle} aria-label="Quick Links">
            <h4 style={colHeadingStyle}>Quick Links</h4>
            <ul style={linkListStyle}>
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
          </nav>

          {/* COLUMN 3: CUSTOMER SERVICE */}
          <nav style={colNavStyle} aria-label="Customer Service">
            <h4 style={colHeadingStyle}>Customer Service</h4>
            <ul style={linkListStyle}>
              <li>
                <button
                  onClick={() =>
                    openInfoModal(
                      "Customer Support",
                      "Our sleep specialists are available to help you select the ideal mattress and variant for your sleep profile."
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
                      "Enjoy free contactless doorstep shipping across India on orders above ₹5,000. Hassle-free 100-night trial returns with complimentary pickup."
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
          </nav>

          {/* COLUMN 4: LEGAL */}
          <nav style={colNavStyle} aria-label="Legal">
            <h4 style={colHeadingStyle}>Legal</h4>
            <ul style={linkListStyle}>
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
          </nav>

        </div>

        {/* 5. FOOTER DIVIDER */}
        <div style={dividerLineStyle} />

        {/* 6. COPYRIGHT SECTION */}
        <div style={copyrightRowStyle}>
          <p style={copyrightTextStyle}>
            © 2026 Mellosoft. All rights reserved.
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

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .footer-columns-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 40px 32px !important;
          }
        }

        @media (max-width: 640px) {
          .footer-columns-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .storefront-footer {
            padding: 40px 0 24px 0 !important;
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
  padding: "56px 0 28px 0",
  width: "100%",
  marginTop: "auto",
  boxSizing: "border-box"
};

const footerInnerContainerStyle = {
  width: "100%",
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "0 48px",
  boxSizing: "border-box"
};

const footerGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.4fr 1fr 1fr 0.8fr",
  gap: "48px",
  alignItems: "flex-start",
  marginBottom: "48px"
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
  height: "36px",
  width: "auto",
  objectFit: "contain"
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
  marginBottom: "24px"
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
