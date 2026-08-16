import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";
import { Store } from "../src/models/Store.js";
import { Product } from "../src/models/Product.js";
import { Order } from "../src/models/Order.js";
import { SubOrder } from "../src/models/SubOrder.js";
import { Category } from "../src/models/Category.js";

async function inspect() {
  await connectDB();
  const users = await User.find({}).select("name email role status storeId");
  const stores = await Store.find({}).select("name slug vendorId status");
  const productCount = await Product.countDocuments();
  const orderCount = await Order.countDocuments();
  const subOrderCount = await SubOrder.countDocuments();
  const categoryCount = await Category.countDocuments();

  console.log("=== DB INSPECTION ===");
  console.log("Users count:", users.length);
  for (const u of users) {
    console.log(`  - [${u.role}] ${u.email} (${u.name})`);
  }
  console.log("Stores count:", stores.length);
  for (const s of stores) {
    console.log(`  - Store: ${s.name} (${s.slug})`);
  }
  console.log(`Counts -> Products: ${productCount}, Orders: ${orderCount}, SubOrders: ${subOrderCount}, Categories: ${categoryCount}`);

  await mongoose.disconnect();
}

inspect().catch((err) => {
  console.error("Inspect error:", err.message);
  process.exit(1);
});
