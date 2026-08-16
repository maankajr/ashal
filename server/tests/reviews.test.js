import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../app.js";
import { setupTestDB, teardownTestDB, extractCookies, cookieString } from "./setup.js";
import { User } from "../src/models/User.js";
import { Store } from "../src/models/Store.js";
import { Product } from "../src/models/Product.js";
import { Category } from "../src/models/Category.js";
import { SubOrder } from "../src/models/SubOrder.js";
import { Review } from "../src/models/Review.js";

describe("4. Review Eligibility & Verified Buyer Rules", () => {
  const ts = Date.now();
  let customerCookies, nonBuyerCookies, vendorCookies;
  let store, product, category, subOrder;

  beforeAll(async () => {
    await setupTestDB();

    category = await Category.create({
      name: `Review Category ${ts}`,
      slug: `review-cat-${ts}`,
    });

    const vendorUser = await User.create({
      name: "Review Vendor",
      email: `review-vendor-${ts}@ashal.test`,
      passwordHash: await bcrypt.hash("Pass123!", 10),
      role: "vendor",
    });

    store = await Store.create({
      vendorId: vendorUser._id,
      name: `Review Store ${ts}`,
      slug: `review-store-${ts}`,
      status: "active",
    });

    product = await Product.create({
      storeId: store._id,
      categoryId: category._id,
      name: `Smartwatch Pro ${ts}`,
      slug: `smartwatch-pro-${ts}`,
      price: 199,
      stock: 20,
      status: "active",
    });

    // 1. Register buyer customer
    const buyerRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Buyer Customer",
        email: `buyer-${ts}@ashal.test`,
        password: "Password123!",
      });
    customerCookies = extractCookies(buyerRes);

    // 2. Register non-buyer customer
    const nonBuyerRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Non Buyer",
        email: `nonbuyer-${ts}@ashal.test`,
        password: "Password123!",
      });
    nonBuyerCookies = extractCookies(nonBuyerRes);

    // 3. Buyer purchases product (order placed, suborder starts in Pending)
    await request(app)
      .post("/api/cart/items")
      .set("Cookie", cookieString(customerCookies))
      .send({ productId: product._id, quantity: 1 });

    const checkoutRes = await request(app)
      .post("/api/orders/checkout")
      .set("Cookie", cookieString(customerCookies))
      .send({
        shippingAddress: { line1: "Test Way", city: "Mogadishu", country: "Somalia" },
        paymentMethod: "cod",
      });

    subOrder = checkoutRes.body.data.subOrders[0];
  });

  afterAll(async () => {
    await Review.deleteMany({ productId: product?._id });
    await Product.deleteMany({ _id: product?._id });
    await Store.deleteMany({ _id: store?._id });
    await Category.deleteMany({ _id: category?._id });
    await User.deleteMany({ email: { $regex: `@ashal.test` } });
    await teardownTestDB();
  });

  it("denies review creation to non-buyer customer", async () => {
    const eligRes = await request(app)
      .get(`/api/products/${product.slug}/reviews/eligibility`)
      .set("Cookie", cookieString(nonBuyerCookies))
      .expect(200);

    expect(eligRes.body.data.canReview).toBe(false);
    expect(eligRes.body.data.hasPurchased).toBe(false);

    const postRes = await request(app)
      .post(`/api/products/${product.slug}/reviews`)
      .set("Cookie", cookieString(nonBuyerCookies))
      .send({ rating: 5, comment: "Looks great even though I did not buy it!" });

    expect(postRes.status).toBe(403);
  });

  it("denies review creation to buyer while SubOrder status is still Pending", async () => {
    const eligRes = await request(app)
      .get(`/api/products/${product.slug}/reviews/eligibility`)
      .set("Cookie", cookieString(customerCookies))
      .expect(200);

    expect(eligRes.body.data.canReview).toBe(false);

    const postRes = await request(app)
      .post(`/api/products/${product.slug}/reviews`)
      .set("Cookie", cookieString(customerCookies))
      .send({ rating: 5, comment: "I ordered it but it hasn't arrived!" });

    expect(postRes.status).toBe(403);
  });

  it("allows review creation once SubOrder status is marked as Delivered", async () => {
    // Advance SubOrder directly or through vendor workflow to Delivered
    await SubOrder.findByIdAndUpdate(subOrder._id, { status: "Delivered" });

    const eligRes = await request(app)
      .get(`/api/products/${product.slug}/reviews/eligibility`)
      .set("Cookie", cookieString(customerCookies))
      .expect(200);

    expect(eligRes.body.data.canReview).toBe(true);
    expect(eligRes.body.data.hasPurchased).toBe(true);

    const postRes = await request(app)
      .post(`/api/products/${product.slug}/reviews`)
      .set("Cookie", cookieString(customerCookies))
      .send({ rating: 5, comment: "Received the watch and it works great!" })
      .expect(201);

    expect(postRes.body.success).toBe(true);
    expect(postRes.body.data.rating).toBe(5);

    // Verify aggregate product rating updated
    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct.ratingCount).toBe(1);
    expect(updatedProduct.ratingAvg).toBe(5);
  });

  it("blocks duplicate reviews from the same verified customer for the same product", async () => {
    const duplicateRes = await request(app)
      .post(`/api/products/${product.slug}/reviews`)
      .set("Cookie", cookieString(customerCookies))
      .send({ rating: 4, comment: "Trying to submit a second review." });

    expect(duplicateRes.status).toBe(409);
  });
});
