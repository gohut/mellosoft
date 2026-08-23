// Centralized Mellosoft Mattress & Accessories Master Catalogue (66 Mattress Products)

export const CATEGORY_FALLBACK_IMAGES = {
  foam: "/images/mattresses/fallback/foam.svg",
  ortho: "/images/mattresses/fallback/ortho.svg",
  spring: "/images/mattresses/fallback/spring.svg",
  latex: "/images/mattresses/fallback/latex.svg",
  "memory-foam": "/images/mattresses/fallback/memory-foam.svg"
};

export const STANDARD_SIZES = {
  Single: ["72 x 30", "72 x 36", "75 x 30", "75 x 36", "78 x 30", "78 x 36", "84 x 36"],
  Double: ["72 x 42", "72 x 44", "72 x 48", "75 x 44", "75 x 48", "78 x 48", "84 x 48"],
  Queen: ["72 x 60", "75 x 60", "78 x 60", "84 x 60", "72 x 66", "75 x 66", "78 x 66", "84 x 66"],
  King: ["72 x 72", "75 x 72", "78 x 72", "84 x 72"]
};

export const MATTRESS_CATEGORIES = [
  { id: "foam", name: "Foam Mattress", slug: "foam", tagline: "Simple, supportive comfort designed for everyday rest.", heroImage: "/images/mattresses/fallback/foam.svg" },
  { id: "ortho", name: "Ortho Mattress", slug: "ortho", tagline: "Designed for balanced firmness and dependable support.", heroImage: "/images/mattresses/fallback/ortho.svg" },
  { id: "spring", name: "Spring Mattress", slug: "spring", tagline: "Responsive support with breathable comfort.", heroImage: "/images/mattresses/fallback/spring.svg" },
  { id: "latex", name: "Latex Mattress", slug: "latex", tagline: "Naturally responsive comfort with premium resilience.", heroImage: "/images/mattresses/fallback/latex.svg" },
  { id: "memory-foam", name: "Memory Foam Mattress", slug: "memory-foam", tagline: "Adaptive comfort designed to contour around you.", heroImage: "/images/mattresses/fallback/memory-foam.svg" }
];


export const ACCESSORY_FALLBACK_IMAGES = {
  "memory-foam-pillow": "/images/accessories/fallback/memory-foam-pillow.svg",
  "latex-pillow": "/images/accessories/fallback/latex-pillow.svg",
  "fiber-pillow": "/images/accessories/fallback/fiber-pillow.svg",
  "mattress-protector": "/images/accessories/fallback/mattress-protector.svg",
  "fitted-bedspread": "/images/accessories/fallback/fitted-bedspread.svg",
  "blanket-duvet": "/images/accessories/fallback/blanket-duvet.svg",
  "travel-bed": "/images/accessories/fallback/travel-bed.svg"
};

export const ACCESSORIES_CATEGORIES = [
  { id: "memory-foam-pillow", name: "Memory Foam Pillow", slug: "memory-foam-pillow", tagline: "Adaptive comfort designed to support your head and neck.", variants: ["Contour", "Soap"] },
  { id: "latex-pillow", name: "Latex Pillow", slug: "latex-pillow", tagline: "Naturally responsive, breathable comfort for refreshing sleep.", variants: ["Contour", "Soap"] },
  { id: "fiber-pillow", name: "Fiber Pillow", slug: "fiber-pillow", tagline: "Soft, lightweight comfort for everyday relaxation.", variants: ["Small", "Big"] },
  { id: "mattress-protector", name: "Mattress Protector", slug: "mattress-protector", tagline: "Practical protection designed to keep your mattress fresh and comfortable.", sizes: ["78 x 36", "78 x 48", "78 x 60", "78 x 72"] },
  { id: "fitted-bedspread", name: "Fitted Bedspread", slug: "fitted-bedspread", tagline: "Clean fitted styling for a neat and comfortable bedroom.", sizes: ["75 x 36", "75 x 48", "78 x 60", "78 x 72"] },
  { id: "blanket-duvet", name: "Blanket / Duvet", slug: "blanket-duvet", tagline: "Cozy layers designed for comfortable nights in every season.", sizes: ["90 x 60", "100 x 90"] },
  { id: "travel-bed", name: "Travel Bed", slug: "travel-bed", tagline: "Portable sleep comfort for guests, journeys and compact spaces.", types: ["Quilt", "Folding Bed"] }
];


