/**
 * Default Homepage Category Tiles Data & Presets
 * Used by the storefront "Shop By Category" section and Admin Homepage Content editor.
 */

export const HOMEPAGE_CATEGORIES_STORAGE_KEY = "mellosoft_homepage_categories";
export const HOMEPAGE_CATEGORIES_UPDATED_EVENT = "mellosoft_homepage_categories_updated";

export const CATEGORY_THEME_PRESETS = [
  {
    id: "blue-ice",
    name: "Blue Ice",
    color: "#E0EFFE",
    gradient: "linear-gradient(135deg, #E8F3FE 0%, #D4E8FC 50%, #C3DEFA 100%)",
    accentGlow: "rgba(147, 197, 253, 0.5)",
    ringColor: "rgba(59, 130, 246, 0.16)",
    previewColor: "#3B82F6"
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    color: "#FDE6D7",
    gradient: "linear-gradient(135deg, #FEEDE2 0%, #FCE0CF 50%, #F9CDAF 100%)",
    accentGlow: "rgba(253, 186, 116, 0.5)",
    ringColor: "rgba(234, 88, 12, 0.16)",
    previewColor: "#EA580C"
  },
  {
    id: "mint-emerald",
    name: "Mint Emerald",
    color: "#E0F5EB",
    gradient: "linear-gradient(135deg, #E8F8F0 0%, #D8F2E4 50%, #BFEBD3 100%)",
    accentGlow: "rgba(134, 239, 172, 0.5)",
    ringColor: "rgba(22, 163, 74, 0.16)",
    previewColor: "#16A34A"
  },
  {
    id: "blossom-pink",
    name: "Blossom Pink",
    color: "#FCE4EB",
    gradient: "linear-gradient(135deg, #FDEEF2 0%, #FADDE5 50%, #F5C6D3 100%)",
    accentGlow: "rgba(244, 114, 182, 0.5)",
    ringColor: "rgba(219, 39, 119, 0.16)",
    previewColor: "#DB2777"
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    color: "#EEE7FD",
    gradient: "linear-gradient(135deg, #F3EEFE 0%, #EAE0FD 50%, #DAD0F8 100%)",
    accentGlow: "rgba(192, 132, 252, 0.5)",
    ringColor: "rgba(147, 51, 234, 0.16)",
    previewColor: "#9333EA"
  },
  {
    id: "amber-gold",
    name: "Amber Gold",
    color: "#FCEFD6",
    gradient: "linear-gradient(135deg, #FEF6E8 0%, #FCEBD0 50%, #F7DCB0 100%)",
    accentGlow: "rgba(252, 211, 77, 0.5)",
    ringColor: "rgba(217, 119, 6, 0.16)",
    previewColor: "#D97706"
  },
  {
    id: "teal-breeze",
    name: "Teal Breeze",
    color: "#E0F7F6",
    gradient: "linear-gradient(135deg, #E6FAF9 0%, #D0F5F2 50%, #BAECE8 100%)",
    accentGlow: "rgba(94, 234, 212, 0.5)",
    ringColor: "rgba(13, 148, 136, 0.16)",
    previewColor: "#0D9488"
  },
  {
    id: "slate-modern",
    name: "Slate Modern",
    color: "#F1F5F9",
    gradient: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #CBD5E1 100%)",
    accentGlow: "rgba(148, 163, 184, 0.5)",
    ringColor: "rgba(71, 85, 105, 0.16)",
    previewColor: "#475569"
  }
];

export const PRESET_IMAGE_OPTIONS = [
  { label: "Hybrid Mattress", url: "/assets/categories/hybrid.png" },
  { label: "Firm Mattress", url: "/assets/categories/firm.png" },
  { label: "Pillows", url: "/assets/categories/pillows.png" },
  { label: "Bed Frames", url: "/assets/categories/bed-frames.png" },
  { label: "Protectors", url: "/assets/categories/protectors.png" },
  { label: "Memory Foam Mattress", url: "/assets/categories/memory-foam.png" }
];

export const DEFAULT_HOMEPAGE_CATEGORIES = [
  {
    id: "cat-hybrid",
    label: "Hybrid",
    category: "mattress",
    subcategory: null,
    href: "",
    firmness: "Hybrid",
    image: "/assets/categories/hybrid.png",
    color: "#FDE6D7",
    gradient: "linear-gradient(135deg, #FEEDE2 0%, #FCE0CF 50%, #F9CDAF 100%)",
    accentGlow: "rgba(253, 186, 116, 0.5)",
    ringColor: "rgba(234, 88, 12, 0.16)",
    scale: 1.18,
    displayOrder: 1,
    isActive: true
  },
  {
    id: "cat-firm",
    label: "Firm",
    category: "mattress",
    subcategory: null,
    href: "",
    firmness: "Firm",
    image: "/assets/categories/firm.png",
    color: "#E0F5EB",
    gradient: "linear-gradient(135deg, #E8F8F0 0%, #D8F2E4 50%, #BFEBD3 100%)",
    accentGlow: "rgba(134, 239, 172, 0.5)",
    ringColor: "rgba(22, 163, 74, 0.16)",
    scale: 1.18,
    displayOrder: 2,
    isActive: true
  },
  {
    id: "cat-pillows",
    label: "Pillows",
    category: "",
    subcategory: null,
    href: "/accessories/memory-foam-pillow",
    firmness: "",
    image: "/assets/categories/pillows.png",
    color: "#FCE4EB",
    gradient: "linear-gradient(135deg, #FDEEF2 0%, #FADDE5 50%, #F5C6D3 100%)",
    accentGlow: "rgba(244, 114, 182, 0.5)",
    ringColor: "rgba(219, 39, 119, 0.16)",
    scale: 1.22,
    displayOrder: 3,
    isActive: true
  },
  {
    id: "cat-bed-frames",
    label: "Bed Frames",
    category: "",
    subcategory: null,
    href: "/bed-frames",
    firmness: "",
    image: "/assets/categories/bed-frames.png",
    color: "#EEE7FD",
    gradient: "linear-gradient(135deg, #F3EEFE 0%, #EAE0FD 50%, #DAD0F8 100%)",
    accentGlow: "rgba(192, 132, 252, 0.5)",
    ringColor: "rgba(147, 51, 234, 0.16)",
    scale: 1.18,
    displayOrder: 4,
    isActive: true
  },
  {
    id: "cat-protectors",
    label: "Protectors",
    category: "",
    subcategory: null,
    href: "/accessories/mattress-protector",
    firmness: "",
    image: "/assets/categories/protectors.png",
    color: "#FCEFD6",
    gradient: "linear-gradient(135deg, #FEF6E8 0%, #FCEBD0 50%, #F7DCB0 100%)",
    accentGlow: "rgba(252, 211, 77, 0.5)",
    ringColor: "rgba(217, 119, 6, 0.16)",
    scale: 1.20,
    displayOrder: 5,
    isActive: true
  },
  {
    id: "cat-memory-foam",
    label: "Memory Foam",
    category: "mattress",
    subcategory: "memory-foam",
    href: "",
    firmness: "",
    image: "/assets/categories/memory-foam.png",
    color: "#E0EFFE",
    gradient: "linear-gradient(135deg, #E8F3FE 0%, #D4E8FC 50%, #C3DEFA 100%)",
    accentGlow: "rgba(147, 197, 253, 0.5)",
    ringColor: "rgba(59, 130, 246, 0.16)",
    scale: 1.18,
    displayOrder: 6,
    isActive: true
  }
];
