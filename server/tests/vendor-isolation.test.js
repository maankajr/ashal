import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app.js";
import { setupTestDB, teardownTestDB, extractCookies, cookieString } from "./setup.js";
import { User } from "../src/models/User.js";
import { Store } from "../src/models/Store.js";
import { Product } from "../src/models/Product.js";
import { Category } from "../src/models/Category.js";
import { SubOrder } from "../src/models/SubOrder.js";

describe("3. Vendor Permission & Ownership Isolation", () => {
  const ts = Date.now();
  let vendor1Cookies, vendor2Cookies, customerCookies;
  let vendor1Store, vendor2Store;
  let product1, product2;
  let category;
  let subOrder2;

  beforeAll(async () => {
    await setupTestDB();

    category = await Category.create({
      name: `Vendor Category ${ts}`,
      slug: `vendor-cat-${ts}`,
    });

    // 1. Register Vendor 1
    const v1Res = await request(app)
      .post("/api/auth/register/vendor")
      .send({
        name: "Vendor One",
        email: `vendor-1-${ts}@ashal.test`,
        password: "Password123!",
        storeName: `Store One ${ts}`,
      });
    vendor1Cookies = extractCookies(v1Res);
    vendor1Store = v1Res.body.data.store;

    // 2. Register Vendor 2
    const v2Res = await request(app)
      .post("/api/auth/register/vendor")
      .send({
        name: "Vendor Two",
        email: `vendor-2-${ts}@ashal.test`,
        password: "Password123!",
        storeName: `Store Two ${ts}`,
      });
    vendor2Cookies = extractCookies(v2Res);
    vendor2Store = v2Res.body.data.store;

    // 3. Create Product for Vendor 1
    const p1Res = await request(app)
      .post("/api/vendor/products")
      .set("Cookie", cookieString(vendor1Cookies))
      .send({
        name: `Product 1 ${ts}`,
        price: 20,
        stock: 5,
        categoryId: category._id.toString(),
      });
    product1 = p1Res.body.data;

    // 4. Create Product for Vendor 2
    const p2Res = await request(app)
      .post("/api/vendor/products")
      .set("Cookie", cookieString(vendor2Cookies))
      .send({
        name: `Product 2 ${ts}`,
        price: 40,
        stock: 8,
        categoryId: category._id.toString(),
      });
    product2 = p2Res.body.data;

    // 5. Register customer & checkout Vendor 2's product
    const custRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Isolation Customer",
        email: `cust-iso-${ts}@ashal.test`,
        password: "CustomerPass123!",
      });
    customerCookies = extractCookies(custRes);

    await request(app)
      .post("/api/cart/items")
      .set("Cookie", cookieString(customerCookies))
      .send({ productId: product2._id, quantity: 1 });

    const checkoutRes = await request(app)
      .post("/api/orders/checkout")
      .set("Cookie", cookieString(customerCookies))
      .send({
        shippingAddress: { line1: "Test St", city: "Mogadishu", country: "Somalia" },
        paymentMethod: "cod",
      });

    subOrder2 = checkoutRes.body.data.subOrders[0];
  });

  afterAll(async () => {
    await Product.deleteMany({ _id: { $in: [product1?._id, product2?._id] } });
    await Store.deleteMany({ _id: { $in: [vendor1Store?._id, vendor2Store?._id] } });
    await Category.deleteMany({ _id: category?._id });
    await User.deleteMany({ email: { $regex: `@ashal.test` } });
    await teardownTestDB();
  });

  it("prevents Vendor 1 from modifying or updating stock of Vendor 2's product", async () => {
    const res = await request(app)
      .patch(`/api/vendor/products/${product2._id}`)
      .set("Cookie", cookieString(vendor1Cookies))
      .send({ name: "Hacked Product Name", price: 1 });

    expect([403, 404]).toContain(res.status); // Cross-store mutation blocked
    const unchanged = await Product.findById(product2._id);
    expect(unchanged.name).toBe(product2.name);
  });

  it("prevents Vendor 1 from deleting Vendor 2's product", async () => {
    const res = await request(app)
      .delete(`/api/vendor/products/${product2._id}`)
      .set("Cookie", cookieString(vendor1Cookies));

    expect([403, 404]).toContain(res.status);
    const existing = await Product.findById(product2._id);
    expect(existing.status).not.toBe("deleted");
  });

  it("prevents Vendor 1 from viewing or updating Vendor 2's sub-order", async () => {
    const updateStatusRes = await request(app)
      .patch(`/api/vendor/orders/${subOrder2._id}/status`)
      .set("Cookie", cookieString(vendor1Cookies))
      .send({ status: "Confirmed" });

    expect([403, 404]).toContain(updateStatusRes.status);
    const subOrder = await SubOrder.findById(subOrder2._id);
    expect(subOrder.status).toBe("Pending");
  });

  it("allows Vendor 2 to successfully advance their own sub-order status", async () => {
    const updateStatusRes = await request(app)
      .patch(`/api/vendor/orders/${subOrder2._id}/status`)
      .set("Cookie", cookieString(vendor2Cookies))
      .send({ status: "Confirmed" })
      .expect(200);

    expect(updateStatusRes.body.success).toBe(true);
    expect(updateStatusRes.body.data.status).toBe("Confirmed");
  });
});
