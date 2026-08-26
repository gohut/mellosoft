"use client";

import React, { useState, useEffect } from "react";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useStore } from "../context/StoreContext";
import { getResolvedImageUrlSync } from "../utils/imageStorage";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowLeft
} from "lucide-react";

export default function AuthModal({ type = "login", onClose }) {
  const { login, signup, intendedView, setIntendedView } = useCustomerAuth();
  const { navigateTo, closeAuthModal, settings } = useStore();

  const [activeModal, setActiveModal] = useState(type); // "login" | "signup" | "forgot-password"

  // Update activeModal if prop changes
  useEffect(() => {
    setActiveModal(type);
  }, [type]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (closeAuthModal) {
      closeAuthModal();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Lock body scroll while modal is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div style={overlayStyle} onClick={handleOverlayClick} className="auth-modal-overlay">
      <div style={modalCardStyle} className="auth-modal-card">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          style={closeBtnStyle}
          className="auth-close-btn"
          aria-label="Close modal"
        >
          <X size={20} color="#6B6B75" />
        </button>

        {activeModal === "login" && (
          <LoginForm
            onSwitchToSignup={() => setActiveModal("signup")}
            onSwitchToForgot={() => setActiveModal("forgot-password")}
            onSuccess={() => {
              handleClose();
              const destination = intendedView && intendedView !== "login" && intendedView !== "signup" ? intendedView : null;
              setIntendedView("home");
              if (destination) {
                navigateTo(destination);
              }
            }}
          />
        )}

        {activeModal === "signup" && (
          <SignupForm
            onSwitchToLogin={() => setActiveModal("login")}
            onSuccess={() => {
              handleClose();
              const destination = intendedView && intendedView !== "login" && intendedView !== "signup" ? intendedView : null;
              setIntendedView("home");
              if (destination) {
                navigateTo(destination);
              }
            }}
          />
        )}

        {activeModal === "forgot-password" && (
          <ForgotPasswordForm
            onSwitchToLogin={() => setActiveModal("login")}
          />
        )}
      </div>

      <style jsx global>{`
        @keyframes authOverlayFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes authModalPop {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .auth-modal-overlay {
          animation: authOverlayFade 0.2s ease-out forwards;
        }
        .auth-modal-card {
          animation: authModalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .auth-close-btn:hover {
          background-color: #E7E7E2 !important;
          color: #14151A !important;
        }
        .auth-chip-btn:hover {
          border-color: #1B1F8C !important;
          background-color: #E8E9F8 !important;
        }
        @media (max-width: 480px) {
          .auth-modal-card {
            padding: 28px 20px 24px 20px !important;
            border-radius: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LOGIN FORM COMPONENT (Popup Version)
   ───────────────────────────────────────────────────────────── */
function LoginForm({ onSwitchToSignup, onSwitchToForgot, onSuccess }) {
  const { login } = useCustomerAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
        onSuccess();
      } else {
        setErrorMessage(res.error || "Invalid email or password.");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage("");
    setEmailTouched(false);
  };

  return (
    <div>
      {/* Header / Logo */}
      <div style={headerSectionStyle}>
        <img
          src={getResolvedImageUrlSync(settings?.website?.logo, "/asset/logo.png")}
          alt={settings?.store?.name || "Mellosoft"}
          style={logoImageStyle}
          onError={(e) => { e.currentTarget.src = "/asset/logo.png"; }}
        />
        <h2 style={titleStyle}>Welcome Back</h2>
        <p style={subtitleStyle}>Sign in to continue to your {settings?.store?.name || "Mellosoft"} account.</p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div style={errorAlertStyle} role="alert">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={formStyle} noValidate>
        {/* Email Field */}
        <div style={fieldGroupStyle}>
          <label htmlFor="modal-login-email" style={labelStyle}>
            Email
          </label>
          <div style={inputWrapperStyle}>
            <Mail size={18} style={inputIconStyle} />
            <input
              id="modal-login-email"
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

        {/* Password Field */}
        <div style={fieldGroupStyle}>
          <div style={passwordLabelRowStyle}>
            <label htmlFor="modal-login-password" style={labelStyle}>
              Password
            </label>
            <button
              type="button"
              onClick={onSwitchToForgot}
              style={forgotBtnStyle}
            >
              Forgot password?
            </button>
          </div>
          <div style={inputWrapperStyle}>
            <Lock size={18} style={inputIconStyle} />
            <input
              id="modal-login-password"
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
        </div>

        {/* Submit Button */}
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
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Quick Demo User Section */}
      <div style={demoBoxStyle}>
        <span style={demoLabelStyle}>Quick Demo Login:</span>
        <div style={demoButtonsRowStyle}>
          <button
            type="button"
            onClick={() => fillDemoAccount("rahul@example.com", "Password123")}
            style={demoChipStyle}
            className="auth-chip-btn"
          >
            Rahul Sharma (C001)
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount("priya@example.com", "Password123")}
            style={demoChipStyle}
            className="auth-chip-btn"
          >
            Priya Patel (C002)
          </button>
        </div>
      </div>

      {/* Switch to Signup Footer */}
      <div style={footerStyle}>
        <span style={footerTextStyle}>Don't have an account? </span>
        <button
          type="button"
          onClick={onSwitchToSignup}
          style={switchLinkStyle}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SIGNUP FORM COMPONENT (Popup Version)
   ───────────────────────────────────────────────────────────── */
function SignupForm({ onSwitchToLogin, onSuccess }) {
  const { signup } = useCustomerAuth();

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
      const res = await signup({ name, email, phone, password });
      if (res.success) {
        onSuccess();
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
    <div>
      <div style={headerSectionStyle}>
        <img
          src={getResolvedImageUrlSync(settings?.website?.logo, "/asset/logo.png")}
          alt={settings?.store?.name || "Mellosoft"}
          style={logoImageStyle}
          onError={(e) => { e.currentTarget.src = "/asset/logo.png"; }}
        />
        <h2 style={titleStyle}>Create Account</h2>
        <p style={subtitleStyle}>Sign up to begin your {settings?.store?.name || "Mellosoft"} luxury sleep experience.</p>
      </div>

      {errorMessage && (
        <div style={errorAlertStyle} role="alert">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={formStyle} noValidate>
        {/* Full Name */}
        <div style={fieldGroupStyle}>
          <label htmlFor="modal-signup-name" style={labelStyle}>Full Name</label>
          <div style={inputWrapperStyle}>
            <User size={18} style={inputIconStyle} />
            <input
              id="modal-signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              style={inputStyle}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div style={fieldGroupStyle}>
          <label htmlFor="modal-signup-email" style={labelStyle}>Email Address</label>
          <div style={inputWrapperStyle}>
            <Mail size={18} style={inputIconStyle} />
            <input
              id="modal-signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={inputStyle}
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div style={fieldGroupStyle}>
          <label htmlFor="modal-signup-phone" style={labelStyle}>Phone Number (Optional)</label>
          <div style={inputWrapperStyle}>
            <Phone size={18} style={inputIconStyle} />
            <input
              id="modal-signup-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Password */}
        <div style={fieldGroupStyle}>
          <label htmlFor="modal-signup-password" style={labelStyle}>Password</label>
          <div style={inputWrapperStyle}>
            <Lock size={18} style={inputIconStyle} />
            <input
              id="modal-signup-password"
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
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div style={fieldGroupStyle}>
          <label htmlFor="modal-confirm-password" style={labelStyle}>Confirm Password</label>
          <div style={inputWrapperStyle}>
            <Lock size={18} style={inputIconStyle} />
            <input
              id="modal-confirm-password"
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
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {password && confirmPassword && (
            <div
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

      <div style={footerStyle}>
        <span style={footerTextStyle}>Already have an account? </span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          style={switchLinkStyle}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FORGOT PASSWORD FORM COMPONENT (Popup Version)
   ───────────────────────────────────────────────────────────── */
function ForgotPasswordForm({ onSwitchToLogin }) {
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
    <div>
      <div style={headerSectionStyle}>
        <img
          src={getResolvedImageUrlSync(settings?.website?.logo, "/asset/logo.png")}
          alt={settings?.store?.name || "Mellosoft"}
          style={logoImageStyle}
          onError={(e) => { e.currentTarget.src = "/asset/logo.png"; }}
        />
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
            onClick={onSwitchToLogin}
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
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div style={fieldGroupStyle}>
            <label htmlFor="modal-reset-email" style={labelStyle}>
              Registered Email
            </label>
            <div style={inputWrapperStyle}>
              <Mail size={18} style={inputIconStyle} />
              <input
                id="modal-reset-email"
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
            onClick={onSwitchToLogin}
            style={backToLoginStyle}
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </button>
        </form>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   INLINE STYLES FOR AUTH MODAL (Mellosoft Brand Aesthetics)
   ───────────────────────────────────────────────────────────── */

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.45)",
  backdropFilter: "blur(4px)",
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px"
};

const modalCardStyle = {
  position: "relative",
  width: "100%",
  maxWidth: "480px",
  maxHeight: "90vh",
  overflowY: "auto",
  backgroundColor: "#FFFFFF",
  borderRadius: "24px",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.08)",
  padding: "36px 32px 32px 32px",
  zIndex: 2001
};

const closeBtnStyle = {
  position: "absolute",
  top: "18px",
  right: "18px",
  width: "36px",
  height: "36px",
  borderRadius: "999px",
  border: "none",
  backgroundColor: "#F7F7F2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.15s ease",
  zIndex: 10
};

const headerSectionStyle = {
  textAlign: "center",
  marginBottom: "24px"
};

const logoImageStyle = {
  width: "120px",
  height: "auto",
  objectFit: "contain",
  margin: "0 auto 16px auto",
  display: "block"
};

const titleStyle = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#14151A",
  letterSpacing: "-0.02em",
  margin: "0 0 6px 0",
  textAlign: "center"
};

const subtitleStyle = {
  fontSize: "15px",
  color: "#6B6B75",
  margin: 0,
  textAlign: "center",
  lineHeight: "1.4"
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
  height: "52px",
  backgroundColor: "#FAFAF7",
  border: "1px solid #E7E7E2",
  borderRadius: "14px",
  paddingLeft: "44px",
  paddingRight: "44px",
  fontSize: "14px",
  color: "#14151A",
  outline: "none",
  transition: "all 0.2s ease"
};

const fieldErrorStyle = {
  fontSize: "12px",
  color: "#DC2626",
  marginTop: "2px"
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
  width: "100%",
  height: "54px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  fontSize: "16px",
  fontWeight: "700",
  border: "none",
  borderRadius: "28px",
  marginTop: "8px",
  boxShadow: "0 4px 14px rgba(27, 31, 140, 0.25)",
  transition: "all 0.2s ease"
};

const demoBoxStyle = {
  marginTop: "20px",
  padding: "12px 14px",
  backgroundColor: "#F7F7F2",
  borderRadius: "14px",
  border: "1px solid #E7E7E2",
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const demoLabelStyle = {
  fontSize: "11px",
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
  padding: "6px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  transition: "all 0.15s ease"
};

const footerStyle = {
  marginTop: "20px",
  textAlign: "center",
  fontSize: "14px"
};

const footerTextStyle = {
  color: "#6B6B75"
};

const switchLinkStyle = {
  border: "none",
  background: "transparent",
  color: "#1B1F8C",
  fontWeight: "700",
  fontSize: "14px",
  cursor: "pointer",
  padding: 0
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
  marginTop: "12px",
  width: "100%"
};

const successBoxStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  padding: "16px 0",
  gap: "14px"
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
