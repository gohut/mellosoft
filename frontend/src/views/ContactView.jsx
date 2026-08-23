"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";

export default function ContactView() {
  const { searchQuery } = useStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    message: ""
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const prod = params.get("product");
      const cat = params.get("category");
      const thick = params.get("thickness");
      const size = params.get("size");

      if (prod) {
        let msg = `Hi, I would like to know the price and availability of the Mellosoft ${prod}`;
        if (cat) msg += ` ${cat}`;
        if (thick) msg += `, ${thick} thickness`;
        if (size) msg += `, size ${size}`;
        msg += `.`;
        setFormData((prev) => ({ ...prev, message: msg }));
      } else if (searchQuery) {
        setFormData((prev) => ({ ...prev, message: `Inquiry regarding: ${searchQuery}` }));
      }
    }
  }, [searchQuery]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9+\-\s]{8,15}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Please enter a valid mobile number";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
      setFormData({ name: "", email: "", mobile: "", message: "" });
      setErrors({});
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerSectionStyle}>
        <h1 style={titleStyle}>CONTACT US</h1>
        <p style={subtitleStyle}>
          We’d Love to Hear From You! Our dedicated team is always ready to assist with product inquiries, pricing, custom sizes, or orders.
        </p>
      </div>

      <div style={contentGridStyle}>
        {/* CONTACT INFO CARD */}
        <div style={infoCardStyle}>
          <h2 style={infoTitleStyle}>Get In Touch</h2>
          <p style={infoDescStyle}>
            Whether it’s a quick product inquiry or custom dimension order, we’re here to make your experience seamless.
          </p>

          <div style={detailListStyle}>
            <div style={detailItemStyle}>
              <div style={iconWrapStyle}>📞</div>
              <div>
                <span style={detailLabelStyle}>Phone</span>
                <a href="tel:+919500260892" style={detailValueLinkStyle}>
                  +91 9500260892
                </a>
              </div>
            </div>

            <div style={detailItemStyle}>
              <div style={iconWrapStyle}>✉️</div>
              <div>
                <span style={detailLabelStyle}>Email</span>
                <a href="mailto:info@mellosoftmattress.com" style={detailValueLinkStyle}>
                  info@mellosoftmattress.com
                </a>
              </div>
            </div>

            <div style={detailItemStyle}>
              <div style={iconWrapStyle}>⏰</div>
              <div>
                <span style={detailLabelStyle}>Business Hours</span>
                <span style={detailValueStyle}>9:30 AM – 6:30 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTACT FORM */}
        <div style={formCardStyle}>
          {submitted ? (
            <div style={successBoxStyle}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>✅</div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#16A34A" }}>Enquiry Sent Successfully!</h3>
              <p style={{ color: "#6B6B75", marginTop: "8px" }}>
                Thank you for contacting Mellosoft Mattress. Our sleep specialist will contact you with pricing and assistance shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                style={resetBtnStyle}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={formStyle} noValidate>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#14151A", marginBottom: "16px" }}>
                Send Product Enquiry
              </h2>

              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  style={{
                    ...inputStyle,
                    borderColor: errors.name ? "#DC2626" : "#E7E7E2"
                  }}
                />
                {errors.name && <span style={errorTextStyle}>{errors.name}</span>}
              </div>

              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  style={{
                    ...inputStyle,
                    borderColor: errors.email ? "#DC2626" : "#E7E7E2"
                  }}
                />
                {errors.email && <span style={errorTextStyle}>{errors.email}</span>}
              </div>

              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Mobile Number *</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="+91 9500260892"
                  style={{
                    ...inputStyle,
                    borderColor: errors.mobile ? "#DC2626" : "#E7E7E2"
                  }}
                />
                {errors.mobile && <span style={errorTextStyle}>{errors.mobile}</span>}
              </div>

              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Message *</label>
                <textarea
                  rows="5"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Hi, I would like to know the price and availability of..."
                  style={{
                    ...inputStyle,
                    borderColor: errors.message ? "#DC2626" : "#E7E7E2",
                    resize: "vertical"
                  }}
                />
                {errors.message && <span style={errorTextStyle}>{errors.message}</span>}
              </div>

              <button type="submit" style={submitBtnStyle}>
                Send Enquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "48px 24px 80px"
};

const headerSectionStyle = {
  textAlign: "center",
  marginBottom: "48px"
};

const titleStyle = {
  fontSize: "36px",
  fontWeight: "800",
  letterSpacing: "1px",
  color: "#1B1F8C"
};

const subtitleStyle = {
  fontSize: "16px",
  color: "#6B6B75",
  maxWidth: "640px",
  margin: "12px auto 0",
  lineHeight: "1.6"
};

const contentGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "32px",
  alignItems: "start"
};

const infoCardStyle = {
  backgroundColor: "#F7F7F2",
  borderRadius: "20px",
  padding: "36px",
  border: "1px solid #E7E7E2"
};

const infoTitleStyle = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#14151A",
  marginBottom: "12px"
};

const infoDescStyle = {
  fontSize: "14px",
  color: "#6B6B75",
  lineHeight: "1.6",
  marginBottom: "32px"
};

const detailListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px"
};

const detailItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px"
};

const iconWrapStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  backgroundColor: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
};

const detailLabelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "600",
  color: "#6B6B75"
};

const detailValueStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#14151A"
};

const detailValueLinkStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#1B1F8C",
  textDecoration: "none"
};

const formCardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  padding: "36px",
  border: "1px solid #E7E7E2",
  boxShadow: "0 10px 30px rgba(0,0,0,0.03)"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const fieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px"
};

const fieldLabelStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#14151A"
};

const inputStyle = {
  padding: "12px 16px",
  borderRadius: "10px",
  border: "1px solid #E7E7E2",
  fontSize: "14px",
  outline: "none",
  transition: "border 0.2s ease"
};

const errorTextStyle = {
  fontSize: "12px",
  color: "#DC2626",
  fontWeight: "500"
};

const submitBtnStyle = {
  padding: "14px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  marginTop: "10px",
  transition: "opacity 0.2s ease"
};

const successBoxStyle = {
  textAlign: "center",
  padding: "24px 0"
};

const resetBtnStyle = {
  marginTop: "20px",
  padding: "10px 20px",
  backgroundColor: "#F7F7F2",
  color: "#1B1F8C",
  border: "1px solid #E7E7E2",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer"
};
