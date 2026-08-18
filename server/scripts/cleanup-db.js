/**
 * Database Cleanup Script
 * Keeps: admin users + vendor with email abdirahmanosmanali28@gmail.com
 * Deletes: all other users (customers, other vendors) and ALL associated data
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const KEEP_VENDOR_EMAIL = "abdirahmanosmanali28@gmail.com";

async function cleanup() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const db = mongoose.connection.db;

    // 1. Find users to KEEP
    const usersCollection = db.collection("users");

    const keepUsers = await usersCollection
      .find({
        $or: [
          { role: "admin" },
          { email: KEEP_VENDOR_EMAIL.toLowerCase() },
        ],
      })
      .toArray();

    const keepUserIds = keepUsers.map((u) => u._id);

    console.log("Users to KEEP (" + keepUsers.length + "):");
    keepUsers.forEach((u) =>
      console.log("  [" + u.role.toUpperCase() + "] " + u.name + " <" + u.email + ">")
    );

    // 2. Find storeId of the kept vendor
    const keptVendor = keepUsers.find(
      (u) => u.email === KEEP_VENDOR_EMAIL.toLowerCase()
    );
    const keptStoreId = keptVendor?.storeId ?? null;

    console.log("\nKept vendor store ID: " + (keptStoreId ?? "none"));

    // 3. Find users to DELETE
    const deleteUsers = await usersCollection
      .find({ _id: { $nin: keepUserIds } })
      .toArray();

    console.log("\nUsers to DELETE (" + deleteUsers.length + "):");
    deleteUsers.forEach((u) =>
      console.log("  [" + u.role.toUpperCase() + "] " + u.name + " <" + u.email + ">")
    );

    // 4. Delete collections
    console.log("\nStarting cleanup...\n");

    const ordersResult = await db.collection("orders").deleteMany({});
    console.log("  Orders deleted:     " + ordersResult.deletedCount);

    const subOrdersResult = await db.collection("suborders").deleteMany({});
    console.log("  SubOrders deleted:  " + subOrdersResult.deletedCount);

    const cartsResult = await db.collection("carts").deleteMany({});
    console.log("  Carts deleted:      " + cartsResult.deletedCount);

    const wishlistResult = await db.collection("wishlists").deleteMany({});
    console.log("  Wishlists deleted:  " + wishlistResult.deletedCount);

    const reviewsResult = await db.collection("reviews").deleteMany({});
    console.log("  Reviews deleted:    " + reviewsResult.deletedCount);

    const contactsResult = await db.collection("contacts").deleteMany({});
    console.log("  Contacts deleted:   " + contactsResult.deletedCount);

    const categoriesResult = await db.collection("categories").deleteMany({});
    console.log("  Categories deleted: " + categoriesResult.deletedCount);

    // Products: delete products NOT belonging to the kept vendor
    let productsResult;
    if (keptStoreId) {
      productsResult = await db.collection("products").deleteMany({
        $and: [
          { vendorId: { $ne: keptStoreId } },
          { storeId: { $ne: keptStoreId } },
        ],
      });
    } else {
      productsResult = await db.collection("products").deleteMany({});
    }
    console.log("  Products deleted:   " + productsResult.deletedCount);

    // Stores: delete stores NOT belonging to the kept vendor
    let storesResult;
    if (keptStoreId) {
      storesResult = await db
        .collection("stores")
        .deleteMany({ _id: { $ne: keptStoreId } });
    } else {
      storesResult = await db.collection("stores").deleteMany({});
    }
    console.log("  Stores deleted:     " + storesResult.deletedCount);

    // Users: delete all non-kept users
    const usersResult = await usersCollection.deleteMany({
      _id: { $nin: keepUserIds },
    });
    console.log("  Users deleted:      " + usersResult.deletedCount);

    console.log("\nCleanup complete!\n");

    // 5. Summary
    const remainingUsers = await usersCollection.find({}).toArray();
    console.log("Remaining users (" + remainingUsers.length + "):");
    remainingUsers.forEach((u) =>
      console.log("  [" + u.role.toUpperCase() + "] " + u.name + " <" + u.email + ">")
    );
  } catch (err) {
    console.error("Error during cleanup:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

cleanup();
