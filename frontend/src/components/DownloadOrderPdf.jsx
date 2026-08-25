"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import { useCustomerAuth } from "../context/CustomerAuthContext";

/**
 * DownloadOrderPdf — Reusable component to generate and download a
 * professional Mellosoft Order Invoice PDF for a given order.
 *
 * Usage:
 *   <DownloadOrderPdf order={order} />
 *
 * Security: Verifies the logged-in user owns the order before generating.
 */

// INR currency formatter — uses Unicode Rupee symbol so jsPDF can render it
function fmtINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "Rs 0";
  const num = Number(amount);
  if (Number.isInteger(num)) {
    return `Rs ${num.toLocaleString("en-IN")}`;
  }
  return `Rs ${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function drawHRule(doc, y, margin, pageWidth) {
  doc.setDrawColor(220, 220, 218);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
}

function checkPageBreak(doc, currentY, margin, pageHeight, lineHeight = 8) {
  if (currentY + lineHeight > pageHeight - margin) {
    doc.addPage();
    return margin + 10;
  }
  return currentY;
}

async function generateOrderPdf(order, currentCustomer) {
  // Dynamic import — keeps jsPDF out of SSR bundle
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // ── HEADER BAND ────────────────────────────────────────────────────────────
  doc.setFillColor(27, 31, 140); // Mellosoft indigo
  doc.rect(0, 0, pageWidth, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("MELLOSOFT", pageWidth / 2, 16, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Premium Comfort & Better Sleep", pageWidth / 2, 23, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("ORDER CONFIRMATION", pageWidth / 2, 32, { align: "center" });

  y = 48;

  // ── ORDER META ─────────────────────────────────────────────────────────────
  doc.setTextColor(20, 21, 26);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  const orderId = order.orderId || order.id || "—";
  const orderDate = order.createdAt || order.date || new Date().toISOString().split("T")[0];
  const orderStatus = order.orderStatus || "Processing";

  // Left column meta
  doc.text("Order ID:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(orderId, margin + 28, y);

  doc.setFont("helvetica", "bold");
  doc.text("Order Date:", margin, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(orderDate, margin + 28, y + 7);

  doc.setFont("helvetica", "bold");
  doc.text("Status:", margin, y + 14);
  doc.setFont("helvetica", "normal");
  doc.text(orderStatus, margin + 28, y + 14);

  // Right column meta (customer)
  if (currentCustomer) {
    doc.setFont("helvetica", "bold");
    doc.text("Customer:", pageWidth / 2 + 5, y);
    doc.setFont("helvetica", "normal");
    doc.text(currentCustomer.name || currentCustomer.fullName || "—", pageWidth / 2 + 30, y);

    doc.setFont("helvetica", "bold");
    doc.text("Customer ID:", pageWidth / 2 + 5, y + 7);
    doc.setFont("helvetica", "normal");
    doc.text(currentCustomer.id || order.customerId || "—", pageWidth / 2 + 30, y + 7);

    if (currentCustomer.email) {
      doc.setFont("helvetica", "bold");
      doc.text("Email:", pageWidth / 2 + 5, y + 14);
      doc.setFont("helvetica", "normal");
      // Truncate long emails
      const emailText = currentCustomer.email.length > 28 ? currentCustomer.email.slice(0, 26) + "..." : currentCustomer.email;
      doc.text(emailText, pageWidth / 2 + 30, y + 14);
    }
  }

  y += 26;

  drawHRule(doc, y, margin, pageWidth);
  y += 10;

  // ── ORDERED PRODUCTS ───────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(27, 31, 140);
  doc.text("ORDERED PRODUCTS", margin, y);
  y += 8;

  // Table header
  doc.setFillColor(245, 245, 242);
  doc.rect(margin, y - 5, contentWidth, 10, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(107, 107, 117);

  const col1 = margin + 2;
  const col2 = margin + contentWidth * 0.47;
  const col3 = margin + contentWidth * 0.62;
  const col4 = margin + contentWidth * 0.74;
  const col5 = margin + contentWidth * 0.86;

  doc.text("PRODUCT", col1, y + 1);
  doc.text("VARIANT", col2, y + 1);
  doc.text("SKU", col3, y + 1);
  doc.text("QTY", col4, y + 1);
  doc.text("PRICE", col5, y + 1, { align: "right" });
  y += 10;

  const items = order.items || [];

  items.forEach((item, idx) => {
    y = checkPageBreak(doc, y, margin, pageHeight, 30);

    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(252, 252, 250);
      doc.rect(margin, y - 4, contentWidth, 28, "F");
    }

    // Product name (word wrap if long)
    const productName = item.name || item.productName || item.productId || "Product";
    const category = item.category || "";
    const size = item.size || item.variantSize || "";
    const firmness = item.firmness || item.variantFirmness || "";
    const sku = item.sku || item.variantSKU || "";
    const qty = item.quantity || item.qty || 1;
    const price = item.price || item.discountPrice || item.actualPrice || 0;
    const actualPrice = item.actualPrice || item.price || 0;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(20, 21, 26);

    // Wrap product name
    const nameLines = doc.splitTextToSize(productName, contentWidth * 0.43);
    doc.text(nameLines, col1, y);

    if (category) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(107, 107, 117);
      doc.text(`Category: ${category}`, col1, y + (nameLines.length * 4.5) + 1);
    }

    // Variant
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(20, 21, 26);
    if (size) doc.text(`Size: ${size}`, col2, y);
    if (firmness) doc.text(`Firmness: ${firmness}`, col2, y + 6);

    // SKU
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 107, 117);
    if (sku) {
      const skuLines = doc.splitTextToSize(sku, contentWidth * 0.1);
      doc.text(skuLines, col3, y);
    }

    // Qty
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(20, 21, 26);
    doc.text(String(qty), col4, y);

    // Prices
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(27, 31, 140);
    doc.text(fmtINR(price * qty), pageWidth - margin - 2, y, { align: "right" });

    if (actualPrice && actualPrice !== price) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(107, 107, 117);
      doc.text(`MRP: ${fmtINR(actualPrice)}`, col5, y + 6, { align: "right" });
    }

    // Thin separator per item
    doc.setDrawColor(230, 230, 228);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 24, pageWidth - margin, y + 24);

    y += 28;
  });

  y += 4;
  drawHRule(doc, y, margin, pageWidth);
  y += 10;

  // ── PAYMENT DETAILS ────────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, margin, pageHeight, 40);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(27, 31, 140);
  doc.text("PAYMENT DETAILS", margin, y);
  y += 8;

  doc.setFillColor(248, 249, 255);
  doc.roundedRect(margin, y - 3, contentWidth, 22, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(107, 107, 117);
  doc.text("Payment Method", margin + 4, y + 5);
  doc.text("Payment Status", pageWidth / 2 + 4, y + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 21, 26);
  doc.text(order.paymentMethod || "—", margin + 4, y + 14);

  const payStatus = order.paymentStatus || "—";
  if (payStatus === "Paid") doc.setTextColor(22, 163, 74);
  else if (payStatus === "Pending") doc.setTextColor(217, 119, 6);
  else doc.setTextColor(220, 38, 38);
  doc.text(payStatus, pageWidth / 2 + 4, y + 14);

  y += 28;

  drawHRule(doc, y, margin, pageWidth);
  y += 10;

  // ── ORDER SUMMARY ──────────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, margin, pageHeight, 80);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(27, 31, 140);
  doc.text("ORDER SUMMARY", margin, y);
  y += 10;

  const summaryColLabel = margin + 4;
  const summaryColVal = pageWidth - margin - 4;

  function summaryRow(label, value, isNegative = false, isBold = false) {
    y = checkPageBreak(doc, y, margin, pageHeight, 9);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(isBold ? 20 : 107, isBold ? 21 : 107, isBold ? 26 : 117);
    doc.text(label, summaryColLabel, y);
    doc.setTextColor(isNegative ? 22 : (isBold ? 27 : 20), isNegative ? 163 : (isBold ? 31 : 21), isNegative ? 74 : (isBold ? 140 : 26));
    doc.text(value, summaryColVal, y, { align: "right" });
    y += 8;
  }

  const subtotal = order.subtotal ?? (order.totalAmount ? order.totalAmount * 0.75 : 0);
  const discount = order.discount ?? 0;
  const tax = order.tax ?? 0;
  const shipping = order.shipping ?? 0;
  const couponDiscount = order.couponDiscount ?? 0;
  const totalAmount = order.totalAmount ?? 0;

  summaryRow("Subtotal", fmtINR(subtotal));
  if (discount > 0) summaryRow("Discount Saved", `- ${fmtINR(discount)}`, true);
  if (couponDiscount > 0) summaryRow("Coupon Discount", `- ${fmtINR(couponDiscount)}`, true);
  if (tax > 0) summaryRow(`GST (18%)`, fmtINR(tax));
  summaryRow("Shipping", shipping === 0 ? "FREE" : fmtINR(shipping));

  // Total row with background
  y += 2;
  doc.setFillColor(27, 31, 140);
  doc.roundedRect(margin, y - 5, contentWidth, 14, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL AMOUNT", summaryColLabel, y + 4);
  doc.text(fmtINR(totalAmount), summaryColVal, y + 4, { align: "right" });
  y += 20;

  drawHRule(doc, y, margin, pageWidth);
  y += 10;

  // ── DELIVERY DETAILS ───────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, margin, pageHeight, 70);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(27, 31, 140);
  doc.text("DELIVERY DETAILS", margin, y);
  y += 8;

  const addr = order.deliveryAddress || order.shippingAddress || {};

  doc.setFillColor(248, 255, 249);
  const addrBoxHeight = 58;
  doc.roundedRect(margin, y - 3, contentWidth, addrBoxHeight, 2, 2, "F");
  doc.setDrawColor(22, 163, 74, 0.3);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y - 3, contentWidth, addrBoxHeight, 2, 2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 21, 26);
  const recipientName = addr.fullName || addr.name || order.customerName || "—";
  doc.text(recipientName, margin + 5, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);

  const phoneText = addr.phone || order.phone || "—";
  doc.text(`Phone: ${phoneText}`, margin + 5, y + 14);

  let addrLine = "";
  if (addr.addressLine1 || addr.street) addrLine += (addr.addressLine1 || addr.street);
  if (addr.addressLine2) addrLine += `, ${addr.addressLine2}`;
  if (addrLine) doc.text(addrLine, margin + 5, y + 22);

  const cityStatePinLine = [addr.city, addr.state].filter(Boolean).join(", ") + (addr.pincode || addr.zip ? ` - ${addr.pincode || addr.zip}` : "");
  if (cityStatePinLine.trim()) doc.text(cityStatePinLine, margin + 5, y + 30);

  if (addr.landmark) {
    doc.setTextColor(107, 107, 117);
    doc.text(`Landmark: ${addr.landmark}`, margin + 5, y + 38);
  }

  y += addrBoxHeight + 10;

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, margin, pageHeight, 28);

  drawHRule(doc, y, margin, pageWidth);
  y += 8;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(107, 107, 117);
  doc.text("Thank you for shopping with Mellosoft.", pageWidth / 2, y, { align: "center" });
  y += 6;
  doc.text("For support, contact us at support@mellosoft.com or visit mellosoft.com/support", pageWidth / 2, y, { align: "center" });
  y += 6;
  doc.text("100-Night Risk-Free Trial | Free Returns | Premium Sleep Guarantee", pageWidth / 2, y, { align: "center" });
  y += 8;

  // Page number
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`Page ${i} of ${totalPages}  |  ${orderId}`, pageWidth - margin, pageHeight - 6, { align: "right" });
    doc.text(`Generated on ${new Date().toLocaleDateString("en-IN")}`, margin, pageHeight - 6);
  }

  return doc;
}

export default function DownloadOrderPdf({ order, variant = "primary" }) {
  const { currentCustomer, isAuthenticated } = useCustomerAuth();
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleDownload = async () => {
    if (status === "loading") return;

    // Auth check
    if (!isAuthenticated || !currentCustomer) {
      setErrorMsg("Please log in to download your order copy.");
      setStatus("error");
      return;
    }

    // Order existence check
    if (!order) {
      setErrorMsg("Order not found.");
      setStatus("error");
      return;
    }

    // Ownership check — compare currentCustomer.id against order userId/customerId
    const orderOwnerId = order.userId || order.customerId;
    const currentUserId = currentCustomer.id;
    if (orderOwnerId && currentUserId && orderOwnerId !== currentUserId) {
      setErrorMsg("You are not authorized to access this order.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const doc = await generateOrderPdf(order, currentCustomer);
      const orderId = order.orderId || order.id || "order";
      doc.save(`Mellosoft-Order-${orderId}.pdf`);
      setStatus("idle");
    } catch (err) {
      console.error("PDF generation failed:", err);
      setErrorMsg("Unable to generate the order copy. Please try again.");
      setStatus("error");
    }
  };

  const isLoading = status === "loading";

  // Style variants
  const isPrimary = variant === "primary";
  const btnStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    height: "44px",
    padding: "0 20px",
    borderRadius: "999px",
    border: isPrimary ? "none" : "1.5px solid #1B1F8C",
    backgroundColor: isPrimary ? "#1B1F8C" : "#F4F5FF",
    color: isPrimary ? "#FFFFFF" : "#1B1F8C",
    fontSize: "14px",
    fontWeight: "700",
    cursor: isLoading ? "not-allowed" : "pointer",
    opacity: isLoading ? 0.75 : 1,
    transition: "all 0.18s ease",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    width: variant === "full" ? "100%" : "auto",
    minWidth: "180px"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "inherit", gap: "6px" }}>
      <button
        onClick={handleDownload}
        style={btnStyle}
        disabled={isLoading}
        title="Download your order as a PDF"
      >
        {isLoading ? (
          <>
            <span style={spinnerStyle} />
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <Download size={16} />
            <span>Download Order Copy</span>
          </>
        )}
      </button>

      {status === "error" && errorMsg && (
        <div style={errorStyle}>
          ⚠️ {errorMsg}
        </div>
      )}
    </div>
  );
}

const spinnerStyle = {
  width: "14px",
  height: "14px",
  border: "2px solid rgba(255,255,255,0.3)",
  borderTopColor: "#FFFFFF",
  borderRadius: "50%",
  display: "inline-block",
  animation: "spin 0.7s linear infinite",
};

const errorStyle = {
  fontSize: "12px",
  color: "#DC2626",
  backgroundColor: "#FEF2F2",
  border: "1px solid #FECACA",
  borderRadius: "8px",
  padding: "6px 12px",
  maxWidth: "300px"
};
