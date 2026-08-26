/**
 * Resolves the explicit parent route for any given pathname in the Mellosoft application.
 *
 * Routing Matrix:
 * - /mattresses -> /
 * - /accessories -> /
 * - /bed-frames -> /
 * - /mattresses/:category -> /mattresses
 * - /accessories/:category -> /accessories
 * - /bed-frames/:category -> /bed-frames
 * - /category/:main -> /
 * - /category/:main/:sub -> /category/:main (or /mattresses, etc.)
 * - /orders/:orderId -> /orders
 * - /about, /contact, /search, /wishlist, /cart, /profile, policies -> /
 *
 * @param {string} pathname
 * @returns {string}
 */
export function getParentRoute(pathname) {
  if (!pathname || pathname === "/") return "/";

  // Clean trailing slash
  const cleanPath = pathname.replace(/\/$/, "");

  // 1. Subcategory routes under specific departments
  if (cleanPath.startsWith("/mattresses/")) {
    return "/mattresses";
  }
  if (cleanPath.startsWith("/accessories/")) {
    return "/accessories";
  }
  if (cleanPath.startsWith("/bed-frames/")) {
    return "/bed-frames";
  }

  // 2. Nested routes under dynamic /category/
  const nestedCategoryMatch = cleanPath.match(/^\/category\/([^/]+)\/([^/]+)$/);
  if (nestedCategoryMatch) {
    const mainCat = nestedCategoryMatch[1].toLowerCase();
    if (mainCat === "mattress" || mainCat === "mattresses") return "/mattresses";
    if (mainCat === "accessory" || mainCat === "accessories") return "/accessories";
    if (mainCat === "bed-frame" || mainCat === "bed-frames") return "/bed-frames";
    return `/category/${mainCat}`;
  }

  const singleCategoryMatch = cleanPath.match(/^\/category\/([^/]+)$/);
  if (singleCategoryMatch) {
    return "/";
  }

  // 3. Orders sub-route
  if (cleanPath.startsWith("/orders/")) {
    return "/orders";
  }

  // 4. Main department listing pages and general pages -> Home "/"
  if (
    cleanPath === "/mattresses" ||
    cleanPath === "/accessories" ||
    cleanPath === "/bed-frames" ||
    cleanPath === "/catalog" ||
    cleanPath === "/search" ||
    cleanPath === "/about" ||
    cleanPath === "/contact" ||
    cleanPath === "/wishlist" ||
    cleanPath === "/cart" ||
    cleanPath === "/profile" ||
    cleanPath === "/orders" ||
    cleanPath === "/cancellation-policy" ||
    cleanPath === "/return-policy" ||
    cleanPath === "/privacy" ||
    cleanPath === "/terms" ||
    cleanPath === "/home/cancellation-policy" ||
    cleanPath === "/home/return-policy" ||
    cleanPath === "/home/privacy" ||
    cleanPath === "/home/terms" ||
    cleanPath === "/order-confirmation" ||
    cleanPath.startsWith("/order-confirmation/")
  ) {
    return "/";
  }

  // Fallback default
  return "/";
}
