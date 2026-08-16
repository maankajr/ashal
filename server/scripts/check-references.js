import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { Product } from "../src/models/Product.js";
import { Cart } from "../src/models/Cart.js";
import { Wishlist } from "../src/models/Wishlist.js";
import { SubOrder } from "../src/models/SubOrder.js";

async function checkReferences() {
  await connectDB();
  const productIds = [
    new mongoose.Types.ObjectId("6a81923833ceacb912c65a16"),
    new mongoose.Types.ObjectId("6a81934d33ceacb912c65a17"),
  ];

  const inCarts = await Cart.find({ "items.productId": { $in: productIds } });
  const inWishlists = await Wishlist.find({ products: { $in: productIds } });
  const inSubOrders = await SubOrder.find({ "items.productId": { $in: productIds } });

  console.log({
    inCartsCount: inCarts.length,
    inWishlistsCount: inWishlists.length,
    inSubOrdersCount: inSubOrders.length,
  });

  await mongoose.disconnect();
}

checkReferences().catch(err => {
  console.error(err);
  process.exit(1);
});
