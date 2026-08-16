import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { Product } from "../src/models/Product.js";
import { Store } from "../src/models/Store.js";
import { User } from "../src/models/User.js";
import { Category } from "../src/models/Category.js";

async function inspect() {
  await connectDB();
  const products = await Product.find({ name: /Abdirahman/i }).populate("storeId").populate("categoryId");
  console.log("=== MATCHING PRODUCTS ===");
  for (const p of products) {
    console.log({
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      price: p.price,
      stock: p.stock,
      status: p.status,
      store: p.storeId ? { id: p.storeId._id.toString(), name: p.storeId.name, slug: p.storeId.slug } : null,
      category: p.categoryId ? { id: p.categoryId._id.toString(), name: p.categoryId.name } : null,
      images: p.images,
      createdAt: p.createdAt
    });
  }

  const stores = await Store.find({
    $or: [{ name: /Abdirahman/i }, { slug: /abdirahman/i }, { name: /maanka/i }]
  }).populate("vendorId", "name email");
  console.log("\n=== MATCHING STORES ===");
  for (const s of stores) {
    console.log({
      _id: s._id.toString(),
      name: s.name,
      slug: s.slug,
      status: s.status,
      vendor: s.vendorId ? { id: s.vendorId._id.toString(), name: s.vendorId.name, email: s.vendorId.email } : null,
      createdAt: s.createdAt
    });
  }

  await mongoose.disconnect();
}

inspect().catch(err => {
  console.error("Inspect error:", err);
  process.exit(1);
});
