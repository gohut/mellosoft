import fs from "fs";
import path from "path";
import { MOCK_BANNERS } from "../admin/data/adminMockData";

const DEFAULT_BANNER_TYPES = [
  { id: "type-offer", name: "Offer" },
  { id: "type-arrival", name: "New Arrival" },
  { id: "type-promo", name: "Promotion" },
  { id: "type-collection", name: "Collection" },
];

const DEFAULT_HOMEPAGE_SECTIONS = [
  { id: "hero-slider",      label: "Hero Slides",       description: "Main hero banner slideshow at the top of the page",   visible: true, type: "global" },
  { id: "shop-by-category", label: "Shop by Category",  description: "Category grid letting customers browse by product type", visible: true, type: "global" },
  { id: "promo-001",        label: "Classic Comfort",   description: "Promotional Banner • Promotion",                       visible: true, type: "promo-banner", bannerId: "promo-001" },
  { id: "promo-002",        label: "Get 30% off essentials", description: "Promotional Banner • Promotion",               visible: true, type: "promo-banner", bannerId: "promo-002" },
  { id: "promo-003",        label: "Free assembly included", description: "Promotional Banner • Promotion",               visible: true, type: "promo-banner", bannerId: "promo-003" },
  { id: "new-arrivals",     label: "New Arrivals",      description: "Showcase of the latest products added to the store",   visible: true, type: "global" },
  { id: "best-sellers",     label: "Best Sellers",      description: "Top-selling products ranked by purchase frequency",    visible: true, type: "global" },
  { id: "customer-reviews", label: "Customer Reviews",  description: "Customer reviews and feedback carousel section",        visible: true, type: "global" },
];

const DEFAULT_NEW_ARRIVALS = [
  { id: "na-1", productId: "foamcloud",      displayOrder: 1,  isActive: true },
  { id: "na-2", productId: "orthocare",       displayOrder: 2,  isActive: true },
  { id: "na-3", productId: "springease",      displayOrder: 3,  isActive: true },
  { id: "na-4", productId: "latexpure",       displayOrder: 4,  isActive: true },
  { id: "na-5", productId: "memorycloud",     displayOrder: 5,  isActive: true },
  { id: "na-6", productId: "memory-contour",  displayOrder: 6,  isActive: true },
  { id: "na-7", productId: "natura-latex",    displayOrder: 7,  isActive: true },
  { id: "na-8", productId: "aqua-guard",      displayOrder: 8,  isActive: true },
  { id: "na-9", productId: "cloud-duvet",     displayOrder: 9,  isActive: true },
  { id: "na-10", productId: "flexi-bed",      displayOrder: 10, isActive: true },
];

const DEFAULT_BEST_SELLERS = [
  { id: "bs-1", productId: "foamcloud",  displayOrder: 1, isActive: true },
  { id: "bs-2", productId: "orthocare",   displayOrder: 2, isActive: true },
  { id: "bs-3", productId: "springease",  displayOrder: 3, isActive: true },
  { id: "bs-4", productId: "latexpure",   displayOrder: 4, isActive: true },
];

// Persistent file path
const DATA_DIR = path.join(process.cwd(), ".data");
const STORAGE_FILE = path.join(DATA_DIR, "homepage_content.json");

function getInitialState() {
  return {
    homepageConfig: {
      sections: JSON.parse(JSON.stringify(DEFAULT_HOMEPAGE_SECTIONS))
    },
    banners: JSON.parse(JSON.stringify(MOCK_BANNERS)),
    bannerTypes: JSON.parse(JSON.stringify(DEFAULT_BANNER_TYPES)),
    newArrivalItems: JSON.parse(JSON.stringify(DEFAULT_NEW_ARRIVALS)),
    bestSellerItems: JSON.parse(JSON.stringify(DEFAULT_BEST_SELLERS)),
    updatedAt: new Date().toISOString()
  };
}

// Global server memory store
let globalStore = null;

function loadFromDiskOrDefaults() {
  if (globalStore) return globalStore;

  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        globalStore = {
          homepageConfig: parsed.homepageConfig || { sections: DEFAULT_HOMEPAGE_SECTIONS },
          banners: Array.isArray(parsed.banners) ? parsed.banners : MOCK_BANNERS,
          bannerTypes: Array.isArray(parsed.bannerTypes) ? parsed.bannerTypes : DEFAULT_BANNER_TYPES,
          newArrivalItems: Array.isArray(parsed.newArrivalItems) ? parsed.newArrivalItems : DEFAULT_NEW_ARRIVALS,
          bestSellerItems: Array.isArray(parsed.bestSellerItems) ? parsed.bestSellerItems : DEFAULT_BEST_SELLERS,
          updatedAt: parsed.updatedAt || new Date().toISOString()
        };
        return globalStore;
      }
    }
  } catch (e) {
    console.warn("Could not read homepage_content.json from disk, falling back to defaults:", e.message);
  }

  globalStore = getInitialState();
  return globalStore;
}

function saveToDisk(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    // In serverless environments (Netlify functions), the disk may be read-only or ephemeral
    // Memory store handles request lifetime
  }
}

/**
 * Retrieve all homepage content configuration from server store
 */
export function getHomepageData() {
  const store = loadFromDiskOrDefaults();
  return {
    success: true,
    homepageConfig: store.homepageConfig,
    banners: store.banners,
    bannerTypes: store.bannerTypes,
    newArrivalItems: store.newArrivalItems,
    bestSellerItems: store.bestSellerItems,
    updatedAt: store.updatedAt
  };
}

/**
 * Update homepage content configuration on server store
 */
export function updateHomepageData(updates = {}) {
  const current = loadFromDiskOrDefaults();

  if (updates.homepageConfig !== undefined) {
    current.homepageConfig = updates.homepageConfig;
  }
  if (updates.banners !== undefined) {
    current.banners = updates.banners;
  }
  if (updates.bannerTypes !== undefined) {
    current.bannerTypes = updates.bannerTypes;
  }
  if (updates.newArrivalItems !== undefined) {
    current.newArrivalItems = updates.newArrivalItems;
  }
  if (updates.bestSellerItems !== undefined) {
    current.bestSellerItems = updates.bestSellerItems;
  }
  current.updatedAt = new Date().toISOString();

  saveToDisk(current);

  return {
    success: true,
    homepageConfig: current.homepageConfig,
    banners: current.banners,
    bannerTypes: current.bannerTypes,
    newArrivalItems: current.newArrivalItems,
    bestSellerItems: current.bestSellerItems,
    updatedAt: current.updatedAt
  };
}
