"use client";

import React, { useState } from "react";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useStore } from "../context/StoreContext";
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function SignupView() {
  const { signup, intendedView, setIntendedView } = useCustomerAuth();
  const { navigateTo } = useStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter a password.");
      return;
    }

    if (!confirmPassword) {
      setErrorMessage("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await signup({
        name,
        email,
        phone,
        password
      });

      if (res.success) {
        const destination = intendedView && intendedView !== "signup" ? intendedView : "home";
        setIntendedView("home");
        navigateTo(destination);
      } else {
        setErrorMessage(res.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
              <span>Join Mellosoft Club</span>
            </div>
          </div>

          <div style={panelMiddleStyle}>
            <h1 style={headlineStyle}>
              Start Your Journey<br />
              to Better Sleep.
            </h1>
            <p style={subheadStyle}>
              Create your account to track orders, save favorite mattresses, and unlock exclusive sleep member rewards.
            </p>
          </div>

          <div style={panelBottomStyle}>
            <div style={trustBadgeStyle}>
              <ShieldCheck size={16} color="#16A34A" />
              <span>Free Delivery • 100-Night Trial • Easy Returns</span>
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
            <h2 style={titleStyle}>Create Account</h2>
            <p style={subtitleStyle}>Sign up to begin your Mellosoft luxury sleep experience.</p>
          </div>

          {errorMessage && (
            <div style={errorAlertStyle} role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={formStyle} noValidate>
            
            {/* FULL NAME */}
            <div style={fieldGroupStyle}>
              <label htmlFor="signup-name" style={labelStyle}>
                Full Name
              </label>
              <div style={inputWrapperStyle}>
                <User size={18} style={inputIconStyle} />
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div style={fieldGroupStyle}>
              <label htmlFor="signup-email" style={labelStyle}>
                Email Address
              </label>
              <div style={inputWrapperStyle}>
                <Mail size={18} style={inputIconStyle} />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            {/* PHONE */}
            <div style={fieldGroupStyle}>
              <label htmlFor="signup-phone" style={labelStyle}>
                Phone Number (Optional)
              </label>
              <div style={inputWrapperStyle}>
                <Phone size={18} style={inputIconStyle} />
                <input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div style={fieldGroupStyle}>
              <label htmlFor="signup-password" style={labelStyle}>
                Password
              </label>
              <div style={inputWrapperStyle}>
                <Lock size={18} style={inputIconStyle} />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  style={inputStyle}
                  required
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
            </div>

            {/* CONFIRM PASSWORD */}
            <div style={fieldGroupStyle}>
              <label htmlFor="confirm-password" style={labelStyle}>
                Confirm Password
              </label>
              <div style={inputWrapperStyle}>
                <Lock size={18} style={inputIconStyle} />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  style={inputStyle}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={eyeBtnStyle}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && confirmPassword && (
                <div 
                  aria-live="polite" 
                  style={{ 
                    fontSize: "12px", 
                    marginTop: "4px", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "4px",
                    fontWeight: "500",
                    color: password === confirmPassword ? "#16A34A" : "#DC2626"
                  }}
                >
                  {password === confirmPassword ? (
                    <>
                      <CheckCircle2 size={14} color="#16A34A" />
                      <span>Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} color="#DC2626" />
                      <span>Passwords do not match.</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
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
              {submitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* LOGIN FOOTER */}
          <div style={footerStyle}>
            <span style={footerTextStyle}>Already have an account? </span>
            <button
              type="button"
              onClick={() => navigateTo("login")}
              style={signupLinkStyle}
            >
              Sign In
            </button>
          </div>

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
  minHeight: "580px",
  backgroundImage: "url('/asset/img2.jpg')",
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
  gap: "16px"
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
  height: "46px",
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
  marginTop: "10px",
  boxShadow: "0 4px 14px rgba(27, 31, 140, 0.25)",
  transition: "all 0.2s ease"
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
