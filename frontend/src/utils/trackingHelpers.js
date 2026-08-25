export const TRACKING_STAGES = [
  { key: "Confirmed", label: "Order Confirmed", defaultDesc: "Your order has been placed and confirmed." },
  { key: "Processing", label: "Processing", defaultDesc: "Your order is being prepared and quality inspected." },
  { key: "Packed", label: "Packed", defaultDesc: "Items packaged safely and ready for carrier dispatch." },
  { key: "Shipped", label: "Shipped", defaultDesc: "Handed over to carrier partner. Package in transit." },
  { key: "Out for Delivery", label: "Out for Delivery", defaultDesc: "Out for delivery with local courier agent." },
  { key: "Delivered", label: "Delivered", defaultDesc: "Package delivered to destination address." }
];

export function formatTrackingTimestamp(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${dateStr} • ${timeStr}`;
}

export function buildInitialTrackingHistory(order) {
  if (!order) return [];
  if (Array.isArray(order.trackingHistory) && order.trackingHistory.length > 0) {
    return order.trackingHistory;
  }

  const rawDate = order.createdAt || order.date || "2026-08-01";
  const startMs = new Date(rawDate).getTime() || Date.now() - 86400000 * 3;

  const currentStatusNorm = (order.orderStatus || "Confirmed").toLowerCase();

  let activeIdx = TRACKING_STAGES.findIndex((s) => s.key.toLowerCase() === currentStatusNorm || s.label.toLowerCase() === currentStatusNorm);
  if (activeIdx === -1) {
    if (currentStatusNorm.includes("process")) activeIdx = 1;
    else if (currentStatusNorm.includes("pack")) activeIdx = 2;
    else if (currentStatusNorm.includes("ship")) activeIdx = 3;
    else if (currentStatusNorm.includes("delivery") || currentStatusNorm.includes("out")) activeIdx = 4;
    else if (currentStatusNorm.includes("deliver")) activeIdx = 5;
    else activeIdx = 0;
  }

  if (currentStatusNorm === "cancelled" || currentStatusNorm === "failed") {
    return [
      {
        status: "Order Confirmed",
        timestamp: new Date(startMs).toISOString(),
        description: "Your order has been placed and confirmed."
      },
      {
        status: order.orderStatus || "Cancelled",
        timestamp: new Date(startMs + 3600000 * 2).toISOString(),
        description: currentStatusNorm === "cancelled" ? "Order has been cancelled." : "Fulfillment failed."
      }
    ];
  }

  const history = [];
  for (let i = 0; i <= activeIdx; i++) {
    const stage = TRACKING_STAGES[i];
    const timestampMs = startMs + (i * 12 + (i * 2)) * 3600000;
    history.push({
      status: stage.key,
      timestamp: new Date(timestampMs).toISOString(),
      description: stage.defaultDesc
    });
  }

  return history;
}
