import React from "react";
import { useStore } from "../context/StoreContext";

export default function Footer() {
  const { navigateTo, setActiveFilters } = useStore();

  const handleCategoryClick = (category) => {
    setActiveFilters((prev) => ({
      ...prev,
      category,
      firmness: "All",
      size: "All",
      sort: "Recommended"
    }));
    navigateTo("catalog");
  };

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        
        {/* Brand Block */}
        <div style={brandBlockStyle}>
          <div onClick={() => navigateTo("home")} style={logoContainerStyle}>
            <img src="/asset/logo.png" alt="Mellosoft" style={logoImageStyle} />
          </div>
          <p style={taglineStyle}>Sleep in luxury... Wake up refreshed...</p>
          <p style={descriptionStyle}>
            Crafting premium, sleep-engineered mattresses and bedding products using natural materials and responsive foam technology.
          </p>
        </div>

        {/* Link Columns */}
        <div style={linksGridStyle}>
          <div style={columnStyle}>
            <h5 style={columnHeaderStyle}>Shop</h5>
            <button onClick={() => handleCategoryClick("mattress")} style={linkBtnStyle}>Mattresses</button>
            <button onClick={() => handleCategoryClick("pillows")} style={linkBtnStyle}>Pillows</button>
            <button onClick={() => handleCategoryClick("bed frames")} style={linkBtnStyle}>Bed Frames</button>
            <button onClick={() => handleCategoryClick("protectors")} style={linkBtnStyle}>Protectors</button>
          </div>

          <div style={columnStyle}>
            <h5 style={columnHeaderStyle}>Company</h5>
            <button onClick={() => navigateTo("home")} style={linkBtnStyle}>About Us</button>
            <button onClick={() => navigateTo("home")} style={linkBtnStyle}>Sustainability</button>
            <button onClick={() => navigateTo("home")} style={linkBtnStyle}>Press</button>
            <button onClick={() => navigateTo("home")} style={linkBtnStyle}>Careers</button>
          </div>

          <div style={columnStyle}>
            <h5 style={columnHeaderStyle}>Support</h5>
            <button style={linkBtnStyle}>100-Night Trial</button>
            <button style={linkBtnStyle}>Warranty Info</button>
            <button style={linkBtnStyle}>FAQs</button>
            <button style={linkBtnStyle}>Contact Us</button>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={bottomRowStyle}>
        <div style={bottomContainerStyle}>
          <p style={copyrightStyle}>
            © {new Date().getFullYear()} Mellosoft Inc. All rights reserved.
          </p>
          
          {/* Payment Badges */}
          <div style={paymentBadgesStyle}>
            {/* Visa */}
            <span style={badgeItemStyle}>Visa</span>
            {/* Mastercard */}
            <span style={badgeItemStyle}>Mastercard</span>
            {/* Amex */}
            <span style={badgeItemStyle}>Amex</span>
            {/* Apple Pay */}
            <span style={badgeItemStyle}>Apple Pay</span>
            {/* Shop Pay */}
            <span style={badgeItemStyle}>Shop Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const footerStyle = {
  backgroundColor: "#FFFFFF",
  borderTop: "1px solid #E7E7E2",
  padding: "60px 0 20px 0",
  width: "100%",
  marginTop: "auto"
};

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 24px",
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: "40px",
  marginBottom: "40px"
};

const brandBlockStyle = {
  flex: "1 1 320px",
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const logoContainerStyle = {
  display: "flex",
  alignItems: "center",
  cursor: "pointer"
};

const logoImageStyle = {
  height: "48px",
  width: "auto"
};

const taglineStyle = {
  fontSize: "14px",
  fontWeight: "600",
  fontStyle: "italic",
  color: "#16A34A"
};

const descriptionStyle = {
  fontSize: "13.5px",
  color: "#6B6B75",
  lineHeight: "1.6",
  maxWidth: "280px"
};

const linksGridStyle = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  gap: "60px",
  flex: "2 1 400px",
  justifyContent: "flex-end"
};

const columnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  minWidth: "120px"
};

const columnHeaderStyle = {
  fontSize: "14px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#1B1F8C",
  marginBottom: "4px"
};

const linkBtnStyle = {
  border: "none",
  background: "none",
  textAlign: "left",
  fontSize: "13.5px",
  color: "#6B6B75",
  cursor: "pointer",
  padding: "2px 0",
  transition: "color 0.2s ease",
  outline: "none"
};

const bottomRowStyle = {
  borderTop: "1px solid #E7E7E2",
  paddingTop: "24px"
};

const bottomContainerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 24px",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "16px"
};

const copyrightStyle = {
  fontSize: "12px",
  color: "#6B6B75"
};

const paymentBadgesStyle = {
  display: "flex",
  gap: "8px",
  alignItems: "center"
};

const badgeItemStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "#6B6B75",
  backgroundColor: "#F7F7F2",
  padding: "4px 8px",
  borderRadius: "4px",
  border: "1px solid #E7E7E2"
};