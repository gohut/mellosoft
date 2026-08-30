/**
 * Navigation and Back Routing Helper for Mellosoft
 * 
 * Rules:
 * 1. Main Listing Pages (/mattresses, /accessories, /bed-frames, /category/[slug]) -> route to Home ("/")
 * 2. Subcategory Pages (/mattresses/[sub], /accessories/[sub], /bed-frames/[sub], /category/[main]/[sub]) -> route to Parent Main Category
 * 3. Static/Policy Pages -> route to Home ("/")
 * 4. Product Detail pages MUST use browser history (router.back()), NOT this helper.
 */

export const getListingBackRoute = (pathname) => {
  if (!pathname) return "/";

  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  // 1. Main Category Listing Pages -> Home ("/")
  if (
    cleanPath === "/mattresses" ||
    cleanPath === "/accessories" ||
    cleanPath === "/bed-frames" ||
    cleanPath === "/catalog" ||
    cleanPath === "/search" ||
    cleanPath === "/wishlist" ||
    cleanPath === "/about" ||
    cleanPath === "/contact" ||
    cleanPath === "/privacy" ||
    cleanPath === "/terms" ||
    cleanPath === "/return-policy" ||
    cleanPath === "/cancellation-policy" ||
    cleanPath === "/home/privacy" ||
    cleanPath === "/home/terms" ||
    cleanPath === "/home/return-policy" ||
    cleanPath === "/home/cancellation-policy" ||
    cleanPath === "/profile"
  ) {
    return "/";
  }

  // 2. Specific Subcategory Pages -> Parent Main Category
  if (cleanPath.startsWith("/mattresses/")) {
    return "/mattresses";
  }

  if (cleanPath.startsWith("/accessories/")) {
    return "/accessories";
  }

  if (cleanPath.startsWith("/bed-frames/")) {
    return "/bed-frames";
  }

  // 3. Generic Category Routes (/category/[mainCategorySlug] and /category/[mainCategorySlug]/[subcategorySlug])
  const parts = cleanPath.split("/").filter(Boolean);

  if (parts[0] === "category") {
    if (parts.length === 2) {
      // /category/[mainCategorySlug] -> Home ("/")
      return "/";
    }
    if (parts.length >= 3) {
      // /category/[mainCategorySlug]/[subcategorySlug] -> /category/[mainCategorySlug]
      return `/category/${parts[1]}`;
    }
  }

  return "/";
};