export const MATTRESS_PRODUCTS = [
  // ─── FOAM MATTRESSES (12) ──────────────────────────────────────────────────
  {
    id: "haven",
    slug: "haven",
    name: "Haven",
    category: "foam",
    categoryName: "Foam Mattress",
    tagline: "a sanctuary of rest",
    construction: "PU FOAM",
    thicknessOptions: ["4 inch", "5 inch"],
    layers: { "4 inch": "4 PU foam", "5 inch": "5 PU foam" },
    images: ["/images/mattresses/foam/haven.svg", "/asset/texture.png"],
    description: "Conformed for deep, undisturbed rest. The Haven PU Foam mattress offers balanced lumbar cushioning and all-night breathability.",
    startingPrice: 10411,
    prices: {
      "4 inch": {
        "72 x 30": 10411, "72 x 36": 12493, "75 x 30": 10845, "75 x 36": 13014,
        "78 x 30": 11279, "78 x 36": 13535, "84 x 36": 14576,
        "72 x 42": 14576, "72 x 44": 15270, "72 x 48": 16658, "75 x 44": 15906,
        "75 x 48": 17352, "78 x 48": 18046, "84 x 48": 19434,
        "72 x 60": 20822, "75 x 60": 21690, "78 x 60": 22558, "84 x 60": 24293,
        "72 x 72": 24987, "75 x 72": 26028, "78 x 72": 27069, "84 x 72": 29151
      },
      "5 inch": {
        "72 x 30": 13014, "72 x 36": 15616, "75 x 30": 13556, "75 x 36": 16268,
        "78 x 30": 14099, "78 x 36": 16919, "84 x 36": 18220,
        "72 x 42": 18220, "72 x 44": 19088, "72 x 48": 20823, "75 x 44": 19883,
        "75 x 48": 21690, "78 x 48": 22558, "84 x 48": 24293,
        "72 x 60": 26028, "75 x 60": 27113, "78 x 60": 28198, "84 x 60": 30366,
        "72 x 72": 31234, "75 x 72": 32535, "78 x 72": 33836, "84 x 72": 36439
      }
    }
  },
  {
    id: "cocoon",
    slug: "cocoon",
    name: "Cocoon",
    category: "foam",
    categoryName: "Foam Mattress",
    tagline: "plush and protective",
    construction: "SS + HR",
    thicknessOptions: ["4 inch", "5 inch"],
    layers: { "4 inch": "2 supersoft + 2 high resilience", "5 inch": "2 supersoft + 3 high resilience" },
    images: ["/images/mattresses/foam/cocoon.svg", "/asset/texture.png"],
    description: "Experience the ultimate cocooning sensation with dual-density high resilience and plush supersoft foam.",
    startingPrice: 11556,
    prices: {
      "4 inch": {
        "72 x 30": 11556, "72 x 36": 13867, "75 x 30": 12038, "75 x 36": 14446,
        "78 x 30": 12520, "78 x 36": 15024, "84 x 36": 16179,
        "72 x 42": 16179, "72 x 44": 16950, "72 x 48": 18490, "75 x 44": 17656,
        "75 x 48": 19261, "78 x 48": 20031, "84 x 48": 21572,
        "72 x 60": 23112, "75 x 60": 24076, "78 x 60": 25039, "84 x 60": 26965,
        "72 x 72": 27736, "75 x 72": 28891, "78 x 72": 30047, "84 x 72": 32358
      },
      "5 inch": {
        "72 x 30": 14445, "72 x 36": 17334, "75 x 30": 15048, "75 x 36": 18058,
        "78 x 30": 15650, "78 x 36": 18780, "84 x 36": 20224,
        "72 x 42": 20224, "72 x 44": 21188, "72 x 48": 23113, "75 x 44": 22070,
        "75 x 48": 24076, "78 x 48": 25039, "84 x 48": 26965,
        "72 x 60": 28890, "75 x 60": 30095, "78 x 60": 31299, "84 x 60": 33706,
        "72 x 72": 34670, "75 x 72": 36114, "78 x 72": 37559, "84 x 72": 40448
      }
    }
  },
  { id: "cloudrest", slug: "cloudrest", name: "CloudRest", category: "foam", categoryName: "Foam Mattress", tagline: "soft comfort for peaceful nights", construction: "PREMIUM PU FOAM", thicknessOptions: ["4 inch", "5 inch", "6 inch"], images: ["/images/mattresses/foam/cloudrest.svg"], description: "Soft premium PU foam mattress tailored for deep, pressure-free rest.", startingPrice: null },
  { id: "dreamnest", slug: "dreamnest", name: "DreamNest", category: "foam", categoryName: "Foam Mattress", tagline: "your everyday comfort sanctuary", construction: "PU FOAM + COMFORT FOAM", thicknessOptions: ["5 inch", "6 inch"], images: ["/images/mattresses/foam/dreamnest.svg"], description: "Comfort sanctuary with dual-layer PU and plush cushioning foam.", startingPrice: null },
  { id: "serenity", slug: "serenity", name: "Serenity", category: "foam", categoryName: "Foam Mattress", tagline: "simple comfort, beautifully designed", construction: "HIGH DENSITY FOAM", thicknessOptions: ["4 inch", "5 inch", "6 inch"], images: ["/images/mattresses/foam/serenity.svg"], description: "High density foam engineered for long-lasting spinal support.", startingPrice: null },
  { id: "comforta", slug: "comforta", name: "Comforta", category: "foam", categoryName: "Foam Mattress", tagline: "balanced comfort for everyday sleep", construction: "PU + HR FOAM", thicknessOptions: ["5 inch", "6 inch"], images: ["/images/mattresses/foam/comforta.svg"], description: "High resilience foam blended with open-cell PU foam for resilient support.", startingPrice: null },
  { id: "cloudnine", slug: "cloudnine", name: "CloudNine", category: "foam", categoryName: "Foam Mattress", tagline: "light, plush and wonderfully comfortable", construction: "SUPER SOFT + PU FOAM", thicknessOptions: ["5 inch", "6 inch", "8 inch"], images: ["/images/mattresses/foam/cloudnine.svg"], description: "Plush supersoft comfort topper with high-density support core.", startingPrice: null },
  { id: "resteasy", slug: "resteasy", name: "RestEasy", category: "foam", categoryName: "Foam Mattress", tagline: "dependable comfort night after night", construction: "HIGH RESILIENCE FOAM", thicknessOptions: ["4 inch", "5 inch", "6 inch"], images: ["/images/mattresses/foam/resteasy.svg"], description: "High resilience foam mattress providing durable motion isolation.", startingPrice: null },
  { id: "feathersoft", slug: "feathersoft", name: "FeatherSoft", category: "foam", categoryName: "Foam Mattress", tagline: "gentle cushioning with supportive comfort", construction: "SUPER SOFT + HR FOAM", thicknessOptions: ["5 inch", "6 inch"], images: ["/images/mattresses/foam/feathersoft.svg"], description: "Feather-light soft feel cradles pressure points for effortless sleep.", startingPrice: null },
  { id: "purecomfort", slug: "purecomfort", name: "PureComfort", category: "foam", categoryName: "Foam Mattress", tagline: "comfort in its simplest form", construction: "HIGH DENSITY PU FOAM", thicknessOptions: ["4 inch", "5 inch", "6 inch"], images: ["/images/mattresses/foam/purecomfort.svg"], description: "Pure high density PU foam designed for simple, pure sleep comfort.", startingPrice: null },
  { id: "dreamcloud", slug: "dreamcloud", name: "DreamCloud", category: "foam", categoryName: "Foam Mattress", tagline: "plush relaxation from dusk to dawn", construction: "SOFT FOAM + HR FOAM", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/foam/dreamcloud.svg"], description: "Deep plush comfort with responsive high resilience foundation.", startingPrice: null },
  { id: "bliss", slug: "bliss", name: "Bliss", category: "foam", categoryName: "Foam Mattress", tagline: "effortless comfort for better sleep", construction: "PREMIUM COMFORT FOAM", thicknessOptions: ["5 inch", "6 inch", "8 inch"], images: ["/images/mattresses/foam/bliss.svg"], description: "Effortless sleep bliss powered by multi-density responsive foam.", startingPrice: null },

  // ─── ORTHO MATTRESSES (13) ─────────────────────────────────────────────────
  {
    id: "bloom",
    slug: "bloom",
    name: "Bloom",
    category: "ortho",
    categoryName: "Ortho Mattress",
    tagline: "Fresh and rejuvenating",
    construction: "SS + ORTHO",
    thicknessOptions: ["6 inch", "8 inch"],
    layers: { "6 inch": "2 supersoft + 4 ortho", "8 inch": "4 supersoft + 4 ortho" },
    images: ["/images/mattresses/ortho/bloom.svg", "/asset/img2.jpg"],
    description: "Rejuvenates tired joints and aligns spine curvature using ergonomic orthopedic high-density layers.",
    startingPrice: 15811,
    prices: {
      "6 inch": {
        "72 x 30": 15811, "72 x 36": 18973, "75 x 30": 16470, "75 x 36": 19764,
        "78 x 30": 17129, "78 x 36": 20555, "84 x 36": 22136,
        "72 x 42": 22136, "72 x 44": 23190, "72 x 48": 25298, "75 x 44": 24156,
        "75 x 48": 26352, "78 x 48": 27406, "84 x 48": 29514,
        "72 x 60": 31622, "75 x 60": 32940, "78 x 60": 34258, "84 x 60": 36893,
        "72 x 72": 37947, "75 x 72": 39528, "78 x 72": 41109, "84 x 72": 44271
      },
      "8 inch": {
        "72 x 30": 21076, "72 x 36": 25291, "75 x 30": 21955, "75 x 36": 26345,
        "78 x 30": 22833, "78 x 36": 27400, "84 x 36": 29507,
        "72 x 42": 29507, "72 x 44": 30912, "72 x 48": 33722, "75 x 44": 32200,
        "75 x 48": 35127, "78 x 48": 36532, "84 x 48": 39342,
        "72 x 60": 42152, "75 x 60": 43909, "78 x 60": 45666, "84 x 60": 49178,
        "72 x 72": 50583, "75 x 72": 52691, "78 x 72": 54798, "84 x 72": 59013
      }
    }
  },
  {
    id: "mist",
    slug: "mist",
    name: "Mist",
    category: "ortho",
    categoryName: "Ortho Mattress",
    tagline: "cool and breathable",
    construction: "LATEX + ORTHO",
    thicknessOptions: ["6 inch", "8 inch"],
    layers: { "6 inch": "2 latex + 4 ortho", "8 inch": "4 latex + 4 ortho" },
    images: ["/images/mattresses/ortho/mist.svg", "/asset/img1.jpg"],
    description: "Combines ventilated natural latex with high-rigidity orthopedic core foam for cool, effortless back comfort.",
    startingPrice: 22550,
    prices: {
      "6 inch": {
        "72 x 30": 22550, "72 x 36": 27060, "75 x 30": 23490, "75 x 36": 28188,
        "78 x 30": 24430, "78 x 36": 29316, "84 x 36": 31571,
        "72 x 42": 31571, "72 x 44": 33074, "72 x 48": 36081, "75 x 44": 34452,
        "75 x 48": 37584, "78 x 48": 39087, "84 x 48": 42094,
        "72 x 60": 45101, "75 x 60": 46980, "78 x 60": 48859, "84 x 60": 52618,
        "72 x 72": 54121, "75 x 72": 56376, "78 x 72": 58631, "84 x 72": 63141
      },
      "8 inch": {
        "72 x 30": 34128, "72 x 36": 40954, "75 x 30": 35550, "75 x 36": 42660,
        "78 x 30": 36972, "78 x 36": 44366, "84 x 36": 47779,
        "72 x 42": 47779, "72 x 44": 50054, "72 x 48": 54605, "75 x 44": 52140,
        "75 x 48": 56880, "78 x 48": 59155, "84 x 48": 63706,
        "72 x 60": 68256, "75 x 60": 71100, "78 x 60": 73944, "84 x 60": 79632,
        "72 x 72": 81907, "75 x 72": 85320, "78 x 72": 88733, "84 x 72": 95558
      }
    }
  },
  {
    id: "terra",
    slug: "terra",
    name: "Terra",
    category: "ortho",
    categoryName: "Ortho Mattress",
    tagline: "grounded and natural",
    construction: "MEMORY + ORTHO",
    thicknessOptions: ["6 inch", "8 inch"],
    layers: { "6 inch": "2 memory + 4 ortho", "8 inch": "4 memory + 4 ortho" },
    images: ["/images/mattresses/ortho/terra.svg", "/asset/texture.png"],
    description: "Memory foam contouring supported by orthopedic firm base layer for solid posture support.",
    startingPrice: 18576,
    prices: {
      "6 inch": {
        "72 x 30": 18576, "72 x 36": 22291, "75 x 30": 19350, "75 x 36": 23220,
        "78 x 30": 20124, "78 x 36": 24149, "84 x 36": 26006,
        "72 x 42": 26006, "72 x 44": 27245, "72 x 48": 29722, "75 x 44": 28380,
        "75 x 48": 30960, "78 x 48": 32198, "84 x 48": 34675,
        "72 x 60": 37152, "75 x 60": 38700, "78 x 60": 40248, "84 x 60": 43344,
        "72 x 72": 44582, "75 x 72": 46440, "78 x 72": 48298, "84 x 72": 52013
      },
      "8 inch": {
        "72 x 30": 27432, "72 x 36": 32918, "75 x 30": 28575, "75 x 36": 34290,
        "78 x 30": 29718, "78 x 36": 35662, "84 x 36": 38405,
        "72 x 42": 38405, "72 x 44": 40234, "72 x 48": 43891, "75 x 44": 41910,
        "75 x 48": 45720, "78 x 48": 47549, "84 x 48": 51206,
        "72 x 60": 54864, "75 x 60": 57150, "78 x 60": 59436, "84 x 60": 64008,
        "72 x 72": 65837, "75 x 72": 68580, "78 x 72": 71323, "84 x 72": 76810
      }
    }
  },
  { id: "spinecare", slug: "spinecare", name: "SpineCare", category: "ortho", categoryName: "Ortho Mattress", tagline: "firm support designed around your back", construction: "ORTHO + HR", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/ortho/spinecare.svg"], description: "Orthopedic core designed around spine alignment and lower back tension relief.", startingPrice: null },
  { id: "align", slug: "align", name: "Align", category: "ortho", categoryName: "Ortho Mattress", tagline: "support that keeps comfort in line", construction: "ORTHO SUPPORT FOAM", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/ortho/align.svg"], description: "Keeps spinal alignment in line for back and side sleepers alike.", startingPrice: null },
  { id: "postureplus", slug: "postureplus", name: "PosturePlus", category: "ortho", categoryName: "Ortho Mattress", tagline: "balanced support for restorative sleep", construction: "HR + ORTHO", thicknessOptions: ["6 inch", "8 inch", "10 inch"], images: ["/images/mattresses/ortho/postureplus.svg"], description: "Multi-layered posture support preventing hip sinkage and shoulder stress.", startingPrice: null },
  { id: "spineguard", slug: "spineguard", name: "SpineGuard", category: "ortho", categoryName: "Ortho Mattress", tagline: "strong support where your body needs it", construction: "ORTHO + HIGH DENSITY FOAM", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/ortho/spineguard.svg"], description: "Heavy duty spine protection core engineered for back stiffness relief.", startingPrice: null },
  { id: "revive", slug: "revive", name: "Revive", category: "ortho", categoryName: "Ortho Mattress", tagline: "wake refreshed with dependable support", construction: "MEMORY + ORTHO", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/ortho/revive.svg"], description: "Revitalizing memory top cradles your body over rigid orthopedic support.", startingPrice: null },
  { id: "balance", slug: "balance", name: "Balance", category: "ortho", categoryName: "Ortho Mattress", tagline: "the harmony of firmness and comfort", construction: "SUPER SOFT + ORTHO", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/ortho/balance.svg"], description: "Balanced firmness for sleepers needing rigid support with plush surface feel.", startingPrice: null },
  { id: "restore", slug: "restore", name: "Restore", category: "ortho", categoryName: "Ortho Mattress", tagline: "supportive sleep for renewed mornings", construction: "ORTHO + HR FOAM", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/ortho/restore.svg"], description: "Restores energy with zero-sag orthopedic structural base.", startingPrice: null },
  { id: "ergorest", slug: "ergorest", name: "ErgoRest", category: "ortho", categoryName: "Ortho Mattress", tagline: "ergonomic comfort engineered for sleep", construction: "LATEX + ORTHO", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/ortho/ergorest.svg"], description: "Ergonomic latex layer provides buoyant support above orthopedic core.", startingPrice: null },
  { id: "firmcare", slug: "firmcare", name: "FirmCare", category: "ortho", categoryName: "Ortho Mattress", tagline: "reliable firmness without sacrificing comfort", construction: "HIGH DENSITY + ORTHO", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/ortho/firmcare.svg"], description: "Extra-firm lumbar support mattress for doctors-recommended spinal care.", startingPrice: null },
  { id: "backbone", slug: "backbone", name: "Backbone", category: "ortho", categoryName: "Ortho Mattress", tagline: "serious support for seriously good sleep", construction: "ORTHO CORE + HR", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/ortho/backbone.svg"], description: "Flagship orthopedic backbone support system built for heavy duty durability.", startingPrice: null },

  // ─── SPRING MATTRESSES (12) ────────────────────────────────────────────────
  { id: "willow", slug: "willow", name: "Willow", category: "spring", categoryName: "Spring Mattress", tagline: "soft and flexible support", construction: "BONNEL SPRING", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/spring/willow.svg"], description: "Classic Bonnel spring technology offering flexible posture adaptation.", startingPrice: null },
  { id: "horizon", slug: "horizon", name: "Horizon", category: "spring", categoryName: "Spring Mattress", tagline: "expansive comfort", construction: "POCKET SPRING", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/spring/horizon.svg"], description: "Individually pocketed steel coils dissipate motion transfer for quiet sleep.", startingPrice: null },
  { id: "breeze", slug: "breeze", name: "Breeze", category: "spring", categoryName: "Spring Mattress", tagline: "responsive comfort with refreshing airflow", construction: "BONNELL SPRING + FOAM", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/spring/breeze.svg"], description: "Airflow-boosting Bonnell spring design keeps mattress cool all night.", startingPrice: null },
  { id: "cascade", slug: "cascade", name: "Cascade", category: "spring", categoryName: "Spring Mattress", tagline: "responsive support from edge to edge", construction: "POCKET SPRING + FOAM", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/spring/cascade.svg"], description: "Full edge-to-edge pocket spring grid prevents side sagging.", startingPrice: null },
  { id: "momentum", slug: "momentum", name: "Momentum", category: "spring", categoryName: "Spring Mattress", tagline: "dynamic support built for every movement", construction: "POCKET SPRING + HR", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/spring/momentum.svg"], description: "Dynamic spring rebound absorbs tosses and turns effortlessly.", startingPrice: null },
  { id: "springair", slug: "springair", name: "SpringAir", category: "spring", categoryName: "Spring Mattress", tagline: "breathable sleep with classic spring comfort", construction: "BONNELL SPRING", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/spring/springair.svg"], description: "Breathable open coil matrix ensures steady thermal regulation.", startingPrice: null },
  { id: "elevate", slug: "elevate", name: "Elevate", category: "spring", categoryName: "Spring Mattress", tagline: "lift your sleep to a new level", construction: "POCKET SPRING + SUPER SOFT", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/spring/elevate.svg"], description: "Elevates weight distribution with plush quilted top over responsive pocket coils.", startingPrice: null },
  { id: "rhythm", slug: "rhythm", name: "Rhythm", category: "spring", categoryName: "Spring Mattress", tagline: "responsive comfort that moves with you", construction: "POCKET SPRING", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/spring/rhythm.svg"], description: "Fluid pocket coil matrix adapts in rhythm with body contours.", startingPrice: null },
  { id: "bounce", slug: "bounce", name: "Bounce", category: "spring", categoryName: "Spring Mattress", tagline: "lively support with lasting comfort", construction: "BONNELL SPRING + HR", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/spring/bounce.svg"], description: "Lively coil feedback offers traditional spring bounce and comfort.", startingPrice: null },
  { id: "aerospring", slug: "aerospring", name: "AeroSpring", category: "spring", categoryName: "Spring Mattress", tagline: "airy comfort with responsive support", construction: "POCKET SPRING + BREATHABLE FOAM", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/spring/aerospring.svg"], description: "Air-circulating pocket coils topped with breathable open-cell foam.", startingPrice: null },
  { id: "royalspring", slug: "royalspring", name: "RoyalSpring", category: "spring", categoryName: "Spring Mattress", tagline: "classic spring comfort with a premium touch", construction: "POCKET SPRING + SUPER SOFT + HR", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/spring/royalspring.svg"], description: "Hotel-grade pocket spring luxury with plush pillow-top padding.", startingPrice: null },
  { id: "infinity", slug: "infinity", name: "Infinity", category: "spring", categoryName: "Spring Mattress", tagline: "continuous comfort built around you", construction: "ADVANCED POCKET SPRING", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/spring/infinity.svg"], description: "Advanced multi-zone pocket coil system built for lifetime durability.", startingPrice: null },

  // ─── LATEX MATTRESSES (15) ─────────────────────────────────────────────────
  { id: "royale", slug: "royale", name: "Royale", category: "latex", categoryName: "Latex Mattress", tagline: "regal and opulent", construction: "LATEX + PU", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/latex/royale.svg"], description: "Luxurious latex topper rested over a dense PU foundation.", startingPrice: null },
  { id: "luxe", slug: "luxe", name: "Luxe", category: "latex", categoryName: "Latex Mattress", tagline: "sleek and indulgent", construction: "LATEX + SS + HR", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/latex/luxe.svg"], description: "Triple-layer sleep design integrating natural latex and supersoft cushioning.", startingPrice: null },
  { id: "opus", slug: "opus", name: "Opus", category: "latex", categoryName: "Latex Mattress", tagline: "a work of art in sleep engineering", construction: "LATEX + HR", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/latex/opus.svg"], description: "Heavy latex top construction delivering deep buoyant pressure relief.", startingPrice: null },
  { id: "elite", slug: "elite", name: "Elite", category: "latex", categoryName: "Latex Mattress", tagline: "premium performance and materials", construction: "LATEX + SS + HR", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/latex/elite.svg"], description: "Masterwork hybrid latex mattress for deep rest and durability.", startingPrice: null },
  { id: "signature", slug: "signature", name: "Signature", category: "latex", categoryName: "Latex Mattress", tagline: "your brand-defining masterpiece", construction: "PURE FULL LATEX", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/latex/signature.svg"], description: "100% full natural latex core offering unmatched organic comfort.", startingPrice: null },
  { id: "natura", slug: "natura", name: "Natura", category: "latex", categoryName: "Latex Mattress", tagline: "naturally comfortable, beautifully supportive", construction: "NATURAL LATEX", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/latex/natura.svg"], description: "Eco-certified natural Dunlop latex with organic cotton cover.", startingPrice: null },
  { id: "ecorest", slug: "ecorest", name: "EcoRest", category: "latex", categoryName: "Latex Mattress", tagline: "natural comfort for conscious sleep", construction: "LATEX + HR", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/latex/ecorest.svg"], description: "Conscious organic latex combined with high resilience foundation.", startingPrice: null },
  { id: "purelatex", slug: "purelatex", name: "PureLatex", category: "latex", categoryName: "Latex Mattress", tagline: "pure responsive comfort from nature", construction: "FULL LATEX", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/latex/purelatex.svg"], description: "100% pure latex pincore slab providing instant responsive bounce.", startingPrice: null },
  { id: "botanical", slug: "botanical", name: "Botanical", category: "latex", categoryName: "Latex Mattress", tagline: "naturally inspired comfort", construction: "LATEX + PU", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/latex/botanical.svg"], description: "Botanical natural latex topper with hypoallergenic bamboo wrap.", startingPrice: null },
  { id: "evergreen", slug: "evergreen", name: "Evergreen", category: "latex", categoryName: "Latex Mattress", tagline: "lasting comfort with natural resilience", construction: "NATURAL LATEX + HR", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/latex/evergreen.svg"], description: "Durafirm natural latex slab built for decades of resilient sleep.", startingPrice: null },
  { id: "harmony", slug: "harmony", name: "Harmony", category: "latex", categoryName: "Latex Mattress", tagline: "responsive support in perfect balance", construction: "LATEX + SUPER SOFT", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/latex/harmony.svg"], description: "Harmonious blend of bouncy natural latex and cloudlike soft foam.", startingPrice: null },
  { id: "verde", slug: "verde", name: "Verde", category: "latex", categoryName: "Latex Mattress", tagline: "fresh comfort inspired by nature", construction: "PREMIUM LATEX", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/latex/verde.svg"], description: "Verde green organic latex offering chemical-free natural sleep.", startingPrice: null },
  { id: "origin", slug: "origin", name: "Origin", category: "latex", categoryName: "Latex Mattress", tagline: "natural sleep starts here", construction: "FULL LATEX", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/latex/origin.svg"], description: "Origin pure latex core with pin-hole thermal ventilation channels.", startingPrice: null },
  { id: "euphoria", slug: "euphoria", name: "Euphoria", category: "latex", categoryName: "Latex Mattress", tagline: "luxurious latex comfort every night", construction: "LATEX + SUPER SOFT + HR", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/latex/euphoria.svg"], description: "Euphoric comfort with thick natural latex and plush quilted topper.", startingPrice: null },
  { id: "sovereign", slug: "sovereign", name: "Sovereign", category: "latex", categoryName: "Latex Mattress", tagline: "premium natural comfort without compromise", construction: "PURE FULL LATEX", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/latex/sovereign.svg"], description: "Flagship sovereign 100% full natural latex masterpiece.", startingPrice: null },

  // ─── MEMORY FOAM MATTRESSES (14) ───────────────────────────────────────────
  { id: "solace", slug: "solace", name: "Solace", category: "memory-foam", categoryName: "Memory Foam Mattress", tagline: "for deep, restorative comfort", construction: "MEMORY + PU", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/memory-foam/solace.svg"], description: "Adapts to body contours to relieve pressure points along shoulders, spine, and hips.", startingPrice: null },
  { id: "eclipse", slug: "eclipse", name: "Eclipse", category: "memory-foam", categoryName: "Memory Foam Mattress", tagline: "ideal for a dual-comfort or hybrid mattress", construction: "MEMORY + SS + HR", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/memory-foam/eclipse.svg"], description: "Dual-comfort pressure distribution designed for all sleeping orientations.", startingPrice: null },
  { id: "aura", slug: "aura", name: "Aura", category: "memory-foam", categoryName: "Memory Foam Mattress", tagline: "light, breathable, and ethereal", construction: "MEMORY + HR", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/memory-foam/aura.svg"], description: "Air-infused memory foam layers pull heat away while cradling pressure points.", startingPrice: null },
  { id: "zenith", slug: "zenith", name: "Zenith", category: "memory-foam", categoryName: "Memory Foam Mattress", tagline: "top-tier, flagship model", construction: "MEMORY + SS + HR", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/memory-foam/zenith.svg"], description: "Mellosoft's flagship memory foam model featuring 4-inch deep memory layer.", startingPrice: null },
  { id: "embrace", slug: "embrace", name: "Embrace", category: "memory-foam", categoryName: "Memory Foam Mattress", tagline: "comfort that gently surrounds you", construction: "MEMORY FOAM + HR", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/memory-foam/embrace.svg"], description: "Embracing contour foam cradles shoulders and hips for zero-pressure sleep.", startingPrice: null },
  { id: "cloudsense", slug: "cloudsense", name: "CloudSense", category: "memory-foam", categoryName: "Memory Foam Mattress", tagline: "adaptive comfort made for deeper sleep", construction: "MEMORY FOAM + PU", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/memory-foam/cloudsense.svg"], description: "Sensory gel-infused memory foam adapts actively to sleeping positions.", startingPrice: null },
  { id: "dreamwave", slug: "dreamwave", name: "DreamWave", category: "memory-foam", categoryName: "Memory Foam Mattress", tagline: "contouring comfort that flows with you", construction: "MEMORY FOAM + HR", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/memory-foam/dreamwave.svg"], description: "Wave-contour memory foam layer promotes steady spinal alignment.", startingPrice: null },
  { id: "gravity", slug: "gravity", name: "Gravity", category: "memory-foam", categoryName: "Memory Foam Mattress", tagline: "pressure-relieving comfort that feels weightless", construction: "HIGH DENSITY MEMORY FOAM", thicknessOptions: ["6 inch", "8 inch", "10 inch"], images: ["/images/mattresses/memory-foam/gravity.svg"], description: "Weightless zero-gravity memory foam relieves chronic joint pressure.", startingPrice: null },
  { id: "moonlight", slug: "moonlight", name: "Moonlight", category: "memory-foam", categoryName: "Memory Foam Mattress", tagline: "made for calm and comfortable nights", construction: "MEMORY FOAM + SOFT FOAM", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/memory-foam/moonlight.svg"], description: "Plush moonlight memory foam top provides soft hugged feel.", startingPrice: null },
  { id: "tranquil", slug: "tranquil", name: "Tranquil", category: "memory-foam", categoryName: "Memory Foam Mattress", tagline: "deep comfort for uninterrupted rest", construction: "MEMORY + HR", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/memory-foam/tranquil.svg"], description: "Tranquil memory foam core suppresses motion transfer completely.", startingPrice: null },
  { id: "nova", slug: "nova", name: "Nova", category: "memory-foam", categoryName: "Memory Foam Mattress", tagline: "advanced comfort for modern sleep", construction: "MEMORY + SUPER SOFT + HR", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/memory-foam/nova.svg"], description: "Next-gen open cell memory foam for heat-dissipating contour comfort.", startingPrice: null },
  { id: "infinity-memory", slug: "infinity-memory", name: "Infinity Memory", category: "memory-foam", categoryName: "Memory Foam Mattress", tagline: "lasting contouring comfort", construction: "PREMIUM MEMORY FOAM", thicknessOptions: ["6 inch", "8 inch"], images: ["/images/mattresses/memory-foam/infinity-memory.svg"], description: "Long-lasting memory foam that retains shape and firmness year after year.", startingPrice: null },
  { id: "dreamcontour", slug: "dreamcontour", name: "DreamContour", category: "memory-foam", categoryName: "Memory Foam Mattress", tagline: "personalized comfort that follows your body", construction: "MEMORY FOAM + SUPPORT FOAM", thicknessOptions: ["6 inch", "8 inch", "10 inch"], images: ["/images/mattresses/memory-foam/dreamcontour.svg"], description: "Personalized multi-zone memory contour foam fits your unique posture.", startingPrice: null },
  { id: "celestial", slug: "celestial", name: "Celestial", category: "memory-foam", categoryName: "Memory Foam Mattress", tagline: "flagship comfort for truly luxurious sleep", construction: "PREMIUM MEMORY + SUPER SOFT + HR", thicknessOptions: ["8 inch", "10 inch"], images: ["/images/mattresses/memory-foam/celestial.svg"], description: "Flagship celestial memory mattress crafted with 4 layers of responsive foam.", startingPrice: null }
];

export function getProductBySlug(slug) {
  return MATTRESS_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
}

export function getProductsByCategory(category) {
  if (!category || category === "All" || category === "all") return MATTRESS_PRODUCTS;
  return MATTRESS_PRODUCTS.filter((p) => p.category === category);
}

export function getCalculatedPrice(productId, thickness, size) {
  const product = getProductBySlug(productId);
  if (!product || !product.prices) return null;
  const thicknessPrices = product.prices[thickness];
  if (!thicknessPrices) return null;
  const price = thicknessPrices[size];
  return typeof price === "number" ? price : null;
}


export const ACCESSORY_PRODUCTS = [
  // Base 7 items
  { id: "memory-foam-pillow", slug: "memory-foam-pillow", name: "Memory Foam Pillow", category: "memory-foam-pillow", categoryName: "Memory Foam Pillow", tagline: "Ergonomic cervical support for neck and shoulder relaxation.", type: "Contour & Soap Memory Foam Pillow", images: ["/asset/pillow.png"], startingPrice: null },
  { id: "latex-pillow", slug: "latex-pillow", name: "Latex Pillow", category: "latex-pillow", categoryName: "Latex Pillow", tagline: "Naturally bouncy, pin-core ventilated cooling pillow.", type: "Natural Dunlop Latex Pillow", images: ["/asset/pillow.png"], startingPrice: null },
  { id: "fiber-pillow", slug: "fiber-pillow", name: "Fiber Pillow", category: "fiber-pillow", categoryName: "Fiber Pillow", tagline: "Plush micro-fiber cloud comfort pillow.", type: "Microfiber Pillow", images: ["/asset/pillow.png"], startingPrice: null },
  { id: "mattress-protector", slug: "mattress-protector", name: "Mattress Protector", category: "mattress-protector", categoryName: "Mattress Protector", tagline: "Waterproof, breathable shielding for your mattress.", type: "Waterproof Bamboo Protector", images: ["/asset/texture.png"], startingPrice: null },
  { id: "fitted-bedspread", slug: "fitted-bedspread", name: "Fitted Bedspread", category: "fitted-bedspread", categoryName: "Fitted Bedspread", tagline: "Snug, wrinkle-free elastic fitted sheets.", type: "100% Cotton Bedspread", images: ["/asset/img2.jpg"], startingPrice: null },
  { id: "blanket-duvet", slug: "blanket-duvet", name: "Blanket / Duvet", category: "blanket-duvet", categoryName: "Blanket / Duvet", tagline: "All-season lightweight thermal duvet.", type: "All-Season Thermal Duvet", images: ["/asset/img1.jpg"], startingPrice: null },
  { id: "travel-bed", slug: "travel-bed", name: "Travel Bed", category: "travel-bed", categoryName: "Travel Bed", tagline: "Portable, fold-away comfort for guests and travel.", type: "Portable Fold Bed", images: ["/asset/img2.jpg"], startingPrice: null },

  // 10 MEMORY FOAM PILLOWS
  { id: "cloud-contour", slug: "cloud-contour", name: "CloudContour", category: "memory-foam-pillow", categoryName: "Memory Foam Pillow", tagline: "adaptive neck support with cloud-like comfort", type: "Contour Memory Foam Pillow", firmness: "Medium", images: ["/images/accessories/memory-foam-pillows/cloud-contour.svg"], startingPrice: null },
  { id: "dream-wave", slug: "dream-wave", name: "DreamWave", category: "memory-foam-pillow", categoryName: "Memory Foam Pillow", tagline: "gentle contouring for relaxed sleep", type: "Wave Memory Foam Pillow", firmness: "Medium Soft", images: ["/images/accessories/memory-foam-pillows/dream-wave.svg"], startingPrice: null },
  { id: "neck-ease", slug: "neck-ease", name: "NeckEase", category: "memory-foam-pillow", categoryName: "Memory Foam Pillow", tagline: "designed for comfortable neck alignment", type: "Cervical Memory Foam Pillow", firmness: "Medium Firm", images: ["/images/accessories/memory-foam-pillows/neck-ease.svg"], startingPrice: null },
  { id: "aero-memory", slug: "aero-memory", name: "AeroMemory", category: "memory-foam-pillow", categoryName: "Memory Foam Pillow", tagline: "breathable memory foam comfort", type: "Ventilated Memory Foam Pillow", firmness: "Medium", images: ["/images/accessories/memory-foam-pillows/aero-memory.svg"], startingPrice: null },
  { id: "cool-sense", slug: "cool-sense", name: "CoolSense", category: "memory-foam-pillow", categoryName: "Memory Foam Pillow", tagline: "cooling comfort with responsive support", type: "Cooling Memory Foam Pillow", firmness: "Medium", images: ["/images/accessories/memory-foam-pillows/cool-sense.svg"], startingPrice: null },
  { id: "serenity-memory", slug: "serenity-memory", name: "Serenity Memory", category: "memory-foam-pillow", categoryName: "Memory Foam Pillow", tagline: "deep comfort for peaceful nights", type: "Classic Memory Foam Pillow", firmness: "Soft", images: ["/images/accessories/memory-foam-pillows/serenity-memory.svg"], startingPrice: null },
  { id: "support-plus", slug: "support-plus", name: "SupportPlus", category: "memory-foam-pillow", categoryName: "Memory Foam Pillow", tagline: "enhanced support for everyday rest", type: "Support Memory Foam Pillow", firmness: "Firm", images: ["/images/accessories/memory-foam-pillows/support-plus.svg"], startingPrice: null },
  { id: "dream-contour-pillow", slug: "dream-contour-pillow", name: "DreamContour Pillow", category: "memory-foam-pillow", categoryName: "Memory Foam Pillow", tagline: "personalized contouring for better sleep", type: "Ergonomic Memory Foam Pillow", firmness: "Medium Firm", images: ["/images/accessories/memory-foam-pillows/dream-contour-pillow.svg"], startingPrice: null },
  { id: "plush-memory", slug: "plush-memory", name: "PlushMemory", category: "memory-foam-pillow", categoryName: "Memory Foam Pillow", tagline: "soft cushioning with memory foam support", type: "Plush Memory Foam Pillow", firmness: "Soft", images: ["/images/accessories/memory-foam-pillows/plush-memory.svg"], startingPrice: null },
  { id: "zen-memory", slug: "zen-memory", name: "ZenMemory", category: "memory-foam-pillow", categoryName: "Memory Foam Pillow", tagline: "balanced comfort for calm sleep", type: "Premium Memory Foam Pillow", firmness: "Medium", images: ["/images/accessories/memory-foam-pillows/zen-memory.svg"], startingPrice: null },

  // 10 LATEX PILLOWS
  { id: "natura-latex", slug: "natura-latex", name: "Natura Latex", category: "latex-pillow", categoryName: "Latex Pillow", tagline: "natural resilience for refreshing sleep", type: "Natural Latex Pillow", images: ["/images/accessories/latex-pillows/natura-latex.svg"], startingPrice: null },
  { id: "air-latex", slug: "air-latex", name: "AirLatex", category: "latex-pillow", categoryName: "Latex Pillow", tagline: "ventilated comfort with responsive support", type: "Perforated Latex Pillow", images: ["/images/accessories/latex-pillows/air-latex.svg"], startingPrice: null },
  { id: "pure-latex-pillow", slug: "pure-latex-pillow", name: "PureLatex Pillow", category: "latex-pillow", categoryName: "Latex Pillow", tagline: "simple natural comfort", type: "Full Latex Pillow", images: ["/images/accessories/latex-pillows/pure-latex-pillow.svg"], startingPrice: null },
  { id: "eco-rest-latex", slug: "eco-rest-latex", name: "EcoRest Latex", category: "latex-pillow", categoryName: "Latex Pillow", tagline: "naturally supportive sleep", type: "Natural Latex Pillow", images: ["/images/accessories/latex-pillows/eco-rest-latex.svg"], startingPrice: null },
  { id: "latex-contour-plus", slug: "latex-contour-plus", name: "LatexContour Plus", category: "latex-pillow", categoryName: "Latex Pillow", tagline: "contoured natural support for neck comfort", type: "Contour Latex Pillow", images: ["/images/accessories/latex-pillows/latex-contour-plus.svg"], startingPrice: null },
  { id: "breeze-latex", slug: "breeze-latex", name: "Breeze Latex", category: "latex-pillow", categoryName: "Latex Pillow", tagline: "cool airflow with responsive comfort", type: "Ventilated Latex Pillow", images: ["/images/accessories/latex-pillows/breeze-latex.svg"], startingPrice: null },
  { id: "harmony-latex", slug: "harmony-latex", name: "Harmony Latex", category: "latex-pillow", categoryName: "Latex Pillow", tagline: "balanced softness and natural support", type: "Premium Latex Pillow", images: ["/images/accessories/latex-pillows/harmony-latex.svg"], startingPrice: null },
  { id: "botanical-latex", slug: "botanical-latex", name: "Botanical Latex", category: "latex-pillow", categoryName: "Latex Pillow", tagline: "nature-inspired comfort for restful sleep", type: "Natural Latex Pillow", images: ["/images/accessories/latex-pillows/botanical-latex.svg"], startingPrice: null },
  { id: "latex-cloud", slug: "latex-cloud", name: "LatexCloud", category: "latex-pillow", categoryName: "Latex Pillow", tagline: "soft bounce with breathable comfort", type: "Soft Latex Pillow", images: ["/images/accessories/latex-pillows/latex-cloud.svg"], startingPrice: null },
  { id: "sovereign-latex", slug: "sovereign-latex", name: "Sovereign Latex", category: "latex-pillow", categoryName: "Latex Pillow", tagline: "premium natural comfort and resilience", type: "Luxury Latex Pillow", images: ["/images/accessories/latex-pillows/sovereign-latex.svg"], startingPrice: null },

  // 10 FIBER PILLOWS
  { id: "cloud-fiber", slug: "cloud-fiber", name: "CloudFiber", category: "fiber-pillow", categoryName: "Fiber Pillow", tagline: "light and fluffy everyday comfort", type: "Microfiber Pillow", images: ["/images/accessories/fiber-pillows/cloud-fiber.svg"], startingPrice: null },
  { id: "dream-soft", slug: "dream-soft", name: "DreamSoft", category: "fiber-pillow", categoryName: "Fiber Pillow", tagline: "soft cushioning for relaxed sleep", type: "Soft Fiber Pillow", images: ["/images/accessories/fiber-pillows/dream-soft.svg"], startingPrice: null },
  { id: "hotel-comfort", slug: "hotel-comfort", name: "HotelComfort", category: "fiber-pillow", categoryName: "Fiber Pillow", tagline: "hotel-inspired plush comfort", type: "Premium Fiber Pillow", images: ["/images/accessories/fiber-pillows/hotel-comfort.svg"], startingPrice: null },
  { id: "feather-touch", slug: "feather-touch", name: "FeatherTouch", category: "fiber-pillow", categoryName: "Fiber Pillow", tagline: "feather-like softness without feathers", type: "Siliconized Fiber Pillow", images: ["/images/accessories/fiber-pillows/feather-touch.svg"], startingPrice: null },
  { id: "sleep-cloud", slug: "sleep-cloud", name: "SleepCloud", category: "fiber-pillow", categoryName: "Fiber Pillow", tagline: "soft support for peaceful nights", type: "Hollow Fiber Pillow", images: ["/images/accessories/fiber-pillows/sleep-cloud.svg"], startingPrice: null },
  { id: "comfort-fill", slug: "comfort-fill", name: "ComfortFill", category: "fiber-pillow", categoryName: "Fiber Pillow", tagline: "balanced filling for everyday use", type: "Poly Fiber Pillow", images: ["/images/accessories/fiber-pillows/comfort-fill.svg"], startingPrice: null },
  { id: "plush-fiber", slug: "plush-fiber", name: "PlushFiber", category: "fiber-pillow", categoryName: "Fiber Pillow", tagline: "extra-soft cushioning", type: "Premium Microfiber Pillow", images: ["/images/accessories/fiber-pillows/plush-fiber.svg"], startingPrice: null },
  { id: "air-fill", slug: "air-fill", name: "AirFill", category: "fiber-pillow", categoryName: "Fiber Pillow", tagline: "lightweight and breathable comfort", type: "Breathable Fiber Pillow", images: ["/images/accessories/fiber-pillows/air-fill.svg"], startingPrice: null },
  { id: "rest-easy-fiber", slug: "rest-easy-fiber", name: "RestEasy Fiber", category: "fiber-pillow", categoryName: "Fiber Pillow", tagline: "simple dependable comfort", type: "Standard Fiber Pillow", images: ["/images/accessories/fiber-pillows/rest-easy-fiber.svg"], startingPrice: null },
  { id: "royal-fiber", slug: "royal-fiber", name: "RoyalFiber", category: "fiber-pillow", categoryName: "Fiber Pillow", tagline: "premium plush comfort", type: "Luxury Fiber Pillow", images: ["/images/accessories/fiber-pillows/royal-fiber.svg"], startingPrice: null },

  // 10 MATTRESS PROTECTORS
  { id: "aqua-guard", slug: "aqua-guard", name: "AquaGuard", category: "mattress-protector", categoryName: "Mattress Protector", tagline: "waterproof protection for everyday use", type: "Waterproof Mattress Protector", sizes: ["78 x 36", "78 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/mattress-protectors/aqua-guard.svg"], startingPrice: null },
  { id: "dry-shield", slug: "dry-shield", name: "DryShield", category: "mattress-protector", categoryName: "Mattress Protector", tagline: "reliable protection against spills", type: "Water Resistant Protector", sizes: ["78 x 36", "78 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/mattress-protectors/dry-shield.svg"], startingPrice: null },
  { id: "soft-guard", slug: "soft-guard", name: "SoftGuard", category: "mattress-protector", categoryName: "Mattress Protector", tagline: "soft surface with dependable protection", type: "Quilted Mattress Protector", sizes: ["78 x 36", "78 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/mattress-protectors/soft-guard.svg"], startingPrice: null },
  { id: "cool-guard", slug: "cool-guard", name: "CoolGuard", category: "mattress-protector", categoryName: "Mattress Protector", tagline: "breathable protection for cooler sleep", type: "Breathable Mattress Protector", sizes: ["78 x 36", "78 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/mattress-protectors/cool-guard.svg"], startingPrice: null },
  { id: "pure-shield", slug: "pure-shield", name: "PureShield", category: "mattress-protector", categoryName: "Mattress Protector", tagline: "clean and comfortable mattress protection", type: "Hypoallergenic Protector", sizes: ["78 x 36", "78 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/mattress-protectors/pure-shield.svg"], startingPrice: null },
  { id: "secure-fit", slug: "secure-fit", name: "SecureFit", category: "mattress-protector", categoryName: "Mattress Protector", tagline: "snug fitted protection that stays in place", type: "Fitted Mattress Protector", sizes: ["78 x 36", "78 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/mattress-protectors/secure-fit.svg"], startingPrice: null },
  { id: "premium-guard", slug: "premium-guard", name: "PremiumGuard", category: "mattress-protector", categoryName: "Mattress Protector", tagline: "premium protection for premium mattresses", type: "Luxury Mattress Protector", sizes: ["78 x 36", "78 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/mattress-protectors/premium-guard.svg"], startingPrice: null },
  { id: "fresh-shield", slug: "fresh-shield", name: "FreshShield", category: "mattress-protector", categoryName: "Mattress Protector", tagline: "fresh, breathable and easy-care protection", type: "Breathable Fabric Protector", sizes: ["78 x 36", "78 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/mattress-protectors/fresh-shield.svg"], startingPrice: null },
  { id: "comfort-guard", slug: "comfort-guard", name: "ComfortGuard", category: "mattress-protector", categoryName: "Mattress Protector", tagline: "extra cushioning with protective coverage", type: "Padded Mattress Protector", sizes: ["78 x 36", "78 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/mattress-protectors/comfort-guard.svg"], startingPrice: null },
  { id: "total-guard", slug: "total-guard", name: "TotalGuard", category: "mattress-protector", categoryName: "Mattress Protector", tagline: "complete everyday mattress protection", type: "Full Coverage Protector", sizes: ["78 x 36", "78 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/mattress-protectors/total-guard.svg"], startingPrice: null },

  // 10 FITTED BEDSPREADS
  { id: "soft-fit", slug: "soft-fit", name: "SoftFit", category: "fitted-bedspread", categoryName: "Fitted Bedspread", tagline: "clean fitted styling with soft comfort", material: "Cotton Blend", sizes: ["75 x 36", "75 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/fitted-bedspreads/soft-fit.svg"], startingPrice: null },
  { id: "pure-cotton-fit", slug: "pure-cotton-fit", name: "PureCotton Fit", category: "fitted-bedspread", categoryName: "Fitted Bedspread", tagline: "breathable everyday comfort", material: "Cotton", sizes: ["75 x 36", "75 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/fitted-bedspreads/pure-cotton-fit.svg"], startingPrice: null },
  { id: "luxe-fit", slug: "luxe-fit", name: "LuxeFit", category: "fitted-bedspread", categoryName: "Fitted Bedspread", tagline: "premium fitted elegance", material: "Premium Cotton Blend", sizes: ["75 x 36", "75 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/fitted-bedspreads/luxe-fit.svg"], startingPrice: null },
  { id: "hotel-fit", slug: "hotel-fit", name: "HotelFit", category: "fitted-bedspread", categoryName: "Fitted Bedspread", tagline: "crisp hotel-style bedding", material: "Cotton Rich", sizes: ["75 x 36", "75 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/fitted-bedspreads/hotel-fit.svg"], startingPrice: null },
  { id: "comfort-fit", slug: "comfort-fit", name: "ComfortFit", category: "fitted-bedspread", categoryName: "Fitted Bedspread", tagline: "soft, secure and easy to use", material: "Soft Cotton Blend", sizes: ["75 x 36", "75 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/fitted-bedspreads/comfort-fit.svg"], startingPrice: null },
  { id: "easy-fit", slug: "easy-fit", name: "EasyFit", category: "fitted-bedspread", categoryName: "Fitted Bedspread", tagline: "simple fitted bedding for everyday use", material: "Poly Cotton", sizes: ["75 x 36", "75 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/fitted-bedspreads/easy-fit.svg"], startingPrice: null },
  { id: "satin-touch-fit", slug: "satin-touch-fit", name: "SatinTouch Fit", category: "fitted-bedspread", categoryName: "Fitted Bedspread", tagline: "smooth fitted comfort", material: "Satin Blend", sizes: ["75 x 36", "75 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/fitted-bedspreads/satin-touch-fit.svg"], startingPrice: null },
  { id: "classic-fit", slug: "classic-fit", name: "ClassicFit", category: "fitted-bedspread", categoryName: "Fitted Bedspread", tagline: "timeless fitted bed styling", material: "Cotton Blend", sizes: ["75 x 36", "75 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/fitted-bedspreads/classic-fit.svg"], startingPrice: null },
  { id: "fresh-fit", slug: "fresh-fit", name: "FreshFit", category: "fitted-bedspread", categoryName: "Fitted Bedspread", tagline: "light and breathable fitted comfort", material: "Breathable Fabric", sizes: ["75 x 36", "75 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/fitted-bedspreads/fresh-fit.svg"], startingPrice: null },
  { id: "royal-fit", slug: "royal-fit", name: "RoyalFit", category: "fitted-bedspread", categoryName: "Fitted Bedspread", tagline: "premium fitted bedspread for elegant bedrooms", material: "Luxury Cotton Blend", sizes: ["75 x 36", "75 x 48", "78 x 60", "78 x 72"], images: ["/images/accessories/fitted-bedspreads/royal-fit.svg"], startingPrice: null },

  // 10 BLANKETS / DUVETS
  { id: "cloud-duvet", slug: "cloud-duvet", name: "CloudDuvet", category: "blanket-duvet", categoryName: "Blanket / Duvet", tagline: "soft warmth with cloud-like comfort", type: "Microfiber Duvet", sizes: ["90 x 60", "100 x 90"], images: ["/images/accessories/blankets-duvets/cloud-duvet.svg"], startingPrice: null },
  { id: "warm-nest", slug: "warm-nest", name: "WarmNest", category: "blanket-duvet", categoryName: "Blanket / Duvet", tagline: "cozy warmth for comfortable nights", type: "Comfort Blanket", sizes: ["90 x 60", "100 x 90"], images: ["/images/accessories/blankets-duvets/warm-nest.svg"], startingPrice: null },
  { id: "hotel-duvet", slug: "hotel-duvet", name: "HotelDuvet", category: "blanket-duvet", categoryName: "Blanket / Duvet", tagline: "premium hotel-inspired bedding", type: "Luxury Duvet", sizes: ["90 x 60", "100 x 90"], images: ["/images/accessories/blankets-duvets/hotel-duvet.svg"], startingPrice: null },
  { id: "soft-cloud-blanket", slug: "soft-cloud-blanket", name: "SoftCloud Blanket", category: "blanket-duvet", categoryName: "Blanket / Duvet", tagline: "gentle everyday warmth", type: "Soft Blanket", sizes: ["90 x 60", "100 x 90"], images: ["/images/accessories/blankets-duvets/soft-cloud-blanket.svg"], startingPrice: null },
  { id: "winter-nest", slug: "winter-nest", name: "WinterNest", category: "blanket-duvet", categoryName: "Blanket / Duvet", tagline: "extra warmth for colder nights", type: "Winter Blanket", sizes: ["90 x 60", "100 x 90"], images: ["/images/accessories/blankets-duvets/winter-nest.svg"], startingPrice: null },
  { id: "cozy-dream", slug: "cozy-dream", name: "CozyDream", category: "blanket-duvet", categoryName: "Blanket / Duvet", tagline: "comforting warmth for restful sleep", type: "Premium Blanket", sizes: ["90 x 60", "100 x 90"], images: ["/images/accessories/blankets-duvets/cozy-dream.svg"], startingPrice: null },
  { id: "feather-lite-duvet", slug: "feather-lite-duvet", name: "FeatherLite Duvet", category: "blanket-duvet", categoryName: "Blanket / Duvet", tagline: "lightweight warmth without heaviness", type: "Lightweight Duvet", sizes: ["90 x 60", "100 x 90"], images: ["/images/accessories/blankets-duvets/feather-lite-duvet.svg"], startingPrice: null },
  { id: "all-season-duvet", slug: "all-season-duvet", name: "AllSeason", category: "blanket-duvet", categoryName: "Blanket / Duvet", tagline: "comfortable warmth through every season", type: "All-Season Duvet", sizes: ["90 x 60", "100 x 90"], images: ["/images/accessories/blankets-duvets/all-season-duvet.svg"], startingPrice: null },
  { id: "royal-warmth", slug: "royal-warmth", name: "RoyalWarmth", category: "blanket-duvet", categoryName: "Blanket / Duvet", tagline: "luxurious warmth and softness", type: "Premium Duvet", sizes: ["90 x 60", "100 x 90"], images: ["/images/accessories/blankets-duvets/royal-warmth.svg"], startingPrice: null },
  { id: "dream-wrap", slug: "dream-wrap", name: "DreamWrap", category: "blanket-duvet", categoryName: "Blanket / Duvet", tagline: "wrap yourself in soft comfort", type: "Comfort Duvet", sizes: ["90 x 60", "100 x 90"], images: ["/images/accessories/blankets-duvets/dream-wrap.svg"], startingPrice: null },

  // 10 TRAVEL BEDS
  { id: "travel-lite", slug: "travel-lite", name: "TravelLite", category: "travel-bed", categoryName: "Travel Bed", tagline: "lightweight comfort wherever you go", type: "Foldable Travel Mattress", images: ["/images/accessories/travel-beds/travel-lite.svg"], startingPrice: null },
  { id: "comfort-fold", slug: "comfort-fold", name: "ComfortFold", category: "travel-bed", categoryName: "Travel Bed", tagline: "easy folding comfort for travel", type: "Folding Bed", images: ["/images/accessories/travel-beds/comfort-fold.svg"], startingPrice: null },
  { id: "easy-roll", slug: "easy-roll", name: "EasyRoll", category: "travel-bed", categoryName: "Travel Bed", tagline: "roll, carry and rest anywhere", type: "Rollable Travel Bed", images: ["/images/accessories/travel-beds/easy-roll.svg"], startingPrice: null },
  { id: "camp-comfort", slug: "camp-comfort", name: "CampComfort", category: "travel-bed", categoryName: "Travel Bed", tagline: "comfortable rest for travel and camping", type: "Travel Quilt Mattress", images: ["/images/accessories/travel-beds/camp-comfort.svg"], startingPrice: null },
  { id: "guest-nest", slug: "guest-nest", name: "GuestNest", category: "travel-bed", categoryName: "Travel Bed", tagline: "quick comfort for overnight guests", type: "Portable Guest Bed", images: ["/images/accessories/travel-beds/guest-nest.svg"], startingPrice: null },
  { id: "fold-away", slug: "fold-away", name: "FoldAway", category: "travel-bed", categoryName: "Travel Bed", tagline: "space-saving sleep solution", type: "Foldable Mattress", images: ["/images/accessories/travel-beds/fold-away.svg"], startingPrice: null },
  { id: "journey-bed", slug: "journey-bed", name: "JourneyBed", category: "travel-bed", categoryName: "Travel Bed", tagline: "portable comfort for every journey", type: "Travel Mattress", images: ["/images/accessories/travel-beds/journey-bed.svg"], startingPrice: null },
  { id: "quick-rest", slug: "quick-rest", name: "QuickRest", category: "travel-bed", categoryName: "Travel Bed", tagline: "instant comfort wherever needed", type: "Portable Folding Bed", images: ["/images/accessories/travel-beds/quick-rest.svg"], startingPrice: null },
  { id: "nomad-comfort", slug: "nomad-comfort", name: "NomadComfort", category: "travel-bed", categoryName: "Travel Bed", tagline: "flexible sleep comfort on the move", type: "Travel Quilt", images: ["/images/accessories/travel-beds/nomad-comfort.svg"], startingPrice: null },
  { id: "flexi-bed", slug: "flexi-bed", name: "FlexiBed", category: "travel-bed", categoryName: "Travel Bed", tagline: "flexible folding comfort for compact spaces", type: "Multi-Fold Travel Bed", images: ["/images/accessories/travel-beds/flexi-bed.svg"], startingPrice: null }
];


