/**
 * Normalizes any customer identifier variant (e.g. "C002", "C2", "CUS-0002", "CUS-2")
 * to the canonical format: "CUS-XXXX" (e.g. "CUS-0002").
 */
export function normalizeCustomerId(id) {
  if (!id) return "CUS-0001";
  const str = String(id).trim().toUpperCase();
  if (str.startsWith("CUS-")) {
    const numPart = str.substring(4);
    const num = parseInt(numPart, 10);
    if (!isNaN(num)) {
      return `CUS-${String(num).padStart(4, "0")}`;
    }
    return str;
  }
  if (str.startsWith("C")) {
    const numPart = str.substring(1);
    const num = parseInt(numPart, 10);
    if (!isNaN(num)) {
      return `CUS-${String(num).padStart(4, "0")}`;
    }
  }
  const directNum = parseInt(str, 10);
  if (!isNaN(directNum)) {
    return `CUS-${String(directNum).padStart(4, "0")}`;
  }
  return str;
}

/**
 * Robust relational matching between an order/cart/wishlist record and a customer record.
 * Matches by canonical customerId, raw id, userId, or normalized email.
 */
export function matchCustomer(record, customer) {
  if (!record || !customer) return false;

  const targetCustId = normalizeCustomerId(customer.customerId || customer.id);
  const targetEmail = (customer.email || "").trim().toLowerCase();

  // Match record's customerId or userId
  const recordCustId = record.customerId ? normalizeCustomerId(record.customerId) : null;
  const recordUserId = record.userId ? normalizeCustomerId(record.userId) : null;

  if (recordCustId && recordCustId === targetCustId) return true;
  if (recordUserId && recordUserId === targetCustId) return true;

  // Direct raw id comparison
  if (record.customerId && (record.customerId === customer.id || record.customerId === customer.customerId)) return true;
  if (record.userId && (record.userId === customer.id || record.userId === customer.customerId)) return true;

  // Normalized email matching
  const recordEmail = (record.email || record.customerEmail || "").trim().toLowerCase();
  if (targetEmail && recordEmail && targetEmail === recordEmail) return true;

  return false;
}
