import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";
import { Store } from "../src/models/Store.js";
import { Product } from "../src/models/Product.js";
import { SubOrder } from "../src/models/SubOrder.js";

async function inspectStores() {
  await connectDB();

  console.log("=== ALL STORES IN DB ===");
  const allStores = await Store.find({}).populate("vendorId", "name email role");
  for (const s of allStores) {
    const products = await Product.find({ storeId: s._id });
    const subOrders = await SubOrder.find({ storeId: s._id });
    console.log({
      _id: s._id.toString(),
      name: s.name,
      slug: s.slug,
      vendor: s.vendorId ? { id: s.vendorId._id.toString(), name: s.vendorId.name, email: s.vendorId.email } : null,
      status: s.status,
      createdAt: s.createdAt,
      productsCount: products.length,
      products: products.map(p => ({ id: p._id.toString(), name: p.name, status: p.status })),
      subOrdersCount: subOrders.length
    });
  }

  console.log("\n=== ALL USERS WITH 'ABDIRAHMAN' ===");
  const abdiUsers = await User.find({
    $or: [
      { name: { $regex: /abdirahman/i } },
      { email: { $regex: /abdirahman/i } },
      { email: { $regex: /maanka/i } }
    ]
  }).select("_id name email role status storeId createdAt");
  for (const u of abdiUsers) {
    console.log(u.toObject());
  }

  await mongoose.disconnect();
}

inspectStores().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
