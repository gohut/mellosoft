"use client";

import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import { Mail, CheckCircle2, ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";

export default function ForgotPasswordView() {
  const { navigateTo } = useStore();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div style={pageWrapperStyle}>
      <div style={cardContainerStyle}>
        
        {/* LEFT VISUAL PANEL */}
        <div style={leftPanelStyle} className="login-left-panel">
          <div style={overlayStyle} />
          
          <div style={panelTopStyle}>
            <div style={brandBadgeStyle}>
              <Sparkles size={14} color="#16A34A" />
              <span>Mellosoft Customer Care</span>
            </div>
          </div>

          <div style={panelMiddleStyle}>
            <h1 style={headlineStyle}>
              Reset Your<br />
              Password safely.
            </h1>
            <p style={subheadStyle}>
              Enter your registered email address and we'll send you secure instructions to reset your account password.
            </p>
          </div>

          <div style={panelBottomStyle}>
            <div style={trustBadgeStyle}>
              <ShieldCheck size={16} color="#16A34A" />
              <span>Encrypted • Safe • 24/7 Account Support</span>
            </div>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div style={rightPanelStyle}>
          <div style={formHeaderStyle}>
            <button 
              onClick={() => navigateTo("home")} 
              style={logoBtnStyle}
              aria-label="Mellosoft Home"
            >
              <img src="/asset/logo.png" alt="Mellosoft" style={logoImageStyle} />
            </button>
            <h2 style={titleStyle}>Forgot Password</h2>
            <p style={subtitleStyle}>No worries! Enter your email to recover access.</p>
          </div>

          {submitted ? (
            <div style={successBoxStyle}>
              <CheckCircle2 size={42} color="#16A34A" />
              <h3 style={successTitleStyle}>Password Reset Email Sent</h3>
              <p style={successTextStyle}>
                If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.
              </p>
              <button
                type="button"
                onClick={() => navigateTo("login")}
                style={submitBtnStyle}
                className="hover-lift"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={formStyle} noValidate>
              {error && (
                <div style={errorAlertStyle}>
                  {error}
                </div>
              )}

              <div style={fieldGroupStyle}>
                <label htmlFor="reset-email" style={labelStyle}>
                  Registered Email
                </label>
                <div style={inputWrapperStyle}>
                  <Mail size={18} style={inputIconStyle} />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...submitBtnStyle,
                  opacity: submitting ? 0.75 : 1,
                  cursor: submitting ? "not-allowed" : "pointer"
                }}
                className="hover-lift"
              >
                {submitting ? "Sending Link..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                onClick={() => navigateTo("login")}
                style={backToLoginStyle}
              >
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

const pageWrapperStyle = {
  minHeight: "calc(100vh - 76px)",
  backgroundColor: "#F7F7F2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 16px"
};

const cardContainerStyle = {
  maxWidth: "1000px",
  width: "100%",
  backgroundColor: "#FFFFFF",
  borderRadius: "24px",
  border: "1px solid #E7E7E2",
  boxShadow: "0 20px 50px rgba(27, 31, 140, 0.07), 0 4px 16px rgba(0, 0, 0, 0.03)",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  overflow: "hidden"
};

const leftPanelStyle = {
  position: "relative",
  minHeight: "520px",
  backgroundImage: "url('/asset/img1.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "40px"
};

const overlayStyle = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(160deg, rgba(27, 31, 140, 0.82) 0%, rgba(20, 21, 26, 0.92) 100%)",
  zIndex: 1
};

const panelTopStyle = {
  position: "relative",
  zIndex: 2
};

const brandBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  backgroundColor: "rgba(255, 255, 255, 0.12)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  color: "#FFFFFF",
  fontSize: "12px",
  fontWeight: "600",
  padding: "6px 14px",
  borderRadius: "999px"
};

const panelMiddleStyle = {
  position: "relative",
  zIndex: 2,
  margin: "32px 0"
};

const headlineStyle = {
  fontSize: "34px",
  fontWeight: "800",
  color: "#FFFFFF",
  lineHeight: "1.15",
  letterSpacing: "-0.02em",
  margin: "0 0 16px 0"
};

const subheadStyle = {
  fontSize: "15px",
  color: "rgba(255, 255, 255, 0.85)",
  lineHeight: "1.6",
  margin: 0,
  maxWidth: "340px"
};

const panelBottomStyle = {
  position: "relative",
  zIndex: 2
};

const trustBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  backgroundColor: "rgba(22, 163, 74, 0.15)",
  border: "1px solid rgba(22, 163, 74, 0.3)",
  color: "#FFFFFF",
  fontSize: "12px",
  fontWeight: "600",
  padding: "8px 16px",
  borderRadius: "999px",
  backdropFilter: "blur(8px)"
};

const rightPanelStyle = {
  padding: "44px 40px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  backgroundColor: "#FFFFFF"
};

const formHeaderStyle = {
  marginBottom: "24px"
};

const logoBtnStyle = {
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  marginBottom: "20px",
  display: "inline-block"
};

const logoImageStyle = {
  height: "32px",
  width: "auto",
  objectFit: "contain"
};

const titleStyle = {
  fontSize: "26px",
  fontWeight: "800",
  color: "#14151A",
  letterSpacing: "-0.02em",
  margin: "0 0 6px 0"
};

const subtitleStyle = {
  fontSize: "14px",
  color: "#6B6B75",
  margin: 0
};

const errorAlertStyle = {
  backgroundColor: "#FEF2F2",
  border: "1px solid #FCA5A5",
  borderRadius: "12px",
  padding: "12px 16px",
  marginBottom: "16px",
  color: "#991B1B",
  fontSize: "13.5px",
  fontWeight: "500"
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

const labelStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#14151A"
};

const inputWrapperStyle = {
  position: "relative",
  display: "flex",
  alignItems: "center"
};

const inputIconStyle = {
  position: "absolute",
  left: "14px",
  color: "#6B6B75",
  pointerEvents: "none"
};

const inputStyle = {
  width: "100%",
  height: "48px",
  backgroundColor: "#FAFAF7",
  border: "1px solid #E7E7E2",
  borderRadius: "12px",
  paddingLeft: "42px",
  paddingRight: "14px",
  fontSize: "14px",
  color: "#14151A",
  outline: "none"
};

const submitBtnStyle = {
  height: "48px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  fontSize: "15px",
  fontWeight: "700",
  border: "none",
  borderRadius: "999px",
  boxShadow: "0 4px 14px rgba(27, 31, 140, 0.25)",
  transition: "all 0.2s ease"
};

const backToLoginStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  border: "none",
  background: "transparent",
  color: "#6B6B75",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "8px"
};

const successBoxStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  padding: "20px 0",
  gap: "16px"
};

const successTitleStyle = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#14151A",
  margin: 0
};

const successTextStyle = {
  fontSize: "14px",
  color: "#6B6B75",
  lineHeight: "1.5",
  margin: 0
};
