export const MOCK_PRODUCTS = [
  {
    id: "classic-mattress",
    name: "Mellosoft Classic Mattress",
    tagline: "The perfect balance of pressure relief and deep support.",
    category: "mattress",
    price: 899,
    rating: 4.8,
    reviewCount: 142,
    badge: "Bestseller",
    images: ["/asset/img1.jpg", "/asset/texture.png", "/asset/img2.jpg"],
    description: "Engineered with three layers of premium responsive foam, the Mellosoft Classic Mattress conforms to your body shape while keeping you cool all night. It provides an optimal level of support to keep your spine aligned.",
    specs: "10\" Height • 3 Foam Layers • Cool-to-the-touch Cover",
    features: [
      "Breathable open-cell foam pulls heat away from your body.",
      "Zoned support system relieves pressure points at your shoulders and hips.",
      "Zero motion transfer makes it ideal for couples.",
      "100-night risk-free trial with free returns."
    ],
    firmnessOptions: ["Soft", "Medium", "Firm"],
    sizeOptions: ["Twin", "Full", "Queen", "King"],
    sizePrices: {
      Twin: 699,
      Full: 799,
      Queen: 899,
      King: 1099
    },
    reviews: [
      {
        id: "r1",
        author: "Helen M.",
        rating: 5,
        date: "Yesterday",
        content: "Excellent running mattress! It conforms to the body and turns very sharply on the comfort. Best sleep I've had in years.",
        helpfulCount: 42,
        replyCount: 0
      },
      {
        id: "r2",
        author: "Ann D.",
        rating: 5,
        date: "2 days ago",
        content: "Good mattress. Soft yet supportive, exactly as advertised. Delivered in a neat box and expanded in under 2 hours.",
        helpfulCount: 35,
        replyCount: 2
      },
      {
        id: "r3",
        author: "Andrew G.",
        rating: 4,
        date: "2 days ago",
        content: "Is it suitable for side sleepers? Yes, absolutely! The shoulder zone is noticeably softer than the middle section.",
        helpfulCount: 12,
        replyCount: 1
      },
      {
        id: "r4",
        author: "Sarah L.",
        rating: 5,
        date: "1 week ago",
        content: "I used to wake up with lower back pain every morning, but after a week on this mattress, it's completely gone. Life-changing!",
        helpfulCount: 58,
        replyCount: 0
      },
      {
        id: "r5",
        author: "John K.",
        rating: 4,
        date: "2 weeks ago",
        content: "Solid build, does not heat up at all. Delivery was prompt. Docked one star because the box was heavy to carry upstairs.",
        helpfulCount: 8,
        replyCount: 0
      }
    ]
  },
  {
    id: "luxe-hybrid",
    name: "Mellosoft Luxe Hybrid",
    tagline: "Luxury comfort meets responsive pocketed coils.",
    category: "mattress",
    price: 1299,
    rating: 4.9,
    reviewCount: 96,
    badge: "Premium",
    images: ["/asset/img2.jpg", "/asset/texture.png", "/asset/img1.jpg"],
    description: "Our most advanced mattress combines contoured memory foam with individually wrapped pocket coils for the ultimate hybrid experience. Offers targeted pressure relief and maximum breathability.",
    specs: "12\" Height • Pocket Coils + Gel Memory Foam • Tencel Cover",
    features: [
      "Individually wrapped coils minimize motion transfer and contour to your body.",
      "Reinforced edge support prevents sagging and roll-off.",
      "Gel-infused memory foam absorbs and dissipates body heat.",
      "Luxury plush quilted top layer feels like a 5-star hotel bed."
    ],
    firmnessOptions: ["Medium", "Firm"],
    sizeOptions: ["Queen", "King"],
    sizePrices: {
      Queen: 1299,
      King: 1499
    },
    reviews: [
      {
        id: "lh-r1",
        author: "Michael F.",
        rating: 5,
        date: "3 days ago",
        content: "This hybrid is outstanding. The pocket coils give it a nice bounce while the foam top cradles your body. Exceptional value.",
        helpfulCount: 22,
        replyCount: 0
      },
      {
        id: "lh-r2",
        author: "Jessica R.",
        rating: 5,
        date: "1 week ago",
        content: "Absolutely love it. My husband tosses and turns but I don't feel a thing. The edges are firm and easy to sit on.",
        helpfulCount: 19,
        replyCount: 1
      },
      {
        id: "lh-r3",
        author: "Robert T.",
        rating: 5,
        date: "2 weeks ago",
        content: "The best mattress I've ever owned. Worth every single penny. Customer service was also top-notch.",
        helpfulCount: 14,
        replyCount: 0
      },
      {
        id: "lh-r4",
        author: "Emma P.",
        rating: 4,
        date: "3 weeks ago",
        content: "Very thick and plush. It did have a slight 'new mattress' smell for the first 24 hours, but that went away quickly.",
        helpfulCount: 7,
        replyCount: 0
      },
      {
        id: "lh-r5",
        author: "David H.",
        rating: 5,
        date: "1 month ago",
        content: "It supports my back perfectly and sleeps incredibly cool. High quality finishes.",
        helpfulCount: 11,
        replyCount: 0
      }
    ]
  },
  {
    id: "latex-serene",
    name: "Mellosoft Latex Serene",
    tagline: "Eco-friendly, bouncy, naturally cool sleep.",
    category: "mattress",
    price: 1099,
    rating: 4.7,
    reviewCount: 68,
    badge: "Eco-Friendly",
    images: ["/asset/texture.png", "/asset/img2.jpg", "/asset/img1.jpg"],
    description: "Crafted from 100% natural organic Dunlop latex and wrapped in a certified organic cotton cover. Naturally hypoallergenic, resistant to dust mites, and exceptionally durable.",
    specs: "9\" Height • Natural Dunlop Latex • Organic Cotton & Wool",
    features: [
      "Natural latex provides instant responsive bounce and contouring.",
      "Eco-INSTITUT and OEKO-TEX certified materials.",
      "Inherently temperature-regulating with pincore ventilation.",
      "Free of synthetic chemicals, polyfoams, and fire retardants."
    ],
    firmnessOptions: ["Medium", "Firm"],
    sizeOptions: ["Full", "Queen", "King"],
    sizePrices: {
      Full: 999,
      Queen: 1099,
      King: 1299
    },
    reviews: [
      {
        id: "ls-r1",
        author: "Diana C.",
        rating: 5,
        date: "4 days ago",
        content: "I wanted a chemical-free mattress and this is perfect. It smells like sweet natural wool and is incredibly comfortable.",
        helpfulCount: 18,
        replyCount: 1
      },
      {
        id: "ls-r2",
        author: "Tom V.",
        rating: 5,
        date: "1 week ago",
        content: "Excellent mattress. Latex has a different bounce than springs or standard memory foam - it supports you instantly without sinking.",
        helpfulCount: 25,
        replyCount: 0
      },
      {
        id: "ls-r3",
        author: "Rachel B.",
        rating: 4,
        date: "3 weeks ago",
        content: "Very comfortable, nice and firm. Great for back sleeping.",
        helpfulCount: 6,
        replyCount: 0
      },
      {
        id: "ls-r4",
        author: "Leo W.",
        rating: 5,
        date: "1 month ago",
        content: "If you care about the environment and want a durable mattress, get this. Dunlop latex lasts forever. Feels amazing.",
        helpfulCount: 15,
        replyCount: 2
      },
      {
        id: "ls-r5",
        author: "Megan S.",
        rating: 4,
        date: "1 month ago",
        content: "Really good. A bit heavier to move than memory foam mattresses, but the comfort is stellar.",
        helpfulCount: 3,
        replyCount: 0
      }
    ]
  },
  {
    id: "ortho-support",
    name: "Mellosoft Ortho Support",
    tagline: "Orthopedic design for extra-firm lumbar alignment.",
    category: "mattress",
    price: 949,
    rating: 4.6,
    reviewCount: 52,
    badge: "Ortho Approved",
    images: ["/asset/img1.jpg", "/asset/img2.jpg"],
    description: "Designed in collaboration with top orthopedic specialists. Provides high-density support layers that prevent hip sinkage, ensuring optimal spinal health and reducing chronic joint stiffness.",
    specs: "10\" Height • High-Density Support Core • Hypoallergenic Wrap",
    features: [
      "Rigid spinal-alignment core prevents sagging.",
      "Therapeutic compression layer relieves lower back tension.",
      "Recommended for back and stomach sleepers who prefer a firm feel.",
      "Durafirm edge support system."
    ],
    firmnessOptions: ["Firm"],
    sizeOptions: ["Twin", "Full", "Queen", "King"],
    sizePrices: {
      Twin: 749,
      Full: 849,
      Queen: 949,
      King: 1149
    },
    reviews: [
      {
        id: "os-r1",
        author: "Gregory P.",
        rating: 5,
        date: "Yesterday",
        content: "Finally, a mattress that is actually firm. My chiropractor recommended an orthopedic mattress and this has drastically reduced my back aches.",
        helpfulCount: 31,
        replyCount: 0
      },
      {
        id: "os-r2",
        author: "Linda J.",
        rating: 4,
        date: "1 week ago",
        content: "Very firm. Excellent for back sleeping. If you are a strict side sleeper, it might feel a bit too rigid, but for back sleepers it's heaven.",
        helpfulCount: 18,
        replyCount: 1
      },
      {
        id: "os-r3",
        author: "Mark A.",
        rating: 5,
        date: "2 weeks ago",
        content: "Well constructed and provides incredible structural support. No sagging whatsoever.",
        helpfulCount: 9,
        replyCount: 0
      },
      {
        id: "os-r4",
        author: "Claire B.",
        rating: 5,
        date: "3 weeks ago",
        content: "High quality materials. Best firm mattress on the market. Extremely happy.",
        helpfulCount: 12,
        replyCount: 0
      },
      {
        id: "os-r5",
        author: "Steven M.",
        rating: 4,
        date: "1 month ago",
        content: "Does exactly what it says. Very firm support. It sleeps nice and cool too.",
        helpfulCount: 4,
        replyCount: 0
      }
    ]
  },
  {
    id: "ergo-air",
    name: "Mellosoft Ergo Air",
    tagline: "Cloud-like plush comfort with active cooling.",
    category: "mattress",
    price: 999,
    rating: 4.8,
    reviewCount: 47,
    badge: "New",
    images: ["/asset/img2.jpg", "/asset/texture.png"],
    description: "Features a soft, plush cloud topper integrated with breathable micro-channels that actively ventilate air. Perfect for side sleepers who want deep pressure relief for shoulders and hips.",
    specs: "11\" Height • Active Cooling Top • Cushion Comfort Foam",
    features: [
      "Ultra-plush comfort layers feel like sleeping on a cloud.",
      "Ergonomic weight distribution channels relieve shoulder pressure.",
      "Thermoregulating gel phase changes adapt to body temperature.",
      "CertiPUR-US certified non-toxic foams."
    ],
    firmnessOptions: ["Soft", "Medium"],
    sizeOptions: ["Twin", "Full", "Queen", "King"],
    sizePrices: {
      Twin: 799,
      Full: 899,
      Queen: 999,
      King: 1199
    },
    reviews: [
      {
        id: "ea-r1",
        author: "Laura W.",
        rating: 5,
        date: "4 days ago",
        content: "This mattress is insanely comfortable. It's like a soft hug but still supports you so you don't feel stuck. Highly recommend the Soft firmness.",
        helpfulCount: 15,
        replyCount: 0
      },
      {
        id: "ea-r2",
        author: "Kevin B.",
        rating: 5,
        date: "1 week ago",
        content: "Absolutely amazing for side sleeping. No more sore shoulders in the morning.",
        helpfulCount: 8,
        replyCount: 1
      },
      {
        id: "ea-r3",
        author: "Patricia G.",
        rating: 4,
        date: "2 weeks ago",
        content: "Very soft and luxurious. Sleeps cooler than my previous memory foam mattress.",
        helpfulCount: 6,
        replyCount: 0
      },
      {
        id: "ea-r4",
        author: "Brian K.",
        rating: 5,
        date: "1 month ago",
        content: "I purchased this for my daughter and she loves it. Excellent premium feel.",
        helpfulCount: 2,
        replyCount: 0
      },
      {
        id: "ea-r5",
        author: "Sophie T.",
        rating: 5,
        date: "1 month ago",
        content: "Extremely comfortable, soft, and feels durable. The cooling cover actually works.",
        helpfulCount: 5,
        replyCount: 0
      }
    ]
  },
  {
    id: "luxury-pillow",
    name: "Mellosoft Luxury Down Pillow",
    tagline: "Fluffy, customizable support for neck alignment.",
    category: "pillows",
    price: 89,
    rating: 4.7,
    reviewCount: 212,
    badge: "Essential",
    images: ["/asset/pillow.png", "/asset/texture.png"],
    description: "Filled with responsibly sourced, allergen-free European down and cradled in a 100% organic sateen cotton cover. Features a dual-chamber design providing soft plushness on the outside with structural support on the inside.",
    specs: "Standard Size • Dual-Chamber Down • 300 Thread Count Sateen",
    features: [
      "Responsible Down Standard (RDS) certified fill.",
      "Dual-chamber core prevents flattening over time.",
      "Machine-washable cover and easy to fluff.",
      "Perfect for all sleep positions: back, side, and stomach."
    ],
    firmnessOptions: ["Soft", "Medium"],
    sizeOptions: ["Standard", "King"],
    sizePrices: {
      Standard: 89,
      King: 109
    },
    reviews: [
      {
        id: "lp-r1",
        author: "Jonathan E.",
        rating: 5,
        date: "Yesterday",
        content: "Best pillow I have ever owned. It doesn't go flat during the night and is so soft.",
        helpfulCount: 18,
        replyCount: 0
      },
      {
        id: "lp-r2",
        author: "Lisa M.",
        rating: 5,
        date: "4 days ago",
        content: "Feels like sleeping on a cloud. I bought two and my neck aches have disappeared.",
        helpfulCount: 24,
        replyCount: 0
      },
      {
        id: "lp-r3",
        author: "Chris R.",
        rating: 4,
        date: "1 week ago",
        content: "Very high quality down. I ordered the Medium firmness, which gives just enough neck support.",
        helpfulCount: 11,
        replyCount: 1
      },
      {
        id: "lp-r4",
        author: "Emily F.",
        rating: 5,
        date: "2 weeks ago",
        content: "Love the double lining - feathers don't poke through at all. Feels very high-end.",
        helpfulCount: 14,
        replyCount: 0
      },
      {
        id: "lp-r5",
        author: "Arthur N.",
        rating: 4,
        date: "1 month ago",
        content: "Great customer service and nice fluffy pillow. Good value for real down.",
        helpfulCount: 5,
        replyCount: 0
      }
    ]
  },
  {
    id: "oak-bedframe",
    name: "Mellosoft Solid Oak Bed Frame",
    tagline: "Minimalist timber craftsmanship for your bedroom sanctuary.",
    category: "bed frames",
    price: 799,
    rating: 4.9,
    reviewCount: 34,
    badge: "Premium Wood",
    images: ["/asset/bedframe.png", "/asset/img2.jpg"],
    description: "Handcrafted from sustainably sourced solid European White Oak. Features a clean, low-profile design with a secure slot-in slat system that requires no box spring. Designed to last a lifetime.",
    specs: "Solid Oak • Low-profile • No box spring required",
    features: [
      "100% solid timber construction - no veneers or MDF.",
      "Easy, tool-free assembly under 15 minutes.",
      "Heavy duty support legs with felt floor protectors.",
      "Minimalist design fits clean modern spaces."
    ],
    firmnessOptions: ["Standard"],
    sizeOptions: ["Queen", "King"],
    sizePrices: {
      Queen: 799,
      King: 949
    },
    reviews: [
      {
        id: "bf-r1",
        author: "Alexander V.",
        rating: 5,
        date: "3 days ago",
        content: "Incredible craftsmanship. The wood grain is gorgeous and there are no creaks or squeaks. Extremely sturdy.",
        helpfulCount: 21,
        replyCount: 0
      },
      {
        id: "bf-r2",
        author: "Sophia L.",
        rating: 5,
        date: "1 week ago",
        content: "Assembling it was a breeze! It slots together perfectly. The oak wood feels heavy and premium.",
        helpfulCount: 15,
        replyCount: 1
      },
      {
        id: "bf-r3",
        author: "Peter D.",
        rating: 5,
        date: "2 weeks ago",
        content: "Very beautiful minimalist bed frame. Holds the mattress securely and looks stunning.",
        helpfulCount: 8,
        replyCount: 0
      },
      {
        id: "bf-r4",
        author: "Grace M.",
        rating: 4,
        date: "3 weeks ago",
        content: "Beautiful oak color. Deliver was well-packed. Very heavy, so make sure you have help to move it.",
        helpfulCount: 4,
        replyCount: 0
      },
      {
        id: "bf-r5",
        author: "Daniel S.",
        rating: 5,
        date: "1 month ago",
        content: "Solid wood, sleek design, zero noise. Perfect purchase.",
        helpfulCount: 7,
        replyCount: 0
      }
    ]
  },
  {
    id: "organic-protector",
    name: "Mellosoft Organic Mattress Protector",
    tagline: "Waterproof, breathable shielding for your mattress.",
    category: "protectors",
    price: 69,
    rating: 4.8,
    reviewCount: 88,
    badge: "Essential",
    images: ["/asset/texture.png", "/asset/img1.jpg"],
    description: "Protects your investment without changing the feel of your mattress. Made with organic bamboo fibers and a whisper-quiet polyurethane backing that shields against spills, allergens, and dust mites.",
    specs: "Waterproof • Organic Bamboo • Hypoallergenic & Quiet",
    features: [
      "100% waterproof barrier shields mattress from liquids.",
      "Organic bamboo fabric is cooling and sweat-wicking.",
      "No plastic crinkling noise - completely silent protection.",
      "Deep pockets fit mattresses up to 16\" deep."
    ],
    firmnessOptions: ["Standard"],
    sizeOptions: ["Twin", "Full", "Queen", "King"],
    sizePrices: {
      Twin: 59,
      Full: 65,
      Queen: 69,
      King: 79
    },
    reviews: [
      {
        id: "pr-r1",
        author: "Carolyn B.",
        rating: 5,
        date: "5 days ago",
        content: "Absolutely silent! I've had waterproof protectors before that sounded like plastic bags, but this is soft and quiet.",
        helpfulCount: 14,
        replyCount: 0
      },
      {
        id: "pr-r2",
        author: "Tyler F.",
        rating: 5,
        date: "1 week ago",
        content: "Saved our new mattress from a coffee spill on day three. Totally waterproof, wiped clean. Lifesaver.",
        helpfulCount: 22,
        replyCount: 0
      },
      {
        id: "pr-r3",
        author: "Marie L.",
        rating: 4,
        date: "2 weeks ago",
        content: "Nice soft material and fits our Queen mattress tightly. Very easy to wash.",
        helpfulCount: 7,
        replyCount: 0
      },
      {
        id: "pr-r4",
        author: "Frank J.",
        rating: 5,
        date: "1 month ago",
        content: "Very breathable. Doesn't make the bed sleep hot at all. Perfect protector.",
        helpfulCount: 5,
        replyCount: 0
      },
      {
        id: "pr-r5",
        author: "Katelyn P.",
        rating: 5,
        date: "1 month ago",
        content: "Great fit and good materials. Bamboo cover is soft to touch.",
        helpfulCount: 3,
        replyCount: 0
      }
    ]
  }
];
