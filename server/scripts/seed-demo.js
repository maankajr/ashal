import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";
import { Store } from "../src/models/Store.js";
import { Category } from "../src/models/Category.js";
import { Product } from "../src/models/Product.js";
import { uniqueSlug } from "../src/utils/slugify.js";

const demoProducts = [
  {
    name: "Apex Smartwatch Pro",
    price: 189,
    category: "Watches",
    stock: 18,
    store: "techvault",
    image:
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "Velocity Running Sneakers",
    price: 129.99,
    category: "Shoes",
    stock: 24,
    store: "stride-co",
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "Pulse Wireless Earbuds",
    price: 79.5,
    category: "Earbuds",
    stock: 40,
    store: "techvault",
    image:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "NovaBook Ultralight Laptop",
    price: 999,
    category: "Laptops",
    stock: 9,
    store: "techvault",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "ClearVue Aviator Glasses",
    price: 89,
    category: "Glasses",
    stock: 30,
    store: "stride-co",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "IronCore Adjustable Dumbbells",
    price: 149,
    category: "Gym Equipment",
    stock: 15,
    store: "stride-co",
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "PixelMax Pro Phone",
    price: 749,
    category: "Phones",
    stock: 11,
    store: "techvault",
    image:
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "SlateTab 11-inch Tablet",
    price: 429,
    category: "Tablets",
    stock: 14,
    store: "techvault",
    image:
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "Urban Linen Overshirt",
    price: 68,
    category: "Fashion & Clothes",
    stock: 22,
    store: "stride-co",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "Chrono Steel Dress Watch",
    price: 245,
    category: "Watches",
    stock: 10,
    store: "techvault",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "TrailFlex Training Shoes",
    price: 110,
    category: "Shoes",
    stock: 20,
    store: "stride-co",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "Horizon City Hatchback",
    price: 12500,
    category: "Cars",
    stock: 25,
    store: "stride-co",
    image:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "Nordic Compact SUV",
    price: 18900,
    category: "Cars",
    stock: 20,
    store: "techvault",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&h=600&fit=crop&q=80",
  },
];

const storeDefs = [
  {
    slug: "techvault",
    name: "TechVault",
    description: "Phones, laptops, earbuds, and everyday gadgets.",
    vendorEmail: "demo-vendor@ashal.com",
    vendorName: "Demo Vendor",
  },
  {
    slug: "stride-co",
    name: "Stride & Co.",
    description: "Footwear, fashion, and accessories built for daily wear.",
    vendorEmail: "demo-vendor-2@ashal.com",
    vendorName: "Stride Vendor",
  },
];

async function ensureVendor({ email, name, passwordHash }) {
  let vendor = await User.findOne({ email });
  if (!vendor) {
    vendor = await User.create({
      name,
      email,
      passwordHash,
      role: "vendor",
      status: "active",
    });
    return vendor;
  }

  vendor.name = name;
  vendor.role = "vendor";
  vendor.status = "active";
  vendor.passwordHash = passwordHash;
  await vendor.save();
  return vendor;
}

async function seed() {
  await connectDB();

  const passwordHash = await bcrypt.hash("VendorPass123!", 10);
  const storeMap = new Map();

  for (const storeData of storeDefs) {
    const vendor = await ensureVendor({
      email: storeData.vendorEmail,
      name: storeData.vendorName,
      passwordHash,
    });

    let store = await Store.findOne({ slug: storeData.slug });
    if (!store) {
      // One store per vendor (Store.vendorId is unique)
      const existingForVendor = await Store.findOne({ vendorId: vendor._id });
      if (existingForVendor) {
        store = existingForVendor;
        store.name = storeData.name;
        store.slug = storeData.slug;
        store.description = storeData.description;
        store.status = "active";
        await store.save();
      } else {
        store = await Store.create({
          vendorId: vendor._id,
          name: storeData.name,
          slug: storeData.slug,
          description: storeData.description,
          status: "active",
        });
      }
    } else {
      store.status = "active";
      store.name = storeData.name;
      store.description = storeData.description;
      // Keep ownership consistent with the intended vendor
      if (String(store.vendorId) !== String(vendor._id)) {
        const conflict = await Store.findOne({ vendorId: vendor._id });
        if (!conflict) {
          store.vendorId = vendor._id;
        }
      }
      await store.save();
    }

    vendor.storeId = store._id;
    await vendor.save();
    storeMap.set(storeData.slug, store);
  }

  const categoryNames = [
    ...new Set([
      ...demoProducts.map((item) => item.category),
      "Watches",
      "Cars",
      "Fashion & Clothes",
      "Phones",
      "Laptops",
      "Glasses",
      "Earbuds",
      "Gym Equipment",
      "Shoes",
      "Tablets",
    ]),
  ];
  const categoryMap = new Map();
  for (const name of categoryNames) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let category = await Category.findOne({ slug });
    if (!category) {
      category = await Category.create({ name, slug });
    }
    categoryMap.set(name, category);
  }

  let created = 0;
  let updated = 0;

  for (const item of demoProducts) {
    const store = storeMap.get(item.store);
    const category = categoryMap.get(item.category);
    if (!store || !category) {
      throw new Error(`Missing store/category for ${item.name}`);
    }

    let product = await Product.findOne({ name: item.name });
    if (!product) {
      const slug = await uniqueSlug(Product, item.name);
      await Product.create({
        storeId: store._id,
        categoryId: category._id,
        name: item.name,
        slug,
        description: `${item.name} — demo catalog item for Ashal marketplace.`,
        price: item.price,
        stock: item.stock,
        images: [{ url: item.image, fileId: "" }],
        status: "active",
        ratingAvg: 4.5,
        ratingCount: 12,
        tags: [item.category.toLowerCase()],
      });
      created += 1;
      continue;
    }

    product.storeId = store._id;
    product.categoryId = category._id;
    product.status = "active";
    product.stock = item.stock;
    product.price = item.price;
    product.images = [{ url: item.image, fileId: "" }];
    product.description =
      product.description || `${item.name} — demo catalog item for Ashal marketplace.`;
    await product.save();
    updated += 1;
  }

  const activeCount = await Product.countDocuments({ status: "active" });
  console.log(
    `Demo catalog seeded successfully. created=${created} updated=${updated} active=${activeCount}`
  );
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
