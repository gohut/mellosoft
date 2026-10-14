import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_ROLES } from "../src/data/rolesData.js";
import { MATTRESS_PRODUCTS, ACCESSORY_PRODUCTS, BED_FRAME_PRODUCTS } from "../src/data/mattressData.js";
import { MOCK_COUPONS, MOCK_BANNERS } from "../src/admin/data/adminMockData.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Mellosoft database seed...");

  // 1. SEED ROLES & PERMISSIONS
  console.log("-> Seeding system roles & permissions...");
  for (const roleDef of DEFAULT_ROLES) {
    const existingRole = await prisma.role.findUnique({ where: { id: roleDef.id } });
    if (!existingRole) {
      await prisma.role.create({
        data: {
          id: roleDef.id,
          name: roleDef.name,
          description: roleDef.description,
          isSystemRole: Boolean(roleDef.isSystemRole),
        },
      });
    }

    // Upsert permissions
    if (roleDef.permissions) {
      for (const [moduleName, actions] of Object.entries(roleDef.permissions)) {
        for (const action of actions) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_module_action: {
                roleId: roleDef.id,
                module: moduleName,
                action: action,
              },
            },
            update: {},
            create: {
              roleId: roleDef.id,
              module: moduleName,
              action: action,
            },
          });
        }
      }
    }
  }

  // 2. SEED DEFAULT SUPER ADMIN USER
  console.log("-> Seeding default super admin user...");
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@mellosoft.com").toLowerCase().trim();
  const rawAdminPass = process.env.BOOTSTRAP_ADMIN_PASSWORD || "Admin@Mellosoft2026!";
  const passwordHash = await bcrypt.hash(rawAdminPass, 12);

  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: {
        id: "user-super-admin",
        name: "Rahul Sharma",
        email: adminEmail,
        phone: "+91 98765 43210",
        passwordHash,
        roleId: "role-super-admin",
        status: "Active",
      },
    });
    console.log(`✔ Super admin created: ${adminEmail}`);
  }

  // 3. SEED CATEGORIES
  console.log("-> Seeding master and sub-categories...");
  const mainCategories = [
    {
      id: "CAT-MATTRESSES",
      name: "Mattresses",
      slug: "mattresses",
      isParent: true,
      type: "main",
      order: 1,
      image: "/asset/img2.jpg",
      description: "Premium sleep mattresses handcrafted for deep rest",
    },
    {
      id: "CAT-ACCESSORIES",
      name: "Accessories",
      slug: "accessories",
      isParent: true,
      type: "main",
      order: 2,
      image: "/asset/pillow.png",
      description: "Luxury pillows, protectors & sleep essentials",
    },
    {
      id: "CAT-BED-FRAMES",
      name: "Bed Frames",
      slug: "bed-frames",
      isParent: true,
      type: "main",
      order: 3,
      image: "/asset/bedframe.png",
      description: "Bed frames designed for stylish and supportive sleep spaces",
    },
  ];

  for (const cat of mainCategories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }

  const subcategories = [
    { id: "SUB-FOAM", parentId: "CAT-MATTRESSES", name: "Foam Mattress", slug: "foam", order: 1 },
    { id: "SUB-ORTHO", parentId: "CAT-MATTRESSES", name: "Ortho Mattress", slug: "ortho", order: 2 },
    { id: "SUB-SPRING", parentId: "CAT-MATTRESSES", name: "Spring Mattress", slug: "spring", order: 3 },
    { id: "SUB-LATEX", parentId: "CAT-MATTRESSES", name: "Latex Mattress", slug: "latex", order: 4 },
    { id: "SUB-MEMORY-FOAM", parentId: "CAT-MATTRESSES", name: "Memory Foam Mattress", slug: "memory-foam", order: 5 },
    { id: "SUB-MEMORY-FOAM-PILLOW", parentId: "CAT-ACCESSORIES", name: "Memory Foam Pillow", slug: "memory-foam-pillow", order: 1 },
    { id: "SUB-LATEX-PILLOW", parentId: "CAT-ACCESSORIES", name: "Latex Pillow", slug: "latex-pillow", order: 2 },
    { id: "SUB-FIBER-PILLOW", parentId: "CAT-ACCESSORIES", name: "Fiber Pillow", slug: "fiber-pillow", order: 3 },
    { id: "SUB-MATTRESS-PROTECTOR", parentId: "CAT-ACCESSORIES", name: "Mattress Protector", slug: "mattress-protector", order: 4 },
    { id: "SUB-FITTED-BEDSPREAD", parentId: "CAT-ACCESSORIES", name: "Fitted Bedspread", slug: "fitted-bedspread", order: 5 },
    { id: "SUB-BLANKET-DUVET", parentId: "CAT-ACCESSORIES", name: "Blanket / Duvet", slug: "blanket-duvet", order: 6 },
    { id: "SUB-TRAVEL-BED", parentId: "CAT-ACCESSORIES", name: "Travel Bed", slug: "travel-bed", order: 7 },
    { id: "SUB-WOODEN-BED-FRAME", parentId: "CAT-BED-FRAMES", name: "Wooden Bed Frame", slug: "wooden-bed-frame", order: 1 },
    { id: "SUB-PLATFORM-BED", parentId: "CAT-BED-FRAMES", name: "Platform Bed", slug: "platform-bed", order: 2 },
  ];

  for (const sub of subcategories) {
    await prisma.category.upsert({
      where: { id: sub.id },
      update: { ...sub, type: "subcategory", isParent: false },
      create: { ...sub, type: "subcategory", isParent: false },
    });
  }

  // 4. SEED PRODUCTS & VARIANTS
  console.log("-> Seeding products from master catalogue...");
  const allMasterProducts = [
    ...(MATTRESS_PRODUCTS || []).map((p) => ({ ...p, parentCategory: "mattresses" })),
    ...(ACCESSORY_PRODUCTS || []).map((p) => ({ ...p, parentCategory: "accessories" })),
    ...(BED_FRAME_PRODUCTS || []).map((p) => ({ ...p, parentCategory: "bed-frames" })),
  ];

  for (const raw of allMasterProducts) {
    const slug = raw.id;
    const prodId = `PROD-${slug.toUpperCase().replace(/[^A-Z0-9]/g, "")}`;
    const startingPrice = raw.startingPrice || 499;

    // Resolve categoryId
    const subCat = subcategories.find((s) => s.slug === raw.category);
    const categoryId = subCat ? subCat.id : (raw.parentCategory === "accessories" ? "CAT-ACCESSORIES" : "CAT-MATTRESSES");

    const createdProduct = await prisma.product.upsert({
      where: { id: slug },
      update: {
        productId: prodId,
        name: raw.name,
        tagline: raw.tagline || "",
        description: raw.description || raw.tagline || "Handcrafted with premium materials.",
        specs: raw.specs || (raw.construction ? `${raw.construction} • Premium Sleep System` : "Luxury Sleep Collection"),
        categoryId,
        categorySlug: raw.category || "foam",
        parentCategorySlug: raw.parentCategory,
        badge: raw.badge || "Bestseller",
        price: startingPrice,
        actualPrice: startingPrice,
        discountPercent: raw.discountPercent || 0,
        rating: raw.rating || 4.8,
        reviewCount: raw.reviewCount || 42,
        active: true,
        construction: raw.construction || null,
        thicknessOptions: raw.thicknessOptions || null,
        sizeOptions: raw.sizeOptions || ["Single", "Double", "Queen", "King"],
        dimensions: raw.dimensions || null,
        features: raw.features || ["100-Night Sleep Trial", "Direct Factory Warranty", "Free Doorstep Delivery"],
      },
      create: {
        id: slug,
        productId: prodId,
        name: raw.name,
        tagline: raw.tagline || "",
        description: raw.description || raw.tagline || "Handcrafted with premium materials.",
        specs: raw.specs || (raw.construction ? `${raw.construction} • Premium Sleep System` : "Luxury Sleep Collection"),
        categoryId,
        categorySlug: raw.category || "foam",
        parentCategorySlug: raw.parentCategory,
        badge: raw.badge || "Bestseller",
        price: startingPrice,
        actualPrice: startingPrice,
        discountPercent: raw.discountPercent || 0,
        rating: raw.rating || 4.8,
        reviewCount: raw.reviewCount || 42,
        active: true,
        construction: raw.construction || null,
        thicknessOptions: raw.thicknessOptions || null,
        sizeOptions: raw.sizeOptions || ["Single", "Double", "Queen", "King"],
        dimensions: raw.dimensions || null,
        features: raw.features || ["100-Night Sleep Trial", "Direct Factory Warranty", "Free Doorstep Delivery"],
      },
    });

    // Seed primary image idempotently
    const imageUrl = raw.image || (raw.images && raw.images[0]) || "/asset/img1.jpg";
    const existingImg = await prisma.productImage.findFirst({
      where: { productId: slug, isPrimary: true },
    });
    if (!existingImg) {
      await prisma.productImage.create({
        data: {
          productId: slug,
          url: imageUrl,
          alt: raw.name,
          isPrimary: true,
          displayOrder: 1,
        },
      });
    }

    // Seed default variants
    if (raw.parentCategory === "mattresses") {
      const sizes = ["Single", "Double", "Queen", "King"];
      const thicknesses = raw.thicknessOptions || ["4 inch", "5 inch"];
      for (const t of thicknesses) {
        for (const s of sizes) {
          const sku = `MEL-${slug.toUpperCase()}-${t.replace(/\s+/g, "").toUpperCase()}-${s.toUpperCase()}`;
          const variantId = `VAR-${slug}-${t.replace(/\s+/g, "-")}-${s}`;
          const multiplier = s === "King" ? 1.6 : s === "Queen" ? 1.4 : s === "Double" ? 1.2 : 1.0;
          const varPrice = Math.round(startingPrice * multiplier);

          await prisma.productVariant.upsert({
            where: { sku },
            update: {
              actualPrice: varPrice,
              discountedPrice: varPrice,
              stock: 15,
            },
            create: {
              id: variantId,
              sku,
              productId: slug,
              size: s,
              thickness: t,
              firmness: "Medium",
              actualPrice: varPrice,
              discountedPrice: varPrice,
              stock: 15,
              status: "Active",
            },
          });
        }
      }
    } else {
      // Accessory or Bed frame single/standard variant
      const sku = `MEL-${slug.toUpperCase()}-STD`;
      await prisma.productVariant.upsert({
        where: { sku },
        update: { actualPrice: startingPrice, discountedPrice: startingPrice, stock: 20 },
        create: {
          id: `VAR-${slug}-STD`,
          sku,
          productId: slug,
          size: "Standard",
          firmness: "Medium",
          actualPrice: startingPrice,
          discountedPrice: startingPrice,
          stock: 20,
          status: "Active",
        },
      });
    }
  }

  // 5. SEED COUPONS
  console.log("-> Seeding coupons...");
  for (const c of MOCK_COUPONS) {
    const val = parseInt(String(c.discount).replace(/[^0-9]/g, ""), 10) || 10;
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: {
        id: c.id,
        code: c.code,
        discountType: c.type || "percentage",
        discountValue: val,
        usageLimit: c.usageLimit || 500,
        usageCount: c.usageCount || 0,
        status: c.status || "Active",
      },
    });
  }

  // 6. SEED BANNERS
  console.log("-> Seeding promotional banners...");
  for (const b of MOCK_BANNERS) {
    await prisma.banner.upsert({
      where: { id: b.id },
      update: {},
      create: {
        id: b.id,
        title: b.title,
        subtitle: b.subtitle || "",
        description: b.description || "",
        type: b.type || "Offer",
        image: b.image || "/asset/img2.jpg",
        ctaText: b.ctaText || "Shop Now",
        ctaLink: b.ctaLink || "mattresses",
        productId: b.productId || null,
        isActive: b.isActive ?? true,
        displayOrder: b.displayOrder || 1,
      },
    });
  }

  // 7. SEED APPLICATION SETTINGS
  console.log("-> Seeding global application settings...");
  await prisma.applicationSettings.upsert({
    where: { id: "global_settings" },
    update: {},
    create: {
      id: "global_settings",
      data: {
        store: {
          name: "Mellosoft",
          tagline: "Sleep Perfected",
          email: "support@mellosoft.com",
          phone: "+91 98765 43210",
          gstNumber: "29AABCU9603R1ZM",
          address: "42, MG Road, Bengaluru, Karnataka 560001",
        },
        shipping: {
          freeShippingThreshold: 5000,
          standardFee: 499,
          estimatedDaysMin: 3,
          estimatedDaysMax: 7,
        },
        taxes: {
          defaultGstRate: 18,
          taxIncludedInPrice: false,
        },
        payments: {
          codEnabled: true,
          upiEnabled: true,
          razorpayEnabled: false,
          stripeEnabled: false,
        },
        website: {
          maintenanceMode: false,
          bannerNotice: "Enjoy up to 60% savings on luxury handcrafted mattresses.",
        },
      },
    },
  });

  console.log("✔ Mellosoft database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failure:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
