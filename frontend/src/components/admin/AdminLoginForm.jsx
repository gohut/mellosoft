"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../context/AdminAuthContext";

// ─── Eye icons (inline SVG, zero dependency) ─────────────────────────────────
function EyeIcon({ size = 18, color = "#6B6B75" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ size = 18, color = "#6B6B75" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: "loginSpin 0.8s linear infinite" }}>
      <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
      <path d="M9 2 A7 7 0 0 1 16 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminLoginForm() {
  const { login } = useAdminAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isLoading) return;

      setError("");

      // Basic client-side validation
      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }
      if (!password) {
        setError("Please enter your password.");
        return;
      }

      setIsLoading(true);
      try {
        const result = await login(email, password);
        if (result.success) {
          router.replace("/admin");
        } else {
          setError(result.error || "Invalid email or password.");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, isLoading, login, router]
  );

  const inputStyle = (focused) => ({
    width: "100%",
    height: "48px",
    border: `1.5px solid ${focused ? "#1B1F8C" : error ? "#DC2626" : "#E7E7E2"}`,
    borderRadius: "12px",
    padding: "0 16px",
    fontSize: "14px",
    color: "#14151A",
    backgroundColor: "#FAFAF7",
    fontFamily: "Inter, -apple-system, sans-serif",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxShadow: focused ? "0 0 0 3px rgba(27,31,140,0.08)" : "none",
  });

  return (
    <div style={pageWrapStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        @keyframes loginSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes loginFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes loginShake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-6px); }
          40%     { transform: translateX(6px); }
          60%     { transform: translateX(-4px); }
          80%     { transform: translateX(4px); }
        }
        .login-card { animation: loginFadeUp 0.45s cubic-bezier(0.16,1,0.3,1) forwards; }
        .login-error { animation: loginShake 0.45s ease; }
        .login-input-wrap { position: relative; }
        .login-pw-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: background 0.15s;
        }
        .login-pw-toggle:hover { background: #E8E9F8; }
        .login-remember {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }
        .login-remember input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #1B1F8C;
          cursor: pointer;
        }
        .demo-card {
          background: #EEF0FB;
          border: 1px dashed #B8BCE8;
          border-radius: 10px;
          padding: 12px 16px;
          margin-top: 24px;
        }
      `}</style>

      {/* ── Decorative background blobs ── */}
      <div style={blobTopRight} />
      <div style={blobBottomLeft} />

      {/* ── Login Card ── */}
      <div className="login-card" style={cardStyle}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ marginBottom: "12px" }}>
            <span style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.03em", fontFamily: "Inter, sans-serif" }}>
              <span style={{ color: "#16A34A" }}>m</span>
              <span style={{ color: "#1B1F8C" }}>ellosoft</span>
            </span>
          </div>
          <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B75", marginBottom: "16px" }}>
            Admin Portal
          </p>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#14151A", margin: 0, fontFamily: "Inter, sans-serif" }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: "14px", color: "#6B6B75", marginTop: "6px", marginBottom: 0 }}>
            Admin Login — sign in to continue
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", backgroundColor: "#E7E7E2", marginBottom: "24px" }} />

        {/* ── Error Message ── */}
        {error && (
          <div
            className="login-error"
            key={error}
            style={errorStyle}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Email */}
          <div>
            <label style={labelStyle} htmlFor="admin-email">
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              placeholder="admin@mellosoft.com"
              style={inputStyle(emailFocused)}
              disabled={isLoading}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle} htmlFor="admin-password">
              Password
            </label>
            <div className="login-input-wrap">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="••••••••"
                style={{ ...inputStyle(passwordFocused), paddingRight: "46px" }}
                disabled={isLoading}
              />
              <button
                type="button"
                className="login-pw-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword
                  ? <EyeOffIcon color={passwordFocused ? "#1B1F8C" : "#6B6B75"} />
                  : <EyeIcon color={passwordFocused ? "#1B1F8C" : "#6B6B75"} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span style={{ color: "#6B6B75", fontFamily: "Inter, sans-serif" }}>
                Remember me
              </span>
            </label>

            <button
              type="button"
              onClick={() => setError("Forgot password functionality is not configured yet. Contact your Super Admin.")}
              style={{ background: "none", border: "none", color: "#1B1F8C", fontWeight: 600, cursor: "pointer", fontSize: "13px", padding: 0, fontFamily: "inherit" }}
            >
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <button
            id="admin-login-btn"
            type="submit"
            disabled={isLoading}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            style={{
              width: "100%",
              height: "48px",
              backgroundColor: isLoading ? "#2D33A5" : btnHovered ? "#15186E" : "#1B1F8C",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease",
              transform: btnHovered && !isLoading ? "translateY(-1px)" : "none",
              boxShadow: btnHovered && !isLoading
                ? "0 6px 20px rgba(27,31,140,0.3)"
                : "0 2px 8px rgba(27,31,140,0.15)",
              opacity: isLoading ? 0.85 : 1,
            }}
          >
            {isLoading ? (
              <>
                <SpinnerIcon />
                <span>Signing in…</span>
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* ── Quick Role Selector Demo Cards ── */}
        <div className="demo-card">
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1B1F8C", marginBottom: "8px" }}>
            Select Demo Account to Test:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            <button
              type="button"
              onClick={() => { setEmail("admin@mellosoft.com"); setPassword("Admin@123"); setError(""); }}
              style={demoBadgeStyle}
            >
              🔑 <strong>Super Admin</strong>
            </button>
            <button
              type="button"
              onClick={() => { setEmail("priya@mellosoft.com"); setPassword("Priya@123"); setError(""); }}
              style={demoBadgeStyle}
            >
              🛡️ <strong>Admin</strong>
            </button>
            <button
              type="button"
              onClick={() => { setEmail("ankit@mellosoft.com"); setPassword("Ankit@123"); setError(""); }}
              style={demoBadgeStyle}
            >
              📦 <strong>Manager</strong>
            </button>
            <button
              type="button"
              onClick={() => { setEmail("sneha@mellosoft.com"); setPassword("Sneha@123"); setError(""); }}
              style={demoBadgeStyle}
            >
              👤 <strong>Staff</strong>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p style={{ textAlign: "center", fontSize: "12px", color: "#6B6B75", marginTop: "20px", fontFamily: "Inter, sans-serif" }}>
        © {new Date().getFullYear()} Mellosoft · Admin Portal
      </p>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const pageWrapStyle = {
  minHeight: "100vh",
  backgroundColor: "#F7F7F2",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px 16px",
  position: "relative",
  overflow: "hidden",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
};

const cardStyle = {
  width: "100%",
  maxWidth: "420px",
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  padding: "36px 36px 28px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(27,31,140,0.08)",
  border: "1px solid #E7E7E2",
  position: "relative",
  zIndex: 1,
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "#14151A",
  marginBottom: "8px",
  fontFamily: "Inter, sans-serif",
};

const errorStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  backgroundColor: "#FEE2E2",
  border: "1px solid #FECACA",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "13px",
  color: "#DC2626",
  fontWeight: 500,
  marginBottom: "16px",
  fontFamily: "Inter, sans-serif",
};

const demoBadgeStyle = {
  fontSize: "11px",
  color: "#1B1F8C",
  backgroundColor: "#FFFFFF",
  border: "1px solid #C7D2FE",
  borderRadius: "6px",
  padding: "6px 8px",
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
  textAlign: "center",
  transition: "all 0.15s ease",
};

const blobTopRight = {
  position: "absolute",
  top: "-120px",
  right: "-120px",
  width: "400px",
  height: "400px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(27,31,140,0.06) 0%, transparent 70%)",
  pointerEvents: "none",
};

const blobBottomLeft = {
  position: "absolute",
  bottom: "-80px",
  left: "-80px",
  width: "300px",
  height: "300px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(22,163,74,0.06) 0%, transparent 70%)",
  pointerEvents: "none",
};
