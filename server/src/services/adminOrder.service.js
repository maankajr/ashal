import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { SubOrder, SUBORDER_STATUSES } from "../models/SubOrder.js";
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

async function attachSubOrders(orders) {
  const orderIds = orders.map((order) => order._id);
  const subOrders = await SubOrder.find({ parentOrderId: { $in: orderIds } })
    .populate("storeId", "name slug")
    .lean();

  const grouped = new Map();
  for (const subOrder of subOrders) {
    const key = String(subOrder.parentOrderId);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(subOrder);
  }

  return orders.map((order) => {
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
}

export async function listOrders(query = {}) {
  const { page, limit, skip } = getPagination({ ...query, limit: query.limit || 20 });

  const [orders, total] = await Promise.all([
    Order.find()
      .sort({ placedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customerId", "name email")
      .lean(),
    Order.countDocuments(),
  ]);

  const items = await attachSubOrders(orders);
  const statusFilter = String(query.status || "").trim();
  const filtered = statusFilter
    ? items.filter((order) => order.status === statusFilter)
    : items;

  return {
    items: filtered,
    meta: buildPaginationMeta({ total, page, limit }),
  };
}

export async function getOrder(orderId) {
  if (!mongoose.isValidObjectId(orderId)) {
    throw new AppError("Order not found", { status: 404, code: "NOT_FOUND" });
  }

  const order = await Order.findById(orderId).populate("customerId", "name email phone").lean();

  if (!order) {
    throw new AppError("Order not found", { status: 404, code: "NOT_FOUND" });
  }

  const [item] = await attachSubOrders([order]);
  return item;
}

export async function updateSubOrderStatus(adminId, subOrderId, status) {
  if (!mongoose.isValidObjectId(subOrderId)) {
    throw new AppError("Order not found", { status: 404, code: "NOT_FOUND" });
  }

  if (!SUBORDER_STATUSES.includes(status)) {
    throw new AppError("Invalid status", {
      status: 422,
      code: "VALIDATION_ERROR",
      details: [{ field: "status", message: "Invalid order status" }],
    });
  }

  const subOrder = await SubOrder.findById(subOrderId);

  if (!subOrder) {
    throw new AppError("Order not found", { status: 404, code: "NOT_FOUND" });
  }

  subOrder.status = status;
  subOrder.statusHistory.push({
    status,
    changedBy: adminId,
    changedAt: new Date(),
  });

  await subOrder.save();

  return subOrder.populate("storeId", "name slug");
}
