/**
 * Authoritative scroll restoration and return-state manager for Mellosoft.
 */

const STORAGE_KEY = "mellosoft_product_list_return";

export function saveProductListScroll() {
  if (typeof window === "undefined") return;
  try {
    const data = {
      pathname: window.location.pathname,
      search: window.location.search,
      scrollY: window.scrollY || window.pageYOffset || 0,
      timestamp: Date.now()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save scroll position:", e);
  }
}

export function getStoredProductReturnState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function restoreProductListScroll() {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    
    // Only restore if we are back on the exact page & search params where the user clicked
    if (
      data &&
      data.pathname === window.location.pathname &&
      (data.search || "") === (window.location.search || "") &&
      typeof data.scrollY === "number" &&
      data.scrollY > 0
    ) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: data.scrollY,
          behavior: "instant"
        });
      });
    }
  } catch (e) {
    console.error("Failed to restore scroll position:", e);
  }
}
