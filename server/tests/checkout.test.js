import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../app.js";
import { setupTestDB, teardownTestDB, extractCookies, cookieString } from "./setup.js";
import { User } from "../src/models/User.js";
import { Store } from "../src/models/Store.js";
import { Product } from "../src/models/Product.js";
import { Category } from "../src/models/Category.js";
import { Cart } from "../src/models/Cart.js";
import { Order } from "../src/models/Order.js";
import { SubOrder } from "../src/models/SubOrder.js";

describe("1. Checkout Transaction Integration", () => {
  let customerUser;
  let customerCookies;
  let storeA, storeB;
  let productA, productB;
  let category;
  const ts = Date.now();

  beforeAll(async () => {
    await setupTestDB();

    category = await Category.create({
      name: `Checkout Category ${ts}`,
      slug: `checkout-cat-${ts}`,
    });

    const vendorAUser = await User.create({
      name: "Vendor A",
      email: `vendor-a-${ts}@ashal.test`,
      passwordHash: await bcrypt.hash("Pass123!", 10),
      role: "vendor",
    });

    storeA = await Store.create({
      vendorId: vendorAUser._id,
      name: `Store A ${ts}`,
      slug: `store-a-${ts}`,
      status: "active",
    });

    const vendorBUser = await User.create({
      name: "Vendor B",
      email: `vendor-b-${ts}@ashal.test`,
      passwordHash: await bcrypt.hash("Pass123!", 10),
      role: "vendor",
    });

    storeB = await Store.create({
      vendorId: vendorBUser._id,
      name: `Store B ${ts}`,
      slug: `store-b-${ts}`,
      status: "active",
    });

    productA = await Product.create({
      storeId: storeA._id,
      categoryId: category._id,
      name: `Product A ${ts}`,
      slug: `product-a-${ts}`,
      price: 50,
      stock: 10,
      status: "active",
    });

    productB = await Product.create({
      storeId: storeB._id,
      categoryId: category._id,
      name: `Product B ${ts}`,
      slug: `product-b-${ts}`,
      price: 30,
      stock: 5,
      status: "active",
    });

    // Register and login customer
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Customer",
        email: `customer-${ts}@ashal.test`,
        password: "CustomerPass123!",
      });

    customerUser = regRes.body.data.user;
    customerCookies = extractCookies(regRes);
  });

  afterAll(async () => {
    await Product.deleteMany({ _id: { $in: [productA?._id, productB?._id] } });
    await Store.deleteMany({ _id: { $in: [storeA?._id, storeB?._id] } });
    await Category.deleteMany({ _id: category?._id });
    await User.deleteMany({ email: { $regex: `@ashal.test` } });
    await teardownTestDB();
  });

  it("successfully checks out with multi-vendor cart, decrements stock, and creates parent/sub-orders", async () => {
    // 1. Add Product A (qty: 2) and Product B (qty: 1) to cart
    await request(app)
      .post("/api/cart/items")
      .set("Cookie", cookieString(customerCookies))
      .send({ productId: productA._id.toString(), quantity: 2 })
      .expect((res) => expect([200, 201]).toContain(res.status));

    await request(app)
      .post("/api/cart/items")
      .set("Cookie", cookieString(customerCookies))
      .send({ productId: productB._id.toString(), quantity: 1 })
      .expect((res) => expect([200, 201]).toContain(res.status));

    // 2. Execute checkout
    const checkoutRes = await request(app)
      .post("/api/orders/checkout")
      .set("Cookie", cookieString(customerCookies))
      .send({
        shippingAddress: {
          line1: "123 Market St",
          city: "Mogadishu",
          country: "Somalia",
        },
        paymentMethod: "cod",
      })
      .expect(201);

    expect(checkoutRes.body.success).toBe(true);
    const { order, subOrders } = checkoutRes.body.data;

    // Check parent order grand total: (50 * 2) + (30 * 1) = 130
    expect(order.grandTotal).toBe(130);
    expect(order.customerId.toString()).toBe(customerUser.id || customerUser._id);

    // Check sub-orders split per vendor
    expect(subOrders).toHaveLength(2);
    const subOrderA = subOrders.find((s) => s.storeId.toString() === storeA._id.toString());
    const subOrderB = subOrders.find((s) => s.storeId.toString() === storeB._id.toString());

    expect(subOrderA).toBeDefined();
    expect(subOrderA.subtotal).toBe(100);
    expect(subOrderA.items[0].quantity).toBe(2);

    expect(subOrderB).toBeDefined();
    expect(subOrderB.subtotal).toBe(30);
    expect(subOrderB.items[0].quantity).toBe(1);

    // 3. Verify stock decremented atomically
    const updatedProductA = await Product.findById(productA._id);
    const updatedProductB = await Product.findById(productB._id);

    expect(updatedProductA.stock).toBe(8); // 10 - 2 = 8
    expect(updatedProductB.stock).toBe(4); // 5 - 1 = 4

    // 4. Verify cart is cleared
    const cartRes = await request(app)
      .get("/api/cart")
      .set("Cookie", cookieString(customerCookies))
      .expect(200);

    expect(cartRes.body.data.items).toHaveLength(0);
  });

  it("rolls back transaction completely if any item exceeds available stock", async () => {
    // Current stock of Product B is 4. Add quantity 10 to trigger stock failure
    const initialProductA = await Product.findById(productA._id);
    const initialProductB = await Product.findById(productB._id);

    // Force add to cart directly or through API if stock allows initial add
    await Cart.findOneAndUpdate(
      { userId: customerUser.id || customerUser._id },
      {
        items: [
          { productId: productA._id, quantity: 1, priceSnapshot: 50 },
          { productId: productB._id, quantity: 10, priceSnapshot: 30 }, // Exceeds stock 4
        ],
      },
      { upsert: true }
    );

    const initialOrderCount = await Order.countDocuments();
    const initialSubOrderCount = await SubOrder.countDocuments();

    // Checkout should fail
    const failRes = await request(app)
      .post("/api/orders/checkout")
      .set("Cookie", cookieString(customerCookies))
      .send({
        shippingAddress: {
          line1: "123 Market St",
          city: "Mogadishu",
          country: "Somalia",
        },
        paymentMethod: "cod",
      });

    expect(failRes.status).toBeGreaterThanOrEqual(400);

    // Verify database was not modified (atomicity rollback)
    const afterProductA = await Product.findById(productA._id);
    const afterProductB = await Product.findById(productB._id);

    expect(afterProductA.stock).toBe(initialProductA.stock);
    expect(afterProductB.stock).toBe(initialProductB.stock);

    const afterOrderCount = await Order.countDocuments();
    const afterSubOrderCount = await SubOrder.countDocuments();

    expect(afterOrderCount).toBe(initialOrderCount);
    expect(afterSubOrderCount).toBe(initialSubOrderCount);
  });
});
