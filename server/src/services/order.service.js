import mongoose from "mongoose";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { SubOrder } from "../models/SubOrder.js";
import { AppError } from "../utils/AppError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";

function deriveOrderStatus(subOrders = []) {
  if (!subOrders.length) return "Pending";
  if (subOrders.every((sub) => sub.status === "Cancelled")) return "Cancelled";
  if (subOrders.every((sub) => ["Delivered", "Completed"].includes(sub.status))) {
    return "Delivered";
  }
  if (subOrders.some((sub) => sub.status === "Shipped" || sub.status === "OutForDelivery")) {
    return "Shipped";
  }
  if (subOrders.every((sub) => sub.status === "Confirmed")) return "Confirmed";
  return subOrders[0].status;
}

export async function checkout(userId, { shippingAddress, paymentMethod }) {
  if (
    !shippingAddress ||
    !shippingAddress.line1 ||
    !shippingAddress.city ||
    !shippingAddress.country
  ) {
    throw new AppError("Validation failed", {
      status: 422,
      code: "VALIDATION_ERROR",
      details: [
        { field: "shippingAddress", message: "line1, city, and country are required" },
      ],
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ userId }).session(session);
    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty", {
        status: 400,
        code: "EMPTY_CART",
      });
    }

    const productIds = cart.items.map((item) => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      status: "active",
    }).session(session);

    const productMap = new Map(products.map((product) => [String(product._id), product]));
    const byStore = new Map();
    let grandTotal = 0;

    for (const item of cart.items) {
      const product = productMap.get(String(item.productId));

      if (!product) {
        throw new AppError("One or more products are unavailable", {
          status: 400,
          code: "PRODUCT_UNAVAILABLE",
        });
      }

      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, {
          status: 400,
          code: "OUT_OF_STOCK",
          details: [
            {
              field: "quantity",
              message: `${product.name} only has ${product.stock} left`,
            },
          ],
        });
      }

      const price = product.price;
      const subtotal = price * item.quantity;
      grandTotal += subtotal;

      const storeKey = String(product.storeId);
      if (!byStore.has(storeKey)) {
        byStore.set(storeKey, {
          storeId: product.storeId,
          items: [],
          subtotal: 0,
        });
      }

      const group = byStore.get(storeKey);
      group.items.push({
        productId: product._id,
        name: product.name,
        price,
        quantity: item.quantity,
        subtotal,
      });
      group.subtotal += subtotal;

      product.stock -= item.quantity;
      await product.save({ session });
    }

    const [order] = await Order.create(
      [
        {
          customerId: userId,
          shippingAddress,
          grandTotal,
          paymentMethod: paymentMethod || "cod",
          placedAt: new Date(),
        },
      ],
      { session }
    );

    const subOrdersPayload = [...byStore.values()].map((group) => ({
      parentOrderId: order._id,
      storeId: group.storeId,
      items: group.items,
      status: "Pending",
      statusHistory: [
        {
          status: "Pending",
          changedBy: userId,
          changedAt: new Date(),
        },
      ],
      subtotal: group.subtotal,
    }));

    const subOrders = await SubOrder.insertMany(subOrdersPayload, { session });

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();

    return {
      order,
      subOrders,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function listCustomerOrders(userId, query = {}) {
  const { page, limit, skip } = getPagination(query);

  const [orders, total] = await Promise.all([
    Order.find({ customerId: userId }).sort({ placedAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments({ customerId: userId }),
  ]);

  const orderIds = orders.map((order) => order._id);
  const subOrders = await SubOrder.find({ parentOrderId: { $in: orderIds } })
    .populate("storeId", "name slug logoUrl")
    .lean();

  const grouped = new Map();
  for (const subOrder of subOrders) {
    const key = String(subOrder.parentOrderId);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(subOrder);
  }

  const items = orders.map((order) => {
    const orderSubOrders = grouped.get(String(order._id)) || [];
    return {
      ...order,
      subOrders: orderSubOrders,
      status: deriveOrderStatus(orderSubOrders),
      itemCount: orderSubOrders.reduce(
        (sum, sub) => sum + sub.items.reduce((n, item) => n + item.quantity, 0),
        0
      ),
    };
  });

  return {
    items,
    meta: buildPaginationMeta({ total, page, limit }),
  };
}

export async function getCustomerOrder(userId, orderId) {
  const order = await Order.findById(orderId).lean();

  if (!order) {
    throw new AppError("Order not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  if (String(order.customerId) !== String(userId)) {
    throw new AppError("You do not have access to this order", {
      status: 403,
      code: "FORBIDDEN",
    });
  }

  const subOrders = await SubOrder.find({ parentOrderId: order._id })
    .populate("storeId", "name slug logoUrl")
    .lean();

  return {
    ...order,
    subOrders,
    status: deriveOrderStatus(subOrders),
  };
}
