"use client";

import React, { useEffect, useState, useRef } from "react";
import "./MellosoftLoader.css";

/**
 * MellosoftLoader — Full-screen animated sleep-themed loading screen.
 *
 * Props:
 *   show        {boolean}  — Control visibility externally (default true).
 *   minDisplayMs {number}  — Minimum ms to display before allowing fade-out (default 0).
 *   label       {string}   — Text below dots (default "Loading your comfort...").
 *
 * Usage:
 *   <MellosoftLoader show={isLoading} />
 *
 * Or as a standalone full-screen overlay (no props needed for Next.js loading.jsx):
 *   <MellosoftLoader />
 */
export default function MellosoftLoader({
  show = true,
  minDisplayMs = 0,
  label = "Loading your comfort..."
}) {
  const [visible, setVisible] = useState(show);
  const [fadingOut, setFadingOut] = useState(false);
  const showTimerRef = useRef(null);
  const minTimerRef = useRef(null);
  const mountTimeRef = useRef(Date.now());

  // Handle show→false with min display time + fade-out
  useEffect(() => {
    if (show) {
      mountTimeRef.current = Date.now();
      setFadingOut(false);
      setVisible(true);
    } else {
      const elapsed = Date.now() - mountTimeRef.current;
      const remaining = Math.max(0, minDisplayMs - elapsed);
      minTimerRef.current = setTimeout(() => {
        setFadingOut(true);
        showTimerRef.current = setTimeout(() => {
          setVisible(false);
          setFadingOut(false);
        }, 320);
      }, remaining);
    }
    return () => {
      clearTimeout(showTimerRef.current);
      clearTimeout(minTimerRef.current);
    };
  }, [show, minDisplayMs]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Mellosoft"
      className={`mellosoft-loader-overlay${fadingOut ? " fade-out" : ""}`}
    >
      <div className="loader-scene">

        {/* ── Ceiling Fan ── */}
        <div className="loader-fan-wrap" aria-hidden="true">
          <div className="loader-fan-canopy" />
          <div className="loader-fan-rod" />
          <div className="loader-fan-motor">
            {/* 3D horizontal plane: fan wings rotate horizontally facing toward the bed */}
            <div className="loader-fan-rotor-plane">
              <div className="loader-fan-rotor">
                <div className="loader-fan-blade loader-blade-1" />
                <div className="loader-fan-blade loader-blade-2" />
                <div className="loader-fan-blade loader-blade-3" />
                <div className="loader-fan-blade loader-blade-4" />
              </div>
            </div>
            <div className="loader-fan-hub" />
          </div>
        </div>

        {/* ── Bedroom arch background ── */}
        <div className="loader-room-bg" aria-hidden="true">

          {/* Stars */}
          <div className="loader-stars">
            <span className="loader-star" />
            <span className="loader-star" />
            <span className="loader-star" />
            <span className="loader-star" />
            <span className="loader-star" />
          </div>

          {/* Moon */}
          <span className="loader-moon">🌙</span>

          {/* Bed with sleeping person & "z z z z z z" effect */}
          <div className="loader-bed-wrap">
            {/* "z z z z z z" rising directly from the sleeping person on the bed */}
            <div className="loader-zzz-stream" aria-hidden="true">
              <span className="loader-zzz loader-z-1">z</span>
              <span className="loader-zzz loader-z-2">z</span>
              <span className="loader-zzz loader-z-3">z</span>
              <span className="loader-zzz loader-z-4">z</span>
              <span className="loader-zzz loader-z-5">z</span>
              <span className="loader-zzz loader-z-6">z</span>
            </div>

            <svg
              className="loader-bed-svg"
              viewBox="0 0 180 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Floor */}
              <rect x="0" y="78" width="180" height="12" rx="4" fill="#E2E8F0" />

              {/* Bed frame base */}
              <rect x="10" y="50" width="160" height="30" rx="6" fill="#C7D2FE" />

              {/* Bed frame sides / legs */}
              <rect x="12" y="72" width="14" height="10" rx="3" fill="#A5B4FC" />
              <rect x="154" y="72" width="14" height="10" rx="3" fill="#A5B4FC" />

              {/* Headboard */}
              <rect x="10" y="34" width="28" height="30" rx="5" fill="#818CF8" />
              <rect x="12" y="36" width="24" height="26" rx="4" fill="#6366F1" />
              {/* Headboard detail dots */}
              <circle cx="24" cy="44" r="2.5" fill="#A5B4FC" />
              <circle cx="24" cy="54" r="2.5" fill="#A5B4FC" />

              {/* Footboard */}
              <rect x="142" y="42" width="28" height="22" rx="5" fill="#818CF8" />
              <rect x="144" y="44" width="24" height="18" rx="4" fill="#6366F1" />

              {/* Mattress */}
              <rect x="38" y="38" width="105" height="24" rx="5" fill="#F1F5F9" />
              {/* Mattress top stitching */}
              <line x1="45" y1="50" x2="135" y2="50" stroke="#CBD5E1" strokeWidth="0.8" strokeDasharray="4 4" />
              <line x1="45" y1="44" x2="135" y2="44" stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="3 5" />

              {/* Pillow */}
              <rect x="40" y="38" width="34" height="18" rx="5" fill="#FFFFFF" />
              <rect x="42" y="40" width="30" height="14" rx="4" fill="#F8FAFC" />
              {/* Pillow edge detail */}
              <rect x="44" y="42" width="26" height="10" rx="3" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />

              {/* Sleeping person on the pillow */}
              <g className="loader-sleeper">
                {/* Sleeping Head */}
                <circle cx="56" cy="45" r="7.5" fill="#FED7AA" />
                {/* Cozy hair */}
                <path d="M49 44 C49 38 63 38 63 44" fill="#4B5563" />
                {/* Sleeping closed peaceful eye */}
                <path d="M52 46 Q54 48 57 46" stroke="#4B5563" strokeWidth="1" strokeLinecap="round" fill="none" />
                {/* Soft cheek blush */}
                <circle cx="58" cy="47" r="1.5" fill="#FCA5A5" opacity="0.6" />
              </g>

              {/* Duvet / blanket tucked over sleeper with breathing animation */}
              <g className="loader-duvet-group">
                <rect x="60" y="39" width="82" height="23" rx="5" fill="#DBEAFE" />
                {/* Duvet fold edge */}
                <rect x="58" y="39" width="10" height="23" rx="3" fill="#BFDBFE" />
                <path d="M60 52 Q100 56 140 52" stroke="#93C5FD" strokeWidth="1.2" fill="none" />
                <path d="M60 46 Q100 50 140 46" stroke="#BFDBFE" strokeWidth="0.8" fill="none" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Screen-reader only status */}
      <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
        Loading Mellosoft...
      </span>
    </div>
  );
}
