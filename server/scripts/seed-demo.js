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
  { name: "Apex Smartwatch Pro", price: 189, category: "Watches", stock: 18, store: "techvault", image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop&q=80" },
  { name: "Velocity Running Sneakers", price: 129.99, category: "Shoes", stock: 24, store: "stride-co", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&q=80" },
  { name: "Pulse Wireless Earbuds", price: 79.5, category: "Earbuds", stock: 40, store: "techvault", image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop&q=80" },
  { name: "NovaBook Ultralight Laptop", price: 999, category: "Laptops", stock: 9, store: "techvault", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&q=80" },
  { name: "ClearVue Aviator Glasses", price: 89, category: "Glasses", stock: 30, store: "stride-co", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop&q=80" },
  { name: "IronCore Adjustable Dumbbells", price: 149, category: "Gym Equipment", stock: 15, store: "stride-co", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=600&fit=crop&q=80" },
  { name: "PixelMax Pro Phone", price: 749, category: "Phones", stock: 11, store: "techvault", image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop&q=80" },
  { name: "SlateTab 11-inch Tablet", price: 429, category: "Tablets", stock: 14, store: "techvault", image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&fit=crop&q=80" },
  { name: "Urban Linen Overshirt", price: 68, category: "Fashion & Clothes", stock: 22, store: "stride-co", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&q=80" },
  { name: "Chrono Steel Dress Watch", price: 245, category: "Watches", stock: 10, store: "techvault", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80" },
  { name: "TrailFlex Training Shoes", price: 110, category: "Shoes", stock: 20, store: "stride-co", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=80" },
];

const stores = [
  { slug: "techvault", name: "TechVault", description: "Phones, laptops, earbuds, and everyday gadgets." },
  { slug: "stride-co", name: "Stride & Co.", description: "Footwear, fashion, and accessories built for daily wear." },
];

async function seed() {
  await connectDB();

  const passwordHash = await bcrypt.hash("VendorPass123!", 10);

  let vendor = await User.findOne({ email: "demo-vendor@ashal.com" });
  if (!vendor) {
    vendor = await User.create({
      name: "Demo Vendor",
      email: "demo-vendor@ashal.com",
      passwordHash,
      role: "vendor",
    });
  }

  const storeMap = new Map();
  for (const storeData of stores) {
    let store = await Store.findOne({ slug: storeData.slug });
    if (!store) {
      store = await Store.create({
        vendorId: vendor._id,
        name: storeData.name,
        slug: storeData.slug,
        description: storeData.description,
        status: "active",
      });
    } else {
      store.status = "active";
      await store.save();
    }
    storeMap.set(storeData.slug, store);
  }

  if (!vendor.storeId) {
    vendor.storeId = storeMap.get("techvault")._id;
    await vendor.save();
  }

  const categoryNames = [...new Set(demoProducts.map((item) => item.category))];
  const categoryMap = new Map();
  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    let category = await Category.findOne({ slug });
    if (!category) {
      category = await Category.create({ name, slug });
    }
    categoryMap.set(name, category);
  }

  for (const item of demoProducts) {
    const slug = await uniqueSlug(Product, item.name);
    const existing = await Product.findOne({ slug });
    if (existing) {
      existing.status = "active";
      existing.stock = item.stock;
      existing.price = item.price;
      await existing.save();
      continue;
    }

    await Product.create({
      storeId: storeMap.get(item.store)._id,
      categoryId: categoryMap.get(item.category)._id,
      name: item.name,
      slug,
      description: `${item.name} — demo catalog item for Ashal marketplace.`,
      price: item.price,
      stock: item.stock,
      images: [{ url: item.image }],
      status: "active",
      ratingAvg: 4.5,
      ratingCount: 12,
    });
  }

  console.log("Demo catalog seeded successfully.");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
