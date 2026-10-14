/**
 * Normalizes sequential customer identifier variants (e.g. "C002", "C2", "CUS-0002", "CUS-2")
 * to the canonical format: "CUS-XXXX" (e.g. "CUS-0002").
 * Does NOT corrupt UUIDs/CUIDs that happen to start with 'c' followed by digits.
 */
export function normalizeCustomerId(id) {
  if (!id) return "";
  const str = String(id).trim();
  const upper = str.toUpperCase();
  if (upper.startsWith("CUS-")) {
    const numPart = upper.substring(4);
    if (/^\d+$/.test(numPart)) {
      return `CUS-${String(parseInt(numPart, 10)).padStart(4, "0")}`;
    }
    return str;
  }
  if (upper.startsWith("C") && /^\d+$/.test(upper.substring(1))) {
    const num = parseInt(upper.substring(1), 10);
    return `CUS-${String(num).padStart(4, "0")}`;
  }
  if (/^\d+$/.test(str)) {
    const directNum = parseInt(str, 10);
    return `CUS-${String(directNum).padStart(4, "0")}`;
  }
  return str;
}

/**
 * Robust relational matching between an order/cart/wishlist record and a customer record.
 * Matches by direct ID, canonical customerId, or normalized email.
 */
export function matchCustomer(record, customer) {
  if (!record || !customer) return false;

  const targetId = customer.id ? String(customer.id).trim() : null;
  const targetCustId = customer.customerId ? String(customer.customerId).trim() : null;
  const targetEmail = customer.email ? customer.email.trim().toLowerCase() : null;

  const normTargetCustId = (targetCustId || targetId) ? normalizeCustomerId(targetCustId || targetId) : null;

  // Match record's customerId or userId
  const recordCustId = record.customerId ? String(record.customerId).trim() : null;
  const recordUserId = record.userId ? String(record.userId).trim() : null;

  // 1. Direct ID match
  if (targetId && (recordCustId === targetId || recordUserId === targetId || record.id === targetId)) return true;
  if (targetCustId && (recordCustId === targetCustId || recordUserId === targetCustId)) return true;

  // 2. Normalized customerId match (only if valid non-empty)
  if (normTargetCustId) {
    if (recordCustId && normalizeCustomerId(recordCustId) === normTargetCustId) return true;
    if (recordUserId && normalizeCustomerId(recordUserId) === normTargetCustId) return true;
  }

  // 3. Normalized email matching
  const recordEmail = (record.email || record.customerEmail || "").trim().toLowerCase();
  if (targetEmail && recordEmail && targetEmail === recordEmail) return true;

  return false;
}

