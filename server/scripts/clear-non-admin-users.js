import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";
import { Store } from "../src/models/Store.js";
import { Product } from "../src/models/Product.js";
import { Cart } from "../src/models/Cart.js";
import { Wishlist } from "../src/models/Wishlist.js";
import { Review } from "../src/models/Review.js";
import { Order } from "../src/models/Order.js";
import { SubOrder } from "../src/models/SubOrder.js";

async function clearNonAdminUsers() {
  await connectDB();

  const admins = await User.find({ role: "admin" }).select("_id email name");
  const adminIds = admins.map((user) => user._id);

  if (adminIds.length === 0) {
    throw new Error("No admin users found. Aborting so the database is not emptied.");
  }

  const others = await User.find({ _id: { $nin: adminIds } }).select("_id role email");
  const otherIds = others.map((user) => user._id);
  const vendorIds = others.filter((user) => user.role === "vendor").map((user) => user._id);

  const stores = await Store.find({ vendorId: { $in: vendorIds } }).select("_id");
  const storeIds = stores.map((store) => store._id);

  const orders = await Order.find({ customerId: { $in: otherIds } }).select("_id");
  const orderIds = orders.map((order) => order._id);

  const [
    carts,
    wishlists,
    reviews,
    subOrders,
    products,
    deletedStores,
    deletedOrders,
    deletedUsers,
  ] = await Promise.all([
    Cart.deleteMany({ userId: { $in: otherIds } }),
    Wishlist.deleteMany({ userId: { $in: otherIds } }),
    Review.deleteMany({ userId: { $in: otherIds } }),
    SubOrder.deleteMany({
      $or: [{ parentOrderId: { $in: orderIds } }, { storeId: { $in: storeIds } }],
    }),
    Product.deleteMany({ storeId: { $in: storeIds } }),
    Store.deleteMany({ _id: { $in: storeIds } }),
    Order.deleteMany({ _id: { $in: orderIds } }),
    User.deleteMany({ _id: { $in: otherIds } }),
  ]);

  console.log("Kept admins:");
  for (const admin of admins) {
    console.log(`  - ${admin.email} (${admin.name})`);
  }
  console.log(`Deleted users: ${deletedUsers.deletedCount}`);
  console.log(`Deleted carts: ${carts.deletedCount}`);
  console.log(`Deleted wishlists: ${wishlists.deletedCount}`);
  console.log(`Deleted reviews: ${reviews.deletedCount}`);
  console.log(`Deleted orders: ${deletedOrders.deletedCount}`);
  console.log(`Deleted sub-orders: ${subOrders.deletedCount}`);
  console.log(`Deleted stores: ${deletedStores.deletedCount}`);
  console.log(`Deleted products: ${products.deletedCount}`);

  await mongoose.disconnect();
}

clearNonAdminUsers().catch(async (error) => {
  console.error("Cleanup failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
