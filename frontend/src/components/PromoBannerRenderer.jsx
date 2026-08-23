"use client";

import React from "react";
import PromoBannerCard from "./PromoBannerCard";

/**
 * Dedicated shared PromoBannerRenderer component.
 * Renders an independent static promo banner for both Admin Live Preview and User Homepage.
 */
export default function PromoBannerRenderer({ banner, preview = false, onClick, style = {}, className = "" }) {
  return (
    <PromoBannerCard
      banner={banner}
      preview={preview}
      onClick={onClick}
      style={style}
      className={className}
    />
  );
}
