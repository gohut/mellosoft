"use client";

import React, { useState } from "react";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useStore } from "../context/StoreContext";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginView() {
  const { login, intendedView, setIntendedView } = useCustomerAuth();
  const { navigateTo } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = !emailTouched || email.trim() === "" || emailRegex.test(email.trim());
  const showEmailError = emailTouched && email.trim() !== "" && !emailRegex.test(email.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setEmailTouched(true);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await login(trimmedEmail, password);
      if (res.success) {
        // Navigate to intended destination or default to home
        const destination = intendedView && intendedView !== "login" ? intendedView : "home";
        setIntendedView("home");
        navigateTo(destination);
      } else {
        setErrorMessage(res.error || "Invalid email or password.");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Pre-fill helper for user convenience testing
  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage("");
    setEmailTouched(false);
  };

  return (
    <div style={pageWrapperStyle} className="login-page-wrapper">
      <div style={cardContainerStyle} className="login-card-container">
        
        {/* LEFT VISUAL PANEL */}
        <div style={leftPanelStyle} className="login-left-panel">
          <div style={overlayStyle} />
          
          <div style={panelTopStyle}>
            <div style={brandBadgeStyle}>
              <Sparkles size={14} color="#16A34A" />
              <span>Mellosoft Sleep Experience</span>
            </div>
          </div>

          <div style={panelMiddleStyle}>
            <h1 style={headlineStyle}>
              Sleep Better.<br />
              Wake Better.
            </h1>
            <p style={subheadStyle}>
              Premium comfort designed for better nights and brighter mornings.
            </p>
          </div>

          <div style={panelBottomStyle}>
            <div style={trustBadgeStyle}>
              <ShieldCheck size={16} color="#16A34A" />
              <span>100-Night Trial • Free Delivery • 10-Year Warranty</span>
            </div>
          </div>
        </div>

        {/* RIGHT LOGIN PANEL */}
        <div style={rightPanelStyle} className="login-right-panel">
          <div style={formHeaderStyle} className="login-form-header">
            <button 
              onClick={() => navigateTo("home")} 
              style={logoBtnStyle}
              className="login-logo-btn"
              aria-label="Mellosoft Home"
            >
              <img src="/asset/logo.png" alt="Mellosoft" style={logoImageStyle} className="login-logo-img" />
            </button>
            <h2 style={titleStyle} className="login-title">Welcome Back</h2>
            <p style={subtitleStyle} className="login-subtitle">Sign in to continue to your Mellosoft account.</p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div style={errorAlertStyle} role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={formStyle} className="login-form" noValidate>
            
            {/* EMAIL FIELD */}
            <div style={fieldGroupStyle}>
              <label htmlFor="login-email" style={labelStyle}>
                Email
              </label>
              <div style={inputWrapperStyle}>
                <Mail size={18} style={inputIconStyle} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="Enter your email"
                  style={{
                    ...inputStyle,
                    borderColor: showEmailError ? "#DC2626" : "#E7E7E2"
                  }}
                  required
                  autoComplete="email"
                />
              </div>
              {showEmailError && (
                <span style={fieldErrorStyle}>Please enter a valid email address.</span>
              )}
            </div>

            {/* PASSWORD FIELD */}
            <div style={fieldGroupStyle}>
              <div style={passwordLabelRowStyle}>
                <label htmlFor="login-password" style={labelStyle}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigateTo("forgot-password")}
                  style={forgotBtnStyle}
                  className="desktop-forgot-btn"
                >
                  Forgot password?
                </button>
              </div>
              <div style={inputWrapperStyle}>
                <Lock size={18} style={inputIconStyle} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={inputStyle}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeBtnStyle}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Mobile Forgot Password Link below password input */}
              <div className="mobile-forgot-row" style={{ display: "none" }}>
                <button
                  type="button"
                  onClick={() => navigateTo("forgot-password")}
                  style={forgotBtnStyle}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                ...submitBtnStyle,
                opacity: submitting ? 0.75 : 1,
                cursor: submitting ? "not-allowed" : "pointer"
              }}
              className="hover-lift login-submit-btn"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* QUICK DEMO USER SELECTION */}
          <div style={demoBoxStyle}>
            <span style={demoLabelStyle}>Quick Demo Login:</span>
            <div style={demoButtonsRowStyle}>
              <button
                type="button"
                onClick={() => fillDemoAccount("rahul@example.com", "Password123")}
                style={demoChipStyle}
              >
                Rahul Sharma (C001)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("priya@example.com", "Password123")}
                style={demoChipStyle}
              >
                Priya Patel (C002)
              </button>
            </div>
          </div>

          {/* SIGN UP FOOTER */}
          <div style={footerStyle}>
            <span style={footerTextStyle}>Don't have an account? </span>
            <button
              type="button"
              onClick={() => navigateTo("signup")}
              style={signupLinkStyle}
            >
              Create Account
            </button>
          </div>

        </div>

      </div>

      <style jsx global>{`
        .mobile-forgot-row {
          display: none;
        }

        @media (max-width: 768px) {
          .login-left-panel {
            display: none !important;
          }

          .login-page-wrapper {
            min-height: auto !important;
            background-color: #FFFFFF !important;
            padding: 28px 20px 48px 20px !important;
            display: block !important;
          }

          .login-card-container {
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            grid-template-columns: 1fr !important;
            background-color: #FFFFFF !important;
          }

          .login-right-panel {
            padding: 0 !important;
            background-color: #FFFFFF !important;
          }

          .login-logo-img {
            width: 120px !important;
            height: auto !important;
          }

          .login-logo-btn {
            margin-bottom: 24px !important;
          }

          .login-title {
            font-size: 34px !important;
            margin-bottom: 10px !important;
          }

          .login-subtitle {
            font-size: 16px !important;
            color: #6B6B75 !important;
          }

          .login-form-header {
            margin-bottom: 28px !important;
          }

          .login-form {
            gap: 16px !important;
          }

          .desktop-forgot-btn {
            display: none !important;
          }

          .mobile-forgot-row {
            display: flex !important;
            justify-content: flex-end !important;
            margin-top: 14px !important;
            margin-bottom: 6px !important;
          }

          .login-submit-btn {
            margin-top: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}

// Inline Style Definitions matching Mellosoft Brand Design System
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
  minHeight: "560px",
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
  fontSize: "36px",
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
  marginBottom: "20px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
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

const passwordLabelRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const forgotBtnStyle = {
  border: "none",
  background: "transparent",
  color: "#1B1F8C",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  padding: 0
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
  paddingRight: "44px",
  fontSize: "14px",
  color: "#14151A",
  outline: "none",
  transition: "all 0.2s ease"
};

const fieldErrorStyle = {
  fontSize: "12px",
  color: "#DC2626",
  marginTop: "4px"
};

const eyeBtnStyle = {
  position: "absolute",
  right: "12px",
  border: "none",
  background: "transparent",
  color: "#6B6B75",
  padding: "6px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const submitBtnStyle = {
  height: "48px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  fontSize: "15px",
  fontWeight: "700",
  border: "none",
  borderRadius: "999px",
  marginTop: "6px",
  boxShadow: "0 4px 14px rgba(27, 31, 140, 0.25)",
  transition: "all 0.2s ease"
};

const demoBoxStyle = {
  marginTop: "24px",
  padding: "12px 14px",
  backgroundColor: "#F7F7F2",
  borderRadius: "12px",
  border: "1px solid #E7E7E2",
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const demoLabelStyle = {
  fontSize: "11.5px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#6B6B75"
};

const demoButtonsRowStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap"
};

const demoChipStyle = {
  border: "1px solid #E7E7E2",
  backgroundColor: "#FFFFFF",
  color: "#1B1F8C",
  fontSize: "12px",
  fontWeight: "600",
  padding: "5px 10px",
  borderRadius: "8px",
  cursor: "pointer"
};

const footerStyle = {
  marginTop: "24px",
  textAlign: "center",
  fontSize: "14px"
};

const footerTextStyle = {
  color: "#6B6B75"
};

const signupLinkStyle = {
  border: "none",
  background: "transparent",
  color: "#1B1F8C",
  fontWeight: "700",
  fontSize: "14px",
  cursor: "pointer",
  padding: 0
};
