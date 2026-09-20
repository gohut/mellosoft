"use client";

import React, { useState, useEffect } from "react";
import { getResolvedImageUrlSync, getImageBlob } from "../utils/imageStorage";

function getImageSrc(img) {
  if (!img) return "";
  let val = "";
  if (typeof img === "string") val = img.trim();
  else if (Array.isArray(img) && img.length > 0) return getImageSrc(img[0]);
  else if (typeof img === "object") {
    val = (
      (typeof img.url === "string" && img.url.trim()) ||
      (typeof img.src === "string" && img.src.trim()) ||
      (typeof img.secure_url === "string" && img.secure_url.trim()) ||
      (typeof img.path === "string" && img.path.trim()) ||
      ""
    );
  } else {
    val = String(img).trim();
  }

  // Automatically rewrite any static category JPEG reference to transparent PNG
  if (val && val.startsWith("/assets/categories/") && val.toLowerCase().endsWith(".jpg")) {
    return val.replace(/\.jpg$/i, ".png");
  }
  return val;
}

/**
 * CategoryTileImage
 * Renders category tile images cleanly on colored cards, resolving static, external,
 * or IndexedDB ("idb:...") persistent images.
 */
export default function CategoryTileImage({
  src,
  alt = "Category",
  style = {},
  className = "",
  onError
}) {
  const cleanSrc = getImageSrc(src);
  const initialResolved = getResolvedImageUrlSync(cleanSrc, cleanSrc);
  const [displaySrc, setDisplaySrc] = useState(initialResolved);

  useEffect(() => {
    let isCancelled = false;
    const raw = getImageSrc(src);

    if (!raw) {
      setDisplaySrc("");
      return;
    }

    if (raw.startsWith("idb:")) {
      const syncUrl = getResolvedImageUrlSync(raw, null);
      if (syncUrl) {
        setDisplaySrc(syncUrl);
      } else {
        getImageBlob(raw).then((blob) => {
          if (isCancelled) return;
          if (blob) {
            setDisplaySrc(URL.createObjectURL(blob));
          } else {
            setDisplaySrc("/assets/categories/memory-foam.png");
          }
        });
      }
    } else {
      setDisplaySrc(raw);
    }

    return () => {
      isCancelled = true;
    };
  }, [src]);

  return (
    <img
      src={displaySrc || cleanSrc || "/assets/categories/memory-foam.png"}
      alt={alt}
      style={{
        background: "transparent",
        backgroundColor: "transparent",
        mixBlendMode: "normal",
        ...style
      }}
      className={className}
      onError={(e) => {
        if (e.target.src && !e.target.src.endsWith("/assets/categories/memory-foam.png")) {
          e.target.src = "/assets/categories/memory-foam.png";
        }
        if (typeof onError === "function") {
          onError(e);
        }
      }}
    />
  );
}

