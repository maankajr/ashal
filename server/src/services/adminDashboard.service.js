import { User } from "../models/User.js";
import { Store } from "../models/Store.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { SubOrder } from "../models/SubOrder.js";

export async function getAdminDashboard() {
  const [
    totalUsers,
    totalVendors,
    totalCustomers,
    totalStores,
    pendingStores,
    totalProducts,
    pendingProducts,
    totalOrders,
    revenueAgg,
    recentOrders,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments({ role: { $ne: "admin" } }),
    User.countDocuments({ role: "vendor" }),
    User.countDocuments({ role: "customer" }),
    Store.countDocuments(),
    Store.countDocuments({ status: "pending" }),
    Product.countDocuments({ status: { $ne: "deleted" } }),
    Product.countDocuments({ status: "pending" }),
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$grandTotal" } } }]),
    Order.find()
      .sort({ placedAt: -1 })
      .limit(8)
      .populate("customerId", "name email")
      .lean(),
    User.find({ role: { $ne: "admin" } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role status createdAt")
      .lean(),
  ]);

  const orderIds = recentOrders.map((order) => order._id);
  const subOrders = await SubOrder.find({ parentOrderId: { $in: orderIds } })
    .populate("storeId", "name")
    .lean();

  const grouped = new Map();
  for (const subOrder of subOrders) {
    const key = String(subOrder.parentOrderId);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(subOrder);
  }

  return {
    stats: {
      totalUsers,
      totalVendors,
      totalCustomers,
      totalStores,
      pendingStores,
      totalProducts,
      pendingProducts,
      totalOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
    },
    recentOrders: recentOrders.map((order) => ({
      ...order,
      subOrders: grouped.get(String(order._id)) || [],
    })),
    recentUsers,
  };
}
